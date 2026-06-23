---
title: linux下intel&AMD双显卡切换
tags:
  - linux
  - 双显卡
  - amd
categories:
  - linux
abbrlink: 3b8b96de
date: 2018-09-08 19:02:47
updated: 2020-05-05 19:02:47
language: zh-Hans
---

使用**xrandr**显示可支持的显卡

```shell
xrandr --listproviders
```

输出类似以下内容

```shell
Providers: number : 2
Provider 0: id: 0x6b cap: 0x9, Source Output, Sink Offload crtcs: 3 outputs: 7 associated providers: 1 name:modesetting
Provider 1: id: 0x41 cap: 0x6, Sink Output, Source Offload crtcs: 2 outputs: 0 associated providers: 1 name:OLAND @ pci:0000:01:00.0
```

To be able to render GPU-intensive applications by the more powerful discrete card use

```shell
xrandr --setprovideroffloadsink 1 0
```

或者<!--more-->

```shell
xrandr --setprovideroffloadsink 0x41 0x6b
```

使用DRI_PRIME为某个应用选择使用哪一张显卡,使用glxinfo可以查看正在使用的显卡

```shell
DRI_PRIME=0 glxinfo | grep "OpenGL renderer"
DRI_PRIME=1 glxinfo | grep "OpenGL renderer"
```

如为steam启用独显

```shell
DRI_PRIME=1 steam
```

如果需要使用独显进行视频硬件播放,还需指定视频解码库,不然会乱码:
如AMD:

```shell
DRI_PRIME=1            # for laptops with switchable graphics
LIBVA_DRIVER_NAME=r600 # value depends on the driver, check /usr/lib/dri for possible options
```

使用mpv:

```shell
DRI_PRIME=1  LIBVA_DRIVER_NAME=r600 mpv [...]
```

参考资料:  
1.[Intel/AMD Hybrid graphics Ubuntu 18.04](https://askubuntu.com/questions/1038271/intel-amd-hybrid-graphics-ubuntu-18-04)  
2.[PRIME (简体中文)](https://wiki.archlinux.org/index.php/PRIME)
