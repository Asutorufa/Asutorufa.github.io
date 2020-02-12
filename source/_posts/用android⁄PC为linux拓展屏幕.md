---
title: 用Android/PC为linux拓展屏幕
tags:
  - linux
  - android
categories:
  - linux
language: zh-Hans
abbrlink: 4f3989f0
date: 2020-02-12 18:42:51
updated: 2020-02-12 18:42:51
---
## 新建虚拟屏幕

计算出拓展屏幕所需的信息.比如我想拓展1920x1200 60fps的虚拟屏幕:

```shell
gtf 1920 1200 60
```

结果

```shell
 # 1920x1200 @ 60.00 Hz (GTF) hsync: 74.52 kHz; pclk: 193.16 MHz
  Modeline "1920x1200_60.00"  193.16  1920 2048 2256 2592  1200 1201 1204 1242  -HSync +Vsync
```

使用xrandr添加新的mode,参数就是上面结果`Modeline`后面那些东西:

```shell
xrandr --newmode "1920x1200_60.00"  193.16  1920 2048 2256 2592  1200 1201 1204 1242  -HSync +Vsync
```

使用xrandr查看空闲的接口:
<!--more-->
```shell
[ ~ ] xrandr
Screen 0: minimum 8 x 8, current 1920 x 1080, maximum 32767 x 32767
eDP1 connected primary 1920x1080+0+0 (normal left inverted right x axis y axis) 340mm x 190mm
   1920x1080     60.02*+  40.03  
HDMI1 disconnected (normal left inverted right x axis y axis)
VIRTUAL1 disconnected (normal left inverted right x axis y axis)
HDMI-1-2 disconnected (normal left inverted right x axis y axis)
```

比如我目前在使用的屏幕是eDP1,下面都为空闲,如果有虚拟的就用虚拟的,没有虚拟的用HDMI的也行:

```shell
xrandr --addmode VIRTUAL1 1920x1200_60.00
```

拓展屏幕到左面:

```shell
xrandr --output VIRTUAL1 --mode 1920x1200_60.00 --left-of eDP1 # <- 这里也可以使用--right-of,就是拓展到左边.
```

目前为止我们已经创建好了一个虚拟屏幕.  

如果想删除上面新建的东西,可以使用下面的指令(注意相关参数换成自己的)或者直接重启电脑就好了.

```shell
xrandr --output VIRTUAL1 --off
xrandr --delmode VIRTUAL1 1920x1200_60.00
xrndr --rmmode 1920x1200_60.00
```

## 连接屏幕

连接屏幕可以用teamviewer或者x11vnc,以及各种远程控制电脑的软件,这里我更建议使用teamviewer,更流畅,而且方法简单.

### x11vnc

```shell
x11vnc -clip 1920x1200+0+0 # <-这里的两个0,分别是开始剪切的x和y的坐标,如果你拓展到了右边,这里就要加上相应的大小.
```

然后使用安卓上的连接vnc的软件即可,默认端口是5900.

## 使用usb加快传输速度

把手机用usb连接到电脑上,然后用adb连接.

```shell
adb devices
```

### x11vnc

这个的默认端口是5900,将电脑端口映射到android上.

```shell
adb reverse tcp:5900 tcp:5900
```

然后手机上直接连接127.0.0.1:5900就可以

### teamviewer

到teamviewer官网查询,可以知道默认端口为:

>TCP / UDP端口5938  
>TCP端口443  
>TCP端口80  

```shell
adb reverse tcp:5938 tcp:5938
```

后面的443和80也可做映射,不过我这里就使用了5938就成功了.  
然后手机上的teamviewer连接127.0.0.1就可以了.  

## 参考

> [Using Android/PC as a Second Monitor in Linux](https://sangams.com.np/using-android-pc-as-a-second-monitor-in-linux/)