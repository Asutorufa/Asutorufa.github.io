---
title: NAT穿透
tags:
  - NAT
  - UDP
categories:
  - Network
language: zh-Hans
abbrlink: 1124a628
date: 2020-04-22 11:33:26
updated: 2020-04-22 11:33:26
---
## NAT 网络地址转换

网络地址转换 NAT (Network Address Translation)  方法于1994年提出。  
需要在专用网连接到互联网的路由器上安装 NAT 软件。装有 NAT 软件的路由器叫作 NAT路由器，它至少有一个有效的外部全球IP地址。  
所有使用本地地址的主机在和外界通信时，都要在 NAT 路由器上将其本地地址转换成全球 IP 地址，才能和互联网连接。  

### 网络地址转换的过程

内部主机 A 用本地地址 IPA 和互联网上主机 B 通信所发送的数据报必须经过 NAT 路由器。  
NAT 路由器将数据报的源地址 IPA 转换成全球地址 IPG，**并把转换结果记录到NAT地址转换表中**，目的地址 IPB 保持不变，然后发送到互联网。  
NAT 路由器收到主机 B 发回的数据报时，知道数据报中的源地址是 IPB 而目的地址是 IPG。  
根据 NAT 转换表，NAT 路由器将目的地址 IPG 转换为 IPA，转发给最终的内部主机 A。  

网络地址转换表例子:

```md
+-------------+---------------+
| private IP  |   public IP   |
+-------------+---------------+
| 192.168.1.55|219.152.168.222|
+-------------+---------------+
| 192.168.1.59|219.152.168.223|
+-------------+---------------+
|192.168.1.155|219.152.168.224|
+-------------+---------------+
```

<!--more-->
### NAPT 网络地址与端口号转换

为了更加有效地利用 NAT 路由器上的全球IP地址，现在常用的 NAT 转换表把运输层的端口号也利用上。这样，就可以使多个拥有本地地址的主机，共用一个 NAT 路由器上的全球 IP 地址，因而可以同时和互联网上的不同主机进行通信。  
使用端口号的 NAT 叫作网络地址与端口号转换NAPT (Network Address and Port Translation)，而不使用端口号的 NAT 就叫作传统的 NAT (traditional NAT)。  

带端口的网络地址转换表例子:

```md
+-----------------+--------------------+
|   private IP    |     public IP      |
+-----------------+--------------------+
|192.168.1.55:5566|219.152.168.222:9200|
+-----------------+--------------------+
| 192.168.1.59:80 |219.152.168.222:9201|
+-----------------+--------------------+
|192.168.1.59:4465|219.152.168.222:9202|
+-----------------+--------------------+
```

### 不同类型的NAT

来自Wikipedia  

- 完全圆锥型NAT（Full cone NAT），即一对一（one-to-one）NAT  
  一旦一个内部地址（iAddr:port）映射到外部地址（eAddr:port），所有发自iAddr:port的包都经由eAddr:port向外发送。任意外部主机都能通过给eAddr:port发包到达iAddr:port（注：port不需要一样）  
- 受限圆锥型NAT（Address-Restricted cone NAT）  
  内部客户端必须首先发送数据包到对方（IP=X.X.X.X），然后才能接收来自X.X.X.X的数据包。在限制方面，唯一的要求是数据包是来自X.X.X.X。  
  内部地址（iAddr:port1）映射到外部地址（eAddr:port2），所有发自iAddr:port1的包都经由eAddr:port2向外发送。外部主机（hostAddr:any）能通过给eAddr:port2发包到达iAddr:port1。（注：any指外部主机源端口不受限制，但是目的端口必须是port2。只有外部主机数据包的目的IP 为 内部客户端的所映射的外部ip，且目的端口为port2时数据包才被放行。）  
- 端口受限圆锥型NAT（Port-Restricted cone NAT）  
  类似受限制锥形NAT（Restricted cone NAT），但是还有端口限制。  
  一旦一个内部地址（iAddr:port1）映射到外部地址（eAddr:port2），所有发自iAddr:port1的包都经由eAddr:port2向外发送。  
  在受限圆锥型NAT基础上增加了外部主机源端口必须是固定的。  
- 对称NAT（Symmetric NAT）  
  每一个来自相同内部IP与端口，到一个特定目的地地址和端口的请求，都映射到一个独特的外部IP地址和端口。  
  同一内部IP与端口发到不同的目的地和端口的信息包，都使用不同的映射  
  只有曾经收到过内部主机数据的外部主机，才能够把数据包发回  

## UDP打洞

UDP打洞就是利用了NAT地址转换表.  

### 正常访问一台具有公网IP的主机

```md
      +-----+
A <-  | NAT |  -----Public INTERNET -> B
      +-----+
```

由主机A向主机B发起请求.  
NAT将内网地址转换为公网地址,并存在NAT转换表中,这样NAT就知道了来自B的访问应该发给A.  

### 两台都在NAT中的主机建立连接

```md
      +-----+                              +-----+
A <-  |NATA |  ----- Public INTERNET ----- | NATB|  -> B
      +-----+                              +-----+
```

首先我们需要知道两台NAT的公网地址和主机A,B的端口.  
假设NATA的公网地址为1.1.1.1,主机A的端口为1000,NATB的公网地址为1.0.0.1,主机B的端口为1001.  
然后由A向1.0.0.1:1001发起UDP请求,这样NATA就会记住来自1.0.0.1:1001的请求应该发给A.  
B也进行同样的操作向1.1.1.1:1000,发起UDP请求.  
这样A和B就建立起了一条连接.

为了知道主机A和主机B所在网络公网地址,我们需要有一台在公网中的主机来存储A和B的公网地址和端口.

### STUN

STUN（Session Traversal Utilities for NAT，NAT会话穿越应用程序）是一种网络协议，它允许位于NAT（或多重NAT）后的客户端找出自己的公网地址，查出自己位于哪种类型的NAT之后以及NAT为某一个本地端口所绑定的Internet端端口。这些信息被用来在两个同时处于NAT路由器之后的主机之间创建UDP通信。该协议由[RFC 5389](https://tools.ietf.org/html/rfc5389)定义。  

### TURN

TURN（全名Traversal Using Relay NAT），是一种数据传输协议（data-transfer protocol）。允许在TCP或UDP的连在线跨越NAT或防火墙。  
TURN是一个client-server协议。TURN的NAT穿透方法与STUN类似，都是通过获取应用层中的公有地址达到NAT穿透。但实现TURN client的终端必须在通信开始前与TURN server进行交互，并要求TURN server产生"relay port"，也就是relayed-transport-address。这时TURN server会创建peer，即远程端点（remote endpoints），开始进行中继（relay）的动作，TURN client利用relay port将数据发送至peer，再由peer转传到另一方的TURN client。该协议由[RFC 5766](https://tools.ietf.org/html/rfc5766)定义。  

***

>[STUN](https://zh.wikipedia.org/wiki/STUN)  
>[TURN](https://zh.wikipedia.org/wiki/TURN)
>[网络地址转换](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E5%9C%B0%E5%9D%80%E8%BD%AC%E6%8D%A2)  
>[NAT与NAT穿透(二)](https://blog.csdn.net/ustcgy/article/details/5655050)  
>[简单解释 P2P 技术之 UDP 打洞](https://zhuanlan.zhihu.com/p/40816201)  
>[P2P技术详解(一)：NAT详解——详细原理、P2P简介](http://www.52im.net/thread-50-1-1.html)  
