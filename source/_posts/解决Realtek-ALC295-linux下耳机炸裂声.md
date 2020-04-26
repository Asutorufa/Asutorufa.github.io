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

即使有人提交补丁并合并到了linux内核中
>[ALSA: hda - Fix missing COEF init for ALC225/295/299](https://github.com/torvalds/linux/commit/44be77c590f381bc629815ac789b8b15ecc4ddcf#diff-6cb60ab78549a5b6838f746b9e128105)

但是事实证明并没有用

依照上面有人提供的方法却有效(看起来跟提交补丁差不多,但是补丁却没有起作用):
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

不使用crontab,使用systemd的方法[ASUS_Zenbook_UX430/UX530#Headphones_audio_is_too_low](https://wiki.archlinux.org/index.php/ASUS_Zenbook_UX430/UX530#Headphones_audio_is_too_low)

```md
In order to fix it, install alsa-tools or hda-verbAUR and create the file:

/usr/local/bin/fix_headphones_audio.sh
```

```sh
#!/bin/bash
while true; do
	DEVICE=`ls /dev/snd/hwC[[:print:]]*D0 | head -n 1`
	if [ ! -z "$DEVICE" ]; then
		hda-verb "$DEVICE" 0x20 SET_COEF_INDEX 0x67
		hda-verb "$DEVICE" 0x20 SET_PROC_COEF 0x3000
		break
	fi
	sleep 1
done
```

```md
Then create a systemd script with the following content:

/etc/systemd/system/fix_headphones_audio.service
```

```systemd
[Unit]
Description=Fix headphones audio after boot & resume.
After=multi-user.target suspend.target hibernate.target

[Service]
Type=oneshot
ExecStart=/bin/sh '/usr/local/bin/fix_headphones_audio.sh'

[Install]
WantedBy=multi-user.target suspend.target hibernate.target
```

```md
And finally, start and enable fix_headphones_audio.service.
```

***
>[Bug 195457 - Realtek ALC295 still unsupported](https://bugzilla.kernel.org/show_bug.cgi?id=195457)  
>[Crackling and popping sound when using headphones](https://bugs.launchpad.net/ubuntu/+source/alsa-driver/+bug/1648183)  
>[How to install Bang and Olufsen Audio drivers for HP laptop?](https://askubuntu.com/questions/873881/how-to-install-bang-and-olufsen-audio-drivers-for-hp-laptop)
>[ASUS_Zenbook_UX430/UX530#Headphones_audio_is_too_low](https://wiki.archlinux.org/index.php/ASUS_Zenbook_UX430/UX530#Headphones_audio_is_too_low)
