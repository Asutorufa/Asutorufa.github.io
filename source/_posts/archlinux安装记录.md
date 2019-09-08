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
updated: 2019-09-06 00:21:27
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

***
新增用户<sup><a href='#1'><font color=red>[1]</font></a></sup>:  
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

***
启用dhcp自动获取网络地址,不然开机无法自动联网

```shell
systemctl enable dhcpcd.service
```

如果只使用有线网络 可以使用[Systemd-networkd](https://wiki.archlinux.org/index.php/Systemd-networkd)  
—---以下已包含dhcp的功能,下面两条命令包括上面那个的功能---—

```shell
pacman -s networkmanager
systemctl enable NetworkManager  
# 启动这个后开机有个NetworkManager-wait-online会占用大概6s的时间,嫌慢的可以屏蔽
systemctl mask NetworkManager-wait-online
```

***
安装一个图形界面,比如kde

```shell
pacman -S plasma-desktop
systemctl start sddm.service  
```

缩略图生成  
若要在桌面和 Dolphin 内为媒体或文档文件生成缩略图，安装 `kdegraphics-thumbnailers`，`ffmpegthumbs`。

```shell
pacman -S kdegraphics-thumbnailers ffmpegthumbs
```

一些gtk应用的plasma panel托盘图标模糊且右键菜单比较奇怪  
解决方法: 安装libappindicator-gtk3 libappindicator-gtk2

```shell
pacman -S libappindicator-gtk3 libappindicator-gtk2
```

安装一个终端,不然进入图形界面只能进tty输入命令

```shell
pacman -S konsole
```

***
无法检测到蓝牙适配器:
安装`bluez`,`bluez-utils`

```shell
pacman -S bluez bluez-utils
```

首先确定内核的蓝牙模块已载入

```shell
modinfo btusb
```

如果没有的话就是没载入,手动载入:

```shell
modprobe btusb
```

开启bluetooth服务

```shell
systemctl start bluetooth
# 开机自启
systemctl enable bluetooth
```

开机后自动启动:  
修改 `/etc/bluetooth/main.conf`

```conf
[Policy]
# 这一句的注释删除 并将false改成true
AutoEnable=true
```

已知问题:
有时候会崩溃,且无法找到蓝牙适配器,使用`dmesg`查看错误日志.
***
蓝牙耳机可能载入模块失败

```shell
pactl load-module module-bluetooth-discover
Failure: Module initialization failed
```

临时解决方法:

```shell
pactl unload-module  module-bluetooth-discover
pactl   load-module  module-bluetooth-discover
```

长期解决方法<sup><a href='#2'><font color=red>[2]</font></a></sup>:

Edit the file:

```shell
/etc/pulse/default.pa
```

and comment out (with an # at the beginning of the line) the following line:

```shell
#load-module module-bluetooth-discover
```

now edit the file:

```shell
/usr/bin/start-pulseaudio-x11
```

and after the lines:

```shell
   if [ x”$SESSION_MANAGER” != x ] ; then
        /usr/bin/pactl load-module module-x11-xsmp “display=$DISPLAY session_manager=$SESSION_MANAGER” > /dev/null
    fi
```

add the following line:

```shell
    /usr/bin/pactl load-module module-bluetooth-discover
```

This way the Pulse audio’s Bluetooth modules will not be downloaded at boot time but after x11 is started.  
***
字体优化:  
有些字体可能看不见,比如 𫔭 𪠸 :

```shell
#安装 ttf-hanazono ttf-ume(mincho) 字体
pacman -S ttf-hanazono ttf-ume
```

不要使用noto和思源黑体的亚洲字体整合包,因为会优先使用日语字体,造成中文大小不一,尽量下载思源黑体的分开的字体包,然后在`~/.config/fontconfig/fonts.conf`中将中文的思源黑体设置为第一个,具体设置参考[Font_configuration](https://wiki.archlinux.org/index.php/Font_configuration)  
***
解决DNS污染问题:  
安装dnscrypt-proxy 具体方法参见arch wiki [dnscrypt-proxy](https://wiki.archlinux.org/index.php/Dnscrypt-proxy),使用[dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list)排除中国域名  
***
arch 使用pyhon-dlib会提示`Undefined symbol: cblas_dtrsm`  
使用aur或archlinuxcn中的openblas-lapack-git代替pacman源中的cblas,貌似源中的cblas版本太低  
***
自动清除pacman的缓存:  
创建`/usr/share/libalpm/hooks/clean-pacman-cache.hook`

```shell
[Trigger]
Operation = Remove
Operation = Install
Operation = Upgrade
Type = Package
Target = *

[Action]
Description = Cleaning up old packages...
When = PostTransaction
Exec = /usr/bin/paccache -rvk3
```

***
ext4分区优化:  

`有备用电源或者笔记本可以关闭ext4的barriers具体方法参考`[Ext4#Turning_barriers_off](https://wiki.archlinux.org/index.php/Ext4#Turning_barriers_off)  

***
deadbeef-git 打开提示`plugin cdda.so not found or failed to load`  
解决方法: 安装 libcddb libcdio

```shell
pacman -S libcddb libcdio
```

***
使用anime4k会提示缺少openCL库,安装ocl-icd

```shell
pacman -S ocl-icd
```

***
开启powertop的自动优化节省电量:

```shell
#安装powertop
pacman -S powertop
#开机自动启用
vim /etc/systemd/system/powertop.service
#填入以下内容
[Unit]
Description=Powertop tunings

[Service]
ExecStart=/usr/bin/powertop --auto-tune && echo 'on'
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
# 启用
systemctl enable powertop.service
```

以下shell是禁用usb的休眠,不然鼠标用起来很难受(**注意:每个电脑的命令都不同,请自行用powertop查看相应的命令**)

```shell
# Autosuspend for USB device USB Optical Mouse [PixArt]
echo 'on' > '/sys/bus/usb/devices/1-1/power/control';
# Autosuspend for USB device HP Wide Vision HD [Generic]
echo 'on' > '/sys/bus/usb/devices/1-4/power/control';
# Autosuspend for USB device xHCI Host Controller [usb1]
echo 'on' > '/sys/bus/usb/devices/usb1/power/control';
# Autosuspend for USB device xHCI Host Controller [usb2]
echo 'on' > '/sys/bus/usb/devices/usb2/power/control';
# Autosuspend for unknown USB device 1-7 (8087:0a2a)
echo 'on' > '/sys/bus/usb/devices/1-7/power/control';
```

***
rider 需要安装moon(.net framework/.net core)

```shell
pacman -S moon
```

服务端需要mono-xsp,使用aur安装:

```shell
yay -S xsp
```

***

vscode 开发`asp.net`:  
安装 moon dotnet

```shell
pacman -S moon dotnet-sdk
```

dotnet 安装 dotnet-dev-certs 生成证书:

```shell
dotnet tool install --global dotnet-dev-certs
```

export要加入.bashrc 或者每次开始前执行

```shell
export PATH="$PATH:/home/[user]/.dotnet/tools"
```

生成证书

```shell
dotnet dev-certs https
```

如果想卸载

```shell
dotnet tool uninstall --global dotnet-dev-certs
```

***
编译汇编语言 需要安装nasm

```shell
pacman -S nasm
```

***

chrome/chromium 即使已经设置为默认浏览器也会提示设置为默认浏览器:  
解决方法:

>What has worked for me is go to `Settings -> Applications -> File Associations` and there, filter with `html`. Then for the entries `xhtml+xml` and `html`, you can move `Google Chrome` to the first position of the preference order.<a href="#3"><sup><font color=red>[3]</font></sup></a>  

个人测试 只要把`xhtml+xml`的默认开启最高优先级应用设置为chromium/chrome就行了

***
已知问题:

kde discover 无法使用pacman backend  
discover 使用了 packagekit,使用 pkcon 需要root权限,按理来说packagekit会自动获取root且无需输入密码,但discover无法获取root已无法已root用户运行,问题未知,放弃解决  
解决方法:  
卸载discover packagekit packagekit-qt5  
新安装的话 索性不装就行了  

***

>1. 此方法参考自 <a id='1'>[用户添加](https://www.jianshu.com/p/6eaf642a94ed)</a>
>2. 此方法参考自 <a id='2'>[PulseAudio can not load bluetooth module](https://askubuntu.com/questions/689281/pulseaudio-can-not-load-bluetooth-module)
</a>
>3. 此方法来自 <a id="3">[Plasma wont set Chromium as default browser](https://bbs.archlinux.org/viewtopic.php?id=198432)</a>
