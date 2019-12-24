---
title: uefi and efi
tags:
  - efi
  - uefi
categories:
  - Computer
abbrlink: a99a60b1
date: 2019-04-22 22:57:46
updated: 2019-04-22 22:57:46
---
创建efi分区:  

创建efi分区要设置boot flag,而不是纯FAT32文件系统  
使用gdisk
```
gdisk /dev/sd**
这里要注意后面输入分区系统编号 要选择EFI分区,目前efi分区编号是 ef00
```
使用parted
```
parted /dev/sd**
(parted) set 1 boot on
```
之后再格式化为fat32
```
mkfs.vfat -F 32 /dev/sd**
```
uefi 会查看所有 fat 分区，看看里面有没有 efi 引导文件,然后只要是 FAT32 文件系统就行,所以可以把 windows 或 ubuntu 的 iso 直接解压到一个 fat 分区（比如 fat 的 u 盘或移动硬盘）然后引导  
**有些UEFI系统只会识别 efi分区下的EFI/boot文件夹内的efi文件,有的甚至只会识别EFI/boot/bootx64.efi**
