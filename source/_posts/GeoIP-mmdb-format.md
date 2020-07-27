---
title: GeoIP mmdb format
tags:
  - Network
categories:
  - Network
abbrlink: 931c13a4
date: 2020-07-27 22:15:17
updated: 2020-07-27 22:15:17
language:
---

complete document [MaxMind DB File Format SpecificationDescription](https://maxmind.github.io/MaxMind-DB/)

here is only how convert trie tree to array

```md
0100, 1011 -> trie

              root
               |
         +-----+------+
        /              \
       0                1
     /   \             /  \
   null   1           0   null
         / \        /   \
        0 null     null   1
       / \               / \
       0 null         null  1
```

trie -> array
left is 0, right is 1
value is index of array<!--more-->

``` md
 left | right byte
3     |   5    2
null  |   7    4
9     |  null  6
11    |  null  8
null  |  13   10
15    |  null 12
null  |  17   14
end   |  null 16
null  |  end  18

array: [3,5,null,7,9,null,11,null,null,13,15,null,null,17,end,null,null,end]
```

for example:

index 1:
 next left index 3 is null, so 00* is not exist
 next right index 3+1 = 4 is not null, continue search until end or null

this is one byte as one child, but one byte max is 255, if node more than 255, we can use multiple byte as one child
