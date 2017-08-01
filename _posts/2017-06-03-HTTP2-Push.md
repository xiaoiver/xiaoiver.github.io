---
layout: post
title:  "HTTP2 Push"
header-img: "img/post-bg-js-module.jpg"
date:   2017-06-03 19:21:32
category: coding
tags: http2
---

[原文](https://www.smashingmagazine.com/2017/04/guide-http2-server-push/)

[HTTP/2支持度](http://caniuse.com/#feat=http2)

[nodejs内置支持](https://github.com/nodejs/http2)

[使用中的问题](https://jakearchibald.com/2017/h2-push-tougher-than-i-thought/)

[API 推送](https://zhuanlan.zhihu.com/p/26757514)

## HTTP/2

[介绍](https://blog.yld.io/2017/01/10/http-2-a-look-into-the-future-of-the-web/#.WPSBnVN969s)

1次连接，多个stream，每个stream用来传递message，message中可以包含多个frame。

## 问题

HTTP/1中为了在获取外部资源之前，就能够渲染页面，带来的反模式：
- 内联样式
- html中直接插入js
- 样式中data-uri

缺点就是无法缓存

## http2服务端推送

例如伴随index.html的响应头，可以减少http往返通信时间。
`Link: </css/styles.css>; rel=preload; as=style`

apache有支持的http2模块，nginx暂无。

### 注意事项

#### 选择性push资源

过多push也会影响首屏渲染时间，可以从样式表开始。

#### push缓存

apache和H2O Server有各自的设计。

可以[利用cookie缓存](https://css-tricks.com/cache-aware-server-push/)，将需要缓存的资源数组通过json持久化。通过md5实现只推送发生变更的资源。

## 配合sw

[配合sw](https://blog.yld.io/2017/03/01/optimize-with-http-2-server-push-and-service-workers/#.WPQ2D1N969s)

本地测试存在证书问题，无法使用sw，mac中关闭ssh证书报错，要注意在`chrome://flags`中并没有这个开关
`open -a Google\ Chrome.app --args --ignore-certificate-errors`

另外代码中有错误，response和request作为stream，不能重复使用，需要clone。
