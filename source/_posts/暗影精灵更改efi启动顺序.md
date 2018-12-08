---
title: 暗影精灵更改efi启动顺序
tags:
  - EFI
  - BIOS
  - 计算机
categories:
  - 计算机
abbrlink: 6683eff9
date: 2018-06-23 11:43:40
---

暗影精灵安装完ubuntu之后只能开机按esc+f9进入ubuntu，否则会直接启动windows,虽然可以使用但及其不方便的说

首先从ubuntu进入/boot/efi/EFI
**备份windwos的启动文件**（**切记一定要备份，否则只能从pe重新建立windwos启动项**）
```
cp -arf Microsoft win10
```
将ubuntu的grubx64.efi替换掉EFI/Microsoft/Boot/bootmgfw.efi文件 <!--more-->
```
cp -arf ubuntu/grubx64.efi Microsoft/Boot/bootmgfw.efi 
```
这样替换之后grub就接管了系统的启动

然后将/boot/grub/grub.cfg中关于windows的启动段复制到/etc/grub.d/40_custom中
将**chainloader /EFI/Micorosoft/Boot/bootmgfw.efi**
改为
**chainloader /EFI/win10/Boot/bootmgfw.efi**
就是把中间那个改为你备份的文件夹，可以改一改前面的启动名称
最后执行update-grub来更新启动项

但是windwos有大更新的时候会把更改的覆盖掉，再来一遍就好了
参考文章[暗影精灵2pro安装win10+ubuntu16.10双系统](https://blog.csdn.net/zyix_0712/article/details/69675748)
