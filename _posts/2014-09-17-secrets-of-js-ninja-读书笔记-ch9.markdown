---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch9运行时代码解析"
date:   2014-09-17 10:54:40
categories: js jquery
---

运行时动态解释执行代码。

## eval()

参数是string，在被调用的scope中执行

返回最后一个表达式的结果`eval('3+4;5+6')`，结果是11

如果希望返回的不是原始类型，简单变量或者赋值，需要用大括号包裹。
`var o = eval('({ninja: 1})');`，如果没有，虽然还是创建了o，但是值是1。

## 通过Function的构造函数

不会创建闭包
{% highlight javascript %}
var add = new Function("a", "b", "return a + b;");
assert(add(3,4) === 7, "Function created and working!");
{% endhighlight %}

## 定时器

其实和new Function()差不多
`var tick = window.setTimeout('alert("Hi!")',100);`

## 想在全局作用域中动态解释string

赋值给`window.propName`

[Web Reflection](http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html)提供的另外一种办法，在head后添加script代码段，在全局作用域执行。
{% highlight javascript %}
function globalEval(data) {
    data = data.replace(/^\s*|\s*$/g, "");//去除首尾空白字符
    if (data) {
        var head = document.getElementsByTagName("head")[0] ||
                    document.documentElement,
            script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        head.appendChild(script);
        head.removeChild(script);
    }
}
window.onload = function() {
    (function() {
        globalEval("var test = 5;");
    })();
    assert(test === 5, "The code was evaluated globally.");
};
{% endhighlight %}

应用场景是动态执行从服务端返回的代码，但问题是安全性。

## 安全地解析代码

google项目[Caja](http://code.google.com/p/google-caja/)，将js代码转换成更安全的形式
{% highlight javascript %}
var test = true;
(function(){ var foo = 5; })();
Function.prototype.toString = function(){};

___.loadModule(function (___, IMPORTS___) {
{
    var Function = ___.readImport(IMPORTS___, 'Function');
    var x0___;
    var x1___;
    var x2___;
    var test = true;
    ___.asSimpleFunc(___.primFreeze(___.simpleFunc(function () {
        var foo = 5;
    })))();
    IMPORTS___[ 'yield' ] ((x0___ = (x2___ = Function,
        x2___.prototype_canRead___?
    x2___.prototype: ___.readPub(x2___, 'prototype')),
    x1___ = ___.primFreeze(___.simpleFunc(function () {})),
    x0___.toString_canSet___? (x0___.toString = x1___):
    ___.setPub(x0___, 'toString', x1___)));
}
});
}
{% endhighlight %}

## function的反编译

将function反编译成string，注意返回的字符串包含全部空格和换行符
{% highlight javascript %}
function test(a){ return a + a; }
assert(test.toString() ===
    "function test(a){ return a + a; }",
    "Function decompiled");
{% endhighlight %}

用途：Prototype中提取函数的参数
{% highlight javascript %}
function argumentNames(fn) {
    var found = /^[\s\(]*function[^(]*\(\s*([^)]*?)\s*\)/
        .exec(fn.toString());
    return found && found[1] ?
        found[1].split(/,\s*/) :
        [];
}
{% endhighlight %}

检测浏览器是否支持反编译
{% highlight javascript %}
var FUNCTION_DECOMPILATION = /abc(.|\n)*xyz/.test(function(abc){xyz;});
assert(FUNCTION_DECOMPILATION,
    "Function decompilation works in this browser");
{% endhighlight %}

## 将JSON字符串转化成js对象

很多浏览器支持JSON对象的parse()和stringify()方法
{% highlight javascript %}
var json = '{"name":"Ninja"}';
var object = eval("(" + json + ")");
assert(object.name === "Ninja",
    "My name is Ninja!");
{% endhighlight %}

[安全的实现](https://github.com/douglascrockford/JSON-js)
做了很多预处理工作

## 导入命名空间中的代码

{% highlight javascript %}
base2.namespace ==
    "var Base=base2.Base;var Package=base2.Package;"
eval(base2.namespace);
{% endhighlight %}

## 压缩和混淆

将代码中的变量重新命名，压缩成一个字符串，使用eval解析执行

[Dean Edwards’s Packer](http://dean.edwards.name/packer/)

但是小虽然能减少下载时间，但是解析时间不一定
load time = download time + evaluation time

## 动态代码重写

单元测试库[Screw.Unit](https://github.com/nkallen/screw-unit)

测试代码
{% highlight javascript %}
describe(“Matchers”, function() {
    it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
    });
});
{% endhighlight %}

使用Function构造函数，动态生成代码。通过with避免引入大量全局变量。
{% highlight javascript %}
var contents = fn.toString().match(/^[^{]*{((.*\n*)*)}/m)[1];
var fn = new Function("matchers", "specifications",
    "with (specifications) { with (matchers) { " + contents + " } }"
);
fn.call(this, Screw.Matchers, Screw.Specifications);
{% endhighlight %}

## 面向方面的script tag

面向方面编程：代码在运行时动态注入和执行，处理一些类似日志，缓存工作。

通过定义新的script type，浏览器会忽略
{% highlight javascript %}
<script type="text/javascript">
    window.onload = function(){
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].type == "x/onload") {
                globalEval(scripts[i].innerHTML);
            }
        }
    };
</script>
<script type="x/onload">
    assert(true,"Executed on page load");
</script>
{% endhighlight %}

jquery的tmp方法提供运行时的模板

## 元语言和DSL领域特定语言

[Processing.js](http://processing.org/)

john resig写了[js的版本](http://ejohn.org/blog/processingjs/)应用于HTML5 canvas

使用元语言的好处：

* 先进的语言特性：如class和继承
* 使用简单的画图api

示例代码
{% highlight javascript %}
<script type="application/processing">
class SpinSpots extends Spin {
    float dim;
    SpinSpots(float x, float y, float s, float d) {
        super(x, y, s);
        dim = d;
    }
    void display() {
        noStroke();
        pushMatrix();
        translate(x, y);
        angle += speed;
        rotate(angle);
        ellipse(-dim/2, 0, dim, dim);
        ellipse(dim/2, 0, dim, dim);
        popMatrix();
    }
}
</script>
{% endhighlight %}

转化成js，使用eval执行
{% highlight javascript %}
function SpinSpots() {with(this){
    var __self=this;function superMethod(){
    extendClass(__self,arguments,Spin);
    this.dim = 0;
    extendClass(this, Spin);
    addMethod(this, 'display', function() {
        noStroke();
        pushMatrix();
        translate(x, y);
        angle += speed;
        rotate(angle);
        ellipse(-dim/2, 0, dim, dim);
        ellipse(dim/2, 0, dim, dim);
        popMatrix();
    });
    if ( arguments.length == 4 ) {
        var x = arguments[0];
        var y = arguments[1];
        var s = arguments[2];
        var d = arguments[3];
        superMethod(x, y, s);
        dim = d;
    }
}}
{% endhighlight %}