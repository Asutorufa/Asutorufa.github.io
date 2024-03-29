---
title: c语言中格式化字符的应用
tags:
  - C
categories:
  - Program
abbrlink: b6b4601
date: 2017-10-10 13:03:15
updated: 2017-10-10 13:03:15
language: zh-Hans
---
## 格式化规定符
符号 作用
%d 十进制有符号整数
%u 十进制无符号整数
%f 浮点数
%s 字符串
%c 单个字符
%p 指针的值
%e 指数形式的浮点数
%x, %X 无符号以十六进制表示的整数<!--more-->
%0 无符号以八进制表示的整数
%g 自动选择合适的表示法

说明:
(1). 可以在"%"和字母之间插进数字表示最大场宽。
例如: %3d 表示输出3位整型数, 不够3位右对齐。
%9.2f 表示输出场宽为9的浮点数, 其中小数位为2, 整数位为6,小数点占一位, 不够9位右对齐。
另外, 若想在输出值前加一些0, 就应在场宽项前加个0。
例如: %04d 表示在输出一个小于4位的数值时, 将在前面补0使其总宽度为4位。
如果用浮点数表示字符或整型量的输出格式, 小数点后的数字代表最大宽度,小数点前的数字代表最小宽度。
例如: %6.9s 表示显示一个长度不小于6且不大于9的字符串。若大于9, 则第9个字符以后的内容将被删除。
(2). 可以在"%"和字母之间加小写字母l, 表示输出的是长型数。
例如: %ld 表示输出long整数,%lf 表示输出double浮点数
(3). 可以控制输出左对齐或右对齐, 即在"%"和字母之间加入一个"-" 号可说明输出为左对齐, 否则为右对齐。
例如: %-7d 表示输出7位整数左对齐,%-10s 表示输出10个字符左对齐.

## 一些特殊规定字符
字符 作用
/n   换行
/f   清屏并换页
/r   回车
/t   Tab符
/xhh 表示一个ASCII码用16进表示,其中hh是1到2个16进制数
