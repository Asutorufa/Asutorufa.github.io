---
title: 安卓通过shell更改语言
tags:
  - android
categories:
  - android
abbrlink: f7f814df
date: 2019-01-23 19:15:44
updated: 2019-01-23 19:15:44
language: zh-Hans
---

对于Android M或更高版本，使用：

```bash
setprop ro.product.locale xx-XX
setprop persist.sys.locale xx-XX
```

xx是语言  
XX是国家  
改为日语为:xx=ja XX=JP  

其他安卓版本:

```bash
setprop persist.sys.language xx
setprop persist.sys.country XX
setprop ctl.restart zygote
```

xx是语言  
XX是国家  <!--more-->
Zygote进程运行时, 会初始化Dalvik虚拟机, 并运行它. Android的应用程序是由Java编写的, 它们不能直接运行在Linux上, 只能运行在Dalvik虚拟机中. 并且, 每个应用程序都运行在各自的虚拟机中, 应用程序每次运行都要重新初始化并启动虚拟机, 这个过程会消耗相当长时间, 是拖慢应用程序的原因之一. 因此, 在Android中, 应用程序运行前, 通过Zygote进程共享已运行的虚拟机的代码与内存信息, 缩短应用程序运行所耗费的时间. 也就是说, Zygote进程会事先将应用程序要使用的Android Framework中的类与资源加载到内存中, 并组织形成所用资源的链接信息. 这样, 新运行的Android应用程序在使用所需资源时不必每次形成资源的链接信息, 这样就大大提升了程序的运行时间.   

参考:  
1.[通过ADB更改设备语言](http://bbs.bugcode.cn/t/16729)  
2.[初识Zygote进程](https://www.jianshu.com/p/3dbe46439359)

