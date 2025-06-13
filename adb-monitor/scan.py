#!/usr/bin/python3

from datetime import datetime

import RPi.GPIO as GPIO

import glob
import os
import re
import subprocess
import time

# IOC directory
ioc_path = f'/usr/local/mvt'

# Output file
output_file = f"/tmp/mvt_scan_output.txt"

# Command to run the MVT scan that includes custom IOCs
#mvt_command = ["/home/totem/mvt/bin/mvt-android", "check-adb", "--iocs", "/home/totem/Totem/custom_iocs/custom_ioc1.stix2", "--iocs", "/home/totem/Totem/custom_iocs/custom_ioc2.stix2"]
mvt_command = ["/usr/local/bin/mvt-android", "check-adb"]

#Patterns that script is looking for in order to detect suspicious activity
detection_patterns = [
    r"The analysis of the Android bug report produced \d+ detections!",
    r"The analysis of the Android backup produced \d+ detections!",
    r"The analysis of the AndroidQF acquisition produced \d+ detections!",
    r"The analysis of the Android device produced \d+ detections!",
    r"Found a known suspicious app with ID",
    r"Found a known suspicous file at path:",
    r"Found an SUID file in a non-standard directory",
    r"Found an installed package related to rooting/jailbreaking",
    r"Found root binary",
    r"Detected indicators of compromise."
]

# Patterns that script is looking for in order to detect errors
error_patterns= [
    r"Device is busy, maybe run `adb kill-server` and try again.",
    r"No device found. Make sure it is connected and unlocked."
]

# Controlled LED pins
led_pins = [18, 24]

# Initializes GPIO pins found in led_pins
def init_pins():
    # Use Broadcom pin numbering
    GPIO.setmode(GPIO.BCM)

    # Setup and turn off pin
    for pin in led_pins:
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.LOW)

# Turn on given pin, turn off all others
def set_led(pin):
    for i in led_pins:
        if pin != i:
            GPIO.output(i, GPIO.LOW)
        else:
            GPIO.output(i, GPIO.HIGH)

# Obtain all IOCs and incorporate into MVT command
def cmd_update_iocs():
    for file in glob.glob(pathname="*.stix2", root_dir=ioc_path):
        if os.path.isfile(file):
            mvt_command.append("--iocs")
            mvt_command.append(file)

def main():
    try:
        # Initialize GPIOs
        init_pins()
        print(f'[*] Initializing GPIO')

        # Update command with custom IOC files
        cmd_update_iocs()
        print(f'[*] Added custom IOCs to calling scan command')

        # Run the MVT scan and capture output
        print(f'[*] Executing MVT scan')
        result = subprocess.run(mvt_command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

        # Write output to file
        with open(output_file, "w") as f:
            f.write(result.stdout)
            print(f"[+] {datetime.now().strftime('%Y-%m-%d_%H-%M-%S')} MVT scan complete. Output saved to {output_file}")


        # If any detection patterns are found the script exits with code 1
        with open(output_file, "r") as f:
            file_content = f.read()
            for pattern in detection_patterns:
                if re.search(pattern, file_content):
                    set_led(18) # Turn on red LED for detection
                    print("[!] Detection message found.")
                    exit(1)

            # If any error patterns are found the script exits with code 2
            for pattern in error_patterns:
                if re.search(pattern, file_content):
                    print("[!] Error message found.")
                    exit(2)

            # If no detection/error patterns are found the script exits with code 0
            set_led(24) # Turn on green LED for clean scan
            print(f"[✓] {datetime.now().strftime('%Y-%m-%d_%H-%M-%S')} No detection messages found.")
            exit(0)

    except FileNotFoundError:
        print("[!] 'mvt-android' not found. Ensure MVT is installed and in your PATH.")
        exit(2)
    except Exception as e:
        print(f"[!] An error occurred: {e}")    
        exit(2)

if __name__ == '__main__':
    main()