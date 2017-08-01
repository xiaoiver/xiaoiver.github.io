---
layout: post
title:  "webpack代码分割"
header-img: "img/vue-webpack.png"
header-mask: 0.6
date:  
category: coding
tags: webpack
---

在开发 Lavas 模版的过程中，使用到了 webpack 代码切割点的功能。

# 代码分割

切割点 import require.ensure

# Bundle splitting

## CommonChunkPlugin

[示例](https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793)

以vue模版为例，按顺序执行，所以首先vendor将entry中共用的依赖抽出，此时标记为entry chunk，然后遇到manifest，发现此时各个chunk不存在公共依赖，所以标记为entry后只包含webpack runtime代码。这样避免runtime和第三方依赖全在vendor中，修改app代码也会导致vendor改变。

[chunk 类型](https://survivejs.com/webpack/building/bundle-splitting/#chunk-types-in-webpack)中最重要的两种就是entry chunk和normal chunk。
entry chunk就是包含runtime代码，而normal chunk包含动态加载的wrapper例如JSONP

## 切分与合并chunk

[结合http2切分大chunk](https://survivejs.com/webpack/building/bundle-splitting/#splitting-and-merging-chunks)

# 提升构建性能

每次构建时处理第三方依赖
[dll](https://survivejs.com/webpack/optimizing/performance/)
