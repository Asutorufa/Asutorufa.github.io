---
title: Kubernetesのコントローラーを作ろう
date: 2025-02-23 22:30:31
updated: 2025-02-23 22:30:31
tags:
  - Kubernetes
  - CRI
  - container
categories:
  - Kubernetes
language: ja
---

## Kubernetesコントローラーとは

コントローラーはKubernetesのリソース設定を監視して変更があったら自動的にリソースを調整するプログラムです。ちなみに、Deployment、Statefulset、DaemonSetなどはKubernetesの内蔵コントローラーです。

## コントローラーを実現

今回はGolangで簡単なLoadBalancerコントローラーを実現する。実際の機能はないですが、作成の流れはただしいと思います。

最初はTypeはLoadBalancerのServiceを作成

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  clusterIP: 10.0.171.239
  type: LoadBalancer
```

この時はIPアドレスを割り当てのコントローラーがないので、ServiceのステータスはPendingです。

新たなKubernetesクライアントを作成
<!--more-->
```go
config, err := rest.InClusterConfig()
if err != nil {
 panic(err)
}

cli, err := kubernetes.NewForConfig(config)
if err != nil {
 panic(err)
}
```

Serviceの状態を監視して

```go
wch, err := cli.CoreV1().Services(corev1.NamespaceAll).Watch(context.TODO(), metav1.ListOptions{Watch: true})
if err != nil {
 panic(err)
}
defer wch.Stop()
```

コントローラーを作成して、IPアドレスをServiceに割り当てる。

```go
// ポートの範囲
var portRange = atomic.Uint32{}
func init() {
 portRange.Store(30000)
}


for {
  select {
  case <-signChannel:
   return
  case obj, ok := <-wch.ResultChan():
   if !ok {
    return
   }

   svc, ok := obj.Object.(*corev1.Service)
   if !ok {
    continue
   }

   switch obj.Type {
   case watch.Added:
   // ServiceのTypeはLoadBalancerかどうかを判断して
   // プロダクション環境にはAnnotationsも判断する必要があると思います
    if svc.Spec.Type != corev1.ServiceTypeLoadBalancer {
     continue
    }

    // ポートを生成して、転送ルールを設定して
    // ここは本当の転送ではなく出力するだけ
    sport := portRange.Add(1)
    forward(svc, sport)

    // ServiceにIPアドレスを設定
    svc.Status.LoadBalancer.Ingress = []corev1.LoadBalancerIngress{
     {
      IP: svc.Spec.ClusterIP,
      Ports: []corev1.PortStatus{
       {
        Port: int32(sport),
       },
      },
     },
    }

    // Serviceを更新して
    _, err := cli.
     CoreV1().
     Services(svc.Namespace).
     UpdateStatus(context.TODO(), svc, metav1.UpdateOptions{})
    if err != nil {
     slog.Error(err.Error())
    } else {
     slog.Info("service added", svc.Name, svc.Namespace, svc.Spec.ClusterIP, svc.Spec.ClusterIPs)
    }

   case watch.Modified:
    slog.Info("service modified", svc.Name, svc.Namespace, svc.Spec.ClusterIP, svc.Spec.ClusterIPs)
   case watch.Deleted:
    slog.Info("service deleted", svc.Name, svc.Namespace, svc.Spec.ClusterIP, svc.Spec.ClusterIPs)
   }
  }
}

// ...
// ...

// 転送ルールの作成をシミュレーション
func forward(svc *corev1.Service, sport uint32) {
 ip, err := netip.ParseAddr(svc.Spec.ClusterIP)
 if err != nil {
  panic(err)
 }

 for _, v := range svc.Spec.Ports {
  var ipt string
  var mask string

  if ip.Is4() {
   ipt = "iptables"
   mask = "32"
  } else {
   ipt = "ip6tables"
   mask = "128"
  }

  fmt.Println(
   ipt, "-t", "filter", "-A", "FORWARD",
   "-d", svc.Spec.ClusterIP+"/"+mask,
   "-p", string(v.Protocol),
   "--dport", strconv.Itoa(int(v.Port)),
   "-j", "DROP",
  )

  fmt.Println(
   ipt, "-t", "nat", "-I", "PRETROUTING", 0,
   "-p", string(v.Protocol),
   "--dport", strconv.Itoa(int(sport)),
   "-j", "DNAT",
   "--to", net.JoinHostPort(svc.Spec.ClusterIP, strconv.Itoa(int(v.Port))),
  )

  fmt.Println(
   ipt, "-t", "nat", "-I", "POSTROUTING",
   "-d", svc.Spec.ClusterIP+"/"+mask,
   "-p", v.Protocol,
   "-j", "MASQUERADE",
  )
 }
}
```

実行したらServiceのステータスはPendingではなくなった、IPアドレスも割り当てられた。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app.kubernetes.io/name: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  clusterIP: 10.0.171.239
  type: LoadBalancer
status:
  loadBalancer:
    ingress:
    - ip: 10.0.171.239
```

k3sの[klipper-lb](https://github.com/k3s-io/klipper-lb)は簡単なLoadBalancerコントローラーの実現、コードほんの数行のスクリプト

```sh
start_proxy() {
    for src_range in ${SRC_RANGES//,/ }; do
        if echo ${src_range} | grep -Eq ":"; then
            ip6tables -t filter -I FORWARD -s ${src_range} -p ${DEST_PROTO} --dport ${DEST_PORT} -j ACCEPT
        else
            iptables -t filter -I FORWARD -s ${src_range} -p ${DEST_PROTO} --dport ${DEST_PORT} -j ACCEPT
        fi
    done

    for dest_ip in ${DEST_IPS//,/ }; do
        if echo ${dest_ip} | grep -Eq ":"; then
            [ $(cat /proc/sys/net/ipv6/conf/all/forwarding) == 1 ] || exit 1
            ip6tables -t filter -A FORWARD -d ${dest_ip}/128 -p ${DEST_PROTO} --dport ${DEST_PORT} -j DROP
            ip6tables -t nat -I PREROUTING -p ${DEST_PROTO} --dport ${SRC_PORT} -j DNAT --to [${dest_ip}]:${DEST_PORT}
            ip6tables -t nat -I POSTROUTING -d ${dest_ip}/128 -p ${DEST_PROTO} -j MASQUERADE
        else
            [ $(cat /proc/sys/net/ipv4/ip_forward) == 1 ] || exit 1
            iptables -t filter -A FORWARD -d ${dest_ip}/32 -p ${DEST_PROTO} --dport ${DEST_PORT} -j DROP
            iptables -t nat -I PREROUTING -p ${DEST_PROTO} --dport ${SRC_PORT} -j DNAT --to ${dest_ip}:${DEST_PORT}
            iptables -t nat -I POSTROUTING -d ${dest_ip}/32 -p ${DEST_PROTO} -j MASQUERADE
        fi
    done
}
```
