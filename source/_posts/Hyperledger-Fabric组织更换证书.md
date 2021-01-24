---
title: Hyperledger Fabric组织更换证书
tags:
  - blockchain
  - Hyperledger Fabric
categories:
  - Hyperledger fabric
language:
  - zh-Hans
abbrlink: afc6d6dd
date: 2021-01-24 17:34:58
updated: 2021-01-24 17:34:58
---
## 前言

最近一直在研究关于如何给一个fabric的组织更换一个新的证书, 包括所有加入的通道, 所有peer和orderer.  
用了很多看似完美的方法却多次测试失败, 最后总算找到一种方法.

```json
{
    "channel_group": {
        "groups": {
            "Application": {
                "groups": {
                    "Org1MSP": {
                        "groups": { }, 
                        "mod_policy": "Admins", 
                        "values": {
                            "MSP": {
                            }
                        }, 
                        "version": "0"
                    }, 
                    "Org2MSP": {
                        "groups": { }, 
                        "mod_policy": "Admins", 
                        "values": {
                            "MSP": {
                            }
                        }, 
                        "version": "0"
                    }
                }, 
                "version": "1"
            }, 
            "Orderer": {
                "groups": {
                    "OrdererOrg": {
                        "groups": { }, 
                        "values": {
                            "MSP": {
                            }
                        }, 
                        "version": "0"
                    }
                }, 
                "values": {
                    "ConsensusType": {
                        "mod_policy": "Admins", 
                        "value": {
                            "metadata": {
                                "consenters": [
                                    {
                                        "client_tls_cert": "==", 
                                        "host": "orderer.example.com", 
                                        "port": 7050, 
                                        "server_tls_cert": "=="
                                    }
                                ], 
                                "options": {
                                    "election_tick": 10, 
                                    "heartbeat_tick": 1, 
                                    "max_inflight_blocks": 5, 
                                    "snapshot_interval_size": 16777216, 
                                    "tick_interval": "500ms"
                                }
                            }, 
                            "state": "STATE_NORMAL", 
                            "type": "etcdraft"
                        }, 
                        "version": "0"
                    }
                }, 
                "version": "0"
            }
        }, 
        "sequence": "2"
    }
}
```

一个通道配置块类似上面这种,为了看的清楚有些内容我删了, 更换证书我们需要保证application及orderer的MSP是相同的, 否则更新配置块是不会成功的, 且我们得保证当前组织的raft节点的证书也要全部更换掉.

## 失败过程
<!--more-->
### 1

第一次就是非常简单的想法, 先更换所有通道的通道配置块的ca证书, 然后重启所有peer和orderer节点.  
但是这里因为raft的问题, 通道配置块内的**raft的tls证书一次只能更换一个**, 如果我要更换证书的组织拥有多个orderer且都作为raft节点, 这是如果直接更新可能会直接导致raft共识直接失效, 很多情况想想都不行.

### 2

先移除多余的raft节点, 更换后再加进来, 测试后发现自己想的太简单了,  因为即使后面重新加进来后, 之前被移除的节点也无法拉取到新的配置块, 因为他们的通道配置块内还是旧的证书, 当然连不上了, 这里必须要更新它们的创世区块才行, 操作过于繁琐, 且在区块链创建初期很容易导致整个联盟的raft共识崩溃掉.

### 3

查看官方文档, 发现orderer和raft的端口可以分开, 也就是说orderer和raft grpc服务可以分开了, 后来测试才发现是自己想错了, 且官方文档的误导性太强了, raft和组织的证书仍旧是绑定在一起的, 如果一个组织只有一个ca证书且拥有多个raft节点依旧无法更换.  
如果使用不同的证书, 查看orderer的报错, 可以发现是在orderer连接其他orderer的raft节点时会出问题, 会报证书验证不通过, 这里我才发现下面的解决方法.

## 方法

最后才发现fabric一个组织的msp目录下的证书都是可以放多个ca证书的, 创建创世区块时, 配置块内的证书数组就会有两个证书, 这样即使orderer和raft使用不同的ca证书签发下来的tls证书, 只要在组织的ca列表内就不会有问题.

这样就有了更换证书的方法, 过程大概是这样的:

- 先将新的tlsca证书添加到所有到通道配置块内, 注意这里是添加, 不是替换.  
- 替换通道配置块内一个raft节点的证书为新证书, 替换本地orderer节点的证书文件, 重启节点.
- 重复以上步骤直到替换了所有raft节点的证书.
- 然后再替换其他的ca证书, admin证书之类的.
- 最后将通道配置块内的旧证书删除掉.

这样就完成替换了, 大概过程就是如此, 实际操作时可能会有所出入.  
当然如果觉得没有删除旧证书的必要也可以不删除.

## 附加

关于fabric ca

fabric ca在签发证书时, ca就是fabric ca server下的ca, 不会重新签发新的ca.  

关于msp目录

keystore <- 节点/用户证书的密钥
signcerts <- 节点/用户证书
