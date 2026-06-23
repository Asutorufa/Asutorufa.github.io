---
title: 秘密共享
tags:
  - Crypto
  - Shamir
categories:
  - Crypto
abbrlink: ce6c7d90
date: 2022-10-10 11:05:22
updated: 2022-10-10 11:05:22
language: zh-Hans
---

## 拉格朗日插值法

对某个多项式函数，已知有给定的 $k+1$ 个取值点：$(x_0,y_0)\ldots(x_k,y_k)$。  
假设任意两个不同的 $x_j$ 都互不相同，那么应用拉格朗日插值公式所得到的拉格朗日插值多项式为：

$$
\ell_0(x)=\frac{(x-x_1)(x-x_2)\cdots(x-x_k)}{(x_0-x_1)(x_0-x_2)\cdots(x_0-x_k)}y_0
$$

$$
\cdots
$$

$$
\ell_k(x)=\frac{(x-x_0)(x-x_1)\cdots(x-x_{k-1})}{(x_k-x_0)(x_k-x_1)\cdots(x_k-x_{k-1})}y_k
$$

$$
f(x)=\ell_0(x)+\ell_1(x)+\cdots+\ell_k(x)
$$

即可求出多项式。

### example

已知 3 个点 $(4,10)(5,5.25)(6,1)$。

$$
\ell_0(x)=\frac{(x-5)(x-6)}{(4-5)(4-6)}\times 10
$$

$$
\ell_1(x)=\frac{(x-4)(x-6)}{(5-4)(5-6)}\times 5.25
$$

$$
\ell_2(x)=\frac{(x-4)(x-5)}{(6-4)(6-5)}\times 1
$$

$$
f(x)=\ell_0+\ell_1+\ell_2=\frac{1}{4}(x^2-28x+136)
$$

## Shamir 秘密共享

生成
<!--more-->
- 设需要生成 $w$ 个密钥，至少需要 $t$ 个密钥才能算出真实密钥。
- 选择一个数 $P$，之后所有数都需要进行模运算。
- 设置真实密钥 $K$。
- 随机选择 $t-1$ 个不大于 $P$ 的数 $a_0,a_1\ldots a_{t-1}$。
- 得到多项式 $f(x)=K+a_0x+a_1x^2\ldots+a_{t-1}x^t$。
- 将 $x=1,x=2\ldots x=w$ 带入多项式即可获得多个密钥 $(1,k_1)(2,k_2)\ldots(w,k_w)$。

解密

- 利用拉格朗日插值法即可算出多项式。
- 需要带上模计算多项式，如果计算多项式时有除法需要进行计算模乘逆元。
- 因为只需要 $K$ 所以计算的时候可以直接令 $x=0$。

### eg1

$w=4,t=3,K=2,p=23$，选择随机数 $a_0=3,a_1=2$。

加密

$$
f(x)=(2+3x+2x^2)\bmod 23
$$

$$
f(1)=2,\ f(2)=16,\ f(3)=6,\ f(4)=0
$$

获得 4 个密钥 $(1,2)(2,16)(3,6)(4,0)$。

解密

选择其中三个进行解密，$(1,7)(3,6)(4,0)$。

$$
\ell_0=\frac{(x-3)(x-4)}{(1-3)(1-4)}\times 7
$$

$$
\ell_1=\frac{(x-1)(x-4)}{(3-1)(3-4)}\times 6
$$

$$
\ell_2=\frac{(x-1)(x-3)}{(4-1)(4-3)}\times 0
$$

将 $x=0$ 带入可得

$$
\ell_0=14,\ \ell_1=-12,\ \ell_2=0
$$

$$
K=(\ell_0+\ell_1+\ell_2)\bmod 23=2\bmod 23=2
$$

### eg2

$w=5,t=3,k=13,p=17$，选择随机数 $a_0=10,a_1=2$。

加密

$$
f(x)=(13+10x+2x^2)\bmod 17
$$

$$
f(1)=8,\ f(2)=7,\ f(3)=10,\ f(4)=0,\ f(5)=11
$$

获得 5 个密钥 $(1,8)(2,7)(3,10)(4,0)(5,11)$。

解密

选择其中三个进行解密，$(1,8)(2,7)(5,11)$。

$$
\ell_0=11\times\frac{(x-1)(x-2)}{(5-1)(5-2)}
$$

$$
\ell_1=7\times\frac{(x-1)(x-5)}{(2-1)(2-5)}
$$

$$
\ell_2=8\times\frac{(x-2)(x-5)}{(1-2)(1-5)}
$$

将 $x=0$ 带入

$$
\ell_0=\frac{22}{12},\ \ell_1=-\frac{140}{12},\ \ell_2=\frac{240}{12}
$$

$$
K=(\ell_0+\ell_1+\ell_2)\bmod 17
$$

$$
=\frac{61}{6}\bmod 17
$$

$$
=(61\times 6^{-1})\bmod 17
$$

其中 $6^{-1}$ 为 $6$ 关于 $17$ 的模乘逆元，为 $3$。

$$
=(61\times 3)\bmod 17=13
$$

## 中国剩余定理

example

$w=5,t=3,K=117$。

选择 $w$ 个 $d$，要求单调递增并两两互素，$t$ 个最小的 $d$ 相乘大于 $K$，$K$ 大于 $t-1$ 个最大 $d$ 相乘。

$$
d_1=4,d_2=5,d_3=7,d_4=9,d_5=11
$$

计算

$$
k_i=K\bmod d_i
$$

$$
k_1=117\bmod 4=1
$$

$$
k_2=117\bmod 5=2
$$

$$
k_3=117\bmod 7=5
$$

$$
k_4=117\bmod 9=0
$$

$$
k_5=117\bmod 11=7
$$

即五个密钥 $(1,4),(2,5),(3,7),(0,9),(7,11)$。

解密，选其中三个密钥 $(1,4)(2,5)(3,7)$，可得

$$
k\bmod 4=1,\quad k\bmod 5=2,\quad k\bmod 11=7
$$

分解为

$$
k_1\bmod 4=1,\ k_1\bmod 5=0,\ k_1\bmod 11=0
$$

$$
5\times 11\times x_1\bmod 4=1
$$

$$
x_1=3,\quad k_1=55\times 3=165
$$

$$
k_2\bmod 4=0,\ k_2\bmod 5=2,\ k_2\bmod 11=0
$$

$$
4\times 11\times x_2\bmod 5=2
$$

$$
44\times x_2\times 2^{-1}\bmod 5=1
$$

其中 $2^{-1}$ 为 $2$ 关于 $5$ 的模乘逆元。

$$
44\times x_2\times 3\bmod 5=1
$$

$$
132\times x_2\bmod 5=1
$$

相当于算 $132$ 关于 $5$ 的模乘逆元。

$$
x_2=3,\quad k_2=44\times 3=132
$$

$$
k_3\bmod 4=0,\ k_3\bmod 5=0,\ k_3\bmod 11=7
$$

$$
4\times 5\times x_3\bmod 11=7
$$

$$
20\times x_3\times 7^{-1}\bmod 11=1
$$

其中 $7^{-1}$ 为 $7$ 关于 $11$ 的模乘逆元。

$$
20\times x_3\times 8\bmod 11=1
$$

$$
160\times x_3\bmod 11=1
$$

相当于算 $160$ 关于 $11$ 的模乘逆元。

$$
x_3=2,\quad k_3=40
$$

$$
K=(k_1+k_2+k_3)\bmod(4\times 5\times 11)
$$

$$
=(165+132+40)\bmod 220=337\bmod 220=117
$$

另一种：

$$
k_1\bmod 4=1,\ k_1\bmod 5=0,\ k_1\bmod 11=0
$$

$$
1\times (k_1\bmod 4=1,\ k_1\bmod 5=0,\ k_1\bmod 11=0)
$$

$$
5\times 11\times x_1\bmod 4=1
$$

$$
x_1=3,\quad k_1=1\times 55\times 3=165
$$

$$
k_2\bmod 4=0,\ k_2\bmod 5=2,\ k_2\bmod 11=0
$$

$$
2\times (k_2\bmod 4=0,\ k_2\bmod 5=1,\ k_2\bmod 11=0)
$$

$$
4\times 11\times x_2\bmod 5=1
$$

$$
x_2=4,\quad k_2=2\times 44\times 4=352
$$

$$
k_3\bmod 4=0,\ k_3\bmod 5=0,\ k_3\bmod 11=7
$$

$$
7\times (k_3\bmod 4=0,\ k_3\bmod 5=0,\ k_3\bmod 11=1)
$$

$$
4\times 5\times x_3\bmod 11=1
$$

$$
x_3=5,\quad k_3=7\times 20\times 5=700
$$

$$
K=(k_1+k_2+k_3)\bmod(4\times 5\times 11)
$$

$$
=(165+352+700)\bmod 220=1217\bmod 220=117
$$

***

- [Shamir's Secret Sharing - Wikipedia](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing)
- [拉格朗日插值法 - Wikipedia](https://zh.wikipedia.org/wiki/%E6%8B%89%E6%A0%BC%E6%9C%97%E6%97%A5%E6%8F%92%E5%80%BC%E6%B3%95)
- [趣说密码学（五）秘密共享方案——shamir,中国剩余定理,Brickell和Blakley](https://zhuanlan.zhihu.com/p/95362628)
- [Shamir秘密共享方案 (Python)](https://www.cnblogs.com/pyrie/p/sss_py.html)
