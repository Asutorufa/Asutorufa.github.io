---
title: DNSSEC
tags:
  - DNS
  - UDP
  - DNSSEC
  - golang
categories:
  - Network
language: zh-Hans
abbrlink: 1751943e
date: 2020-06-23 00:21:33
updated: 2020-06-23 00:21:33
---
这个DNS系列现在有以下几篇文章  
[DNS](/posts/f05986bf/)  [EDNS](/posts/668530ca/) [DNSSEC](/posts/1751943e/) [DNS over HTTPS](/posts/4b39445f/) 完整代码请看[DNS](https://github.com/Asutorufa/yuhaiin/tree/master/net/dns)
***
注意: 这里我只完成了请求字段,主要原因是因为我学习这些DNS协议是为了找到防止DNS污染的方法,而DNSSEC并不能,而且应答头比较复杂,可能还要了解ssl和tls的知识,所以这里我没有完成代码,想了解的请看[protocol change](https://tools.ietf.org/html/rfc3225) [rfc4034](https://tools.ietf.org/html/rfc4034) [rfc4035](https://tools.ietf.org/html/rfc4035) [Algorithm](https://tools.ietf.org/html/rfc4034#appendix-A.1)  

DNSSEC也是使用了EDNS,而且只需要改一个字段,就是之前提到Z,具体协议请看

```md
                +0 (MSB)                +1 (LSB)
         +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      0: |   EXTENDED-RCODE      |       VERSION         |
         +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      2: |DO|                    Z                       |
         +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

完成请求头
<!--more-->
```golang
type eDNSHeader struct {
	DnsHeader   []byte
	Name        [1]byte
	Type        [2]byte
	PayloadSize [2]byte
	ExtendRCode [1]byte
	EDNSVersion [1]byte
	Z           [2]byte
	Data        []byte
}

func createDNSSEC(domain string, reqType2 reqType) (header eDNSHeader, b []byte) {
	//eDNSHeader := createEDNSReq(domain,reqType2,[]byte{})
	header = eDNSHeader{}
	header.DnsHeader = creatRequest(domain, reqType2)
	header.Name[0] = 0b0
	header.Type = [2]byte{0b00000000, 0b00101001}
	header.PayloadSize = [2]byte{0b00010000, 0b00000000} //4096
	header.ExtendRCode = [1]byte{0b00000000}
	header.EDNSVersion = [1]byte{0b00000000}
	header.Z = [2]byte{0b10000000, 0b00000000} // Do bit = 1
	return header, createEDNSRequ(header)
}
```

是不是很简单,再结合之前的EDNS就能完成完整的请求
