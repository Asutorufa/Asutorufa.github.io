---
title: '为广告而生,从使用到干掉大陆版MIUI'
categories:
  - Personally
language: zh-Hans
abbrlink: 6c3a98b5
date: 2021-09-25 11:40:35
updated: 2021-09-25 11:40:35
tags:
---

使用四年多的锤子手机越来越不堪重负，我决定换一款新的手机，在精心挑选后，选定了今年年初发布的一款Red MI手机，其极高的性价比打动了我。

## 使用

在收货当天就迫不及待下班回家开始把玩，有一个词可以形容我当时的体验：軽い。  
换手机的契机也是如此，国产app越来越毒瘤，旧手机越来越卡，开启健康码和支付宝都要至少等待2秒。由于四年的落差，即使是一款性价比手机也让我觉得好流畅，还有120hz屏幕，令我爱不释手。  

## 忍受

我知道MIUI是有广告的，但根据各种网上的说法，是有开关是可以关闭的。  
所以我一入手就根据网上流传的各种方法将隐藏在系统不同角落的广告关闭了。  
确实有效，APP和系统设置中的一些广告确实没有了，天真的我以为真的干掉了广告。  
但是不定时广告推送，小米商城推送各种促销，系统自带浏览器也开始充当新闻客户端，各种推送傻逼新闻，而这一切的前提都是在我进入软件关闭各种推送的条件下，在了解后得知可以使用ADB冻结几个系统软件解决，我冻结了以下系统软件：

```shell
adb shell pm disable-user com.xiaomi.ab
adb shell pm disable-user com.miui.systemAdSolution
adb shell pm disable-user com.miui.analytics
adb shell pm disable-user com.sohu.inputmethod.sogou.xiaomi
```

确实有效，而且连某些app的开屏广告都没了。

## 愤怒
<!--more-->
虽然我不重度依赖谷歌，但我重度使用Twitter,Youtube,Reddit，在使用一段时间后，我发现推特的推送不灵了，每次开屏才会一堆一堆的推送，而在息屏的情况下根本收不到推送。  
最初我一度认为是自己的设置有问题，毕竟连我的旧手机锤子都可以及时收到各种推送。  
在对Google Play Service各种设置后，包括但不限于，取消应用黑名单，后台锁住app，但没有任何改变。  
在了解后得知，大陆版MIUI会在息屏后断开FCM的连接，且强制设置在FCM断开后不再允许其重连，这一切我都可以理解，由于国内的环境，不断重试确实会导致耗电增加，在网友提醒下我通过ADB冻结了以下两个应用：

```shell
adb shell pm disable-user com.miui.powerkeeper
adb shell pm disable-user com.xiaomi.powerchecker
```

别说，还真有用，基本上能正常收到推送了，我以为我解决问题了。  
**但是**  
我发现息屏情况下播放音乐，音乐会自动暂停，在上网搜索后，我发现不只我有这个问题，在各方打听后得知是冻结`com.miui.powerkeeper`导致的。  
加上KDE connect会时不时的断开，我真的很愤怒，我能理解MIUI的做法，但我无法忍受不给用户任何开关一刀切的做法，所以我决定干掉自带的陆版MIUI。

## 成为“欧洲人”

在经过7天的忍受之后，备份好手机内的各种资料后，成功解锁了手机。  
我决定刷入`XIAOMI.EU`，一个被小米官方和欧洲ABC经销商认可的官改系统。  
在[xiaomi.eu](https://xiaomi.eu)上提前下载适用于手机的twrp和ROM。  

- 临时刷入TWRP并进入TWRP

    ```shell
    fastboot flash recovery twrp.img
    fastboot boot twrp.img
    ```

- 在TWRP内格式化DATA分区，**注意不要清除System和Persist分区**。
- 在TWRP内开启sideload。  
- 通过sideload刷入rom

    ```shell
    adb sideload xxxxx.ZIP
    ```

在百分之47的时候会结束，貌似是个bug，不过这个时候其实已经成功刷入了，直接重启进入系统即可。

## 享受

没有了小米的各种广告推送，自带谷歌play商店，而不是小米应用商店，手动安装应用时不再要求你多次确认，正常的FCM推送，不再断开的KDE Connect，虽然缺失了一部分特有的功能，但此时此刻我感受到了成为“欧洲人”的优越感。

## 总结

如果你喜欢折腾且会刷机，那么小米手机依旧可以在你的购机候选名单中，否贼就将其永久拉黑。  
我不认同广告漫天飞的系统会符合用户习惯，包括所谓“符合中国用户习惯”。  
