---
title: iptables
tags:
  - linux
  - iptables
categories:
  - Network
abbrlink: 736b1750
date: 2021-07-14 21:31:27
updated: 2021-07-14 21:31:27
language:
---

iptables chain

```md
    +---------------------------------------------------------+
    |                   Network Card                          |
    +---------------------------------------------------------+
      |                                                    ^
      |                                                    |
      v                                                    |
 +----------+          is?      no    +-------+        +-----------+
 |prerouting| ----> localhost ------> |forward| ---->  |postrouting|
 +----------+          |              +-------+        +-----------+ 
                       | yes                                 ^
                       |                                     |
                       v                                     |
                    +---------+                        +-----------+
                    |  input  |                        |   output  |
                    +---------+                        +-----------+
                         |                                   ^
                         |                                   |
                         |                                   |
                         v                                   |
    +----------------------------------------------------------+
    |                        user                              |
    +----------------------------------------------------------+

out -> localhost: prerouting -> input
forward:          prerouting -> forward    -> postrouting
localhost -> out: output     -> postrouting
```

iptables table:  

- filter:
- nat:
- magle:
- raw:

```md
table <-> chain  
raw: PREROUTING, OUTPUT  
mangle: PREROUTING, INPUT, FORWARD, OUTPUT, POSTROUTING  
nat: PREROUTING, OUTPUT, POSTROUTING, INPUT  
filter: INPUT, FORWARD, OUTPUT

raw –> mangle –> nat –> filter  

chain <-> table
PREROUTING: raw, mangle, nat
INPUT: mangle, filter, nat
FORWARD: mangle, filter
OUTPUT: raw, mangle, nat, filter
POSTROUTING: mangle, nat
```

query

```shell
iptables -t <table> -nvL <chain>
```

***

[iptables](https://www.zsythink.net/archives/tag/iptables/page/2)