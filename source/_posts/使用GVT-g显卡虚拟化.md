---
title: 使用GVT-g显卡虚拟化
tags:
  - Linux
  - qemu
  - GVT-g
  - intel
categories:
  - Linux
language: zh-Hans
abbrlink: 3a1d136
date: 2021-01-17 20:53:29
updated: 2021-01-17 20:53:29
---

## 为内核添加参数

比如`grub`在`/etc/default/grub`的`GRUB_CMDLINE_LINUX_DEFAULT=`中添加

```conf
intel_iommu=on i915.enable_gvt=1 i915.enable_guc=0
```

## 启用modules

在`/etc/mkinitcpio.conf`的MODULES=()`中添加:

```conf
kvmgt vfio vfio-iommu-type1 vfio-mdev
```

然后运行,我用的zen内核所以是linux-zen,默认内核是linux

```bash
sudo mkinitcpio -p linux-zen
```

重启计算机  

查看`/sys/devices/pci0000:00/0000:00:02.0/mdev_supported_types`可以看见类似如下的目录
<!--more-->
```bash
# ls /sys/devices/pci${GVT_DOM}/$GVT_PCI/mdev_supported_types
i915-GVTg_V5_1  # Video memory: <512MB, 2048MB>, resolution: up to 1920x1200
i915-GVTg_V5_2  # Video memory: <256MB, 1024MB>, resolution: up to 1920x1200
i915-GVTg_V5_4  # Video memory: <128MB, 512MB>, resolution: up to 1920x1200
i915-GVTg_V5_8  # Video memory: <64MB, 384MB>, resolution: up to 1024x768
```

向create文件中写入uuid(自己生成)就会创建相应的虚拟显卡

```bash
echo "$GVT_GUID" > "/sys/devices/pci${GVT_DOM}/$GVT_PCI/mdev_supported_types/$GVT_TYPE/create"
```

移除

```bash
echo 1 > /sys/bus/pci/devices/$GVT_PCI/$GVT_GUID/remove
```

## qemu添加钩子, 启动虚拟机时自动创建虚拟显卡

`/etc/libvirt/hooks/qemu`中, 沒有则自己创建

```bash
#!/bin/bash
GVT_PCI=<GVT_PCI> # 这里为显卡的地址, 比如 0000:00:02.0
GVT_GUID=<GVT_GUID> # 这里为自己生成的uuid
MDEV_TYPE=<GVT_TYPE> # 这里为要使用的虚拟的类型, 比如 i915-GVTg_V5_8
DOMAIN=<DOMAIN name> # qemu虚拟机的名字
if [ $# -ge 3 ]; then
    if [ $1 = "$DOMAIN" -a $2 = "prepare" -a $3 = "begin" ]; then
        echo "$GVT_GUID" > "/sys/bus/pci/devices/$GVT_PCI/mdev_supported_types/$MDEV_TYPE/create"
    elif [ $1 = "$DOMAIN" -a $2 = "release" -a $3 = "end" ]; then
        echo 1 > /sys/bus/pci/devices/$GVT_PCI/$GVT_GUID/remove
    fi
fi
```

这样启动虚拟机时会自动创建, 停止后会自动删除

## 生成虚拟机配置

可以使用`virt-manager`先生成一个虚拟机, 再修改相应的配置, 默认配置文件在`/etc/libvirt/qemu/`  
需要添加/修改的配置:

```xml
  <qemu:commandline>
    <qemu:arg value='-set'/>
    <qemu:arg value='device.hostdev0.x-igd-opregion=on'/>
    <qemu:arg value='-set'/>
    <qemu:arg value='device.hostdev0.ramfb=on'/>
    <qemu:arg value='-set'/>
    <qemu:arg value='device.hostdev0.driver=vfio-pci-nohotplug'/>
    <qemu:env name='MESA_LOADER_DRIVER_OVERRIDE' value='i965'/> <!--intel启用OpenGL可能会花屏, 不会就不要加这一条-->
  </qemu:commandline>
```

hostdev配置可以在添加硬件(PCI HOST Devices)的界面直接修改xml, 更方便一点

```xml
    <hostdev mode='subsystem' type='mdev' managed='no' model='vfio-pci' display='on'>
      <source>
        <address uuid='93397e71-15bf-4889-98b7-aa2d735e6260'/>
      </source>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x09' function='0x0'/>
    </hostdev>
```

```xml
    <video>
      <model type='none'/>
    </video>
```

```xml
    <graphics type='spice'>
            <listen type='none'/>
            <image compression='off'/>
            <jpeg compression='never'/>
            <zlib compression='never'/>
            <playback compression='off'/>
            <streaming mode='off'/>
      <gl enable='yes' rendernode='/dev/dri/by-path/pci-0000:00:02.0-render'/>
    </graphics>
```

```xml
  <vcpu placement='static'>2</vcpu>
  <cputune>
    <vcpupin vcpu='0' cpuset='1'/>
    <vcpupin vcpu='1' cpuset='2'/>
  </cputune>
```

## 结尾

启动虚拟机后, 进入虚拟机安装相应的显卡驱动就行了.  
这样就快很多了, 比软件渲染快多了, 这样用linux也能愉快的使用其他系统了.

***

[Intel_GVT-g](https://wiki.archlinux.org/index.php/Intel_GVT-g)
[让 KVM 上的 Windows 虚拟机插上GVT-g 的翅膀](https://medium.com/@langleyhouge/%E8%AE%A9-kvm-%E4%B8%8A%E7%9A%84-windows-%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%8F%92%E4%B8%8Agvt-g-%E7%9A%84%E7%BF%85%E8%86%80-ac0ac28b73b8)
[libvirt hooks](https://www.libvirt.org/hooks.html)
[Intel Gvt](https://blog.bepbep.co/posts/gvt/)
