---
title: 解决linux下Realtek ALC295的耳机炸裂声
tags:
  - driver
  - Realtek ALC295
categories:
  - linux
abbrlink: 67c8ee7f
date: 2020-04-25 22:57:40
updated: 2020-04-25 22:57:40
language: zh-Hans
---

个人使用的笔记本是暗影精灵2 PRO,产品名称是: OMEN by HP Laptop 15-ax210TX.  

最初本人装的是ubuntu,左边耳机的声音一直有噼里啪啦的炸裂声,后来换了Arch还是一样的情况,而且本人喜欢听安静的声音,类似读故事或是心跳声这种,每次听到劈裂啪啦的声音真是难受.

最初尝试过Arch wiki中的各种方法 包括
>[PulseAudio/Troubleshooting#Glitches,_skips_or_crackling](https://wiki.archlinux.org/index.php/PulseAudio/Troubleshooting#Glitches,_skips_or_crackling)
>[PulseAudio/Troubleshooting#Static_noise_when_using_headphones](https://wiki.archlinux.org/index.php/PulseAudio/Troubleshooting#Static_noise_when_using_headphones)

都没有任何改进.

直到后来才发现这是linux下Realtek ALC295的驱动不完善导致的,这个bug在17年就提出了,至今都没有得到解决.
>[Bug 195457 - Realtek ALC295 still unsupported](https://bugzilla.kernel.org/show_bug.cgi?id=195457)  
>[Crackling and popping sound when using headphones](https://bugs.launchpad.net/ubuntu/+source/alsa-driver/+bug/1648183)  

在下面的评论区终于看到了解决方法:
<!--more-->
```md

I've managed to fix this problem on my machine (HP Omen 15 running Ubuntu 17.04 using codec for Realtek ALC295 sound device). To fix the problem, I can do the following:

Install alsa-tools if not installed:

sudo apt install alsa-tools

Create and save a script in /usr/local/bin:

#!/bin/bash
hda-verb /dev/snd/hwC0D0 0x20 SET_COEF_INDEX 0x67
hda-verb /dev/snd/hwC0D0 0x20 SET_PROC_COEF 0x3000

Run the script as root in a terminal to immediately fix the problem.

To run the script on startup, use cron with the @reboot command:

sudo crontab -e

and then add line in crontab:
@reboot [full path to script]

To run script on resume from suspend, copy the script to /lib/systemd/system-sleep

For more technical details regarding this fix, see https://bugzilla.kernel.org/show_bug.cgi?id=195457
```

arch下类似 除了是用pacman安装alsa-tools,之后操作是一样的.

***
>[Bug 195457 - Realtek ALC295 still unsupported](https://bugzilla.kernel.org/show_bug.cgi?id=195457)  
>[Crackling and popping sound when using headphones](https://bugs.launchpad.net/ubuntu/+source/alsa-driver/+bug/1648183)  
>[How to install Bang and Olufsen Audio drivers for HP laptop?](https://askubuntu.com/questions/873881/how-to-install-bang-and-olufsen-audio-drivers-for-hp-laptop)
