# XComps for DHTask

XComps for DHTask is a gliding competition manager for Android that downloads **TSK** (task) files from ongoing competitions into **XCSoar** and its related forks. It uses data from [json.dhtask.com](https://json.dhtask.com).
It was inspired by Kedder's [**Compman**](https://github.com/kedder/openvario-compman) for the OpenVario.

It searches the `Android/media` folder for sub-folders containing "soar" in their name and lets you choose which ones to download to.
Then it places the downloaded files into the folders you selected.

The task file is named `xcomps_task.tsk` and is overwritten each time you download a new one.

**Warning**: this app may not work with older versions of XCSoar, because they don't store their data in the `Android/media` folder.<br>
It is recommended to use the latest version of XCSoar, available at [https://xcsoar.org/download](https://xcsoar.org/download)

Tasks are downloaded from [json.dhtask.com](https://json.dhtask.com). Select **Contest** → **Class** → **Pilot** to retrieve your task file.

## Screenshots
![Screenshot 1](./screenshots/screenshot1.png)
![Screenshot 2](./screenshots/screenshot2.png)
