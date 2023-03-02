---
title: CRI 容器运行时接口
date: 2023-03-01 14:55:45
updated: 2023-03-01 14:55:45
tags:
 - Kubernetes
 - CRI
 - container
categories:
 - Kubernetes
language:
---


```md
+----------------+       +-----------------+
|  kubelet       |       |   CRI shim      |
| +-----------+  |       |  +-----------+  |      +-----------+
| |grpc client|<-|-------|->|grpc server|  |<---->| container |
| +-----------+  |       |  +-----------+  |      |  runtime  |
+----------------+       +-----------------+      +-----------+
```

## CRI shim

- cri-o
- cri-containerd
- rkt
- frakti
- docker (cri-dockerd)

## container runtime

- gvisor
- kata containers
