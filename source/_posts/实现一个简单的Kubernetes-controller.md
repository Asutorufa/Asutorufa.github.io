---
title: 实现一个简单的Kubernetes controller
tags:
  - Kubernetes
  - CRI
  - container
categories:
  - Kubernetes
language: zh-Hans
abbrlink: edf1c330
date: 2024-03-30 15:09:58
updated: 2024-03-30 15:09:58
---

## controller是什么

简单来说，controller就是监听kubernetes的配置/状态变化，自动对资源进行调节。比如kubernetes内置的controller有Deployment、StatefulSet、DaemonSet。

## 实现controller

这里我们实现一个简单的loadbalancer controller，使用kubernetes的client-go。  

先创建一个新的Serivce,并且指定Type为LoadBalancer。

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

这时Service的状态还是pending,因为还没有controller为其分配IP地址。

创建新的client
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

创建一个新的对Service状态变化的监听

```go
wch, err := cli.CoreV1().Services(corev1.NamespaceAll).Watch(context.TODO(), metav1.ListOptions{Watch: true})
if err != nil {
	panic(err)
}
defer wch.Stop()
```

如果是新建的Serivce,并且Type为LoadBalancer，则自动为其分配一个IP地址。

```go
// 端口分配范围
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
                // 判断是否是LoadBalancer
                // 生成环境中还应结合Annotations进行判断，防止误更改错误的Service.
				if svc.Spec.Type != corev1.ServiceTypeLoadBalancer {
					continue
				}

                // 生成端口，并创建转发（只会打印，不会真正创建规则）
				sport := portRange.Add(1)
				forward(svc, sport)

                // 为service分配IP地址
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

                // 更新service
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

// 模拟实现iptables自动创建转发
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

运行这个简单程序，再观察Serivce, 就会发现Serivice已经不再处于pending状态，并也为其分配了一个IP地址，虽然不能真正使用此地址进行访问，因为我们并没有创建真正的转发规则。

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

k3s的[klipper-lb](https://github.com/k3s-io/klipper-lb)是一个很简单loadbalancer实现，代码只是几行脚本。

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
