---
title: c语言利用char指针变量将int按字节打印地址
tags:
  - C
categories:
  - Program
abbrlink: 43cb2931
date: 2017-10-24 22:27:37
updated: 2017-10-24 22:27:37
language: zh-Hans
---
因为int变量的大小为四个字节,所以如果利用int指针变量+1输出地址的话,实际上是加了四个字节后的地址.
而char的大小刚好为一个字节,是我们想要的东西.
这样我们可以强制转换为char指针变量输出每个字节的地址然后+1,+2,+3来分别输出int的四个字节的地址,得到我们想要的内容.
代码如下
```
int a=-65;
char *b=(char *)&a;
printf("%p\n%p\n%p\n%p\n",a,a+1,a+2,a+3);
```
<!--more-->

如果你想按字节输出内存中的内容可以这样写,这里我输出的是16进制整数.
```
int a=-65;
char *b=(char *)&a;
printf("%02x\n%02x\n%02x\n%02x\n",*(unsigned char*)a,*(unsigned char*)(a+1),*(unsigned char*)(a+2),*(unsigned char*)(a+3));
```
两者结合一下
```
int a=-65;
char *b=(char *)&a;
printf("%p %02x\n%p %02x\n%p %02x\n%p %02x\n",a,*(unsigned char*)a,a+1,*(unsigned char*)(a+1),a+2,*(unsigned char*)(a+2),a+3,*(unsigned char*)(a+3));
```
输出内容如图
![](http://blog-1254450445.cossgp.myqcloud.com/TIM%E6%88%AA%E5%9B%BE20171024224821.png)
__有任何错误请邮箱联系我指出我的错误,万分感谢__
