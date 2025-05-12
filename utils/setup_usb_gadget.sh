#!/bin/bash
set -e

# This script can be ran inside the raspberry pi after it is configured
# `chmod +x setup_usb_gadget.sh`
# then `./setup_usb_gadget.sh`

echo "[*] Setting up USB gadget mode..."

BOOT_PATH="/boot/firmware"
CONFIG_TXT="$BOOT_PATH/config.txt"
CMDLINE_TXT="$BOOT_PATH/cmdline.txt"

# enable dwc2 overlay in config.txt
# adds the `dtoverlay=dwc2` line to the config.txt file
if ! grep -q "^dtoverlay=dwc2" "$CONFIG_TXT"; then
    echo "dtoverlay=dwc2" | sudo tee -a "$CONFIG_TXT"
    echo "[+] Added dtoverlay=dwc2 to config.txt"
fi

# add modules-load to cmdline.txt
if ! grep -q "modules-load=dwc2,g_ether" "$CMDLINE_TXT"; then
    sudo sed -i 's/\brootwait\b/rootwait modules-load=dwc2,g_ether/' "$CMDLINE_TXT"
    echo "[+] Inserted modules-load=dwc2,g_ether into cmdline.txt"
fi

# enable SSH if not enabled yet
if [ ! -f "$BOOT_PATH/ssh" ]; then
    sudo touch "$BOOT_PATH/ssh"
    echo "[+] Enabled SSH"
fi

# create bring-up-usb0 script
sudo tee /usr/local/sbin/bring-up-usb0.sh > /dev/null <<EOF
#!/bin/bash
ip link set usb0 up
ip addr add 10.10.10.2/24 dev usb0
EOF
sudo chmod +x /usr/local/sbin/bring-up-usb0.sh
echo "[+] Created /usr/local/sbin/bring-up-usb0.sh"

# create systemd service
sudo tee /etc/systemd/system/usb0.service > /dev/null <<EOF
[Unit]
Description=Manually bring up usb0 interface
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/bring-up-usb0.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable usb0.service
echo "[+] Enabled usb0 systemd service"

echo "All done. Reboot and test with: ssh username@10.10.10.2"
