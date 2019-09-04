---
title: C输出字符串的ASCII码
categories:
  - 编程
tags:
  - c语言
  - 编程
abbrlink: 1cf9e3fb
date: 2017-10-08 09:38:24
updated: 2017-10-08 09:38:24
---
``` bash
#include <stdio.h>
int main()
{
char str[]=”This is a string!”;
int i=0;
while(str[i]!=’\0′)
{
printf(“%c=%d\n”,str[i],str[i]);
i++;
}
printf(“%c=%d\n”,str[i],str[i]);
}
```