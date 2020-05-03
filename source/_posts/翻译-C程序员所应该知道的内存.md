---
title: 翻译-C程序员所应该知道的内存
tags:
  - C
  - English
  - translate
categories:
  - Program
language: zh-Hans
abbrlink: f87fc9f0
date: 2020-05-04 00:26:24
updated: 2020-05-04 00:26:24
---

> 原文章 [What a C programmer should know about memory](https://marek.vavrusa.com/memory/#mmap-fun)
提示: **本篇文章的图片都是直接使用原文中的图片的地址,如果无法显示,请挂代理**
***
2007年,Ulrich Drepper写了一篇"[每个程序员都应该知道的内存](http://www.akkadia.org/drepper/cpumemory.pdf)".是的,虽然这篇文章又细又长,但做到了它所应做到的.很多年后,虚拟内存的概念对于很多人来说仍然难以琢磨,仿佛是某种魔法.我无法抗拒的引用一下.很多年后甚至原始文章的有效性也被[质疑](https://stackoverflow.com/questions/8126311/what-every-programmer-should-know-about-memory),到底发生了什么事?
>北桥,这是什么东西?那不是巷战.

我尝试从"学习锁的基本原理"去传达实用的一面(比如:你能做什么)和更多有趣的东西.可以看待这是一个胶水在原始文章和你每天使用的东西之间.例子将使用linux上的C99,但是更多主题将是普遍的.  
编辑: 虽然我对Windows不了解,但我很乐意联系文章去解释.我会尽全力去提起什么函数是平台特有的,但是再一次我只是一个人.如果你发现出入,请让我知道.  
事不宜迟，倒一杯咖啡，让我们开始吧。

译者注:

```md
worth one's salt:
    good or competent at the job or profession specified.
    ig:"any astrologer worth her salt would have predicted this"

what gives?
    是在英语对话中常用的一句口语
    通常用它的时候只有两层意思
    一个是What's happening?发生了什么事？
    另一个是What is the news?有什么消息？

the practical side
    实用的一面
```

## 理解虚拟内存 - 复杂且神秘

除非你要处理一些嵌入系统或内核空间的代码,否则你应该在保护模式下进行.这太棒了,你的程序一定拥有它自己的[虚拟]地址空间."虚拟"在这里很重要.这意味着,除了其他事情外,你不会被可使用的内存限制,但是也无权获得任何.为了使用这些空间,你不得向操作系统要一些真东西来作后援,这被叫做映射.后援可能是物理内存,也可能是持久性存储.前者也被叫做"匿名映射".但是,稍安勿躁.<!--more-->  
虚拟内存分配(virtual memory allocator=VMA)可以给你所不存在的内存,他只能徒劳的希望你不要去使用它,就像现在的银行.这是过量使用([overcommiting](https://www.kernel.org/doc/Documentation/vm/overcommit-accounting)),并且也存在有需求的程序(稀疏数组),这也意味着内存分配不能简单的说"不".  

```c
char *block = malloc(1024 * sizeof(char));
if (block == NULL) {
	return -ENOMEM; /* Sad :( */
}
```

检查NULL是一个很好的做法,但也没有曾经那么强大.因为过量使用(overcommiting)的存在,操作系统可能给你的内存分配器分配一个有效的内存指针,但当你去访问时-dang*.这里的dang是有平台差异的,但普遍情况下[oom(out-of-memory) killer](http://www.win.tue.nl/~aeb/linux/lk/lk-9.html#ss9.6)将结束你的程序.  

*这里过于简单,as timbatron noted,并且将在[解释按需分页](https://marek.vavrusa.com/memory/#pagefault)节解释.但是我想要在研究细节之前先过一遍更普遍的知识.*

```md
the plot thickens
    said to mean that a complicated situation or series of events starts to become even more complicated or mysterious
    At this point the plot thickened further. A link emerged between the attempt to kill the Pope and the kidnapping of the American.

guaranteed 美 [ˌɡerənˈtid] 英 [ˌɡærənˈtiːd]
    adj. 必定的，肯定的

bounded 美 ['baundid] 英 [ˈbaʊndɪd]
    有界限的, 有限制的

entitled 美 [ɛnˈtaɪtəld; ɪnˈtaɪtəld] 英 [ɪnˈtaɪtəld]
    adj. 有资格的

hold your horses

    used to tell someone to stop and consider carefully their decision or opinion about something:
    Just hold your horses, Bill! Let's think about this for a moment.
    停下來想想，且慢… 稍安勿躁

vain 美 [veɪn] 英 [veɪn]
    adj. 徒劳的

a good practice 一个很好的做法
```

## 绕道 - 内存布局

进程内存的布局已经很好的在Gustavo Duarte所著的[剖析程序内存中](http://duartes.org/gustavo/blog/post/anatomy-of-a-program-in-memory/)中进行解释,所以我将引用并参考原始文章,我希望这是合理的使用.我只有一点想要吹毛求疵一下,那就是他只讲到了x86-32的内存布局,但是幸运的是在x86-64中并没有多大的变化,只是进程可以使用更多的空间 - 在linux中高达 48 bits.

![linux内存布局](http://static.duartes.org/img/blogPosts/linuxFlexibleAddressSpaceLayout.png)
<center>Source: Linux address space layout by <a href="http://duartes.org/gustavo/blog/post/anatomy-of-a-program-in-memory/">Gustavo Duarte</a></center>

这也展示了内存映射段(`memory mapping segment`=MMS)是向下增长的,但是并非总是如此.内存映射段通常开始与([x86/mm/mmap.c:113](http://lxr.free-electrons.com/source/mm/mmap.c#L1953)和[arch/mm/mmap.c:1953](http://lxr.free-electrons.com/source/arch/x86/mm/mmap.c#L113))一个栈底的随机地址.但也可以开始于栈之上或向栈之上增长当且仅当栈很大或栈无限大,或者兼容布局是被允许的.这重要吗?不,但是这将帮助你理解[自由地址范围](https://marek.vavrusa.com/memory/#mmap-fun).  
看那个图表,你可以看到三个不同的变量存放位置:进程数据段(静态存储或堆分配),内存映射段,和栈.让我们从这个开始

```md
anatomy 美 [əˈnætəmi] 英 [əˈnætəmɪ]
    n. 解剖学；结构；身体；剖析

quibble 美 [ˈkwɪbəl] 英 [ˈkwɪbəl]
    vi /ˈkwɪbəl/
        1.（尤指为搪塞）吹毛求疵，诡辩
        2.用双关语；说俏皮话
    n /ˈkwɪbəl/
        1.（尤指为搪塞）吹毛求疵，抱怨
        2.双关语

fair 美 [fɛr] 英 [fɛə]
    合理的

iff [if]
    abbr. (= if and only if) 当且仅当
```

## 未完待续-不定时接着翻译

```md
conquering [ˈkɒŋkərɪŋ]
    adj /ˈkɒŋkərɪŋ/ 进行征服的

digest [ˈdaɪˌdʒɛst]
    理解


scope 美 [skoʊp] 英 [skəʊp]
    n. 范围，领域；

a variable dies 变量的结束

remaining 其余

aka = also-known-as
```
