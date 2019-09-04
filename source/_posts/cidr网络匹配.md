---
title: CIDR网络匹配
tags:
  - CIDR
  - 计算机网络
  - golang
categories:
  - 计算机网络
abbrlink: 3cb4313e
date: 2019-08-02 18:55:15
updated: 2019-08-02 18:55:15
---

## CIDR

我们知道cidr对ip匹配时,只要cidr的mask长度的前几位与要匹配的ip相同,则可以说匹配成功.  
```shell
假设有一个cidr为128.0.0.1/24
转换为二进制 1000 0000.0000 0000.0000 0000.0000 0001/24
可以知道要匹配ip的前24为与cidr的前24(1000 0000.0000 0000.0000 0000)位相同则匹配成功
假设有一个ip 128.0.0.128 二进制为 1000 0000.0000 0000.0000 0000.1000 0000
可以看到前24位与cidr相同 则匹配成功
```

## 前缀树

通过上述规则 我们可以使用前缀树实现CIDR对ip的匹配 

```shell
            root
           /    \
          0     1
         / \   / \
        0   1 0   1
       /
    当ip匹配到此处,此处已无任何子树,且是某一cidr的末尾时则匹配成功
    若此处节点为null(golang为nil)且不是某一cidr的末尾时则匹配失败
```

trie树类似上述结构

trie树节点 我们可以这样写<!--more-->  
+node  
|- bool(判断是否匹配成功,是否是某一cidr的末尾)  
|- left(左树代表0)  
|- right(右树代表1)  

## 使用golang实现

```golang
type node struct {
 isLast bool
    left   *node
    right  *node
}

type TrieTree struct {
    root *node
}

func NewTrieTree() *TrieTree {
	return &TrieTree{
		root: &node{},
	}
}
```

对每一个CIDR的插入  
注意: 此处传入的CIDR为CIDR前mask位的二进制形式

```golang
func (trie *TrieTree) Insert(str string) {
	nodeTemp := trie.root
	for i := 0; i < len(str); i++ {
		// 1 byte is 49
		if str[i] == 49 {
			if nodeTemp.right == nil {
				nodeTemp.right = new(node)
			}
			nodeTemp = nodeTemp.right
		}
		// 0 byte is 48
		if str[i] == 48 {
			if nodeTemp.left == nil {
				nodeTemp.left = new(node)
			}
			nodeTemp = nodeTemp.left
		}
		if i == len(str)-1 {
			nodeTemp.isLast = true
		}
	}
}
```

对ip的匹配  
注意: 此处传入的ip为ip的二进制形式

```golang
func (trie *TrieTree) Search(str string) bool {
	nodeTemp := trie.root
	for i := 0; i < len(str); i++ {
		if str[i] == 49 {
			nodeTemp = nodeTemp.right
		}
		if str[i] == 48 {
			nodeTemp = nodeTemp.left
		}
		if nodeTemp == nil {
			return false
		}
		if nodeTemp.isLast == true {
			return true
		}
	}
	return false
}
```

如果需要知道ip如何转换为二进制,可以联系我
