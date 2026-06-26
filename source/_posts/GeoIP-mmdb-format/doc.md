---
title: GeoIP mmdb format
tags:
  - Network
categories:
  - Network
abbrlink: 931c13a4
date: 2020-07-27 22:15:17
updated: 2020-07-27 22:15:17
language: en
---

complete document [MaxMind DB File Format SpecificationDescription](https://maxmind.github.io/MaxMind-DB/)

here is only how convert trie tree to array

0100, 1011 -> trie

```mermaid
flowchart TD
  root((root))

  root -- "0" --> n0["0"]
  root -- "1" --> n1["1"]

  n0 -- "0" --> n00["null"]
  n0 -- "1" --> n01["01"]
  n01 -- "0" --> n010["010"]
  n01 -- "1" --> n011["null"]
  n010 -- "0" --> n0100["0100"]
  n010 -- "1" --> n0101["null"]
  n0100 --> end0100(("end"))

  n1 -- "0" --> n10["10"]
  n1 -- "1" --> n11["null"]
  n10 -- "0" --> n100["null"]
  n10 -- "1" --> n101["101"]
  n101 -- "0" --> n1010["null"]
  n101 -- "1" --> n1011["1011"]
  n1011 --> end1011(("end"))
```

trie -> array
left is 0, right is 1
value is index of array<!--more-->

| left | right | byte/index |
| --- | --- | --- |
| 2 | 4 | 0-1 |
| null | 6 | 2-3 |
| 8 | null | 4-5 |
| 10 | null | 6-7 |
| null | 12 | 8-9 |
| 14 | null | 10-11 |
| null | 16 | 11-12 |
| end | null | 12-13 |
| null | end | 13-14 |

```text
array: [2,4,null,6,8,null,10,null,null,12,14,null,null,16,end,null,null,end]
```

for example:

index 1:
 next left index 2 is null, so 00* is not exist
 next right index 2+1 = 3 is not null, continue search until end or null

this is one byte as one child, but one byte max is 255, if node more than 255, we can use multiple byte as one child
