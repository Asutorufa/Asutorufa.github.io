---
title: NAT类型
tags:
  - NAT
  - UDP
categories:
  - Network
language: zh-Hans
abbrlink: 14e0ef9e
date: 2023-02-14 10:48:24
updated: 2023-02-14 10:48:24
---

## NAT Mapping

描述NAT在映射网络内主机地址的行为

```md
computer(192.168.100.2:30086) -> NAT -> 1.1.1.1:2345
```

Endpoint-Independent Mapping

网络内主机在通过同一监听udp地址向不同地址和不同端口发包时, NAT使用同一映射地址向外发包

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086

此时主机向 1.0.0.1:53 发送udp包,
             NAT使用 1.1.1.1:2345 向 1.0.0.1:53 发包
主机又向   1.0.0.1:63 发送udp包,
             NAT也使用 1.1.1.1:2345 向 1.0.0.1:63 发包
主机又向   8.8.8.8:53 发送udp包,
             NAT也使用 1.1.1.1:2345 向 8.8.8.8:53 发包

这种无论目标地址和端口是什么都使用同一地址进行发包的NAT行为就是 Endpoint-Independent Mapping,
跟没有NAT一样
```

Address-Dependent Mapping

网络内主机在通过同一监听udp地址向同一地址和不同端口发包时, NAT使用同一映射地址向外发包

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086

此时主机向 1.0.0.1:53 发送udp包,
             NAT使用 1.1.1.1:2345 向 1.0.0.1:53 发包
主机又向   1.0.0.1:63 发送udp包,
             NAT也将使用 1.1.1.1:2345 向 1.0.0.1:63 发包
主机又向   8.8.8.8:53 发送udp包,
             此时NAT将使用一新映射地址 1.1.1.1:5678 向 8.8.8.8:53 发包

这种依赖目标地址但不依赖端口的NAT映射行为就是 Address-Dependent Mapping
```
<!--more-->
Address and Port-Dependent Mapping

网络内主机在通过同一监听udp地址向同一地址和同一端口发包时, NAT使用同一映射地址向外发包

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086

此时主机向 1.0.0.1:53 发送udp包, 
            NAT使用 1.1.1.1:2345 向 1.0.0.1:53 发包
主机又向   1.0.0.1:63 发送udp包,
            NAT将使用一新映射地址 1.1.1.1:3789 向 1.0.0.1:63 发包
主机又向   8.8.8.8:53 发送udp包,
           此时NAT将使用一新映射地址 1.1.1.1:5678 向 8.8.8.8:53 发包
主机又向 1.0.0.1:53 发送udp包,
            NAT使用相同地址 1.1.1.1:2345 向 1.0.0.1:53 发包

这种同时依赖目标地址和端口的NAT映射行为就是 Address and Port-Dependent Mapping,
这种NAT类型是没有办法进行NAT穿透的
```

## NAT Filtering

描述当NAT为网络内主机映射一地址后，互联网内主机向映射地址发送数据时，将允许哪些地址通过的行为

Endpoint-Independent Filtering

A NAT device employing the combination of "Endpoint-Independent
  Mapping" and "Endpoint-Independent Filtering" will accept incoming
  traffic to a mapped public port from ANY external endpoint on the
  public network.

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086, NAT将其映射到 1.1.1.1:2345

无论外部任何地址和端口的主机向1.1.1.1:2345发包, NAT都将会将其转发到 192.168.100.2:30086
```

Address-Dependent Filtering
for receiving packets from a specific external endpoint, it is necessary for the internal endpoint to
  send packets first to that specific external endpoint's IP address.

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086, NAT将其映射到 1.1.1.1:2345

如果需要NAT将外部数据包转发到主机上,
必须先由主机向某一地址发包, 
NAT都会将收到的同一地址(所有端口)的数据包转发到主机上
```

Address and Port-Dependent Filtering

for receiving  packets from a specific external endpoint, it is necessary for
  the internal endpoint to send packets first to that external endpoint's IP address and port.

```md
如 网络内一主机监听了一udp地址 192.168.100.2:30086, NAT将其映射到 1.1.1.1:2345

如果需要NAT将外部数据包转发到主机上
必须先由主机向某一地址和某一端口发包
NAT都会将收到的同一地址和同一端口的数据包转发到主机上

这种NAT类型是没发进行NAT穿透的
```

## NAT穿透

是否可以进行NAT穿透, 同时依赖NAT Mapping和NAT Filtering

```md
Mapping和Filtering都为Endpoint-Independent Mapping,
         这种是百分之百可以进行穿透
Mapping为Endpoint-Independent Mapping, Filtering为Address and Port-Dependent Filtering,
         这种也是可以进行穿透的
但如果Mapping和Filtering都为Address and Port-Dependent Filtering,
         这种是必不可能穿透
```
