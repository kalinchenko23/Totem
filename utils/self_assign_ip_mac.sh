#!/bin/bash

# PLEASE RUN `setup_usb_gadget.sh` first

# Detect USB gadget interface (starts with en)
IFACE=$(ifconfig | grep -E '^enx' | awk '{print $1}' | head -n 1)

PI_IP="10.10.10.2"
HOST_IP="10.10.10.1"

if [ -n "$IFACE" ]; then
    echo "[+] Found gadget interface: $IFACE"
    sudo ifconfig "$IFACE" inet "$HOST_IP" netmask 255.255.255.0 up
    echo "[+] Assigned $HOST_IP to $IFACE"
    echo "[*] Waiting for pi@$PI_IP..."

    for i in {1..10}; do
        if ping -c1 "$PI_IP" &>/dev/null; then
            echo "[+] Pi is up. Connect with: ssh pi@$PI_IP"
            break
        fi
        sleep 1
    done
else
    echo "[-] No enx* interface found"
fi

