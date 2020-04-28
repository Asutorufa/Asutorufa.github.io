---
title: uefi and efi
tags:
  - efi
  - uefi
categories:
  - Computer
abbrlink: a99a60b1
date: 2019-04-22 22:57:46
updated: 2020-04-29 22:57:46
language: zh-Hans
---
创建efi分区:  

创建efi分区要设置boot flag,而不是纯FAT32文件系统  
使用gdisk

```shell
gdisk /dev/sd**
#这里要注意后面输入分区系统编号 要选择EFI分区,目前efi分区编号是 ef00
```

使用parted

```shell
parted /dev/sd**
(parted) set 1 boot on
```

之后再格式化为fat32

```shell
mkfs.vfat -F 32 /dev/sd**
```

更新bios中的启动项应该在将启动文件安装到efi分区时还要向bios中的nvram存储器上写入相应的路径,在linux中可以使用efibootmgr完成相应的操作,当然如果你是安装grub,安装grub时会自动向nvram中写入内容,比如在bios更新后,会清除nvram中的内容,所有还要重新安装grub,或是使用efibootmgr写入引导文件路径.可参考[Unified_Extensible_Firmware_Interface#efibootmgr](https://wiki.archlinux.org/index.php/Unified_Extensible_Firmware_Interface#efibootmgr),windows中也有相应的工具,具体操作方式可在网路上搜索.  
如果是u盘的话,uefi 会查看所有 fat 分区，看看里面有没有 EFI/boot/bootx64.efi(目前还没有找到相应的文档表示是这个,这只是我个人的猜想,因为在我试过的无论是windows还是linux的iso镜像的efi文件都是这个地方) 引导文件,然后只要是 FAT32 文件系统就行,所以可以把 windows 或 ubuntu 的 iso 直接解压到一个 fat 分区（比如 fat 的 u 盘或移动硬盘）然后引导  
**有些UEFI系统只会识别 efi分区下的EFI/boot文件夹内的efi文件,有的甚至只会识别EFI/boot/bootx64.efi**
