---
title: python获取网页源码(爬虫?)
tags:
  - python
  - 编程
categories:
  - python
abbrlink: cee10602
date: 2018-08-07 14:35:06
updated: 2018-08-07 14:35:06
---

利用requrst,使用首先要
```
import requests
```
使用方法
```
url = '要获取的网页地址'
useragent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'#user-agent 可有可无,有些网页防爬虫就要模拟浏览器
requests.get(url,headers={'User-Agent':useragent}))
```
