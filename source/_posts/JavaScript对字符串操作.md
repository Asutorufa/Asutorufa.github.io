---
title: JavaScript对字符串操作
tags: 
 - JavaScript
 - 前端
categories: 
 - JavaScript
abbrlink: 86cfa6a
date: 2018-03-24 23:17:58
updated: 2018-09-04 23:17:58
---

```javascript
var name='aaaa';
var age='bbbb';
var change='Hello javascript';
var message=`hello,${name},${age},`+name+age;//将多个字符串写成一句话
```

```javascript
var length=message.length;//获取字符串长度
```

```javascript
var upper=message.toUpperCase();//把字符串全部变成大写
```

```javascript
var lower=message.toLowerCase();//把字符串全部变成小写
```

```javascript
var search=message.indexOf('aaaa');//搜索字符串位置
```

```javascript
var substr=message.substring(9, 15);//返回区间内字符串
```

```javascript
x=document.getElementById("test");  //查找元素
x.innerHTML="Hello JavaScript";    //改变内容
```
