---
title: c语言数组输出的另一种方法
categories:
  - 编程
tags:
  - c语言
  - 编程
abbrlink: 854ed6ec
date: 2017-12-10 10:39:54
updated: 2017-12-10 10:39:54
---

今天看到这样一种写法,原文链接:[一个有趣的C语言程序](http://blog.accut.cn/archives/173)

```
#include <stdio.h>
 
int main()
{
    int a = 1;
    int x[5]={1,2,3,4,5};
    printf("%d",a[x]);
    return 0;
}
```
```
output: 2
```

<!--more-->
int x[5],x实际上保存的是这个数组首元素的地址也就是&x[0].
a[x]的等效写法是\*(a+&x).因为上面说了x实际上是x[0].
所以可以进一步写成\*(a+&x[0]),又因为a=1所以可以替换成\*(&x[0]+1),也就是x[1].
所以就是x[1]对应的值：2

由此我又想到了二位数组
```
#include <stdio.h>
 
int main()
{
    int a = 1;
    int x[2][2]={{1,2},{3,4}};
    printf("%d",a[a[x]]);
    return 0;
}
```
```
output: 4
```
感觉好神奇,而且在之前不知道在哪看到__c语言的数组其实就是指针的合集__,而且最近要用链表,更觉得链表和数组差不多.