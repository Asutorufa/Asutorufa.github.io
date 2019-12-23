---
title: http Keep-Alive
tags:
  - HTTP
  - proxy
categories:
  - HTTP
abbrlink: d91b7c06
date: 2019-12-23 23:37:32
updated: 2019-12-23 23:37:32
---
## http keep-alive

http头部`Connection: Keep-Alive`代表连接请求保持长连接  
**如果是http代理,必须处理`Proxy-Connection: Keep-Alive`为`Connection: Keep-Alive`,如果代理没有实现`Keep-Alive`就不变或者将Connection设为close.**  

优点:减少握手次数,如下图(图来源文章最下面)
![keep-alive](https://milestone-of-se.nesuke.com/wp-content/uploads/2018/12/http-keepalive-2v2.png)
<!--more-->
## 判断一次连接的传输结束

### 使用消息首部字段`Conent-Length`

`Conent-Length`表示实体内容长度，客户端（服务器）可以根据这个值来判断数据是否接收完成。

### 使用`Transfer-Encoding: chunked`

chunk编码将数据分成一块一块的发生。Chunked编码将使用若干个Chunk串连而成，由一个标明长度为0的chunk标示结束。

***
参考:

- [【図解】TCP Keep-Alive/http Keep-Aliveの仕組みと違い ～Client/Serverの挙動とメリット,設定～](https://www.google.com/amp/s/milestone-of-se.nesuke.com/nw-basic/as-nw-engineer/keepalive-tcp-http/%3Famp=1)  
- [HTTP头部详解](https://www.cnblogs.com/skynet/archive/2010/12/11/1903347.html#!comments)  
- [HTTP协议的Keep-Alive 模式](https://www.jianshu.com/p/49551bda6619)
