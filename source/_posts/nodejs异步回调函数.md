---
title: nodejs异步回调函数
tags:
  - nodejs
categories:
  - nodejs
abbrlink: 5938ae8c
date: 2019-08-30 22:45:20
---
研究了一下javascript的异步回调函数,本来想像golang那样使用chan可以返回原始值,不过貌似无法做到,最后止步async/await,差不多就是用Promise的resolve返回值然后用await调用,不过await必须使用在async的函数里,局限还是有的.  
如果使用非async的函数调用,返回的依旧是Promise类型,需要使用.then.

```javascript
async function test() {
    return await new Promise(function (resolve, reject) {
        resolve("test")
    })
    }

async function test2(){
    console.log(await test())
}

test2()
```
