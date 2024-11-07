---
title: DNS over HTTPS
tags:
  - DNS
  - DOH
  - golang
categories:
  - Network
language: zh-Hans
abbrlink: 4b39445f
date: 2020-06-23 00:30:08
updated: 2020-06-23 00:30:08
---
这个DNS系列现在有以下几篇文章  
[DNS](/posts/f05986bf/)  [EDNS](/posts/668530ca/) [DNSSEC](/posts/1751943e/) [DNS over HTTPS](/posts/4b39445f/) 完整代码请看[DNS](https://github.com/Asutorufa/yuhaiin/tree/master/net/dns)
***
DOH就比较简单了,因为DOH使用的请求数据和应答数据均为之前的DNS协议格式,包括DNS,EDNS,DNSSEC...当然是否支持EDNS,DNSSEC需要看DNS服务器的支持情况  
DOH的最主要的区别是把DNS使用的UDP,换成了HTTPS,这样就能防止DNS污染了,而且可以使用DNSSEC加上ESNI来防止证书劫持,DOH的协议在[rfc8484](https://tools.ietf.org/html/rfc8484)中有定义  
DOH主要有两种方式HTTP的GET请求和POST的请求

## GET

GET请求需要使用BASE64对请求的字节数据进行序列化,然后作为参数传递,获取到的数据使用我们之前的解析进行解析就行了

```go
func get(dReq []byte, server string) (body []byte, err error) {
 query := strings.Replace(base64.URLEncoding.EncodeToString(dReq), "=", "", -1)
 urls := "https://" + server + "/dns-query?dns=" + query
 res, err := http.Get(urls)
 if err != nil {
  return nil, err
 }
 defer res.Body.Close()
 body, err = ioutil.ReadAll(res.Body)
 if err != nil {
  return nil, err
 }
 return
}
```

## POST

POST并不需要进行序列化,直接把原始请求数据作为body就行了
<!--more-->
```go
func post(dReq []byte, server string) (body []byte, err error) {
 client := &http.Client{Timeout: 5 * time.Second}
 req, err := http.NewRequest(http.MethodPost, "", bytes.NewReader(dReq))
 if err != nil {
  return nil, fmt.Errorf("DOH:post() newReq -> %v", err)
 }
 urls, err := url.Parse("//" + server)
 if err != nil {
  return nil, fmt.Errorf("DOH:post() urlParse -> %v", err)
 }
 req.URL.Scheme = "https"
 req.URL.Host = urls.Host
 req.URL.Path = urls.Path + "/dns-query"
 req.Header.Set("accept", "application/dns-message")
 req.Header.Set("content-type", "application/dns-message")
 req.ContentLength = int64(len(dReq))

 resp, err := client.Do(req)
 if err != nil {
  return nil, fmt.Errorf("DOH:post() req -> %v", err)
 }
 defer resp.Body.Close()
 body, err = ioutil.ReadAll(resp.Body)
 if err != nil {
  return nil, fmt.Errorf("DOH:post() readBody -> %v", err)
 }
 return
}
```

完整代码请看开头

***
>[rfc8484](https://tools.ietf.org/html/rfc8484)
