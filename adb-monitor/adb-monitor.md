# ADB Monitor Service

## service setup

### compile

**obtain adb hash**
```bash
sha256sum /usr/bin/adb | awk '{ print $1 }'
```

variable `const std::string EXPECTED_ADB_HASH` in cpp code should be set to output of adb hash

**library requirements**
```bash
sudo apt install -y libssl-dev libudev-dev
```

**compile**
```bash
g++ -std=c++17 -Wall -o adb-monitor adb-monitor.cpp -lssl -lcrypto -ludev
sudo mv adb-monitor /usr/local/bin/
```

### directory+config setup
```bash
# create the config dir
sudo mkdir -p /etc/adb-monitor
sudo touch /etc/adb-monitor/vids.conf
sudo chown root:adbmonitor /etc/adb-monitor/*.conf # create adbmonitor user prior to this step
sudo chmod 644 /etc/adb-monitor/*.conf
```

### setup user environment

**create user**
```bash
sudo useradd -r -s /usr/sbin/nologin adbmonitor
sudo touch /var/log/adb-monitor.log
sudo chown adbmonitor:adbmonitor /var/log/adb-monitor.log
sudo chown adbmonitor:adbmonitor /usr/local/bin/placeholder.(py|sh)
sudo chmod 640 /var/log/adb-monitor.log
sudo chmod 700 /usr/local/bin/placeholder.(py|sh)
```

**grant permissions via `udev` rules**
```bash
# /etc/udev/rules.d/99-android-monitor-access.rules
SUBSYSTEM=="usb", MODE="0664", GROUP="adbmonitor"
```

reload `udev`
```bash
sudo udevadm control --reload-rules
```

**grant access to `udev`**
```bash
sudo usermod -aG systemd-journal adbmonitor
sudo usermod -aG plugdev adbmonitor
```

### systemd service

**systemd unit configuration**

```ini
[Unit]
Description=ADB Monitor
After=network.target

[Service]
ExecStart=/usr/local/bin/adb-monitor
User=adbmonitor
Group=adbmonitor
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**configured service**
```bash
sudo systemctl daemon-reexec
sudo systemctl enable adb-monitor
sudo system start adb-monitor
```