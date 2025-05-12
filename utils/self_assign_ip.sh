#!/bin/bash

# PLEASE RUN `setup_usb_gadget.sh` first
# detect USB gadget interface (starts with enx)
IFACE=$(ip -o link | awk -F': ' '/enx/ {print $2}' | head -n 1)

PI_IP="10.10.10.2"
HOST_IP="10.10.10.1"

if [ -n "$IFACE" ]; then
    echo "[+] Found gadget interface: $IFACE"
    sudo ip link set "$IFACE" up        # bring it up
    sudo ip addr flush dev "$IFACE"
    sudo ip addr add "$HOST_IP/24" dev "$IFACE"
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
