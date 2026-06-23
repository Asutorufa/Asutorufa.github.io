---
title: 三蛋空间自建贴吧云签到
categories:
  - 建站
tags:
  - 建站
  - 免费
abbrlink: 8a291f21
date: 2017-10-08 15:16:56
updated: 2017-10-08 15:16:56
language: zh-Hans
---
## --
这是我自建的贴吧云签到:~~http://dmly.tk~~(已失效)
之后为教程

### 注册免费空间
首先你得注册一个三蛋空间的账号,三蛋空间注册网址:[三蛋空间](https://www.000webhost.com/members/website/list)<!--more-->

### 创建网站
注册完成之后点击这里 添加一个空模版,如图

![](./90cebe21cc5f.png)

写上名字和密码,点击create

![](./5220d289271a.png)

### ftp 
下载SmartFTP Client或者其他你熟悉的ftp上传工具,这里百度就行了
进入三蛋空间的管理网站,点击这里,如图

![](./4d04f06e2e02.png)
![](./4ad83b1ee168.png)

把这里的信息填入SmartFTP Client中

![](./93b2773e53f4.png)
然后点ok

### 上传
贴吧云签到源码github地址:[Tieba-Cloud-Sign](https://github.com/MoeNetwork/Tieba-Cloud-Sign)
点击这里下载zip并解压

![](./b1532377a19e.png)

将解压得到的所有文件拖入ftp上的public_html文件夹中

![](./94c07f697492.png)

### 创建数据库
然后进入三蛋空间创建数据库
三蛋空间会自动给你的数据库名字前加上数字,所以之后在贴吧安装中要注意

![](./7ceb820578ab.png)


### 安装
之后进入你的网站,然后安装就行了.

### 创建cron job
安装完成后就要把do.php加入cron,否则是不会自动签到的,按图中的步骤进行
![](./b796661bef62.png)
