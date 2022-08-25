---
title: TUN网卡
abbrlink: a67af13f
date: 2022-08-14 21:46:33
updated: 2022-08-14 21:46:33
tags:
 - Golang
 - Tun
 - Kotlin
categories:
 - Network
language:
---

## Golang Tun (gVisor)

```golang
import "gvisor.dev/gvisor/pkg/tcpip/stack" // gvisor

s := stack.New(stack.Options{
  NetworkProtocols:   []stack.NetworkProtocolFactory{ipv4.NewProtocol, ipv6.NewProtocol},
  TransportProtocols: []stack.TransportProtocolFactory{tcp.NewProtocol, udp.NewProtocol, icmp.NewProtocol4, icmp.NewProtocol6},
 })

ep := fdbased.New(&fdbased.Options{
   FDs:            []int{fd}, // fd: linux文件标识符, 如android中最后会获取到一个文件标识符
   MTU:            uint32(1500),
  })
 
 nicID := tcpip.NICID(s.UniqueID())
 if er := s.CreateNIC(nicID, ep); er != nil {
  ep.Attach(nil)
  return
 }

func isdns(opt *TunOpt, id stack.TransportEndpointID) bool {
 if id.LocalPort == 53 && (opt.DNSHijacking || id.LocalAddress.String() == opt.Gateway) {
  return true
 }
 return false
}

// TCP
 s.SetTransportProtocolHandler(tcp.ProtocolNumber, tcp.NewForwarder(s, defaultWndSize, maxConnAttempts,  func(r *tcp.ForwarderRequest) {
  wq := new(waiter.Queue)
  id := r.ID()

  ep, err := r.CreateEndpoint(wq)
  if err != nil {
   r.Complete(true)
   return
  }
  r.Complete(false)


  go func(local net.Conn, id stack.TransportEndpointID) {
   defer local.Close()

   if isdns(opt, id) { // 劫持一下dns
    /*
    * Handle DNS
    */
    return
   }

   target := net.JoinHostPort(id.LocalAddress.String(), id.LocalPort) // 远程目标地址
   nconn, er := net.Dial("tcp", target)
   if er != nil {
    return
   }
   defer conn.Close()
   utils.Relay(local, conn)
  }(gonet.NewTCPConn(wq, ep), id)
 }).HandlePacket)


// UDP
 s.SetTransportProtocolHandler(udp.ProtocolNumber, udp.NewForwarder(s, func(fr *udp.ForwarderRequest) {
    // handle udp, 和tcp差不多
 }).HandlePacket)
```

完整代码: [tun](https://github.com/Asutorufa/yuhaiin/tree/main/pkg/net/proxy/tun)

## Android VPN Service

Android 的VPN Service只能处理Tun接口

```kotlin
class MyVpnService : VpnService() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Builder().apply {
            setMtu(1500)
            setSession("my vpn")

            addAddress("172.19.0.1", 24).addRoute("172.19.0.2", 32)
            addAddress("fdfe:dcba:9876::1", 126)
                .addRoute("2000::", 3) // https://issuetracker.google.com/issues/149636790
                .addRoute("fdfe:dcba:9876::2", 128)

            addDnsServer("172.19.0.2") // 记得在Tun中劫持172.19.0.2:53处理所有的DNS请求

            addDisallowedApplication("com.example") // Disallowed和Allowed不能同时调用
            // addAllowedApplication("com.example")

            const fd = establish()
/*
    fd 为 linux文件标识符
    如果是通过tun2socks这种命令行工具处理
    需要使用Linux socket将fd发送给子进程
           
    如果是调用so动态库则不需要
    
    通过unix文件socket发送sd
      private fun sendFd(path: String) {
            LocalSocket().use { localSocket ->
                localSocket.connect(
                    LocalSocketAddress(
                        path,
                        LocalSocketAddress.Namespace.FILESYSTEM
                    )
                )
                localSocket.setFileDescriptorsForSend(arrayOf(fd)) // <------
                localSocket.outputStream.write(42)
            }
    }
*/
        }
        return START_STICKY   
    }


}
```

完整代码: [VpnService](https://github.com/Asutorufa/yuhaiin-android/tree/main/app/src/main/kotlin/io/github/asutorufa/yuhaiin/service)
