#!/bin/bash

# Test if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "[x] Script must be run as root"
    exit 1
fi

##################
# Global Variables
##################

ADB_PATH="/usr/bin/adb"
ADB_LOG_PATH="/var/log/adb-monitor.log"
OUT_BINARY="adb-monitor"
OUT_PATH="/usr/local/bin/"
MVT_SCRIPT="scan.py"
MVT_DESTINATION="/usr/local/bin/mvt-scan.py"
SOURCE="adb-monitor.cpp"
SVC_ACCOUNT="adbmonitor"
SVC_CONF_FILE="vids.conf"
SVC_CONF_PATH="/etc/adb-monitor"
SVC_FILE="adbmonitor.service"
SVC_NAME="adbmonitor"
TEMP_CPP="/tmp/temp_${SOURCE}"
TEMP_LOG="/tmp/${SOURCE}_compile.log"
UDEV_RULE_FILE="99-android-monitor-access.rules"

####################
# 00 - Prerequisites
####################

# For Library Checks / Installations

apt update > /dev/null 2>&1

# Check for and install ADB
if ! [ -f "$ADB_PATH" ]; then
    apt install -y adb > /dev/null 2>&1
    echo "[+] Install ADB package"
fi

# check for libssl
SSL_PACKAGE="libssl-dev"

if ! dpkg -s "$SSL_PACKAGE" > /dev/null 2>&1; then
    apt install -y "$SSL_PACKAGE" > /dev/null 2>&1
    echo "[+] Installed C++ package: ${SSL_PACKAGE}"
fi

# check for libudev-dev
UDEV_PACKAGE="libudev-dev"

if ! dpkg -s "$UDEV_PACKAGE" >/dev/null 2>&1; then
    apt install -y "$UDEV_PACKAGE" > /dev/null 2>&1
    echo "[+] Installed C++ package: ${UDEV_PACKAGE}"
fi

# check python mvt
MVT_PATH="/usr/local/bin/mvt-android"

if ! [ -f "$MVT_PATH" ]; then
    pip install mvt --break-system-packages > /dev/null 2>&1
    echo "[+] Installed MVT python package"
fi

###########################
# 01 - Build Service Binary
###########################

# Remove previous log, if exists
if [ -f "$TEMP_LOG" ]; then
    rm "$TEMP_LOG"
fi

# Check required binary exists
if ! [ -f "$ADB_PATH" ]; then
    echo "[!] Error: Binary file '$ADB_PATH' not found"
    exit 2
fi

# Generate SHA256 hash of the ADB binary
HASH=$(sha256sum "$ADB_PATH" | awk '{print $1}')
echo "[+] SHA256 Hash ($ADB_PATH): $HASH"

if ! [ -f "$SOURCE" ]; then
    echo "[!] Error: Source code file '$SOURCE' not found"
    exit 3
fi

# Replace placeholder in the source file
cp -f "$SOURCE" "$TEMP_CPP"
sed -i "s|<INSERT_SHA256_HASH_HERE>|$HASH|g" "$TEMP_CPP"
echo "[+] Hash placeholder updated in source file"

# Compile the modified source file
echo "[*] Compiling modified source..."
g++ -std=c++17 -Wall -o "$OUT_BINARY" "$TEMP_CPP" -lssl -lcrypto -ludev > "$TEMP_LOG" 2>&1

# Cleanup Temp File
echo "[-] Removing temporary source file"
rm "$TEMP_CPP"

# Test Completion
if [ -f "$OUT_BINARY" ]; then
    echo "[-] Removing compile log file"
    rm "$TEMP_LOG"
    mv $OUT_BINARY $OUT_PATH
    echo "[+] Compilation successful. Output binary: $OUT_PATH/$OUT_BINARY"
else
    echo "[x] Compilation failed - no binary created"
    exit 4
fi

############################
# 02 - Setup Service Account
############################

# Check service account exists
if ! id $SVC_ACCOUNT &> /dev/null; then
    useradd -r -s /usr/sbin/nologin $SVC_ACCOUNT
fi

# Update group memberships
usermod -aG systemd-journal $SVC_ACCOUNT
usermod -aG plugdev $SVC_ACCOUNT

echo "[+] Service account created and group access configured"

##################################
# 03 - Service Setup & Permissions
##################################

# Create ADB log file and set permissions
touch "$ADB_LOG_PATH"
chown $SVC_ACCOUNT:$SVC_ACCOUNT "$ADB_LOG_PATH"
chmod 640 "$ADB_LOG_PATH"
echo "[+] Create ADB log file and set permissions"

# Setup ADB vendor configuration
mkdir -p "$SVC_CONF_PATH"
mv "$SVC_CONF_FILE" "$SVC_CONF_PATH"
chown root:$SVC_ACCOUNT "$SVC_CONF_PATH/$SVC_CONF_FILE"
chmod 644 "$SVC_CONF_PATH/$SVC_CONF_FILE"
echo "[+] Created ADB vendor configuration file and set permissions"

# Move MVT scanning script and set permissions
mv "$MVT_SCRIPT" "$MVT_DESTINATION"
chown $SVC_ACCOUNT:$SVC_ACCOUNT "$MVT_DESTINATION"
chmod 700 "$MVT_DESTINATION"
echo "[+] Updated MVT script file and set permissions"

# Configure udev rules via file
mv "$UDEV_RULE_FILE" "/etc/udev/rules.d/"
udevadm control --reload-rules
echo "[+] Configured monitor service udev access"

# Configured daemon file
mv "$SVC_FILE" "/etc/systemd/system/"
systemctl daemon-reexec
systemctl enable $SVC_NAME > /dev/null 2>&1
systemctl start $SVC_NAME
echo "[+] Systemd service created, enabled, and started"

## Script completed
echo "[*] Setup script completed."