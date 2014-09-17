---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch4"
date:   2014-09-17 10:32:00
categories: js jquery
---

## ch4 function

### 匿名函数

#### 使用场景

1. 用作event handler：不需要再次引用`window.onload = function(){ assert(true, 'power!'); };`
2. 对象的属性方法，这里的shout并不是函数的名字，只是对匿名函数的引用
{% highlight javascript %}
var ninja = {
    shout: function(){
        assert(true,"Ninja");
    }
};
{% endhighlight %}
3. 回调函数
{% highlight javascript %}
setTimeout(
    function(){ assert(true,'Forever!'); },
500);
{% endhighlight %}

#### 解决问题

##### 递归

通过命名函数实现：
a) 判断一个string是否是回文的
{% highlight javascript %}
function isPalindrome(text) {
    if (text.length <= 1) return true;
    if (text.charAt(0) != text.charAt(text.length - 1)) return false;
    return isPalindrome(text.substr(1,text.length - 2));
}
{% endhighlight %}

b) 重复一定次数
{% highlight javascript %}
function chirp(n) {
    return n > 1 ? chirp(n - 1) + "-chirp" : "chirp";
}
{% endhighlight %}

通过匿名函数实现：
{% highlight javascript %}
var ninja = {
    chirp: function(n) {
        return n > 1 ? ninja.chirp(n - 1) + "-chirp" : "chirp";
    }
};
{% endhighlight %}

存在问题，ninja.chirp写成this更好，防止ninja对象清空后，匿名函数无法执行

匿名函数也可以有name，inline function
{% highlight javascript %}
var ninja = {
    chirp: function signal(n) {
    return n > 1 ? signal(n - 1) + "-chirp" : "chirp";
    }
};
{% endhighlight %}

但是inline function的name只在function内部可见，
和function内部声明变量的scope一样

这也是顶级function为什么被创建为window对象的方法，不然我们无法引用

arguments.callee可以得到函数本身

### function本身也是对象

{% highlight javascript %}
var store = {
    nextId: 1,
    cache: {},
    add: function(fn) {
        if (!fn.id) {
            fn.id = store.nextId++;
            return !!(store.cache[fn.id] = fn);// !!将js表达式转换成等价的布尔值
        }
    }
};
function ninja(){}
assert(store.add(ninja),
    "Function was safely added.");
assert(!store.add(ninja),
    "But it was only added once.");
{% endhighlight %}

### memoizing function

判断质数，将过往记录保存在answer中
{% highlight javascript %}
function isPrime(value) {
    if (!isPrime.answers) isPrime.answers = {};
    if (isPrime.answers[value] != null) {
        return isPrime.answers[value];
    }
    var prime = value != 1; // 1 can never be prime
    for (var i = 2; i < value; i++) {
        if (value % i == 0) {
            prime = false;
            break;
        }
    }
    return isPrime.answers[value] = prime;
}
assert(isPrime(5), "5 is prime!" );
assert(isPrime.answers[5], "The answer was cached!" );
{% endhighlight %}

### 保存查询的DOM elements
{% highlight javascript %}
function getElements(name) {
    if (!getElements.cache) getElements.cache = {};
    return getElements.cache[name] =
        getElements.cache[name] ||
        document.getElementsByTagName(name);
}
{% endhighlight %}

### faking array method

利用call将elems作为上下文传递给Array的push方法，增长length属性
{% highlight javascript %}
var elems = {
    length: 0,
    add: function(elem){
        Array.prototype.push.call(this, elem);
    },
    gather: function(id){
        this.add(document.getElementById(id));
    }
};
elems.gather("first");
assert(elems.length == 1 && elems[0].nodeType,
    "Verify that we have an element in our stash");
elems.gather("second");
assert(elems.length == 2 && elems[1].nodeType,
    "Verify the other insertion");
{% endhighlight %}

### 变长参数列表

js中没有面向对象语言中的重载特性，参数列表可以做到

`Math.max/min`不接受array参数，所以需要知道array长度，但这样也不够优雅：
`var biggest = Math.max(list[0],list[1],list[2]);`

使用apply()：传递参数列表，无须显式传递
{% highlight javascript %}
function smallest(array){
    return Math.min.apply(Math, array);
}
{% endhighlight %}

将第一个参数之后的对象合并进第一个对象中
{% highlight javascript %}
function merge(root){
    for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
            root[key] = arguments[i][key];
        }
    }
    return root;
}
var merged = merge(
    {name: "Batou"},
    {city: "Niihama"});
{% endhighlight %}

一个jquery-ui中的例子：
`$("#myDialog").dialog({ caption: "This is a dialog" });$("#myDialog").dialog("open");`
通过判断传入的参数类型，属性赋值和具体操作。

由于arguments并不是一个array对象，诸如slice之类的方法没有，可以通过call
欺骗slice方法，传入一个非array对象的上下文。

{% highlight javascript %}
function multiMax(multi){
    return multi * Math.max.apply(Math,
        Array.prototype.slice.call(arguments, 1));
}
assert(multiMax(3, 1, 2, 3) == 9,
    "3*3=9 (First arg, by largest.)");
{% endhighlight %}

function的length属性值是声明的参数个数，
arguments.length不一样，是调用函数时传入参数的个数。

### 函数重载

像洋葱，每一层的方法检查传入的参数个数和自己定义的是否一致，
一致就执行，不一致传给下一层。内部的匿名函数对old和fn的引用通过closure

{% highlight javascript %}
function addMethod(object, name, fn) {
    var old = object[name];
    object[name] = function(){
        if (fn.length == arguments.length)
            return fn.apply(this, arguments)
        else if (typeof old == 'function')
            return old.apply(this, arguments);
    };
}
var ninja = {};
addMethod(ninja,'whatever',function(){ /* do something */ });
addMethod(ninja,'whatever',function(a){ /* do something else */ });
addMethod(ninja,'whatever',function(a,b){ /* yet something else */ });
{% endhighlight %}

### 判断一个对象是不是function

{% highlight javascript %}
function ninja(){}
assert(typeof ninja == "function",
    "Functions have a type of function");
{% endhighlight %}
一些特例p87，不同浏览器

较好的实现
{% highlight javascript %}
function isFunction(fn) {
    return Object.prototype.toString.call(fn) === "[object Function]";
}
{% endhighlight %}

为何不直接调用fn.toString:

1. 对象可能有自己的toString实现
2. js中大多数类型覆盖了Object.prototype提供的toString方法