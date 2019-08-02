---
title: archlinux安装记录
tags:
  - archlinux
  - efi
  - linux
categories:
  - linux
abbrlink: e3707853
date: 2019-08-03 00:18:40
---
详细安装教程请参考arch wiki [Installation guide (简体中文)](https://wiki.archlinux.org/index.php/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)),此处只记录安装后遇到的问题.

grub更新菜单  

```shell
grub-mkconfig -o /boot/grub/grub.cfg  
```

安装os-prober让grub检测到其他系统并自动创建引导

```shell
pacman -S os-prober
```

使用system-boot(就是直接使用linux内核引导系统,不再需要grub,如果有多系统不推荐,会把efi分区搞得很乱):

```shell
pacman -S efibootmgr dosfstools
# 此处注意:此处要把efi分区挂载为/boot,而非平常的/boot/efi
bootctl install --path=/boot
 ```
<!--more-->
__关于efi的部分可以看我的另一贴.__

arch 安装应用后 应用菜单不刷新怎么办(这个正常情况是不会遇到的,只是刚装完有些功能不完整会这样,我就遇到了):  

```shell
kbuildsycoca5 --noincremental
```

新增用户:
首先添加一个用户，并把它加到wheel组  

```shell
useradd -m -G wheel -s /bin/bash  [用户名]
```

然后为这个用户设置密码  

```shell
passwd [用户名]
```

最后设置wheel组的用户能用sudo获取root权限:  

```shell
visudo
    #找到这样的一行,把前面的#去掉:
    #%wheel ALL=(ALL) ALL
按ESC键，输入x!回车就可以保存并退出
```

启用dhcp自动获取网络地址,不然开机无法自动联网

```shell
systemctl enable dhcpcd.service
—以下已包含dhcp的功能,下面两条命令包括上面那个的功能—
pacman -s networkmanager
systemctl enable NetworkManager  
```

安装一个图形界面,比如kde

```shell
pacman -S plasma-desktop
systemctl start sddm.service  
```

安装一个终端,不然进入图形界面只能进tty输入命令

```shell
pacman -S konsole
````

来源:  
[用户添加](https://www.jianshu.com/p/6eaf642a94ed)
