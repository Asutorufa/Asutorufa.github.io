---
title: golang实现socks5代理连接
tags:
  - socks5
  - 计算机网络
categories:
  - 计算机网络
abbrlink: c7816edc
date: 2019-03-06 20:02:47
updated: 2019-03-06 20:02:47
---
socks5运行流程如下:

- 本机和代理服务端协商和建立连接；
- 本机告诉代理服务端目标服务的地址；
- 代理服务端去连接目标服务，成功后告诉本机；
- 本机开始发送原本应发送到目标服务的数据给代理服务端，由代理服务端完成数据转发。

## 先进行TCP连接

golang实现(_这里的地址我是本地socks5服务端_)

```golang
conn,err := net.Dial("tcp","127.0.0.1:1080")
if err != nil{
 fmt.Println(err)
 return
}
```

## 向socks5服务端发送验证

验证字段:

|VER|NMETHODS|METHODS|
|:-:|:-:|:-:|
|1字节|1字节|1-255字节|

- VER是SOCKS版本，这里应该是0x05； <!--more--> 
- NMETHODS是METHODS部分的长度；  
- METHODS是客户端支持的认证方式列表，每个方法占1字节。当前的定义是：  
  - 0x00 不需要认证
  - 0x01 GSSAPI
  - 0x02 用户名、密码认证
  - 0x03 - 0x7F由IANA分配（保留）
  - 0x80 - 0xFE为私人方法保留
  - 0xFF 无可接受的方法

golang实现代码:  

```golang
_,err = conn.Write([]byte{5,1,0})
var b [2]byte
status,err := conn.Read(b[:])
if err!=nil{
 fmt.Println(err)
 return
}
fmt.Println(b)
fmt.Println(status)
```

## 向socks5服务端发送请求

请求字段:

|VER|CMD|RSV|ATYP|DST.ADDR|DST.PORT|
|:-:|:-:|:-:|:-:|:-:|:-:|
|1字节|1字节|0x00|1字节|动态|2字节|

- VER是SOCKS版本，这里应该是0x05；
- CMD是SOCK的命令码
  - 0x01表示CONNECT请求
  - 0x02表示BIND请求
  - 0x03表示UDP转发
- RSV 0x00，保留
- ATYP DST.ADDR类型
  - 0x01 IPv4地址，DST.ADDR部分4字节长度
  - 0x03 域名，DST.ADDR部分第一个字节为域名长度，DST.ADDR剩余的内容为域名，没有\0结尾。
  - 0x04 IPv6地址，16个字节长度。
- DST.ADDR 目的地址
- DST.PORT 网络字节序表示的目的端口

golang实现代码

```golang
domain := "www.google.com"
before := []byte{5,1,0,3,byte(len(domain))}
de := []byte(domain)
port := []byte{0x1,0xbb}
head_temp := append(before,de...)
head := append(head_temp,port...)

fmt.Println(head)

_,err = conn.Write(head)
if err!=nil{
 fmt.Println(err)
    return
}

var c [10]byte
status_2,err := conn.Read(c[:])
if err!=nil{
 fmt.Println(err)
 return
}
fmt.Println(status_2)
fmt.Println(c)
```

## 进行数据转发

golang实现代码(_不太熟悉各种请求这里随便弄了一个_)

```golang
_,err = conn.Write([]byte("GET /generate_204/ HTTP/2.0\r\n"))
if err!=nil{
 fmt.Println(err)
 return
}
var d [1024]byte

temp := time.Now()

status_3,err := conn.Read(d[:])

deply := time.Since(temp)
fmt.Println(deply)

fmt.Println(status_3)
fmt.Println(string(d[:]))
```

## 关闭TCP连接

```golang
conn.Close()
```

## 参考来源  

[SOCKS(维基百科)](https://en.wikipedia.org/wiki/SOCKS)  
[SOCKS5 协议介绍](https://my.oschina.net/997155658/blog/1563154)  
