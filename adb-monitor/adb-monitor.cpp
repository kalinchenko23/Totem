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

const std::string LOG_FILE = "/var/log/adb-monitor.log";
const std::string VENDOR_CONF = "/etc/adb-monitor/vids.conf";
const std::string ADB_PATH = "/usr/bin/adb";
const std::string EXPECTED_ADB_HASH = "<INSERT_YOUR_SHA256_HASH_HERE>";
const size_t MAX_TRIGGERS_PER_MINUTE = 5;

bool running = true;

// Logs a message with a timestamp to the log file
void log_event(const std::string& message) {
    std::ofstream log(LOG_FILE, std::ios::app);
    if (log.is_open()) {
        std::time_t now = std::time(nullptr);
        log << "[" << std::ctime(&now) << "] " << message << std::endl;
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
        line.erase(remove_if(line.begin(), line.end(), ::isspace), line.end());
        if (!line.empty() && line[0] != '#') {
            outSet.insert(line);
        }
    }
    return true;
}

// Checks if any device is currently connected via ADB
bool is_adb_device_connected() {
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

// Main entry point of the program
int main() {
    // Setup signal handlers
    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);

    // Clear the log on startup
    std::ofstream clearLog(LOG_FILE, std::ios::trunc);
    clearLog << "[" << ([](){ std::time_t now = std::time(nullptr); return std::ctime(&now); })() << "] Log cleared on startup." << std::endl;

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

    // Main monitoring loop
    while (running) {
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(fd, &fds);
        struct timeval timeout = {1, 0}; // 1-second timeout

        int ret = select(fd + 1, &fds, nullptr, nullptr, &timeout);
        if (ret > 0 && FD_ISSET(fd, &fds)) {
            struct udev_device *dev = udev_monitor_receive_device(mon);
            if (dev) {
                const char* action = udev_device_get_action(dev);
                const char* vendor = udev_device_get_sysattr_value(dev, "idVendor");
                const char* product = udev_device_get_sysattr_value(dev, "idProduct");

                if (action && vendor && product) {
                    std::string vendorStr(vendor);
                    std::string productStr(product);
                    std::string actionStr(action);
                    std::string key = vendorStr + ":" + productStr;

                    // Basic validation of vendor/product IDs
                    if (vendorStr.length() <= 4 && productStr.length() <= 4 &&
                        vendorStr.find_first_not_of("0123456789abcdefABCDEF") == std::string::npos &&
                        productStr.find_first_not_of("0123456789abcdefABCDEF") == std::string::npos) {

                        time_t now = std::time(nullptr);

                        // Skip repeated detections within 5 seconds
                        if (lastSeen.find(key) != lastSeen.end() && now - lastSeen[key] < 5) {
                            udev_device_unref(dev);
                            continue;
                        }
                        lastSeen[key] = now;

                        if (vendorIDs.find(vendorStr) != vendorIDs.end()) {
                            log_event("Android USB " + actionStr + " event detected.");

                            // If ADB is active, trigger the script
                            if (is_adb_device_connected()) {
                                trigger_times.push_back(now);

                                // Clean up triggers older than 60 seconds
                                while (!trigger_times.empty() && now - trigger_times.front() > 60) {
                                    trigger_times.pop_front();
                                }

                                // Enforce trigger rate limit
                                if (trigger_times.size() <= MAX_TRIGGERS_PER_MINUTE) {
                                    log_event("ADB ACTIVE: Triggering script.");
                                    int result = system("/usr/local/bin/placeholder.sh");
                                    if (result != 0) {
                                        log_event("Warning: Script exited with code " + std::to_string(result));
                                    }
                                } else {
                                    log_event("Rate limit exceeded: script not triggered.");
                                }
                            } else {
                                log_event("ADB NOT ACTIVE: Device connected without USB debugging.");
                            }
                        } else {
                            log_event("Non-Android USB " + actionStr + " event detected.");
                        }
                    }
                }
                udev_device_unref(dev);
            }
        }
    }

    // Cleanup and shutdown
    udev_monitor_unref(mon);
    udev_unref(udev);
    log_event("Monitor stopped.");
    return 0;
}