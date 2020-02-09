---
title: python使用lxml分析网页
tags:
  - python
  - 编程
categories:
  - python
abbrlink: 77d15527
date: 2018-08-07 14:47:51
updated: 2018-08-07 14:47:51
language: zh-Hans
---
首先得引入lxml

```
#xpath为
frome lxml import etree
#cssselector为
import lxml.html
#cssselector使用起来简单但功能比xpath少
```

cssselector
```
tree = lxml.html.fromstring('你获取的网页源代码文件或变量')
css = tree.cssselect('要选择的内容')

#例如tree.cssselect('div.word-info > div.pronounces > span.word-audio')
#选择器选择的结果为list

css.text_content()

#表示选择的内容

css.attrib['要表示的标签属性']

#如css.attrb['class']表示的就是所选择内容的class属性
```
<!--more-->
**如果选择的内容换行符太多可以使用split表示成list去除**

|说明|例子|
|----|----|
|选择所有标签|*|
|选择<a\>标签|a|
|选择所有class="link"的标签|.link|
|选择class="link"的<a\>标签|a.link|
|选择id="home"的<a\>标签|a#home|
|选择父元素为<a\>标签的所有<span\>标签|a > span|
|选择<a\>标签内部的所有<span\>标签|a span|
|选择title属性为”Home”的所有<a\>标签|a[title=Home]|


xpath
```
selector=etree.HTML('你获取的网页源代码文件或变量')
css = selector.xpath('要选择的内容')
#xpath可直接表示
#xpath可选择并表示属性
```
_xpath由于内容太多,可以直接参考官方文档_
