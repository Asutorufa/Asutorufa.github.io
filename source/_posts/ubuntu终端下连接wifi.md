---
title: ubuntu终端下连接wifi
tags:
  - linux
categories:
  - linux
abbrlink: fb6d8628
date: 2018-06-23 12:24:10
updated: 2018-06-23 12:24:10
language: zh-Hans
---

## 首先使用rfkill查看你的wifi设备是否被停用
使用命令
```
rfkill list
```
获得设备列表，每个都包含与之关联的索引号，从 0 开始
查看设备是否被停用，要启用被停用的设备，请运行：
```
rfkill unblock <索引号>
```
要启用所有设备，请运行：
```
rfkill unblock all
```
<!--more-->
您可以使用这个索引号让 rfkill 停使或者使用某个设备，例如：
```
rfkill block 0
```
您还可以使用 rfkill 阻断某一类设备，或者所有启用了RFKill的设备。例如：
```
rfkill block wifi 
```
停用系统中的所有Wi-Fi设备

## 启用无线网卡
```
ifconfig wlan0 up
```

## 使用iwconfig命令搜索无线网
```
iwlist wlan0 scan
```
记下essid
连接无密码的无线网
```
iwconfig wlan0 essid essidname
```
其中essidname是搜索到的无线网essid
连接有密码的无线网 
```
iwconfig wlan0 essid essidname key <密码>
```
## 补充
通过dhcp获取IP
```
dhclient wlan0
```
或
```
dhcpcd wlan0
```
