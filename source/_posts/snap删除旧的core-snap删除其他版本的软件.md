---
title: snap删除旧的core(snap删除其他版本的软件)
tags:
  - linux
  - snap
categories:
  - linux
abbrlink: b6b8953
date: 2018-06-28 13:43:41
updated: 2018-06-28 13:43:41
---
偶尔发现snap会自动升级core且不删除旧版，在'/snap/core'
会发现好几个版本的文件夹。
使用

```
sudo snap remove core --revision xxx
```
删除某个版本的core，xxx是软件的rev，使用

```
snap list
```

可以查看软件的rev，其他软件也能用这个方法删除旧的版本哦。

参考：[How to unmount and possibly delete old Ubuntu Core snap](https://askubuntu.com/questions/828859/how-to-unmount-and-possibly-delete-old-ubuntu-core-snap)
