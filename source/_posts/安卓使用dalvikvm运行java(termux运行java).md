---
title: 安卓使用dalvikvm运行java(termux运行java)
tags:
  - android
  - java
categories:
  - android
abbrlink: 8b98169e
date: 2019-02-02 23:02:35
---
一直想要使用termux来在安卓上写java,但termux上只有ecj可以使java编译为目标文件class,却不能使其编译为可执行文件  
发现通过安卓自带的dalvikvm可以运行,只是步骤繁琐一些  

## 安装所需工具
termux上安装 ecj 和 dx就可以了
```
apt install ecj dx
```

## 编译为class文件
```
ecj XXX.java
```
<!--more-->
## 编译成dex文件
```
dx --dex --output=XXX.dex XXX.class
```

## 使用dalvikvm运行
```
dalvikvm -cp XXX.dex XXX
```


参考: [使用 dalvikvm 执行一个运行于命令行的 Hello World](https://bbs.pediy.com/thread-184592.htm)