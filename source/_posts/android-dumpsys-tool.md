---
title: android dumpsys tool
tags:
  - android
  - adb
categories:
  - android
abbrlink: '25303996'
date: 2019-02-01 00:00:02
updated: 2019-02-01 00:00:02
language: zh-Hans
---

查看dumpsys所有的子命令:

```bash
dumpsys | grep "DUMP OF SERVICE"
```

output:

```bash
DUMP OF SERVICE SurfaceFlinger:
DUMP OF SERVICE accessibility:
DUMP OF SERVICE account:
DUMP OF SERVICE activity:
DUMP OF SERVICE alarm:
DUMP OF SERVICE appwidget:
DUMP OF SERVICE audio:
DUMP OF SERVICE backup:
DUMP OF SERVICE battery:
DUMP OF SERVICE batteryinfo:
DUMP OF SERVICE clipboard:
DUMP OF SERVICE connectivity:
DUMP OF SERVICE content:
DUMP OF SERVICE cpuinfo:
DUMP OF SERVICE device_policy:
DUMP OF SERVICE devicestoragemonitor:
DUMP OF SERVICE diskstats:
DUMP OF SERVICE dropbox:
DUMP OF SERVICE entropy:
DUMP OF SERVICE hardware:
DUMP OF SERVICE input_method:
DUMP OF SERVICE iphonesubinfo:
DUMP OF SERVICE isms:
DUMP OF SERVICE location:
DUMP OF SERVICE media.audio_flinger:
DUMP OF SERVICE media.audio_policy:
DUMP OF SERVICE media.player:
DUMP OF SERVICE meminfo:
DUMP OF SERVICE mount:
DUMP OF SERVICE netstat:
DUMP OF SERVICE network_management:
DUMP OF SERVICE notification:
DUMP OF SERVICE package:
DUMP OF SERVICE permission:
DUMP OF SERVICE phone:
DUMP OF SERVICE power:
DUMP OF SERVICE reboot:
DUMP OF SERVICE screenshot:
DUMP OF SERVICE search:
DUMP OF SERVICE sensor:
DUMP OF SERVICE simphonebook:
DUMP OF SERVICE statusbar:
DUMP OF SERVICE telephony.registry:
DUMP OF SERVICE throttle:
DUMP OF SERVICE usagestats:
DUMP OF SERVICE vibrator:
DUMP OF SERVICE wallpaper:
DUMP OF SERVICE wifi:
DUMP OF SERVICE window:
```

<!--more-->
eg:  
1.得到电池的所有信息

```bash
adb shell dumpsys battery
```

2.得到wifi的所有信息

```bash
adb shell dumpsys wifi
```

3.得到cpu的所有信息

```bash
adb shell dumpsys cpuinfo
```

4.得到总的存储情况

```bash
adb shell dumpsys meminfo
```

5.得到某应用的存储情况

```bash
adb shell dumpsys meminfo 'your apps package name'
```

6.得到所有的服务列表

```bash
adb shell service list
```

7.得到所有的账户列表

```bash
adb shell dumpsys account
```

8.获得某子命令的帮助信息

```bash
adb shell dumpsys account -h
```

参考:  
[What's the Android ADB shell “dumpsys” tool and what are its benefits?](https://stackoverflow.com/questions/11201659/whats-the-android-adb-shell-dumpsys-tool-and-what-are-its-benefits)
