---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch5"
date:   2014-09-17 10:35:40
categories: js jquery
---

# ch5 closure

当innerFunction在outerFunction内部声明时，一个闭包就被创建了。
{% highlight javascript %}
var outerValue = 'ninja';
var later;
function outerFunction() {
    var innerValue = 'samurai';
    
    function innerFunction() {
        assert(outerValue,"I can see the ninja.");
        assert(innerValue,"I can see the samurai.");
    }
    later = innerFunction;
}
outerFunction();
later();
{% endhighlight %}

closure还包含了传入的参数，甚至是在function定义后声明的变量，
而在同一个scope中，是不能提前引用还未定义的变量的，undefined。

## closure的应用

### private 变量

feint方法能访问feints变量是因为feints处在其closure中。而closure阻止了外面对feints的直接访问。外面要想访问，要通过ninja引用。
{% highlight javascript %}
function Ninja() {
    var feints = 0;
    this.getFeints = function(){
        return feints;
    };
    this.feint = function(){
        feints++;
    };
}
var ninja = new Ninja();
ninja.feint();
assert(ninja.getFeints() == 1,
    "We're able to access the internal feint count.");
assert(ninja.feints === undefined,
    "And the private data is inaccessible to us.");
{% endhighlight %}

### callback & timer

将$作为变量的前缀/后缀可以表示这是一个jquery对象的引用。
success回调函数通过closure引用elem$变量。
{% highlight javascript %}
jQuery('#testButton').click(function(){
    var elem$ = jQuery("#testSubject");
    elem$.html("Loading...");
    jQuery.ajax({
        url: "test.html",
        success: function(html){
            assert(elem$,
                "We can see elem$, via the closure for this callback.");
            elem$.html(html);
        }
    });
});
{% endhighlight %}

如果将变量elem,tick放在全局scope中，多个实例会发生干扰。每个handler的closure保证了其中的变量不会被其他实例访问到。而且closure不只是变量当前状态的快照，是一个动态的封装，只要closure存在就能修改变量。
{% highlight javascript %}
function animateIt(elementId) {
    var elem = document.getElementById(elementId);
    var tick = 0;
    var timer = setInterval(function(){
        if (tick < 100) {
            elem.style.left = elem.style.top = tick + "px";
            tick++;
        }
        else {
            clearInterval(timer);
            assert(tick == 100,
                "Tick accessed via a closure.");
            assert(elem,
                "Element also accessed via a closure.");
            assert(timer,
                "Timer reference also obtained via a closure." );
        }
    }, 10);
}
animateIt('box');
{% endhighlight %}

### 绑定函数上下文

测试未通过的原因是addEventListener会将click处理函数的上下文设置成elem而不是我们
期待的button对象
{% highlight javascript %}
var button = {
    clicked: false,
    click: function(){
        this.clicked = true;
        assert(button.clicked,"The button has been clicked");
    }
};
var elem = document.getElementById("test");
elem.addEventListener("click",button.click,false);
{% endhighlight %}

解决办法：通过apply指定上下文
{% highlight javascript %}
function bind(context,name){
    return function(){
        return context[name].apply(context,arguments);
    };
}
var button = {
    clicked: false,
    click: function(){
        this.clicked = true;
        assert(button.clicked,"The button has been clicked");
        console.log(this);
    }
};
var elem = document.getElementById("test");
elem.addEventListener("click",bind(button,"click"),false);
{% endhighlight %}
bind方法返回的匿名函数的closure包含了context，name。

Prototype类库中的bind实现：
{% highlight javascript %}
Function.prototype.bind = function(){
    var fn = this, args = Array.prototype.slice.call(arguments),
    object = args.shift();
    return function(){
        return fn.apply(object,
            args.concat(Array.prototype.slice.call(arguments)));
    };
};
var myObject = {};
function myFunction(){
    return this == myObject;
}
assert( !myFunction(), "Context is not set yet" );
var aFunction = myFunction.bind(myObject)
assert( aFunction(), "Context is set properly" );
{% endhighlight %}

### partial/curry function

在调用函数之前传递特定参数，proxy
Prototype中的curry实现：注意两个arguments是不同的
{% highlight javascript %}
Function.prototype.curry = function() {
    var fn = this,
        args = Array.prototype.slice.call(arguments);
    return function() {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
};
{% endhighlight %}

使用undefined占位
{% highlight javascript %}
Function.prototype.partial = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
        var arg = 0;
        for (var i = 0; i < args.length && arg < arguments.length; i++) {
            if (args[i] === undefined) {
                args[i] = arguments[arg++];
            }
        }
        return fn.apply(this, args);
    };
};
{% endhighlight %}

使用：
{% highlight javascript %}
var bindClick = document.body.addEventListener
    .partial("click", undefined, false);
bindClick(function(){
    assert(true, "Click event bound via curried function.");
});
{% endhighlight %}

### memoization method

这种方法的坏处是isPrime方法必须显式调用memoized方法才能存储之前的结果。
{% highlight javascript %}
Function.prototype.memoized = function(key){
    this._values = this._values || {};
    return this._values[key] !== undefined ?
        this._values[key] :
        this._values[key] = this.apply(this, arguments);
};
function isPrime(num) {
    var prime = num != 1;
    for (var i = 2; i < num; i++) {
        if (num % i == 0) {
            prime = false;
            break;
        }
    }
    return prime;
}
assert(isPrime.memoized(5),
    "The function works; 5 is prime.");
assert(isPrime._values[5],
    "The answer has been cached.");
{% endhighlight %}

改进：
{% highlight javascript %}
Function.prototype.memoize = function(){
    var fn = this;
    return function(){
        return fn.memoized.apply( fn, arguments );
    };
};
var isPrime = (function(num) {
    var prime = num != 1;
    for (var i = 2; i < num; i++) {
        if (num % i == 0) {
            prime = false;
            break;
        }
    }
    return prime;
}).memoize();
assert(isPrime(17),"17 is prime");
{% endhighlight %}
在memoize中创建了一个closure，由于每个函数都有上下文，所以上下文不能是closure的一部分。
但是context的值可以通过一个变量引用它包含在closure中，如fn。

### wrapper function

重载函数但保持对原函数的引用
{% highlight javascript %}
function wrap(object, method, wrapper) {
    var fn = object[method];
    return object[method] = function() {//匿名函数可以通过closure访问fn和wrapper变量
        return wrapper.apply(this, [fn.bind(this)].concat(//fn 作为参数列表的第一个
            Array.prototype.slice.call(arguments)));
    };
}
if (Prototype.Browser.Opera) {
    wrap(Element.Methods, "readAttribute",
    function(original, elem, attr) {
        return attr == "title" ?
            elem.title :
            original(elem, attr);
    });
}
{% endhighlight %}

### immediate function

`(function(){})()`第一组()只是表达式，第二组()才是函数调用符

这样做了3件事：

1. 创建了一个function实例
2. 执行了function
3. 废弃了function因为没有引用

closure起类似命名空间的作用，$被包含在任何创建在function内部的function的closure中，如handler。

传入jQuery变量。这种用法在plugin中十分常见，能避免变量的命名冲突。
{% highlight javascript %}
$ = function(){ alert('not jQuery!'); };
(function($){
    $('img').on('click',function(event){
        $(event.target).addClass('clickedOn');
    })
})(jQuery);
{% endhighlight %}

以下是Prototype中的例子。通过简短的变量名代替长的。
{% highlight javascript %}
(function(v) {
    Object.extend(v, {
        href: v._getAttr,
        src: v._getAttr,
        type: v._getAttr,
        action: v._getAttrNode,
        disabled: v._flag,
        checked: v._flag,
        readonly: v._flag,
        multiple: v._flag,
        onload: v._getEv,
        onunload: v._getEv,
        onclick: v._getEv,
        ...
    });
})(Element.attributeTranslations.read.values);
{% endhighlight %}

循环中的问题：
{% highlight javascript %}
<body>
<div>DIV 0</div>
<div>DIV 1</div>
<script type="text/javascript">
    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener("click", function() {
            alert("divs #" + i + " was clicked.");
        }, false);
    }
</script>
</body>
{% endhighlight %}
这里的i会等于最终的值就是2。因为closure并不是只记录变量的当前值，会保持对它的引用。

解决办法：使用immediate function，在for循环的每次循环中，i都被重新定义为n，closure中n的值是正确的。
{% highlight javascript %}
for (var i = 0; i < div.length; i++) (function(n){
    div[n].addEventListener("click", function(){
        alert("div #" + n + " was clicked.");
    }, false);
})(i);
{% endhighlight %}

window.jQuery作为全局变量。但是有可能被修改，所以在immediate function
的scope中声明了一个局部变量jQuery。
{% highlight javascript %}
(function(){
    var jQuery = window.jQuery = function(){
        // Initialize
    };
    // ...
})();
{% endhighlight %}

另一种方法：
{% highlight javascript %}
var jQuery = (function(){
    function jQuery(){
        // Initialize
    }
    // ...
    return jQuery;
})();
{% endhighlight %}