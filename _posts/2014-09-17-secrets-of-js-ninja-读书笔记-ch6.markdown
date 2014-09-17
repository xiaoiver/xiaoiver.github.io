---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch6"
date:   2014-09-17 10:40:40
categories: js jquery
---

# ch6 OO prototype

初始化步骤首先从prototype中绑定属性，再从构造函数中添加。
并不是简单的拷贝prototype，是attach。
{% highlight javascript %}
function Ninja(){
    this.swung = true;
}
var ninja = new Ninja();
Ninja.prototype.swingSword = function(){
    return this.swung;
};
assert(ninja.swingSword(),
    "Method exists, even out of order.");
{% endhighlight %}
这里在对象创建之后加入prototype依然能引用到。

每个对象有一个隐式的属性constructor引用对象的构造方法，而prototype是构造方法的一个属性，所以每个对象的实例都能找到自己的prototype。

所以访问一个对象的属性时，优先级是首先检查property，如果没有定义过，继续查找prototype，还是没有则返回undefined。

## 类型检测

{% highlight javascript %}
function Ninja(){}
var ninja = new Ninja();
assert(typeof ninja == "object",
    "The type of the instance is object.");
assert(ninja instanceof Ninja,
    "instanceof identifies the constructor." );
assert(ninja.constructor == Ninja,
    "The ninja object was created by the Ninja function.");
{% endhighlight %}

使用对象constructor属性引用的构造器创建对象：
{% highlight javascript %}
function Ninja(){}
var ninja = new Ninja();
var ninja2 = new ninja.constructor();
assert(ninja2 instanceof Ninja, "It's a Ninja!");
assert(ninja !== ninja2, "But not the same Ninja!");
{% endhighlight %}

## 通过prototype chain实现继承

`SubClass.prototype = new SuperClass();`

这样子类就有了父类的全部属性。
{% highlight javascript %}
function Person(){}
Person.prototype.dance = function(){};
function Ninja(){}
Ninja.prototype = new Person();
var ninja = new Ninja();
assert(ninja instanceof Ninja,
    "ninja receives functionality from the Ninja prototype");
assert(ninja instanceof Person, "... and the Person prototype");
assert(ninja instanceof Object, "... and the Object prototype");
assert(typeof ninja.dance == "function", "... and can dance!")
{% endhighlight %}

`Ninja.prototype = Person.prototype;`不能这样，Ninja的prototype发生改变也会影响Person

## 扩展js中的对象

{% highlight javascript %}
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, context) {
        for (var i = 0; i < this.length; i++) {
            callback.call(context || null, this[i], i, this);//防止传入undefined
        }
    };
}
["a", "b", "c"].forEach(function(value, index, array) {
    assert(value,
        "Is in position " + index + " out of " +
        (array.length - 1));
});
{% endhighlight %}

## 扩展html dom对象

现代浏览器中的dom对象继承自HTMLElement
{% highlight javascript %}
HTMLElement.prototype.remove = function() {
    if (this.parentNode)
    this.parentNode.removeChild(this);
};
{% endhighlight %}

但是这种用法是错误的：浏览器禁止直接调用构造函数
`var elem = new HTMLElement();`

## 扩展Object

这样无法得到正确的结果，原因是引入了keys这个新属性。
{% highlight javascript %}
Object.prototype.keys = function() {
    var keys = [];
    for (var p in this) keys.push(p);
    return keys;
};
var obj = { a: 1, b: 2, c: 3 };
assert(obj.keys().length == 3,
    "There are three properties in this object.");
{% endhighlight %}

使用hasOwnProperty判断属性是通过实例定义的还是prototype引入的。
{% highlight javascript %}
Object.prototype.keys = function() {
    var keys = [];
    for (var i in this)
        if (this.hasOwnProperty(i)) keys.push(i);
    return keys;
};
{% endhighlight %}

## 扩展Number：

p138 最好不要,语法上不支持

[一个很好的blog](http://perfectionkills.com/)

## 继承原生对象

{% highlight javascript %}
function MyArray() {}
MyArray.prototype = new Array();
var mine = new MyArray();
mine.push(1, 2, 3);
assert(mine.length == 3,
    "All the items are in our sub-classed array.");
assert(mine instanceof Array,
    "Verify that we implement Array functionality.");
{% endhighlight %}
在IE上length和Array的关系及其紧密

解决办法：定义新的Length属性并copy其他Array方法，使用immediate function：
{% highlight javascript %}
function MyArray() {}
MyArray.prototype.length = 0;
(function() {
    var methods = ['push', 'pop', 'shift', 'unshift',
        'slice', 'splice', 'join'];
    for (var i = 0; i < methods.length; i++) (function(name) {
        MyArray.prototype[ name ] = function() {
            return Array.prototype[ name ].apply(this, arguments);
        };
    })(methods[i]);
})();
var mine = new MyArray();
mine.push(1, 2, 3);
assert(mine.length == 3,
    "All the items are on our sub-classed array.");
assert(!(mine instanceof Array),
    "We aren't subclassing Array, though.");
{% endhighlight %}

## 实例化注意事项

new操作符在创建对象时必不可少，缺少有可能污染全局scope，恰巧变量与属性同名。
{% highlight javascript %}
function User(first, last){
    this.name = first + " " + last;
}
var name = "Rukia";
var user = User("Ichigo", "Kurosaki");
{% endhighlight %}

## function序列化

`/xyz/.test(function() { xyz; }`调用function的toString方法

## 检验function是通过构造函数调用还是普通调用

{% highlight javascript %}
function Test() {
    return this instanceof arguments.callee;
}
assert(!Test(), "We didn't instantiate, so it returns false.");
assert(new Test(), "We did instantiate, returning true.");
{% endhighlight %}

## 防御式编程

如果不是通过new实例化
{% highlight javascript %}
function User(first, last) {
    if (!(this instanceof arguments.callee)) {
        return new User(first,last);
    }
    this.name = first + " " + last;
}
assert(name == "Rukia",
    "Name was set to Rukia.");
{% endhighlight %}
仍存在3个问题：

1. callee在未来版本js中废弃，strict模式下禁用。
2. 好的编程实践？
3. 自以为了解用户

## 实现类的继承

{% highlight javascript %}
var Person = Object.subClass({
    init: function(isDancing){
        this.dancing = isDancing;
    }
});
var Ninja = Person.subclass({
    init: function(){
        this._super(false);
    }
});

(function() {
var initializing = false,
    superPattern =
        /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
Object.subClass = function(properties) {
    var _super = this.prototype;
    initializing = true;
    var proto = new this();
    initializing = false;
    for (var name in properties) {
        proto[name] = typeof properties[name] == "function" && //判断三件事：子类是方法，父类是方法，子类方法包含对_super()的引用
        typeof _super[name] == "function" &&
            superPattern.test(properties[name]) ?
            (function(name, fn) {
                return function() {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, properties[name]) :
            properties[name];
    }
    function Class() {
        // All construction is actually done in the init method
        if (!initializing && this.init)
            this.init.apply(this, arguments);
    }   
    Class.prototype = proto;
    Class.constructor = Class;
    Class.subClass = arguments.callee;
    return Class;
};
})();
{% endhighlight %}