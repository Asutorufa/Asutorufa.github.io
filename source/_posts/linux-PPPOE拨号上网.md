---
title: linux PPPOE拨号上网
tags:
  - linux
  - archlinux
categories:
  - linux
abbrlink: 59c8ffd6
date: 2020-02-08 16:26:57
updated: 2020-02-08 16:26:57
---
## 安装rp-pppoe

```shell
pacman -S rp-pppoe
```

## 配置

```shell
sudo pppoe-setup
```

```shell
>>> Enter your PPPoE user name:
```

这里输入网络运营商提供给你的用户名.
<!--more-->
```shell
>>> Enter the Ethernet interface connected to the DSL modem
For Solaris, this is likely to be something like /dev/hme0.
For Linux, it will be ethn, where 'n' is a number. :
```

这里输入你链接网络的网卡,可以使用`ip addr`进行查看 比如`eth1`,`wlo1`.

```shel
>>> Enter the demand value (default no):
```

这里可以直接回车

```shell
>>> Enter the DNS information here:
```

```shell
>>> Enter the secondary DNS server address here:
```

这里输入两个DNS,比如`1.1.1.1`,`8.8.8.8`.

```shell
>>> Please enter your PPPoE password:  
```

这里输入网络运营商提供给你的密码.

```shell
The firewall choices are:
0 - NONE: This script will not set any firewall rules.  You are responsible
          for ensuring the security of your machine.  You are STRONGLY
          recommended to use some kind of firewall rules.
1 - STANDALONE: Appropriate for a basic stand-alone web-surfing workstation
2 - MASQUERADE: Appropriate for a machine acting as an Internet gateway
                for a LAN
>>> Choose a type of firewall (0-2):
```

这里我使用1,可以按照自己的需求选择防火墙配置.

## 启用

```shell
sudo pppoe-start
```

可以使用`ip addr`进行查看,现在应该有一个`ppp0`的网络.

## 查看路由确认启用

```shell
[ ~ ] route
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         0.0.0.0         0.0.0.0         U     0      0        0 ppp0
                                ...
                                ...

```

如果没有default到ppp0的这条路由,需要手动创建:

```shell
sudo route add default dev ppp0
```

## 引用

> - [archlinux pppoe拨号连接使用详解[转载]](https://www.cnblogs.com/viusuangio/p/7112674.html)  
> - [Linux下连接无线网络后拨号（即PPP over WiFi）](https://www.librehat.com/guide-on-linux-ppp-over-wireless-network/)
