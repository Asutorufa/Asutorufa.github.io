---
title: EDNS
tags:
  - DNS
  - UDP
  - EDNS
  - golang
categories:
  - Network
language: zh-Hans
abbrlink: 668530ca
date: 2020-06-22 23:09:49
updated: 2020-06-22 23:09:49
---
这个DNS系列现在有以下几篇文章  
[DNS](/posts/f05986bf/)  [EDNS](/posts/668530ca/) [DNSSEC](/posts/1751943e/) [DNS over HTTPS](/posts/4b39445f/) 完整代码请看[DNS](https://github.com/Asutorufa/yuhaiin/tree/master/net/dns)

## EDNS

上一篇我们写了DNS,EDNS就是DNS的功能扩充.
上一篇的DNS里头部有ARCOUNT的计数,EDNS就包含在那个里面,EDNS发送的请求在请求头之后的Additional中,应答在Answer和Authoritative之后,我们可看以下图,跟清晰了吧

```md
    +---------------------+
    |        Header       |
    +---------------------+
    |       Question      | the question for the name server
    +---------------------+
    |        Answer       | RRs answering the question
    +---------------------+
    |      Authority      | RRs pointing toward an authority
    +---------------------+
    |      Additional     | RRs holding additional information
    +---------------------+
```

## 协议格式

具体协议内容请看[rfc2671](https://tools.ietf.org/html/rfc2671),[rfc7871](https://tools.ietf.org/html/rfc7871)
<!--more-->
Additinoal包含以下部分

```md
     Field Name   Field Type     Description
     ------------------------------------------------------
     NAME         domain name    empty (root domain)
     TYPE         u_int16_t      OPT
     CLASS        u_int16_t      sender's UDP payload size
     TTL          u_int32_t      extended RCODE and flags
     RDLEN        u_int16_t      describes RDATA
     RDATA        octet stream   {attribute,value} pairs


TTL中的东西并不是我们之前说到的TTL,这里的TTL只是一个名称,没有具体的含义,TTL中包含以下内容

                      +0 (MSB)                            +1 (LSB)
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   0: |         EXTENDED-RCODE        |            VERSION            |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   2: |                               Z                               |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+


   EXTENDED-RCODE  Forms upper 8 bits of extended 12-bit RCODE.  Note
                   that EXTENDED-RCODE value "0" indicates that an
                   unextended RCODE is in use (values "0" through "15").
   VERSION         EDNS VERSION
   Z               Set to zero by senders and ignored by receivers,
                   unless modified in a subsequent specification.

这里Z我们之后会用到(不是这一篇文章)


RDATA中就是对各种扩充功能的请求字段,而每个不同的功能又有着不同的请求协议
RDATA的格式如下

                +0 (MSB)                            +1 (LSB)
     +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
  0: |                          OPTION-CODE                          |
     +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
  2: |                         OPTION-LENGTH                         |
     +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
  4: |                                                               |
     /                          OPTION-DATA                          /
     /                                                               /
     +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+

   OPTION-CODE    (Assigned by IANA.)
   OPTION-LENGTH  Size (in octets) of OPTION-DATA.
   OPTION-DATA    Varies per OPTION-CODE.

如SubNet中的请求字段就包含在其中RDATA中,所以我们要先完成SubNet的字节数组
才能生成一个Additional,因为请求中需要数据的长度RDLEN
```

因为EDNS中扩展的协议非常多,这里我们就以常用的SubNet为例吧,更多其他类型请看[dns-parameters](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-11)  
因为我们以SubNet为例,所以先要了解下SubNet的具体协议格式

```md
                +0 (MSB)                            +1 (LSB)
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   0: |                          OPTION-CODE                          |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   2: |                         OPTION-LENGTH                         |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   4: |                            FAMILY                             |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   6: |     SOURCE PREFIX-LENGTH      |     SCOPE PREFIX-LENGTH       |
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
   8: |                           ADDRESS...                          /
      +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+

   o  SOURCE PREFIX-LENGTH, an unsigned octet representing the leftmost
      number of significant bits of ADDRESS to be used for the lookup.
      In responses, it mirrors the same value as in the queries.

   o  SCOPE PREFIX-LENGTH, an unsigned octet representing the leftmost
      number of significant bits of ADDRESS that the response covers.
      In queries, it MUST be set to 0.

   o  ADDRESS, variable number of octets, contains either an IPv4 or
      IPv6 address, depending on FAMILY, which MUST be truncated to the
      number of bits indicated by the SOURCE PREFIX-LENGTH field,
      padding with 0 bits to pad to the end of the last octet needed.
```

这里前面三个字段就是我们之前RDATA中规定的协议格式,后面就是SubNet的格式  
SubNet的OPTION-CODE为8,
        OPTION-LENGTH就是完成之后的长度
        FAMILY表示设置的IP的类型 IPv4为1,IPv6为2 更多类型请看[address-family-numbers](https://www.iana.org/assignments/address-family-numbers/address-family-numbers.xhtml)
        SOURCE PREFIX-LENGTH为查询中位置偏移(就是CIDR中的mask),具体请了解CIDR,是计算机网络很基础的知识
        SCOPE PREFIX-LENGTH是响应返回的位置偏移,在查询中应为0
        ADDRESS就是设置的SubNet的IP地址,依据上面的FAMILY

## 请求

看过具体协议格式规定后,我们就可以来完成代码了  

先定义以下各种请求的OPTION-CODE

```golang
var (
	Reserved         = EDNSOPT{0b00000000, 0b00000000} //0
	LLQ              = EDNSOPT{0b00000000, 0b00000001} //1 Optional
	UL               = EDNSOPT{0b00000000, 0b00000010} //2 On-hold
	NSID             = EDNSOPT{0b00000000, 0b00000011} //3 Standard
	Reserved2        = EDNSOPT{0b00000000, 0b00000100} //4
	DAU              = EDNSOPT{0b00000000, 0b00000101} //5 Standard
	DHU              = EDNSOPT{0b00000000, 0b00000110} //6 Standard
	N3U              = EDNSOPT{0b00000000, 0b00000111} //7 Standard
	EdnsClientSubnet = EDNSOPT{0b00000000, 0b00001000} //8 Optional
	EDNSEXPIRE       = EDNSOPT{0b00000000, 0b00001001} //9 Optional
	COOKIE           = EDNSOPT{0b00000000, 0b00001010} //10 Standard
	TcpKeepalive     = EDNSOPT{0b00000000, 0b00001011} //11 Standard
	Padding          = EDNSOPT{0b00000000, 0b00001100} //12 Standard
	CHAIN            = EDNSOPT{0b00000000, 0b00001101} //13 Standard
	KEYTAG           = EDNSOPT{0b00000000, 0b00001110} //14 Optional
	ExtendedDNSError = EDNSOPT{0b00000000, 0b00001111} //15 Standard
	EDNSClientTag    = EDNSOPT{0b00000000, 0b00010000} //16 Optional
	EDNSServerTag    = EDNSOPT{0b00000000, 0b00010001} //17 Optional
)
```

然后完成SubNet的

```golang
func createEdnsClientSubnet(ip net.IP) []byte {
	optionCode := []byte{EdnsClientSubnet[0], EdnsClientSubnet[1]}

	family := []byte{0b00000000, 0b00000001} // 1:Ipv4 2:IPv6 https://www.iana.org/assignments/address-family-numbers/address-family-numbers.xhtml
	sourceNetmask := []byte{0b00100000}      // 32
	scopeNetmask := []byte{0b00000000}       //0 In queries, it MUST be set to 0.
	subnet := ip.To4()                       //depending family
	if subnet == nil {
		subnet = ip.To16()
		family = []byte{0b00000000, 0b00000010}
	}
	optionData := bytes.Join([][]byte{family, sourceNetmask, scopeNetmask, subnet}, []byte{})

	optionLength := getLength(len(optionData))

	return bytes.Join([][]byte{optionCode, optionLength[:], optionData}, []byte{})
}
```

再完成Additional,加上完整的请求头,注意这里我们要修改一下请求头中ArCount的大小

```golang
func createEDNSReq(domain string, reqType2 reqType, eDNS []byte) []byte {
	normalReq := creatRequest(domain, reqType2)
	normalReq[10] = 0b00000000
	normalReq[11] = 0b00000001
	name := []byte{0b00000000}
	typeR := []byte{0b00000000, 0b00101001}       //41
	payloadSize := []byte{0b00010000, 0b00000000} //4096
	extendRcode := []byte{0b00000000}
	eDNSVersion := []byte{0b00000000}
	z := []byte{0b00000000, 0b00000000}
	var dataLength [2]byte
	if eDNS != nil {
		dataLength = getLength(len(eDNS))
	}
	return bytes.Join([][]byte{normalReq, name, typeR, payloadSize, extendRcode, eDNSVersion, z, dataLength[:], eDNS}, []byte{})
}
```

## 应答

我们先分析一下应答的解析顺序,就跟最开始的一样

- Header
- Answer
- Authority
- Additional

Header和Answer的解析我们上一篇已经完成了,这里需要完成Authority和Additional

因为我们不需要Authority内的具体内容,这里我们就直接获取到Authority之后的数据就行了

```golang
func resolveAuthoritative(c []byte, nsCount int, b []byte) (left []byte) {
	for nsCount != 0 {
		nsCount--
		_, _, c = getName(c, b)
		c = c[2:] // type
		c = c[2:] // class
		c = c[4:] // ttl
		dataLength := int(c[0])<<8 + int(c[1])
		c = c[2:] // data length
		c = c[dataLength:]
	}
	return c
}
```

Additional, SubNet

```golang
func resolveAdditional(b []byte, arCount int) {
	for arCount != 0 {
		arCount--
		//name := b[:1]
		b = b[1:]
		typeE := b[:2]
		b = b[2:]
		//payLoadSize := b[:2]
		b = b[2:]
		//rCode := b[:1]
		b = b[1:]
		//version := b[:1]
		b = b[1:]
		//z := b[:2]
		b = b[2:]
		dataLength := int(b[0])<<8 + int(b[1])
		b = b[2:]
		//log.Println(name, typeE, payLoadSize, rCode, version, z, dataLength)
		if typeE[0] != 0 || typeE[1] != 41 {
			//optData := b[:dataLength]
			b = b[dataLength:]
			continue
		}

		if dataLength == 0 {
			continue
		}
		optCode := EDNSOPT{b[0], b[1]}
		b = b[2:]
		optionLength := int(b[0])<<8 + int(b[1])
		b = b[2:]
		switch optCode {
		case EdnsClientSubnet:
			//family := b[:2]
			b = b[2:]
			//sourceNetmask := b[:1]
			//log.Println("sourceNetmask", sourceNetmask)
			b = b[1:]
			//scopeNetmask := b[:1]
			//log.Println("scopeNetmask", scopeNetmask)
			b = b[1:]
			// Subnet IP
			//if family[0] == 0 && family[1] == 1 {
			//	log.Println(b[:4])
			//}
			//if family[0] == 0 && family[1] == 2 {
			//	log.Println(b[:16])
			//}

			b = b[optionLength-4:]
		default:
			//log.Println("opt data:", b[:optionLength])
			b = b[optionLength:]
		}
	}
}
```

最后需要在之前的DNS分析加上这两个函数,完整代码请看开头

***
>[rfc2671](https://tools.ietf.org/html/rfc2671)  
>[rfc7871](https://tools.ietf.org/html/rfc7871)  
>[dns-parameters](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-11)  
>[address-family-numbers](https://www.iana.org/assignments/address-family-numbers/address-family-numbers.xhtml)
