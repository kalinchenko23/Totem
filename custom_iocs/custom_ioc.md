# Custom Indicators of Compromise (IOCs)

This document outlines the Indicators of Compromise (IOCs) in the `custom_iocs` folder. These IOCs are intended for use with tools like the Mobile Verification Toolkit (MVT) for testing and presentation.

## IOC Files

There are two primary IOC files in the `custom_iocs` folder:

1.  **`custom_ioc1.stix2` (checks for presence of eicar.com file)**
    * **Description:** The EICAR file is a harmless, standard file used to test the responsiveness of antivirus software. This IOC contains the filename that must be present on the target phone in order to trigger the detection.    

2.  **`custom_ioc2.stix2` (checks for presence of the Facebook app manager)**
    * **Description:** The Facebook App Manager (`com.facebook.appmanager`) is a system application on Android devices that manages updates for Facebook-owned apps (like Facebook, Instagram, Messenger, WhatsApp). While it's a legitimate application, it is included here simply for testing process detection capabilities.
    * **Indicator Type:** This IOC will look for the Android application package name or process name: `com.facebook.appmanager`.

## Usage

To use these IOCs with MVT, you need to use the `--iocs` flag followed by the path to the specific `.stix2` file or the folder containing them. It will include these custom IOCs in addition to the standard ones located at ~/.local/shared/mvt/indicators:

```bash
# Example using a single IOC file
mvt-android check-adb --iocs ./custom_ioc1.stix2
mvt-android check-adb --iocs ./custom_ioc2.stix2
