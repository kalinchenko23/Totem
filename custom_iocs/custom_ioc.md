# Custom Indicators of Compromise (IOCs)

This document outlines the Indicators of Compromise (IOCs) in the `custom_iocs` folder. These IOCs are intended for use with the Mobile Verification Toolkit (MVT) for testing and presentation.

## IOC Files

There are two primary IOC files in the `custom_iocs` folder:

1.  **`custom_ioc1.stix2` (checks for presence of eicar.com file)**
    * **Description:** The EICAR file is a harmless, standard file used to test the responsiveness of antivirus software. This IOC contains the filename that must be present on the target phone in order to trigger the detection. The official EICAR file can be downloaded here https://www.eicar.org/download-anti-malware-testfile/, but you only need to have a file with the name eicar.com, so please feel free to create your own.   

2.  **`custom_ioc2.stix2` (checks for presence of the Facebook app manager)**
    * **Description:** The Facebook App Manager (`com.facebook.appmanager`) is a system application on Android devices that manages updates for Facebook-owned apps (like Facebook, Instagram, Messenger, WhatsApp). While it's a legitimate application, it is included here simply for testing process detection capabilities.
    * **Indicator Type:** This IOC will look for the Android application package name or process name: `com.facebook.appmanager`.

## Usage

To use these IOCs with MVT, you need to use the `--iocs` flag followed by the path to the specific `.stix2` file or the folder containing them. It will include these custom IOCs in addition to the standard ones located at ~/.local/shared/mvt/indicators:

```bash
# Example using a single IOC file
mvt-android check-adb --iocs ./custom_ioc1.stix2 #the eicar.com file must be present on the phone 
mvt-android check-adb --iocs ./custom_ioc2.stix2 #the Facebook app manager process must be present on the phone 
