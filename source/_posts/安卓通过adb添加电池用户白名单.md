---
title: 安卓通过adb添加电池用户白名单
tags:
  - android
categories:
  - android
abbrlink: 1e63e0e
date: 2019-02-02 23:15:29
updated: 2019-02-02 23:15:29
---
安卓6.0引入了doze来节省电量,但某些国产ui(如锤子)阉割了这个菜单,可通过adb添加  


添加应用到白名单：
```
adb shell dumpsys deviceidle whitelist +<package>
```
如:
```
adb shell dumpsys deviceidle whitelist +com.google.android.gms
```
删除白名单(把加号改成减号):  <!--more-->
```
adb shell dumpsys deviceidle whitelist -<package>
```
查看doze状态：  
```
adb shell dumpsys deviceidle
```

获取完整的帮助菜单:  
```
adb shell dumpsys deviceidle -h
```
```
Device idle controller (deviceidle) commands:
  help
    Print this help text.
  step [light|deep]
    Immediately step to next state, without waiting for alarm.
  force-idle [light|deep]
    Force directly into idle mode, regardless of other device state.
  force-inactive
    Force to be inactive, ready to freely step idle states.
  unforce
    Resume normal functioning after force-idle or force-inactive.
  get [light|deep|force|screen|charging|network]
    Retrieve the current given state.
  disable [light|deep|all]
    Completely disable device idle mode.
  enable [light|deep|all]
    Re-enable device idle mode after it had previously been disabled.
  enabled [light|deep|all]
    Print 1 if device idle mode is currently enabled, else 0.
  whitelist
    Print currently whitelisted apps.
  whitelist [package ...]
    Add (prefix with +) or remove (prefix with -) packages.
  except-idle-whitelist [package ...|reset]
    Prefix the package with '+' to add it to whitelist or '=' to check if it is already whitelisted
    [reset] will reset the whitelist to it's original state
    Note that unlike <whitelist> cmd, changes made using this won't be persisted across boots
  tempwhitelist
    Print packages that are temporarily whitelisted.
  tempwhitelist [-u USER] [-d DURATION] [package ..]
    Temporarily place packages in whitelist for DURATION milliseconds.
    If no DURATION is specified, 10 seconds is used
```