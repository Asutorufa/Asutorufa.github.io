---
title: golang socks5/http proxy
tags:
  - socks5
  - golang
categories:
  - Network
abbrlink: c7816edc
date: 2019-03-06 20:02:47
updated: 2020-05-30 00:00:00
language: zh-Hans
---
完整实现代码:  
[socks5 client](https://github.com/Asutorufa/yuhaiin/blob/master/net/proxy/socks5/client/socks5client.go)  
[socks5 server](https://github.com/Asutorufa/yuhaiin/blob/master/net/proxy/socks5/server/server.go)  
[http server](https://github.com/Asutorufa/yuhaiin/blob/master/net/proxy/http/server/server.go)  

此处已socks5client为例,大致流程都相同,只是协议不同:  

socks5运行流程如下:

tcp:
    - 本机和代理服务端协商和建立连接；
    - 本机告诉代理服务端目标服务的地址；
    - 代理服务端去连接目标服务，成功后告诉本机；
    - 本机开始发送原本应发送到目标服务的数据给代理服务端，由代理服务端完成数据转发。
udp:
    - udp因为是无连接的,所以所以数据一次只用一个udp包
    - socks5是通过tcp先确认socks5 server支持udp,然后再通过udp发送请求

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
sendData := []byte{0x05, 0x01, 0x00}
if _, err := conn.Write(sendData); err != nil{
    return err
}
getData := make([]byte, 3)
if _, err = conn.Read(getData[:]); err != nil {
    return err
}
if getData[0] != 0x05 || getData[1] == 0xFF {
    return errors.New("socks5 first handshake failed!")
}
if getData[1] == 0x02 {
    sendData := append(
        append(
            append(
                []byte{0x01, byte(len(socks5client.Username))},
                []byte(socks5client.Username)...),
            byte(len(socks5client.Password))),
        []byte(socks5client.Password)...)
    _, _ = conn.Write(sendData)
    getData := make([]byte, 3)
    if _, err = conn.Read(getData[:]); err != nil {
        return err
    }
    if getData[1] == 0x01 {
        return errors.New("username or password not correct,socks5 handshake failed!")
    }
}
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
// 此处为向 www.google.com:443 发送请求
domain := "www.google.com"
serverPort := 443
sendData = append(
    append(
        []byte{0x5, 0x01, 0x00, 0x03, byte(len(domain))},
        []byte(domain)...), byte(serverPort>>8),
    byte(serverPort&255))
if _,err = conn.Write(sendData); err!=nil{
    fmt.Println(err)
    return
}
getData := make([]byte, 1024)
if _, err = conn.Read(getData[:]); err != nil {
    return err
}
if getData[0] != 0x05 || getData[1] != 0x00 {
    return errors.New("socks5 second handshake failed!")
}
```

## 进行数据转发

golang实现代码(_不太熟悉各种请求这里随便弄了一个_)

```golang
if _,err = conn.Write([]byte("GET /generate_204/ HTTP/2.0\r\n")); err!=nil{
    fmt.Println(err)
    return
}
```

## 关闭TCP连接

```golang
conn.Close()
```

## UDP

```md
      +----+------+------+----------+----------+----------+
      |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
      +----+------+------+----------+----------+----------+
      | 2  |  1   |  1   | Variable |    2     | Variable |
      +----+------+------+----------+----------+----------+

     The fields in the UDP request header are:

          o  RSV  Reserved X'0000'
          o  FRAG    Current fragment number
          o  ATYP    address type of following addresses:
             o  IP V4 address: X'01'
             o  DOMAINNAME: X'03'
             o  IP V6 address: X'04'
          o  DST.ADDR       desired destination address
          o  DST.PORT       desired destination port
          o  DATA     user data
```

## 参考来源  

[SOCKS(维基百科)](https://en.wikipedia.org/wiki/SOCKS)  
[SOCKS5 协议介绍](https://my.oschina.net/997155658/blog/1563154)  
[rfc1928](https://tools.ietf.org/html/rfc1928)  
