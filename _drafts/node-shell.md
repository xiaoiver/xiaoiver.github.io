---
layout: post
title:  "Node.js线程的简单用法"
subtitle: "spawn(), exec(), execFile(), fork()"
header-img: "img/vue-webpack.png"
header-mask: 0.6
date:   2017-06-11 19:21:32
category: coding
tags: nodejs
---

[原文地址](https://medium.freecodecamp.com/node-js-child-processes-everything-you-need-to-know-e69498fe970a)

## spawn

`spawn`返回一个ChildProcess对象：
* 可以监听exit error等事件，其中的message可用于父子进程通信。
* 3个stdio stream，但是和主进程相反，stdout/stderror是可读的数据流，而stdin是可写的，所以data事件监听的是执行命令过程中的输出

## exec

和spawn不同，会启动一个新的shell，执行结果会被缓存，然后传入callback中，所以输出太大不适合使用。

### 最佳选择

此时使用shell语法的spawn成为了最佳选择：
{% highlight javascript linenos %}
const child = spawn('find . -type f', {
  stdio: 'inherit',
  shell: true
});
{% endhighlight %}

另外第二个参数对象可使用的属性还有cwd，env

值得注意的是detached属性，例如执行一个长时间的任务，不影响主进程退出：
{% highlight javascript linenos %}
const { spawn } = require('child_process');

const child = spawn('node', ['timer.js'], {
  detached: true,
  stdio: 'ignore'
});

child.unref();
{% endhighlight %}

## execFile

不启动shell的exec，执行一个脚本

以上三个方法均有Sync版本

## fork

启动子进程，父子使用send/onmessage通信。

常见的场景是，在一个http server中，长时间的耗时计算可以放在fork出的子进程中，完成后通知父进程响应。这样不会阻塞主进程正常响应其他请求。

