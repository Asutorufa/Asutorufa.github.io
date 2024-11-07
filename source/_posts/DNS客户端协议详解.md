---
title: DNS客户端协议详解
tags:
  - DNS
  - UDP
  - golang
categories:
  - Network
language: zh-Hans
abbrlink: f05986bf
date: 2020-05-31 18:44:37
updated: 2020-05-31 18:44:37
---
这个DNS系列现在有以下几篇文章  
[DNS](/posts/f05986bf/)  [EDNS](/posts/668530ca/) [DNSSEC](/posts/1751943e/) [DNS over HTTPS](/posts/4b39445f/) 完整代码请看[DNS](https://github.com/Asutorufa/yuhaiin/tree/master/net/dns)

## DNS Header

```txt
                                1  1  1  1  1  1
  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      ID                       |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|QR|   Opcode  |AA|TC|RD|RA|   Z    |   RCODE   |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    QDCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ANCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    NSCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ARCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

header在dns请求和应答中相同的,查询中有Query Section,应答中有answer section.

- ID: 2字节,应答中也有ID,可以用来判断是否为我们请求的应答
- QR：1bit,请求时为0,应答时为1
- Opcode：4bit 通常值为0（标准查询），其他值为1（反向查询）和2（服务器状态请求）,[3,15]保留值
- AA：1bit authoritative answer,在应答中才有效
- TC：1bit 表示可截断
- RD：1bit 期望使用递归查询
- RA：1bit 在应答中返回,返回服务器是否支持递归查询
- Z： Reserved for future use.
- RCODE：4bit,应答码,代表返回的状态
  - 0 No Error
  - 1 Format error 格式错误
  - 2 Server failure 服务器失败
  - 3 Name Error 查询域名错误
  - 4 Not Implemented 未实现的查询方式
  - 5 Refused 拒绝
  - 6-15 Reserved for future use.<!--more-->
- QDCOUNT 请求的个数
- ANCOUNT 应答的个数
- NSCOUNT 无符号16bit整数表示报文授权段中的授权记录数。
- ARCOUNT 无符号16bit整数表示报文附加段中的附加记录数。

## 查询

```txt
                                1  1  1  1  1  1
  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                                               |
/                     QNAME                     /
/                                               /
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     QTYPE                     |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     QCLASS                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

- QNAME：不定长,格式为域名以点分割的长度,末尾以0结尾,例如:

    ```txt
        www.google.com -> 3www6google3com0
    ```

- QTYPE:查询的类型  
    常用的我们需要知道A为IPV4,AAAA为IPV6

    ```txt
    TYPE            value and meaning
    A               1 a host address
    NS              2 an authoritative name server
    MD              3 a mail destination (Obsolete - use MX)
    MF              4 a mail forwarder (Obsolete - use MX)
    CNAME           5 the canonical name for an alias
    SOA             6 marks the start of a zone of authority
    MB              7 a mailbox domain name (EXPERIMENTAL)
    MG              8 a mail group member (EXPERIMENTAL)
    MR              9 a mail rename domain name (EXPERIMENTAL)
    NULL            10 a null RR (EXPERIMENTAL)
    WKS             11 a well known service description
    PTR             12 a domain name pointer
    HINFO           13 host information
    MINFO           14 mailbox or mail list information
    MX              15 mail exchange
    TXT             16 text strings

    AAAA            28 <- https://www.ietf.org/rfc/rfc3596.txt
    ```

- QCLASS：无符号16bit整数表示查询的类,比如，IN代表Internet.

现在我们来完成生成请求的代码  
使用全局变量来存储请求的类型

```go
type reqType [2]byte

var (
	A     = reqType{0b00000000, 0b00000001} // 1
	NS    = reqType{0b00000000, 0b00000010} // 2
	MD    = reqType{0b00000000, 0b00000011} // 3
	MF    = reqType{0b00000000, 0b00000100} // 3
	CNAME = reqType{0b00000000, 0b00000101} // 5
	SOA   = reqType{0b00000000, 0b00000110} // 6
	MB    = reqType{0b00000000, 0b00000111} // 7
	MG    = reqType{0b00000000, 0b00001000} // 8
	MR    = reqType{0b00000000, 0b00001001} // 9
	NULL  = reqType{0b00000000, 0b00001010} // 10
	WKS   = reqType{0b00000000, 0b00001011} // 11
	PTR   = reqType{0b00000000, 0b00001100} // 12
	HINFO = reqType{0b00000000, 0b00001101} // 13
	MINFO = reqType{0b00000000, 0b00001110} // 14
	MX    = reqType{0b00000000, 0b00001111} // 15
	TXT   = reqType{0b00000000, 0b00010000} // 16
	AAAA  = reqType{0b00000000, 0b00011100} // 28 https://www.ietf.org/rfc/rfc3596.txt
	// for req
	AXFR = reqType{0b00000000, 0b11111100} // 252
	ANY  = reqType{0b00000000, 0b11111111} // 255
)
```

这里需要注意有些字段是以位的大小来存储的,需要使用移位运算符来计算(在完成这个协议前,我写了socks5,因为socks5中全部为字节的大小,可能有人会出现与我相同的错误,所以需要注意一下)

```go
func creatRequest(domain string, reqType reqType) []byte {
    id := []byte{byte(rand.Intn(255)), byte(rand.Intn(255))} // id:
    qr := byte(0b0)                                          // qr 0
	opCode := byte(0b0000)                                   // opcode 0000
	aa := byte(0b0)                                          // aa 0
	tc := byte(0b0)                                          // tc 0
	rd := byte(0b1)                                          // rd 1
	ra := byte(0b0)                                          // ra 0
	z := byte(0b000)                                         // z 000
	rCode := byte(0b0000)                                    // rCode 0000
	qr2rCode := []byte{qr<<7 + opCode<<3 + aa<<2 + tc<<1 + rd, ra<<7 + z<<4 + rCode}
	qdCount := []byte{0b00000000, 0b00000001} // request number => bit: 00000000 00000001 -> 01
	anCount := []byte{0b00000000, 0b00000000} // answer number(no use for req) => bit: 00000000 00000000
	nsCount := []byte{0b00000000, 0b00000000} //(no use for req) => bit: 00000000 00000000
	arCount := []byte{0b00000000, 0b00000000} //(no use for req) => bit: 00000000 00000000

	var qName []byte
	for _, x := range strings.Split(domain, ".") {
		qName = append(qName, byte(len(x)))
		qName = append(qName, []byte(x)...)
	}
	qName = append(qName, 0b00000000) // add the 0 for last of domain

	qType := []byte{reqType[0], reqType[1]}  // type:
	qClass := []byte{0b00000000, 0b00000001} // 1 -> from internet

	return bytes.Join([][]byte{id, qr2rCode, qdCount, anCount, nsCount, arCount, qName, qType, qClass}, []byte{})
}
```

这里我们已经得到了完整的请求字节数组,然后使用UDP协议发起请求就行了：

```go
// 此处以www.google.com及1111 DNS为例
req := creatRequest("www.google.com", A)
conn, err := net.DialTimeout("udp", "1.1.1.1:53", 5*time.Second)
if err != nil {
	return nil, err
}
defer conn.Close()
if _, err = conn.Write(req); err != nil {
	return nil, err
}
_ = conn.SetDeadline(time.Now().Add(5 * time.Second))
n, err := conn.Read(b[:])
if err != nil {
	return nil, err
}
```

接下来我们就需要解析应答请求了,来获取我们需要的数据.

## 应答

应答数据中具有header和请求字段,所以我们可以先写一个resovle header来分析header.  
之前我们完成了域名编码的代码,就是`3www6google3com0`这个,这里我们还需要完成一个解析的.

```go
func getName(c []byte, all []byte) (name string, x []byte) {
	for {
		if c[0]&128 == 128 && c[0]&64 == 64 { // <- 这里的这个会在下面的answer section中解释
			l := c[1]
			c = c[2:]
			tmp, _ := getName(all[l:], all)
			name += tmp
			//log.Println(c, name)
			break
		}
		name += string(c[1:int(c[0])+1]) + "."
		c = c[int(c[0])+1:]
		if c[0] == 0 {
			c = c[1:] // lastOfDomain: one byte 0
			break
		}
	}
	return name, c
}
```

之后就可以来分析header了：

```go
func resolveHeader(req []byte, answer []byte) (anCount int, answerSection []byte, err error) {
	// resolve answer
	if answer[0] != req[0] || answer[1] != req[1] { // compare id
		// not the answer
		return 0, nil, errors.New("id not same")
	}

	if answer[2]&8 != 0 { // check the QR is 1(Answer)
		return 0, nil, errors.New("the qr is not 1(Answer)")
	}

	rCode := fmt.Sprintf("%08b", answer[3])[4:] // check Response code(rCode)
	switch rCode {
	case "0000": // no error
		break
	case "0001": // Format error
		return 0, nil, errors.New("request format error")
	case "0010": //Server failure
		return 0, nil, errors.New("dns Server failure")
	case "0011": //Name Error
		return 0, nil, errors.New("no such name")
	case "0100": // Not Implemented
		return 0, nil, errors.New("dns server not support this request")
	case "0101": //Refused
		return 0, nil, errors.New("dns server Refuse")
	default: // Reserved for future use.
		return 0, nil, errors.New("other error")
	}

	//qdCountA := []byte{b[4], b[5]}  // no use, for request
	//anCountA := []byte{answer[6], answer[7]}
	anCount = int(answer[6])<<8 + int(answer[7])
	//nsCount2arCountA := []byte{b[8], b[9], b[10], b[11]} // no use

	c := answer[12:]

	var x string
	x, c = getName(c, answer)
	log.Println(x)
	
	log.Println("qType:", c[:2])
	c = c[2:]
	log.Println("qClass:", c[:2])
	c = c[2:]

	return anCount, c, nil
}
```

之后就是我们真正需要的数据,Answer section

```txt
                               1  1  1  1  1  1
  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                                               |
/                                               /
/                      NAME                     /
|                                               |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      TYPE                     |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     CLASS                     |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      TTL                      |
|                                               |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                   RDLENGTH                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--|
/                     RDATA                     /
/                                               /
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

- NAME：不定长与之前QNAME相同,这里会使用省略字段：前两bit为11表示压缩格式，而后面跟的14bit表示的是Name所在的位置相对于DNS首部的偏移值
    如：之前的header数组中出现过3www6google3com0,且处的位置为12,这里就可以用192 12两个字节来省略(192是因为11000000,前两位为11)
- QTYPE：与之前的TYPE相同
- CLASS：与之前的QCLASS相同
- TTL: 就是TTL 可以使用搜索引擎查询一下
- RDLENGTH: RDATA的长度

这个Answer section与之前的header不同,并不是只出现一次,与header中ANCOUNT有关,如果ANCOUNT不为1,后面就会出现多个,要使用循环来获取所有应答数据

```go
// resolve answer
anCount, c, err := resolveHeader(req, b[:n])
if err != nil {
    return nil, err
}

// answer section
log.Println()
log.Println("Answer section:")

var x string
for anCount != 0 {
	x, c = getName(c, b[:n])
	log.Println(x)

	tYPE := reqType{c[0], c[1]}
	log.Println("type:", c[0], c[1])
	c = c[2:] // type
	log.Println("class:", c[0], c[1])
	c = c[2:] // class
	log.Println("ttl:", c[0], c[1], c[2], c[3])
	c = c[4:] // ttl 4byte
	sum := int(c[0])<<8 + int(c[1])
	log.Println("rdlength", sum)
	c = c[2:] // RDLENGTH  跳过总和，因为总和不包括计算域名的长度 2+int(c[0])<<8+int(c[1])

	switch tYPE {
	case A:
		DNS = append(DNS, c[0:4])
		c = c[4:] // 4 byte ip addr
	case AAAA:
		DNS = append(DNS, c[0:16])
		c = c[16:] // 16 byte ip addr
	case NS:
		fallthrough
	case MD:
		fallthrough
	case MF:
		fallthrough
	case CNAME:
		fallthrough
	case SOA:
		fallthrough
	case MG:
		fallthrough
	case MB:
		fallthrough
	case MR:
		fallthrough
	case NULL:
		fallthrough
	case WKS:
		fallthrough
	case PTR:
		fallthrough
	case HINFO:
		fallthrough
	case MINFO:
		fallthrough
	case MX:
		fallthrough
	case TXT:
		fallthrough
	default:
		log.Println("rdata", c[:sum])
		c = c[sum:] // RDATA
	}
	anCount -= 1
}
```

虽然这里我只处理了A,和AAAA的请求类型,但是每个类型的数据格式在[rfc1035](https://www.ietf.org/rfc/rfc1035.txt)都有详细记录,想要自己实现并不难,毕竟我们已经完成的大部分的数据解析,剩下的一点也应该问题不大.

***
>[rfc1035](https://www.ietf.org/rfc/rfc1035.txt)
>[rfc3596](https://www.ietf.org/rfc/rfc3596.txt)
