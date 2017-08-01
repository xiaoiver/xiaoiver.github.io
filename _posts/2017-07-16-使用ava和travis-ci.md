---
layout: post
title:  "使用ava和travis-ci"
header-img: "img/travis-ci.jpg"
header-mask: 0.4
date:   2017-07-16 19:21:32
category: coding
tags: ava travis
---

最近给 [skeleton 插件](https://github.com/lavas-project/vue-skeleton-webpack-plugin)加上了测试用例，顺便使用了下自动集成工具。

## [ava](https://github.com/avajs/ava)

首先配置基本参数：
{% highlight json linenos %}
// package.json

"ava": {
    "concurrency": 5,
    "failFast": true,
    "files": [
      "test/*.test.js"
    ],
    "require": [
      "babel-register"
    ]
}
{% endhighlight %}

使用方法也很简单：
{% highlight javascript linenos %}
import test from 'ava';
test('it should run successfully', async t => {
    let {stats, errors} = webpackBuildStats;
    t.falsy(stats.hasWarnings() && errors.hasWarnings());
});
{% endhighlight %}

运行时除了会输出测试用例结果，还会输出一张代码覆盖率表格，并标出未覆盖的代码行号。
测试代码覆盖率其实很有用，出现很低的覆盖率要么是代码本身问题，要么是测试用例覆盖不全。

![](/img/ava-log.png)

## travis ci

使用持续集成工具，每次提交时自动运行测试脚本。

首先需要有项目的owner权限，授权给travis。

然后在配置文件中我们可以：
* 设置多个 Node.js 版本环境
* 提供安装依赖和脚本，这里就直接运行测试命令了

{% highlight yml linenos %}
//.travis.yml

language: node_js
node_js:
  - "4"
  - "5"
  - "6"
install:
  - npm install
script:
  - npm test
{% endhighlight %}

完成后就可以在`README.md`里加上build图标了。![](https://travis-ci.org/lavas-project/vue-skeleton-webpack-plugin.svg?branch=master)
