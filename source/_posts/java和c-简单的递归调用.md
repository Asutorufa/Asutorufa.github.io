---
title: java和c++简单的递归调用
tags:
  - c++
  - java
  - 编程
categories:
  - 编程
abbrlink: 5eb800c7
date: 2017-10-26 08:50:16
---
题目是盗来的
```
猴子吃桃问题。猴子第一天摘下若干个桃子，当即吃了一半，还不过瘾，又多吃了一个。
第二天早上又将剩下的桃子吃掉一半，又多吃了一个。以后每天早上都吃了前一天剩下的一半零一个。
到第n天早上想再吃时，见只剩下一个桃子了。求第一天共摘了多少桃子。
例如：
输入：3
输出：10
输入：10
输出：1534
```
<!--more-->
C++:
```
#include "iostream"

using namespace std;
long long d(int);
int main(int argc, char const *argv[])
{
	int a;
	cin>>a;
	cout<<d(a)<<endl;
	return 0;
}

long long d(int a)
{
	long long e;
	if(a==1)
	{
		e=1;
	}
	else if(a>1)
	{
		e=(d(a-1)+1)*2;
	}
	return e;
}
```

java:
```
import java.util.*;

public class dgcs
{
	public static void main(String[] args)
	{
		Scanner in=new Scanner(System.in);
		int a=in.nextInt();
		System.out.println(f(a));		
		}

	public static long f(int a)
	{
		long e;
		if(a==1)
			{
				e=1;
			}
		else
		{
			e=(f(a-1)+1)*2;
		}
		return e;
	}
}
```