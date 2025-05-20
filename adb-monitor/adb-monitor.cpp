// adb-monitor.cpp

#include <libudev.h>
#include <iostream>
#include <fstream>
#include <csignal>
#include <unistd.h>
#include <ctime>
#include <unordered_map>
#include <unordered_set>
#include <deque>
#include <vector>
#include <sstream>
#include <cstdlib>
#include <iomanip>
#include <sys/stat.h>
#include <openssl/evp.h>
#include <algorithm>
#include <thread>

const std::string LOG_FILE = "/var/log/adb-monitor.log";
const std::string VENDOR_CONF = "/etc/adb-monitor/vids.conf";
const std::string ADB_PATH = "/usr/bin/adb";
const std::string EXPECTED_ADB_HASH = "fed574838c9b543c410679aeb898304a576139bd6820ec8e202fa34035324eff";
const size_t MAX_TRIGGERS_PER_MINUTE = 5;

bool running = true;

// Logs a message with a timestamp to the log file
void log_event(const std::string& message) {
    std::ofstream log(LOG_FILE, std::ios::app);
    if (log.is_open()) {
        std::time_t now = std::time(nullptr);
        std::string time_str = std::ctime(&now);
        time_str.pop_back();
        log << "[" << time_str << "] " << message << std::endl;
    }
}

// Handles termination signals to gracefully shut down the program
void handle_signal(int signum) {
    log_event("Received termination signal. Exiting monitor.");
    running = false;
}

// Verifies the SHA256 hash of the adb binary to ensure integrity

bool verify_adb_hash(const std::string& expected_hash) {
    FILE* file = fopen(ADB_PATH.c_str(), "rb");
    if (!file) {
        log_event("ADB binary not found.");
        return false;
    }

    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    if (!ctx) {
        log_event("Failed to create EVP_MD_CTX.");
        fclose(file);
        return false;
    }

    const EVP_MD* md = EVP_sha256();
    if (EVP_DigestInit_ex(ctx, md, nullptr) != 1) {
        log_event("EVP_DigestInit_ex failed.");
        EVP_MD_CTX_free(ctx);
        fclose(file);
        return false;
    }

    unsigned char buffer[8192];
    size_t bytesRead;
    while ((bytesRead = fread(buffer, 1, sizeof(buffer), file)) > 0) {
        if (EVP_DigestUpdate(ctx, buffer, bytesRead) != 1) {
            log_event("EVP_DigestUpdate failed.");
            EVP_MD_CTX_free(ctx);
            fclose(file);
            return false;
        }
    }
    fclose(file);

    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_len;
    if (EVP_DigestFinal_ex(ctx, hash, &hash_len) != 1) {
        log_event("EVP_DigestFinal_ex failed.");
        EVP_MD_CTX_free(ctx);
        return false;
    }

    EVP_MD_CTX_free(ctx);

    std::ostringstream oss;
    for (unsigned int i = 0; i < hash_len; i++) {
        oss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }

    return oss.str() == expected_hash;
}


// Loads vendor IDs from configuration file into a set
bool load_vendor_ids(const std::string& path, std::unordered_set<std::string>& outSet) {
    std::ifstream infile(path);
    if (!infile.is_open()) {
        log_event("Failed to open vendor ID config: " + path);
        return false;
    }

    std::string line;
    while (std::getline(infile, line)) {
        // Remove anything after '#'
        size_t comment_pos = line.find('#');
        if (comment_pos != std::string::npos) {
            line = line.substr(0, comment_pos);
        }

        // Remove all whitespace from the line
        line.erase(remove_if(line.begin(), line.end(), ::isspace), line.end());

        // Skip empty lines
        if (!line.empty()) {
            outSet.insert(line);
        }
    }
    return true;
}

// Checks if any device is currently connected via ADB
bool is_adb_device_connected() {
    // Wait for ADB to detect a device (blocks until ready or fails)
    int wait_result = system("timeout 30s /usr/bin/adb wait-for-device");
    if (wait_result != 0) {
        log_event("ADB wait-for-device failed or timed out.");
        return false;
    }

    FILE* pipe = popen("/usr/bin/adb devices", "r");
    if (!pipe) return false;

    char buffer[128];
    bool header_skipped = false;

    while (fgets(buffer, sizeof(buffer), pipe)) {
        std::string line(buffer);
        if (!header_skipped) {
            header_skipped = true;
            continue; // Skip the header line
        }

        std::istringstream iss(line);
        std::string field1, field2;
        iss >> field1 >> field2;

        if (!field1.empty() && field2 == "device") {
            pclose(pipe);
            return true;
        }
    }

    pclose(pipe);
    return false;
}

void handle_usb_device(const std::string& actionStr,
                       const std::string& vendorStr,
                       const std::string& productStr,
                       std::unordered_map<std::string, time_t>& lastSeen,
                       const std::unordered_set<std::string>& vendorIDs,
                       std::deque<time_t>& trigger_times) {

    if (vendorStr.length() > 4 || productStr.length() > 4 ||
        vendorStr.find_first_not_of("0123456789abcdefABCDEF") != std::string::npos ||
        productStr.find_first_not_of("0123456789abcdefABCDEF") != std::string::npos)
        return;

    std::string key = vendorStr + ":" + productStr;
    time_t now = std::time(nullptr);

    if (lastSeen.find(key) != lastSeen.end() && now - lastSeen[key] < 5)
        return;

    lastSeen[key] = now;

    bool isStartup = (actionStr == "startup");

    if (vendorIDs.find(vendorStr) != vendorIDs.end()) {
        log_event("Android USB " + (isStartup ? "device already connected at startup" : actionStr + " event detected"));

        if (is_adb_device_connected()) {
            log_event("ADB ACTIVE" + std::string(isStartup ? " at startup" : "") + ": Triggering script.");
            trigger_times.push_back(now);

            while (!trigger_times.empty() && now - trigger_times.front() > 60) {
                trigger_times.pop_front();
            }

            if (trigger_times.size() <= MAX_TRIGGERS_PER_MINUTE) {
                // checking adb instantiates server - blocking mvt
                // attempt to kill existing adb server
                system("/usr/bin/adb kill-server");
                int result = system("python /home/totem/Totem/adb-monitor/scan.py");
                if (result != 0) {
                    log_event("Warning: Script exited with code " + std::to_string(result));
                }
                std::this_thread::sleep_for(std::chrono::seconds(60));
            } else {
                log_event("Rate limit exceeded: script not triggered.");
            }
        } else {
            log_event("ADB NOT ACTIVE" + std::string(isStartup ? " at startup" : "") + ": Device connected without USB debugging.");
        }
    } else {
        log_event((isStartup ? "Non-Android USB device already connected at startup"
                             : "Non-Android USB " + actionStr + " event detected"));
    }
}

// Main entry point of the program
int main() {
    // Setup signal handlers
    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);

    // Clear the log on startup
    std::ofstream clearLog(LOG_FILE, std::ios::trunc);
    log_event("Log cleared on startup.");

    // Verify ADB binary integrity
    if (!verify_adb_hash(EXPECTED_ADB_HASH)) {
        log_event("ADB binary hash mismatch — aborting.");
        return 1;
    }

    // Load allowed vendor IDs
    std::unordered_set<std::string> vendorIDs;
    if (!load_vendor_ids(VENDOR_CONF, vendorIDs)) {
        std::cerr << "Failed to load vendor ID config. Exiting." << std::endl;
        return 1;
    }

    // Create and configure udev monitor
    struct udev *udev = udev_new();
    if (!udev) return 1;

    struct udev_monitor *mon = udev_monitor_new_from_netlink(udev, "udev");
    if (!mon) return 1;

    udev_monitor_filter_add_match_subsystem_devtype(mon, "usb", nullptr);
    udev_monitor_enable_receiving(mon);
    int fd = udev_monitor_get_fd(mon);

    log_event("ADB monitor started.");

    std::unordered_map<std::string, time_t> lastSeen; // Tracks recently seen devices
    std::deque<time_t> trigger_times; // Tracks script trigger timestamps
    
    // Handle existing USB devices
    struct udev_enumerate* enumerate = udev_enumerate_new(udev);
    udev_enumerate_add_match_subsystem(enumerate, "usb");
    udev_enumerate_scan_devices(enumerate);
    struct udev_list_entry* devices = udev_enumerate_get_list_entry(enumerate);
    struct udev_list_entry* dev_list_entry;

    udev_list_entry_foreach(dev_list_entry, devices) {
        const char* path = udev_list_entry_get_name(dev_list_entry);
        struct udev_device* dev = udev_device_new_from_syspath(udev, path);
        if (!dev) continue;

        const char* vendor = udev_device_get_sysattr_value(dev, "idVendor");
        const char* product = udev_device_get_sysattr_value(dev, "idProduct");

        if (vendor && product) {
            handle_usb_device("startup", vendor, product, lastSeen, vendorIDs, trigger_times);
        }

        udev_device_unref(dev);
    }

    udev_enumerate_unref(enumerate);

    // Main event loop
    while (running) {
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(fd, &fds);
        struct timeval timeout = {1, 0};

        int ret = select(fd + 1, &fds, nullptr, nullptr, &timeout);
        if (ret > 0 && FD_ISSET(fd, &fds)) {
            struct udev_device* dev = udev_monitor_receive_device(mon);
            if (!dev) continue;

            const char* action = udev_device_get_action(dev);
            const char* vendor = udev_device_get_sysattr_value(dev, "idVendor");
            const char* product = udev_device_get_sysattr_value(dev, "idProduct");

            if (action && vendor && product) {
                handle_usb_device(action, vendor, product, lastSeen, vendorIDs, trigger_times);
            }

            udev_device_unref(dev);
        }
    }

    // Cleanup and shutdown
    udev_monitor_unref(mon);
    udev_unref(udev);
    log_event("Monitor stopped.");
    return 0;
}
