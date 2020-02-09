---
title: golang实现子进程后台
tags:
  - golang
  - linux
  - windows
categories:
  - golang
abbrlink: 89c4c907
date: 2019-06-09 10:34:04
updated: 2019-06-09 10:34:04
language: zh-Hans
---
## 系统的进程机制

### linux

```none
linux下的进程机制,当父进程被杀死之后,子进程就被系统接管

+系统
|-父进程 -> system管理
|--子进程 -> 父进程管理

当父进程被杀死之后

+系统
|-父进程 -> 被杀死
|--子进程 -> system管理

如果子进程被杀死,而且父进程没有处理子进程的善后工作,那么子进程就会变成僵尸进程

+系统
|-父进程 -> system管理
|--子进程(被杀死) -> 僵尸进程  
```

<!--more-->
### windows

```none
windows下的进程机制就不太一样了,当父进程被杀死之后,子进程也会被杀死
但是如果子进程还有子进程,杀死子进程但不杀死父进程,子进程的子进程就会被系统接管

+系统
|-父进程 -> system管理
|--子进程 -> 父进程管理
|---孙进程 -> 子进程管理

当父进程被杀死

+系统
|-父进程 -> 被杀死
|--子进程 -> 被杀死  
|---孙进程 -> 被杀死

当子进程被杀死

+系统
|-父进程 -> 系统管理
|--子进程 -> 被杀死
|-孙进程 -> 系统管理

windows的机制和linux不太一样,如果子进程被杀死也不会有僵尸进程这种东西,所以子进程可以放心杀死
```

## 实现golang的后台

如果想实现golang子进程后台,而且不杀死当前父进程,那么我们至少得创建子进程,子进程创建孙进程,然后杀死子进程,这种方法不管在linux还是windows都可以实现  
如果使用c语言我们可以使用系统提供的fork,使用double fork实现上述过程  
golang只提供了forkexec,也就是说一个程序只能创建子进程  
**通过这个我想到了一个比较另类的方法,就是在创建进程的时候再次调用本程序再创建进程,这样就相当于创建了子进程,子进程创建孙进程**  
**实现就是给程序加参数,再次调用的时候加上这个参数再创建想要的进程**

```golang
func daemonF(){
    cmd := exec.Command("puthon","-m","http.server")
    cmd.Start()
}
func main(){
    daemon := flag.Bool("d", false, "d")
    flag.Parse()
    if *daemon == true {
        daemonF()
    } else {
        nowFunction, _ := filepath.Abs(os.Args[0])
        cmd := exec.Command(nowFunction,"-d")
        cmd.Run()
    }
}
```

```none
比如我们有一个程序叫makebk,有一个参数 -d

+系统
|-makebk(再次调用makebk并加上参数-d) -> 父进程:system
|--makebk -d(加上参数之后再创建想要的进程) -> 父进程:makebk
|---子进程 -> 父进程:makebk -d

```

这样就得到我们想要的三层结构了,这时候让父进程杀死make -d,就实现子进程被系统接管,实现子进程后台
