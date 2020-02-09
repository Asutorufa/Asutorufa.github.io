---
title: 让win10的UWP应用走代理
categories:
  - Network
tags:
  - Proxy
abbrlink: d22ffdb6
date: 2018-02-08 15:09:16
updated: 2018-02-08 15:09:16
language: zh-Hans
---

## 原因 
因为uwp应用的特殊性,即使使用proxifier和proxycap这种应用者无法让其走代理
## 1.SSTAP 
这个应用是创建虚拟网卡,让windows全局走代理.但其有弊端就是有一些国内的网站也会走代理,比如BILIBILI.虽然可以自己写规则但实在是麻烦无比.<!--more-->

## 2.fiddler 
利用fiddler的winconfig实现uwp应用走代理
![](http://blog-1254450445.cossgp.myqcloud.com/WK%290~%29WR%29N79$KZ4HZZTDQ2.png)
把要走代理的应用勾上
![](http://blog-1254450445.cossgp.myqcloud.com/KT3%28H@%60C63P@2KH_X7C@QDI.png)
但这不是全局代理,只能让uwp应用走代理
