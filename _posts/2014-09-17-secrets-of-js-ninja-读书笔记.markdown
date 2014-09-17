---
layout: post
title:  "《Secrets of JS Ninja》读书笔记"
date:   2014-09-17 10:02:40
categories: js jquery
---


## ch5 closure
当innerFunction在outerFunction内部声明时，一个闭包就被创建了。
```javascript
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
```

closure还包含了传入的参数，甚至是在function定义后声明的变量，
而在同一个scope中，是不能提前引用还未定义的变量的，undefined。

### closure的应用
#### private 变量

feint方法能访问feints变量是因为feints处在其closure中。而closure阻止了外面对feints的直接访问。外面要想访问，要通过ninja引用。
```javascript
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
```

#### callback & timer

将$作为变量的前缀/后缀可以表示这是一个jquery对象的引用。
success回调函数通过closure引用elem$变量。
```javascript
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
```

如果将变量elem,tick放在全局scope中，多个实例会发生干扰。每个handler的closure保证了其中的变量不会被其他实例访问到。而且closure不只是变量当前状态的快照，是一个动态的封装，只要closure存在就能修改变量。
```javascript
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
```

#### 绑定函数上下文

测试未通过的原因是addEventListener会将click处理函数的上下文设置成elem而不是我们
期待的button对象
```javascript
var button = {
    clicked: false,
    click: function(){
        this.clicked = true;
        assert(button.clicked,"The button has been clicked");
    }
};
var elem = document.getElementById("test");
elem.addEventListener("click",button.click,false);
```

解决办法：通过apply指定上下文
```javascript
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
```
bind方法返回的匿名函数的closure包含了context，name。

Prototype类库中的bind实现：
```javascript
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
```

#### partial/curry function
在调用函数之前传递特定参数，proxy
Prototype中的curry实现：注意两个arguments是不同的
```javascript
Function.prototype.curry = function() {
    var fn = this,
        args = Array.prototype.slice.call(arguments);
    return function() {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
};
```

使用undefined占位
```javascript
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
```

使用：
```javascript
var bindClick = document.body.addEventListener
    .partial("click", undefined, false);
bindClick(function(){
    assert(true, "Click event bound via curried function.");
});
```

#### memoization method
这种方法的坏处是isPrime方法必须显式调用memoized方法才能存储之前的结果。
```javascript
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
```

改进：
```javascript
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
```
在memoize中创建了一个closure，由于每个函数都有上下文，所以上下文不能是closure的一部分。
但是context的值可以通过一个变量引用它包含在closure中，如fn。

#### wrapper function
重载函数但保持对原函数的引用
```javascript
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
```

#### immediate function
`(function(){})()`第一组()只是表达式，第二组()才是函数调用符

这样做了3件事：

1. 创建了一个function实例
2. 执行了function
3. 废弃了function因为没有引用

closure起类似命名空间的作用，$被包含在任何创建在function内部的function的closure中，如handler。

传入jQuery变量。这种用法在plugin中十分常见，能避免变量的命名冲突。
```javascript
$ = function(){ alert('not jQuery!'); };
(function($){
    $('img').on('click',function(event){
        $(event.target).addClass('clickedOn');
    })
})(jQuery);
```

以下是Prototype中的例子。通过简短的变量名代替长的。
```javascript
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
```

循环中的问题：
```javascript
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
```
这里的i会等于最终的值就是2。因为closure并不是只记录变量的当前值，会保持对它的引用。

解决办法：使用immediate function，在for循环的每次循环中，i都被重新定义为n，closure中n的值是正确的。
```javascript
for (var i = 0; i < div.length; i++) (function(n){
    div[n].addEventListener("click", function(){
        alert("div #" + n + " was clicked.");
    }, false);
})(i);
```

window.jQuery作为全局变量。但是有可能被修改，所以在immediate function
的scope中声明了一个局部变量jQuery。
```javascript
(function(){
    var jQuery = window.jQuery = function(){
        // Initialize
    };
    // ...
})();
```

另一种方法：
```javascript
var jQuery = (function(){
    function jQuery(){
        // Initialize
    }
    // ...
    return jQuery;
})();
```

## ch6 OO prototype
p122
初始化步骤首先从prototype中绑定属性，再从构造函数中添加。
并不是简单的拷贝prototype，是attach。
```javascript
function Ninja(){
    this.swung = true;
}
var ninja = new Ninja();
Ninja.prototype.swingSword = function(){
    return this.swung;
};
assert(ninja.swingSword(),
    "Method exists, even out of order.");
```
这里在对象创建之后加入prototype依然能引用到。

每个对象有一个隐式的属性constructor引用对象的构造方法，而prototype是构造方法的一个属性，所以每个对象的实例都能找到自己的prototype。

所以访问一个对象的属性时，优先级是首先检查property，如果没有定义过，继续查找prototype，还是没有则返回undefined。

### 类型检测
```javascript
function Ninja(){}
var ninja = new Ninja();
assert(typeof ninja == "object",
    "The type of the instance is object.");
assert(ninja instanceof Ninja,
    "instanceof identifies the constructor." );
assert(ninja.constructor == Ninja,
    "The ninja object was created by the Ninja function.");
```

使用对象constructor属性引用的构造器创建对象：
```javascript
function Ninja(){}
var ninja = new Ninja();
var ninja2 = new ninja.constructor();
assert(ninja2 instanceof Ninja, "It's a Ninja!");
assert(ninja !== ninja2, "But not the same Ninja!");
```

### 通过prototype chain实现继承
`SubClass.prototype = new SuperClass();`

这样子类就有了父类的全部属性。
```javascript
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
```

`Ninja.prototype = Person.prototype;`不能这样，Ninja的prototype发生改变也会影响Person

### 扩展js中的对象
```javascript
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
```

### 扩展html dom对象
现代浏览器中的dom对象继承自HTMLElement
```javascript
HTMLElement.prototype.remove = function() {
    if (this.parentNode)
    this.parentNode.removeChild(this);
};
```

但是这种用法是错误的：浏览器禁止直接调用构造函数
`var elem = new HTMLElement();`

### 扩展Object
这样无法得到正确的结果，原因是引入了keys这个新属性。
```javascript
Object.prototype.keys = function() {
    var keys = [];
    for (var p in this) keys.push(p);
    return keys;
};
var obj = { a: 1, b: 2, c: 3 };
assert(obj.keys().length == 3,
    "There are three properties in this object.");
```

使用hasOwnProperty判断属性是通过实例定义的还是prototype引入的。
```javascript
Object.prototype.keys = function() {
    var keys = [];
    for (var i in this)
        if (this.hasOwnProperty(i)) keys.push(i);
    return keys;
};
```

### 扩展Number：
p138 最好不要,语法上不支持

[一个很好的blog](http://perfectionkills.com/)

### 继承原生对象
```javascript
function MyArray() {}
MyArray.prototype = new Array();
var mine = new MyArray();
mine.push(1, 2, 3);
assert(mine.length == 3,
    "All the items are in our sub-classed array.");
assert(mine instanceof Array,
    "Verify that we implement Array functionality.");
```
在IE上length和Array的关系及其紧密

解决办法：定义新的Length属性并copy其他Array方法，使用immediate function：
```javascript
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
```

### 实例化注意事项
new操作符在创建对象时必不可少，缺少有可能污染全局scope，恰巧变量与属性同名。
```javascript
function User(first, last){
    this.name = first + " " + last;
}
var name = "Rukia";
var user = User("Ichigo", "Kurosaki");
```

### function序列化
`/xyz/.test(function() { xyz; }`调用function的toString方法

### 检验function是通过构造函数调用还是普通调用
```javascript
function Test() {
    return this instanceof arguments.callee;
}
assert(!Test(), "We didn't instantiate, so it returns false.");
assert(new Test(), "We did instantiate, returning true.");
```

### 防御式编程
如果不是通过new实例化
```javascript
function User(first, last) {
    if (!(this instanceof arguments.callee)) {
        return new User(first,last);
    }
    this.name = first + " " + last;
}
assert(name == "Rukia",
    "Name was set to Rukia.");
```
仍存在3个问题：

1. callee在未来版本js中废弃，strict模式下禁用。
2. 好的编程实践？
3. 自以为了解用户

### P146实现类的继承
```javascript
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
```

## ch7正则表达式

* ? 0/1
* + >=1
* * >=0

[jsbin](jsbin.com)

[regexplanet](www.regexplanet.com/advanced/javascript/index.html)

三种flag: 

* i-忽略大小写
* g-默认local匹配第一次
* m-多行

创建方式：`/test/ig`或者 `new RegExp("test","ig")`
第二种的 好处是字符串可以运行时动态拼接

greedy `/a+/ aaa`匹配一次，全部
nongreedy `/a+?/ aaa`匹配第一个a

backreference: `/<(\w+)>(.+)<\/\1>/` 匹配xml格式

`var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");`这里需要额外的\，因为在字符串中，需要转义

### 得到透明度
```javascript
<div id="opacity"
    style="opacity:0.5;filter:alpha(opacity=50);">
</div>

function getOpacity(elem) {
    var filter = elem.style.filter;
    return filter ?
        filter.indexOf("opacity=") >= 0 ?
            (parseFloat(filter.match(/opacity=([^)]+/)[1]) / 100) + "" :
                "" :
                elem.style.opacity;
}
```
由于match会返回匹配数组，而0下标中是整个匹配字符串

`exec()`每次执行返回全局搜索的一个match
```javascript
var html = "<div class='test'><b>Hello</b> <i>world!</i></div>";
var tag = /<(\/?)(\w+)([^>]*?)>/g, match;
var num = 0;
while ((match = tag.exec(html)) !== null) {
    assert(match.length == 4,
        "Every match finds each tag and 3 captures.");
    num++;
}
assert(num == 6, "3 opening and 3 closing tags found.");
```

backreference和exec结合使用
```javascript
var html = "<b class='hello'>Hello</b> <i>world!</i>";
var pattern = /<(\w+)([^>]*)>(.*?)<\/\1>/g;   //非贪婪模式

var match = pattern.exec(html);
assert(match[0] == "<b class='hello'>Hello</b>",
    "The entire tag, start to finish.");
assert(match[1] == "b", "The tag name.");
assert(match[2] == " class='hello'", "The tag attributes.");
assert(match[3] == "Hello", "The contents of the tag.");

match = pattern.exec(html);
assert(match[0] == "<i>world!</i>",
    "The entire tag, start to finish.");
assert(match[1] == "i", "The tag name.");
assert(match[2] == "", "The tag attributes.");
assert(match[3] == "world!", "The contents of the tag.");
```

replace方法中使用$1表示匹配
```javascript
assert("fontFamily".replace(/([A-Z])/g, "-$1").toLowerCase() ==
    "font-family", "Convert the camelCase into dashed notation.");
```

### non-capturing group
`var pattern = /((ninja-)+)sword/;`

第一个括号表示sword前的全部字符串，第二个括号表示+之前的ninja-
第二个括号不加入group中：
```javascript
var pattern = /((?:ninja-)+)sword/;
var ninjas = "ninja-ninja-sword".match(pattern);
assert(ninjas.length == 2,"Only one capture was returned.");
assert(ninjas[1] == "ninja-ninja-",
    "Matched both words, without any extra capture.");
```

### replace()
replace函数的第二个参数可以是function，传入4类参数：

* The full text of the match
* The captures of the match, one parameter for each（多个）
* The index of the match within the original string
* The source string

```javascript
function upper(all,letter) { return letter.toUpperCase(); }
assert("border-bottom-width".replace(/-(\w)/g,upper)
    == "borderBottomWidth",
    "Camel cased a hyphenated string.");
```
无需使用while循环调用exec

### 压缩query字符串
```javascript
function compress(source) {
    var keys = {};
    source.replace(
        /([^=&]+)=([^&]*)/g,
        function(full, key, value) {
            keys[key] =
            (keys[key] ? keys[key] + "," : "") + value;
            return "";
        }
    );
    var result = [];
    for (var key in keys) {
        result.push(key + "=" + keys[key]);
    }
    return result.join("&");
}
assert(compress("foo=1&foo=2&blah=a&blah=b&foo=3") ==
    "foo=1,2,3&blah=a,b",
    "Compression is OK!");
```

### 使用正则表达式解决常见问题
#### trim string
```javascript
function trim(str) {
    return (str || "").replace(/^\s+|\s+$/g, "");
}
```
p170提供手动解决尾部空格，针对大文档提高效率

#### 匹配换行符
```javascript
var html = "<b>Hello</b>\n<i>world!</i>";

assert(/.*/.exec(html)[0] === "<b>Hello</b>",
    "A normal capture doesn't handle endlines.");无法匹配换行符

assert(/[\S\s]*/.exec(html)[0] ===
"<b>Hello</b>\n<i>world!</i>",
"Matching everything with a character set.");使用空格字符检测所有

assert(/(?:.|\s)*/.exec(html)[0] ===
"<b>Hello</b>\n<i>world!</i>",
"Using a non-capturing group to match everything.");\s包括换行符
```

### unicode
`var matchAll = /[\w\u0080-\uFFFF_-]+/;`

## ch8线程 和 定时器
timer不是js而是浏览器提供的特性。

### 处理计算成本高的任务
下面的任务耗时巨大，浏览器处理时，用户无法交互：
```javascript
var tbody = document.getElementsByTagName("tbody")[0];
for (var i = 0; i < 20000; i++) {
    var tr = document.createElement("tr");
    for (var t = 0; t < 6; t++) {
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(i + "," + t));
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
}
```

使用定时器分割任务：
```javascript
var rowCount = 20000;
var divideInto = 4;
var chunkSize = rowCount/divideInto;
var iteration = 0;
var table = document.getElementsByTagName("tbody")[0];
setTimeout(function generateRows(){
    var base = (chunkSize) * iteration;
    for (var i = 0; i < chunkSize; i++) {
        var tr = document.createElement("tr");
        for (var t = 0; t < 6; t++) {
            var td = document.createElement("td");
            td.appendChild(
                document.createTextNode((i + base) + "," + t +
                "," + iteration));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    iteration++;
    if (iteration < divideInto)
        setTimeout(generateRows,0);
},0);
```

### central timer control
问题：动画，多个定时器改变不同的属性
特点：

* 页面中同时只有一个运行的定时器
* 可以随时暂停和继续定时器
* 移除回调函数的过程

```javascript
var timers = {
    timerID: 0,
    timers: [],

    add: function(fn) {
        this.timers.push(fn);
    },

    start: function() {
        if (this.timerID) return;
        (function runNext() {
            if (timers.timers.length > 0) {
                for (var i = 0; i < timers.timers.length; i++) {
                    if (timers.timers[i]() === false) {
                        timers.timers.splice(i,1);
                        i--;
                    }
                }
                timers.timerID = setTimeout(runNext, 0);
            }
        })();
    },

    stop: function() {
        clearTimeout(this.timerID);
        this.timerID = 0;
    }
};

var box = document.getElementById("box"), x = 0, y = 20;
timers.add(function() {
    box.style.left = x + "px";
    if (++x > 50) return false;
});
timers.add(function() {
    box.style.top = y + "px";
    y += 2;
    if (y > 120) return false;
});
timers.start();
```
除了动画，中心定时器控制还能用于测试前端

### 异步测试

```javascript
(function() {
    var queue = [], paused = false;
    this.test = function(fn) {
        queue.push(fn);
        runTest();
    };
    this.pause = function() {
        paused = true;
    };
    this.resume = function() {
        paused = false;
        setTimeout(runTest, 1);
    };
    function runTest() {
        if (!paused && queue.length) {
            queue.shift()();
            if (!paused) resume();
        }
    }
})();
```

## ch9 运行时代码解析
运行时动态解释执行代码。

### eval()
参数是string，在被调用的scope中执行

返回最后一个表达式的结果`eval('3+4;5+6')`，结果是11

如果希望返回的不是原始类型，简单变量或者赋值，需要用大括号包裹。
`var o = eval('({ninja: 1})');`，如果没有，虽然还是创建了o，但是值是1。

### 通过Function的构造函数
不会创建闭包
```javascript
var add = new Function("a", "b", "return a + b;");
assert(add(3,4) === 7, "Function created and working!");
```

### 定时器
其实和new Function()差不多
`var tick = window.setTimeout('alert("Hi!")',100);`

### 想在全局作用域中动态解释string
赋值给`window.propName`

[Web Reflection](http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html)提供的另外一种办法，在head后添加script代码段，在全局作用域执行。
```javascript
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
```

应用场景是动态执行从服务端返回的代码，但问题是安全性。

### 安全地解析代码
google项目[Caja](http://code.google.com/p/google-caja/)，将js代码转换成更安全的形式
```javascript
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
```

### function的反编译
将function反编译成string，注意返回的字符串包含全部空格和换行符
```javascript
function test(a){ return a + a; }
assert(test.toString() ===
    "function test(a){ return a + a; }",
    "Function decompiled");
```

用途：Prototype中提取函数的参数
```javascript
function argumentNames(fn) {
    var found = /^[\s\(]*function[^(]*\(\s*([^)]*?)\s*\)/
        .exec(fn.toString());
    return found && found[1] ?
        found[1].split(/,\s*/) :
        [];
}
```

检测浏览器是否支持反编译
```javascript
var FUNCTION_DECOMPILATION = /abc(.|\n)*xyz/.test(function(abc){xyz;});
assert(FUNCTION_DECOMPILATION,
    "Function decompilation works in this browser");
```

### 将JSON字符串转化成js对象
很多浏览器支持JSON对象的parse()和stringify()方法
```javascript
var json = '{"name":"Ninja"}';
var object = eval("(" + json + ")");
assert(object.name === "Ninja",
    "My name is Ninja!");
```

[安全的实现](https://github.com/douglascrockford/JSON-js)
做了很多预处理工作

### 导入命名空间中的代码

```javascript
base2.namespace ==
    "var Base=base2.Base;var Package=base2.Package;"
eval(base2.namespace);
```

### 压缩和混淆
将代码中的变量重新命名，压缩成一个字符串，使用eval解析执行

[Dean Edwards’s Packer](http://dean.edwards.name/packer/)

但是小虽然能减少下载时间，但是解析时间不一定
load time = download time + evaluation time

### 动态代码重写
单元测试库[Screw.Unit](https://github.com/nkallen/screw-unit)

测试代码
```javascript
describe(“Matchers”, function() {
    it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
    });
});
```

使用Function构造函数，动态生成代码。通过with避免引入大量全局变量。
```javascript
var contents = fn.toString().match(/^[^{]*{((.*\n*)*)}/m)[1];
var fn = new Function("matchers", "specifications",
    "with (specifications) { with (matchers) { " + contents + " } }"
);
fn.call(this, Screw.Matchers, Screw.Specifications);
```

### 面向方面的script tag
面向方面编程：代码在运行时动态注入和执行，处理一些类似日志，缓存工作。

通过定义新的script type，浏览器会忽略
```javascript
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
```

jquery的tmp方法提供运行时的模板

### 元语言和DSL领域特定语言

[Processing.js](http://processing.org/)

john resig写了[js的版本](http://ejohn.org/blog/processingjs/)应用于HTML5 canvas

使用元语言的好处：

* 先进的语言特性：如class和继承
* 使用简单的画图api

示例代码
```javascript
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
```

转化成js，使用eval执行
```javascript
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
```

## ch10 with语句

### 在with scope中引用属性
性能差，this指向全局对象，可以给已有属性赋值，但是如果想要增加新属性，
必须通过`object.prop`才能创建，否则在全局对象中创建。

### 现实中使用with的例子

Prototype中提高代码可读性
```javascript
Object.extend(String.prototype.escapeHTML, {
    div: document.createElement('div'),
    text: document.createTextNode('')
});
with (String.prototype.escapeHTML) div.appendChild(text);
```

但是不一定要这样做，使用立即执行function也可以办到，虽然还是需要短小的前缀
```javascript
(function(s){
    s.div.appendChild(s.text);
})(String.prototype.escapeHTML);
```

### 导入命名空间中的代码
```javascript
with (YAHOO.util.Dom) {
    YAHOO.util.Event.on([get('item'), get('otheritem')], 'click',
        function(){ setStyle(this,'color','#c00'); });
}
```

### 测试
```javascript
new Test.Unit.Runner({
    testSliderBasics: function(){with(this){
        var slider = new Control.Slider('handle1', 'track1');
        assertInstanceOf(Control.Slider, slider);
        assertEqual('horizontal', slider.axis);
        assertEqual(false, slider.disabled);
        assertEqual(0, slider.value);
        slider.dispose();
    }},
    // ...
});
```

### 模板
```javascript
(function(){
    var cache = {};
    this.tmpl = function tmpl(str, data){
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                "with(obj){p.push('" +
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");
        return data ? fn( data ) : fn;
    };
})();
assert( tmpl("Hello, <%= name %>!", {name: "world"}) ==
    "Hello, world!", "Do simple variable inclusion." );
var hello = tmpl("Hello, <%= name %>!");
assert( hello({name: "world"}) == "Hello, world!",
    "Use a pre-compiled template." );
```

## ch11 跨浏览器策略

### 封装代码
不影响加载页面中的其他代码

### 避免属性冲突
使用hasOwnProperty判断，和in的区别是前者不会检查原型链

### 贪婪的id

没有取到form的action属性，而是input#action
```javascript
<form id="form" action="/conceal">
<input type="text" id="action"/>
<input type="submit" id="submit"/>
</form>

var what = document.getElementById('form').action;
```
原因是浏览器会将form中每个input元素作为属性(prop)增加到form中，属性名就是input的id。所以产生了冲突，form的本身属性被覆盖了。

可以查看node信息获得正确的action值
`var actionValue = element.getAttibuteNode("action").nodeValue;`

## ch12 attribute property css
attribute是dom构建的完整部分，property是元素保存运行时信息，提供访问的主要方式

奇怪的测试，给img.src赋值，但是结果却不一样。没有改变attribute，但是还是变了。
```javascript
<img src="../images/ninja-with-nunchuks.png">
<script type="text/javascript">
    var image = document.getElementsByTagName('img')[0];
    var newSrc = '../images/ninja-with-pole.png';
    image.src = newSrc;
    assert(image.src === newSrc,
        'the image source is now ' + image.src);//http://localhost/ninja/images/ninja-with-pole.png
    assert(image.getAttribute('src') === '../images/ninja-with-nunchuks.png',
        'the image src attribute is ' + image.getAttribute('src'));//../images/ninja-with-pole.png
</script>
```

### 浏览器命名不同
大多数浏览器可以通过getAttribute("class")取到class，但是IE使用className，保持和property一致。

### 命名限制
attr和prop不能做到一一对应，因为要考虑到保留字，比如label的for(attr)，就只能通过htmlFor(prop)。
另外，由多个词组合成的attr，对应的prop要使用驼峰命名方式，如maxLength,rowSpan。
这是因为通过prop访问`element.style.font-size;`连字符会被当做减号。

### xml和html间的区别
attr和prop的对应关系是HTML DOM的特性，在处理XML DOM时，prop不会自动创建代表attr。

判断XML
```javascript
function isXML(elem) {
    return elem.ownerDocument ||
        elem.documentElement.nodeName.toLowerCase() !== "html";
}
```

### 自定义attr
自定义attr，只能通过get/setAttribute
`var value = element.someValue ? element.someValue :element.getAttribute('someValue');`

### 性能考虑
通常prop访问比getAttribute速度快

### url标准化
浏览器特性：当访问指向url的prop时，如src,action,href，URL值会被标准化成完整的路径。attr不会。

### style attr
例子`<div style='color:red;'></div>`

`element.style.color`通过prop可以取得style对象的属性值，但如果我们想访问style中整个字符串，通过prop显然不行。
通过`getAttribute("style")`在大多数浏览器中可行。IE在style对象中增加cssText属性存储，所以可以通过`element.style.cssText`访问。

### type attr
IE9之前的版本不允许修改input的type attr，一旦它被插入文档中。P267

### style的位置
style属性优先级最高，比!important还高。
```javascript
<style>
    div { font-size: 1.8em; border: 0 solid gold; }
</style>
<div style="color:#000;" title="Ninja power!">
    忍者パワー
</div>
<script>
window.onload = function(){
    var div = document.getElementsByTagName("div")[0];
    assert(div.style.color == 'rgb(0, 0, 0)' ||
        div.style.color == '#000',
        'color was recorded');
    assert(div.style.fontSize == '1.8em',
        'fontSize was recorded');   // fail
    assert(div.style.boderWidth == '0',
        'borderWidth was recorded');   // fail
        div.style.borderWidth = "4px";
    assert(div.style.borderWidth == '4px',
        'borderWidth was replaced');
};
</script>
```

### 像素值

有些属性需要加上单位
```javascript
element.style.height = "10px";
element.style.height = 10 + "px";
```

### 度量height和width
两者的值根据内容变化，无法通过height和width属性得到精确值。

offsetHeight和offsetWidth属性包括padding。但是对于`display:none`的元素，值是0。

如果想度量一个隐藏元素非隐藏时的大小

1. display: block 使offsetHeight/Width可度量
2. visibility: hidden 不显示
3. position: absolute 虽然不显示，但会留下空洞，需要脱离正常的显示流
4. 抓取值
5. 恢复改变的属性

### 透明度
所有现代浏览器包括IE9，支持`opacity: 0.5`，
IE9之前，使用`filter: alpha(opacity=50)`

2大困难

* filter种类除了alpha还有很多，不能确定
* 即使不支持opacity，IE8或者更早的版本还是会返回style.opacity的值，尽管浏览器会忽略，导致无法判断浏览器是否支持。

还是有办法判断：
`opacity: .5`，支持的浏览器会规范化成0.5，而不支持的浏览器会简单返回.5
```javascript
var div = document.createElement("div");
div.setAttribute('style','opacity:.5');
var OPACITY_SUPPORTED = div.style.opacity === "0.5";
assert(OPACITY_SUPPORTED,
    "Opacity is supported.");
```

### 颜色
表达方式多种
[jQuery Color plugin](http://plugins.jquery.com/project/color)

### 获取计算后的样式

`window.getComputedStyle()`IE9+，接受element作为参数，返回一个接口。
返回的接口有方法`getPropertyValue()`来获取计算后的样式值。

与style.prop不同，getPropertyValue接受css属性值(非驼峰)作为参数。

IE9之前的版本，每个元素有currentStyle属性

```javascript
function fetchComputedStyle(element,property) {
    if (window.getComputedStyle) {
        var computedStyles = window.getComputedStyle(element);
        if (computedStyles) {
            property = property.replace(/([A-Z])/g,'-$1').toLowerCase();
            return computedStyles.getPropertyValue(property);
        }
    }
    else if (element.currentStyle) {
        property = property.replace(
            /-([a-z])/ig,
            function(all,letter){ return letter.toUpperCase(); });
        return element.currentStyle[property];
    }
}
```

## ch13 事件
DOM Level 0 Event Model 
```javascript
<body onload="doSomething()">
window.onload = doSomething;
```

DOM Level 2 Event Model

### 绑定事件处理器
add/removeEventListener 主流浏览器 IE9+

attach/detachEvent IE9-  IE MODEL

IE Model不提供监听事件捕获阶段，只有冒泡阶段。
在冒泡阶段，事件从目标向DOM根节点传播，在捕获阶段反向传播。

并且，IE MODEL不设置处理器上下文，导致处理器内部this指向全局对象。不传递事件信息到处理器，而是传到全局上下文window对象。

#### 解决设置上下文的问题
```javascript
if (document.addEventListener) {
    this.addEvent = function (elem, type, fn) {
        elem.addEventListener(type, fn, false);
        return fn;
    };
    this.removeEvent = function (elem, type, fn) {
        elem.removeEventListener(type, fn, false);
    };
}
else if (document.attachEvent) {
    this.addEvent = function (elem, type, fn) {
        var bound = function () {
            return fn.apply(elem, arguments);
        };
        elem.attachEvent("on" + type, bound);
        return bound;
    };
    this.removeEvent = function (elem, type, fn) {
        elem.detachEvent("on" + type, fn);
    };
}
```
p291

### 解决事件对象的问题
主要修复IE MODEL存在的问题
```javascript
function fixEvent(event) {
    function returnTrue() { return true; }
    function returnFalse() { return false; }
    if (!event || !event.stopPropagation) {
        var old = event || window.event;
        // Clone the old object so that we can modify the values
        event = {};
        for (var prop in old) {
            event[prop] = old[prop];
        }
        // The event occurred on this element
        if (!event.target) {
            event.target = event.srcElement || document;
        }
        // Handle which other element the event is related to
        event.relatedTarget = event.fromElement === event.target ?
            event.toElement :
            event.fromElement;
        // Stop the default browser action
        event.preventDefault = function () {
            event.returnValue = false;
            event.isDefaultPrevented = returnTrue;
        };
        event.isDefaultPrevented = returnFalse;
        // Stop the event from bubbling
        event.stopPropagation = function () {
            event.cancelBubble = true;
            event.isPropagationStopped = returnTrue;
        };
        event.isPropagationStopped = returnFalse;
        // Stop the event from bubbling and executing other handlers
        event.stopImmediatePropagation = function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        };
        event.isImmediatePropagationStopped = returnFalse;
        // Handle mouse position
        if (event.clientX != null) {
            var doc = document.documentElement, body = document.body;
            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0);
        }
        // Handle key presses
        event.which = event.charCode || event.keyCode;
        // Fix button for mouse clicks:
        // 0 == left; 1 == middle; 2 == right
        if (event.button != null) {
            event.button = (event.button & 1 ? 0 :
                (event.button & 4 ? 1 :
                (event.button & 2 ? 2 : 0)));
        }
    }
    return event;
}
```

### 处理器管理
一个元素绑定了多个事件处理器，难以管理

#### 存储相关信息
```javascript
<div title="Ninja Power!"> 忍者パワー!</div>
<div title="Secrets"> 秘密</div>
<script type="text/javascript">
    (function () {
        var cache = {},
            guidCounter = 1,
            expando = "data" + (new Date).getTime(); //保证对象之前没有同名属性
        this.getData = function (elem) {
            var guid = elem[expando];
            if (!guid) {
                guid = elem[expando] = guidCounter++;
                cache[guid] = {};
            }
            return cache[guid];
        };
        this.removeData = function (elem) {
            var guid = elem[expando];
            if (!guid) return;
            delete cache[guid];
            try {
                delete elem[expando];
            }
            catch (e) {
                if (elem.removeAttribute) {
                    elem.removeAttribute(expando);
                }
            }
        };
    })();
    var elems = document.getElementsByTagName('div');
    for (var n = 0; n < elems.length; n++) {
        getData(elems[n]).ninja = elems[n].title;
    }
    for (var n = 0; n < elems.length; n++) {
        assert(getData(elems[n]).ninja === elems[n].title,
            "Stored data is " + getData(elems[n]).ninja);
    }
    for (var n = 0; n < elems.length; n++) {
        removeData(elems[n]);
        assert(getData(elems[n]).ninja === undefined,
            "Stored data has been destroyed.")
    }
</script>
```

#### 管理事件处理器
绑定事件处理器
```javascript
(function(){
    var nextGuid = 1;
    this.addEvent = function (elem, type, fn) {
        var data = getData(elem); //取得存储对象，后面要多次引用
        if (!data.handlers) data.handlers = {};
        if (!data.handlers[type])
            data.handlers[type] = []; //存储参数事件的处理器数组
        if (!fn.guid) fn.guid = nextGuid++; //每个回调函数存储独特的guid
        data.handlers[type].push(fn); //添加回调函数
        if (!data.dispatcher) {
            data.disabled = false;
            data.dispatcher = function (event) { //创建分发器
                if (data.disabled) return;
                event = fixEvent(event); //使用修复过的event
                var handlers = data.handlers[event.type];
                if (handlers) {
                    for (var n = 0; n < handlers.length; n++) {
                        handlers[n].call(elem, event); //调用回调函数，并将事件对象传递到函数中，修复IE MODEL的问题
                    }
                }
            };
        }
        if (data.handlers[type].length == 1) { //第一次注册dispatcher
            if (document.addEventListener) {
                elem.addEventListener(type, data.dispatcher, false);
            }
            else if (document.attachEvent) {
                elem.attachEvent("on" + type, data.dispatcher);
            }
        }this.removeEvent = function (elem, type, fn) {
    };
})();
```

回收资源工具方法，需要多次调用
```javascript
function tidyUp(elem, type) {
    function isEmpty(object) { //内部使用
        for (var prop in object) {
            return false;
        }
        return true;
    }
    var data = getData(elem);
    if (data.handlers[type].length === 0) {// 某个事件的处理器数组空了，回收数组
        delete data.handlers[type]; 
        if (document.removeEventListener) {
            elem.removeEventListener(type, data.dispatcher, false);
        }
        else if (document.detachEvent) {
            elem.detachEvent("on" + type, data.dispatcher);
        }
    }
    if (isEmpty(data.handlers)) { //如果处理器对象空了，回收对象和分发器
        delete data.handlers;
        delete data.dispatcher;
    }
    if (isEmpty(data)) { //如果导致存储对象空了，回收整个对象
        removeData(elem);
    }
}
```

解除绑定，使用变长参数列表
```javascript
this.removeEvent = function (elem, type, fn) {// 可以通过检查elem的data-属性判断elem是否合理
    var data = getData(elem);
    if (!data.handlers) return;
    var removeType = function(t){ //移除事件类型参数的处理器数组
        data.handlers[t] = [];
        tidyUp(elem,t);
    };
    if (!type) { //如果没有传入特定的事件类型参数，清空所有事件处理器
        for (var t in data.handlers) removeType(t);
        return;
    }
    var handlers = data.handlers[type];
    if (!handlers) return;
    if (!fn) { //如果没有回调函数参数，清空该事件类型的所有处理器
        removeType(type);
        return;
    }
    if (fn.guid) { //在addEvent中添加的属性
        for (var n = 0; n < handlers.length; n++) {
            if (handlers[n].guid === fn.guid) {
                handlers.splice(n--, 1); //可能有多个同样的处理器，不能找到一个就终止，在数组中删除当前的元素，指针前移
            }
        }
    }
    tidyUp(elem, type);
};
```

### 触发事件
事件触发时：

* 目标元素绑定的处理器被触发
* 事件冒泡，触发其他绑定的处理器
* 目标元素如果有默认的action，触发，比如目标元素定义了focus方法，focus事件需要能触发它

第二个参数可以是event对象或者是表示事件类型的string
```javascript
function triggerEvent(elem, event) {
    var elemData = getData(elem),
        parent = elem.parentNode || elem.ownerDocument;
    if (typeof event === "string") {
        event = { type:event, target:elem };
    }
    event = fixEvent(event);
    if (elemData.dispatcher) {
        elemData.dispatcher.call(elem, event);
    }
    if (parent && !event.isPropagationStopped()) { //没有显式停止传播，递归调用向上冒泡
        triggerEvent(parent, event);
    }
    else if (!parent && !event.isDefaultPrevented()) { //已到达dom顶端，触发默认的action，比如目标元素有focus方法
        var targetData = getData(event.target);
        if (event.target[event.type]) {
            targetData.disabled = true;
            event.target[event.type]();
            targetData.disabled = false;
        }
    }
}
```

### 自定义事件
需要在不同场合下多次调用一段代码，使用全局函数？自定义事件，松耦合。

#### ajax例子
需要在ajax开始和结束时显示隐藏图片，绑定在body上，这样事件总会冒泡上来
```javascript
var body = document.getElementsByTagName('body')[0];
addEvent(body, 'ajax-start', function(e){
    document.getElementById('whirlyThing').style.display = 'inline-block';
});
addEvent(body, 'ajax-complete', function(e){
    document.getElementById('whirlyThing').style.display = 'none';
});
```
这其实是事件的委托。

### 冒泡和委托
委托：在目标节点更高级的dom节点上建立事件处理器

#### 委托事件给祖先节点

场景：点击每一个td使其变色

最初的想法：在每个td上绑定click事件处理器
```javascript
var cells = document.getElementsByTagName('td');
for (var n = 0; n < cells.length; n++) {
    addEvent(cells[n], 'click', function(){
        this.style.backgroundColor = 'yellow';
    });
}
```

能工作，但是在数百个元素上绑定同样的处理器，做同样的事。不够优雅。
event.target可以取得事件放生的元素，委托祖先节点处理。
```javascript
var table = document.getElementById('#someTable');
addEvent(table, 'click', function(event){
    if (event.target.tagName.toLowerCase() == 'td')
        event.target.style.backgroundColor = 'yellow';
});
```

#### 浏览器缺陷
submit,change,focus,blur在不同浏览器的冒泡实现中，存在严重问题。

事件冒泡检测代码，使用div是因为包含最多的冒泡事件种类
```javascript
function isEventSupported(eventName) {
    var element = document.createElement('div'),
    isSupported;
    eventName = 'on' + eventName;
    isSupported = (eventName in element);
    if (!isSupported) {
        element.setAttribute(eventName, 'return;');
        isSupported = typeof element[eventName] == 'function';
    }
    element = null;
    return isSupported;
}
```
##### submit事件冒泡
submit在IE MODEL中不能正确冒泡，有两种方式触发：

* type为submit的input/button元素，或者type为image的input元素。可以通过点击，也可以在取得焦点后通过回车或者空格键触发。
* 在type为text/password的input元素中按回车。

通过可以正常冒泡的click和keyress事件处理器触发submit事件。
```javascript
(function(){
    var isSubmitEventSupported = isEventSupported("submit");
    function isInForm(elem) { //判断元素是否在form元素内部
        var parent = elem.parentNode;
        while (parent) {
            if (parent.nodeName.toLowerCase() === "form") {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    function triggerSubmitOnClick(e) {
        var type = e.target.type;
        if ((type === "submit" || type === "image") &&
            isInForm(e.target)) {
            return triggerEvent(this,"submit");
        }
    }

    function triggerSubmitOnKey(e) {
        var type = e.target.type;
        if ((type === "text" || type === "password") &&
            isInForm(e.target) && e.keyCode === 13) {
            return triggerEvent(this,"submit");
        }
    }

    this.addSubmit = function (elem, fn) {
        addEvent(elem, "submit", fn);
        if (isSubmitEventSupported) return; //如果浏览器支持，短路
        if (elem.nodeName.toLowerCase() !== "form" && //如果是form不存在冒泡不正确的问题
                getData(elem).handlers.submit.length === 1) { //如果是第一个被绑定的处理器
            addEvent(elem, "click", triggerSubmitOnClick);
            addEvent(elem, "keypress", triggerSubmitOnKey);
        }
    };
    this.removeSubmit = function (elem, fn) {
        removeEvent(elem, "submit", fn);
        if (isEventSupported("submit")) return;
        var data = getData(elem);
        if (elem.nodeName.toLowerCase() !== "form" &&
                !data || !data.events || !data.events.submit) {
            removeEvent(elem, "click", triggerSubmitOnClick);
            removeEvent(elem, "keypress", triggerSubmitOnKey);
        }
    };
})();
```

##### change事件冒泡
需要绑定更多的事件

* The focusout event for checking the value after moving away from the form element
* The click and keydown events for checking the value the instant it’s been changed
* The beforeactivate event for getting the previous value before a new one is set

```javascript
(function(){
    this.addChange = function (elem, fn) {
        addEvent(elem, "change", fn);
        if (isEventSupported("change")) return;
        if (getData(elem).events.change.length === 1) {
            addEvent(elem, "focusout", triggerChangeIfValueChanged);
            addEvent(elem, "click", triggerChangeOnClick);
            addEvent(elem, "keydown", triggerChangeOnKeyDown);
            addEvent(elem, "beforeactivate", triggerChangeOnBefore);
        }
    };
    this.removeChange = function (elem, fn) {
        removeEvent(elem, "change", fn);
        if (isEventSupported("change")) return;
        var data = getData(elem);
        if (!data || !data.events || !data.events.submit) {
            addEvent(elem, "focusout", triggerChangeIfValueChanged);
            addEvent(elem, "click", triggerChangeOnClick);
            addEvent(elem, "keydown", triggerChangeOnKeyDown);
            addEvent(elem, "beforeactivate", triggerChangeOnBefore);
        }
    };
    function triggerChangeOnClick(e) {
        var type = e.target.type;
        if (type === "radio" || type === "checkbox" ||
                e.target.nodeName.toLowerCase() === "select") {
            return triggerChangeIfValueChanged.call(this, e);
        }
    }
    function triggerChangeOnKeyDown(e) {
        var type = e.target.type,
        key = e.keyCode;
        if (key === 13 && e.target.nodeName.toLowerCase() !== "textarea" ||
                key === 32 && (type === "checkbox" || type === "radio") ||
                type === "select-multiple") {
            return triggerChangeIfValueChanged.call(this, e);
        }
    }
    function triggerChangeOnBefore(e) { //保存改变前的值
        getData(e.target)._change_data = getVal(e.target);
    }
    function getVal(elem) {
        var type = elem.type,
        val = elem.value;
        if (type === "radio" || type === "checkbox") {
            val = elem.checked;
        } else if (type === "select-multiple") {
            val = "";
            if (elem.selectedIndex > -1) {
                for (var i = 0; i < elem.options.length; i++) {
                    val += "-" + elem.options[i].selected;
                }
            }
        } else if (elem.nodeName.toLowerCase() === "select") {
            val = elem.selectedIndex;
        }
        return val;
    }
    function triggerChangeIfValueChanged(e) {
        var elem = e.target, data, val;
        var formElems = /textarea|input|select/i;
        if (!formElems.test(elem.nodeName) || elem.readOnly) {
            return;
        }
        data = getData(elem)._change_data;
        val = getVal(elem);
        if (e.type !== "focusout" || elem.type !== "radio") {
            getData(elem)._change_data = val;
        }
        if (data === undefined || val === data) { //值没发生改变，不触发
            return;
        }
        if (data != null || val) {
            return triggerEvent(elem, "change");
        }
    }
})();
```

##### focusin 和 focusout
IE MODEL中在focus和blur之前会触发非标准的focusin和focusout事件，所以只要在addEvent中判断即可

```javascript
if (document.addEventListener) {
    elem.addEventListener(
        type === "focusin" ? "focus" :
        type === "focusout" ? "blur" : type,
        data.handler, type === "focusin" || type === "focusout");
}
else if (document.attachEvent) {
    elem.attachEvent("on" + type, data.handler);
}
```
##### mouseenter和mouseleave事件
IE MODEL自定义的两个事件

通常使用标准的mouseover和mouseout事件，问题是由于事件的冒泡机制，除了父元素，在子元素之间移动时也会触发事件。这在实际场景例如菜单等交互元素中，我们只想知道是否还在父元素内，而不是离开一个子元素到另一个时也触发事件。

并且，当鼠标从父元素移动到内部的子元素时，mouseout事件会触发，尽管直观上并没有离开父元素。同理，从子元素离开时，mouseover事件会被触发。

所以IE MODEL实现的这两个事件还是很有用的，需要在其他浏览器中模拟。
```javascript
(function() {
    if (isEventSupported("mouseenter")) { //IE MODEL
        this.hover = function (elem, fn) {
            addEvent(elem, "mouseenter", function () {
                fn.call(elem, "mouseenter");
            });
            addEvent(elem, "mouseleave", function () {
                fn.call(elem, "mouseleave");
            });
        };
    }
    else { //不支持mouseenter和mouseleave的浏览器
        this.hover = function (elem, fn) {
            addEvent(elem, "mouseover", function (e) {
                withinElement(this, e, "mouseenter", fn);
            });
            addEvent(elem, "mouseout", function (e) {
                withinElement(this, e, "mouseleave", fn);
            });
        };
    }
    function withinElement(elem, event, type, handle) {
        var parent = event.relatedTarget; //取得从哪进入或者离开去哪
        while (parent && parent != elem) {
            try {
                parent = parent.parentNode;
            }
            catch (e) {
                break;
            }
        }
        if (parent != elem) { //relatedTarget不在elem内部
            handle.call(elem, type);
        }
    }
})();
```

### document ready事件
DOMContentLoaded，当整个DOM文档加载完毕触发ready事件，但是在页面展示之前。对于IE9之前的版本：

* 把文档滚动到最左边的操作会失败，除非文档加载完毕。
* 监听document的onreadystatechange事件，会比第一种晚一点触发，但是仍会在window的load事件之前。
* 检查document的readyState属性，这被所有浏览器支持，用来记录加载DOM文档的完整程度。

```javascript
(function () {
    var isReady = false,
        contentLoadedHandler;
    function ready() {
        if (!isReady) {
            triggerEvent(document, "ready");
            isReady = true;
        }
    }

    if (document.readyState === "complete") {//如果此时已经加载完成，触发事件即可
        ready();
    }

    if (document.addEventListener) {//W3C 浏览器
        contentLoadedHandler = function () {
            document.removeEventListener(
                "DOMContentLoaded", contentLoadedHandler, false);
            ready();
        };
        document.addEventListener(
            "DOMContentLoaded", contentLoadedHandler, false);
    }
    else if (document.attachEvent) {//IE MODEL
        contentLoadedHandler = function () {
            if (document.readyState === "complete") {
                document.detachEvent(
                    "onreadystatechange", contentLoadedHandler);
                ready();
            }
        };
        document.attachEvent(
            "onreadystatechange", contentLoadedHandler);
        var toplevel = false;
        try {
            toplevel = window.frameElement == null;
        }
        catch (e) {
        }
        if (document.documentElement.doScroll && toplevel) { //不在iframe中
            doScrollCheck();
        }
    }

    function doScrollCheck() {
        if (isReady) return;
        try {
            document.documentElement.doScroll("left");
        }
        catch (error) {
            setTimeout(doScrollCheck, 1); //移动失败继续尝试
            return;
        }
        ready();
    }
})();
```

## ch14 操作DOM
很多lib实现考虑效率问题。比如插入html，使用[createContextualFragment](https://developer.mozilla.org/en/DOM/range.createContextualFragment)效率就比通常使用的createElement高。

一个DOM操作实现[metamorph.js](https://github.com/tomhuda/metamorph.js/blob/master/lib/metamorph.js)

### 注入HTML到DOM中
DOM操作API

1. 将合法的HTML/XML字符串转化成DOM结构
2. 将DOM结构注入到DOM的任意有效位置
3. 执行字符串中包含的行内脚本

#### HTML字符串 -> DOM
使用DOM元素的innerHTML属性

* 确保html字符串是合法的
* 用标记包装字符串
* 使用DOM元素的innerHTML属性插入HTML字符串
* 返回DOM节点

##### 预处理XML/HTML源字符串
比如要支持自闭合的标签比如`<table/>`，需要转换成`<table></table>`，便于所有浏览器支持。

列出只能以自闭合形式出现的标签
```javascript
var tags =
    /^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i;
function convert(html) {
    return html.replace(/(<(\w+)[^>]*?)\/>/g, function (all, front, tag) {
        return tags.test(tag) ?
            all :
            front + "></" + tag + ">";
    });
}
```

##### HTML包装
一些HTML元素必须被容器元素包裹。例如`<option>`必须在`<select>`中

有两种方法解决这个问题，都需要构建元素和容器的映射

##### 生成DOM

```javascript
function getNodes(htmlString, doc, fragment) {
    var map = {
        "<td":[3,"<table><tbody><tr>","</tr></tbody></table>"],
        "<th":[3,"<table><tbody><tr>","</tr></tbody></table>"],
        "<tr":[2,"<table><thead>","</thead></table>"],
        "<option":[1,"<select multiple='multiple'>","</select>"],
        "<optgroup":[1,"<select multiple='multiple'>","</select>"],
        "<legend":[1,"<fieldset>","</fieldset>"],
        "<thead":[1,"<table>","</table>"],
        "<tbody":[1,"<table>","</table>"],
        "<tfoot":[1,"<table>","</table>"],
        "<colgroup":[1,"<table>","</table>"],
        "<caption":[1,"<table>","</table>"],
        "<col":[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],
        "<link":[3,"<div></div><div>","</div>"]
    };
    var tagName = htmlString.match(/<\w+/),
        mapEntry = tagName ? map[tagName[0]] : null;
    if (!mapEntry) mapEntry = [0, " ". " " ];
    var div = (doc || document).createElement("div"); //默认document
    div.innerHTML = mapEntry[1] + htmlString + mapEntry[2];//使用容器元素进行包裹
    while (mapEntry[0]--) div = div.lastChild; //按照层数取得最内层的节点，就是想要创建的节点

    if(fragment){//DOM fragment供元素注入
        while(div.firstChild){
            fragment.appendChild(div.firstChild);
        }
    }
    return div.childNodes;
}
assert(getNodes("<td>test</td><td>test2</td>").length === 2,
    "Get two nodes back from the method.");
assert(getNodes("<td>test</td>")[0].nodeName === "TD",
    "Verify that we're getting the right node.");
```

IE中还存在bug，在空的table中会创建`<tbody>`元素。修复方法可以检查table是否为空，如果是空的，就移除所有子节点。

另外，IE会对传入innerHTML属性的字符串进行trim，但是html会忽略空格。修复方法可以检查生成的第一个节点是否是文本节点。

##### 插入document

使用W3C DOM标准的DOM fragment，被所有浏览器支持。

如果要将元素插入多个地方，需要复制fragment，这比复制每个节点效率高。因为多次调用append之类的方法，每次都要刷新页面，而将节点都加入一个fragment，再将fragment一次性添加到document中，只要刷新一次页面。

另外，如果想要将tr直接加入table元素，一般都认为是加入tbody元素中。

以下代码来自jquery中的应用
```javascript
function root(elem, cur) {
    return elem.nodeName.toLowerCase() === "table" &&
        cur.nodeName.toLowerCase() === "tr" ?
        (elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild(elem.ownerDocument.createElement("tbody"))) ://创建tbody并返回新添加的节点
        elem;
}

window.onload = function () {
    function insert(elems, args, callback) {
        if (elems.length) {
            var doc = elems[0].ownerDocument || elems[0],
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(args, doc, fragment),
                first = fragment.firstChild;
            if (first) {
                for (var i = 0; elems[i]; i++) {
                    callback.call(root(elems[i], first),                        i > 0 ? fragment.cloneNode(true) : fragment);//除了第一次都要进行复制
                }
            }
        }
    }
    var divs = document.getElementsByTagName("div");
    insert(divs, ["<b>Name:</b>"], function (fragment) {//传入字符串？
        this.appendChild(fragment);
    });
    insert(divs, ["<span>First</span> <span>Last</span>"],
        function (fragment) {
        this.parentNode.insertBefore(fragment, this);
    });
};
```

##### 执行脚本

在插入到document之前，将内联脚本提取出来。ret数组保存所有生成的DOM节点。scripts数组保存所有提取出来的脚本节点。在插入操作完成后，解释执行这些脚本。
```javascript
for (var i = 0; ret[i]; i++) {//ret的大小可能会改变，所以判断条件是ret[i]非空
    if (jQuery.nodeName(ret[i], "script") &&
        (!ret[i].type ||
            ret[i].type.toLowerCase() === "text/javascript")) {//没有显式的type或者type是text/javascript
        scripts.push(ret[i].parentNode ?
            ret[i].parentNode.removeChild(ret[i]) :
            ret[i]);
    } else if (ret[i].nodeType === 1) {//检查子树中是否包含脚本节点
        ret.splice.apply(ret, [i + 1, 0].concat(//添加进ret数组中的当前下一个位置
            jQuery.makeArray(ret[i].getElementsByTagName("script"))));
    }
}
```

解析出的脚本应该在全局上下文中执行。ch9中介绍过，通过在head中创建script元素并移除。
```javascript
function globalEval(data) {
    data = data.replace(/^\s+|\s+$/g, "");//移除首尾空白符
    if (data) {
        var head = document.getElementsByTagName("head")[0] ||
                document.documentElement,
            script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        head.insertBefore(script, head.firstChild);
        head.removeChild(script);
    }
}
```

加上对非本地脚本的处理
```javascript
function evalScript(elem) {
    if (elem.src)
        jQuery.ajax({
            url:elem.src,
            async:false,
            dataType:"script"
        });
    else
        jQuery.globalEval(elem.text || "");
    if (elem.parentNode)
        elem.parentNode.removeChild(elem);
}
```

### 克隆元素

cloneNode方法，参数表示是否拷贝所有子节点。

首先检测cloneNode是否会拷贝事件处理器包括扩展属性，IE中的问题
```javascript
var div = document.createElement("div");
if (div.attachEvent && div.fireEvent) {
    div.attachEvent("onclick", function () {
        jquery.support.noCloneEvent = false;//标志
        div.detachEvent("onclick", arguments.callee);
    });
    div.cloneNode(true).fireEvent("onclick");
}
```

其次，解决第一个问题的方法首先想到去移除clone元素上的事件处理器，扩展属性。但是在IE中，如果这么做，原节点的也会被移除。

最终的解决方案：克隆元素到另一个元素，读取innerHTML，再转换成DOM节点。在IE中还是有bug，innerHTML并不一定反映元素属性的正确状态。比如input元素的name属性动态改变了，innerHTML不会显示这一点。

```javascript
function clone() {
    var ret = this.map(function () {
        if (!jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this)) {
            var clone = this.cloneNode(true),
            container = document.createElement("div");
            container.appendChild(clone);
            return jQuery.clean([container.innerHTML])[0];
        }
        else
            return this.cloneNode(true);
    });
    var clone = ret.find("*").andSelf().each(function () {
        if (this[ expando ] !== undefined)
            this[ expando ] = null;
    });
    return ret;
}
```

### 删除元素
在简单地调用removeChild之前，还要做清理工作。

首先，所有绑定的事件处理器要清理。其次，元素关联的外部数据要清理。
在ch13中，没有将数据直接依附在元素上，而是使用额外的数据结构存储。这样清理起来就很方便。

另外，子元素也要这样做。

```javascript
function remove() {
    jQuery("*", this).add([this]).each(function () {//遍历子元素
        jQuery.event.remove(this);
        jQuery.removeData(this);
    });
    if (this.parentNode)
        this.parentNode.removeChild(this);
    if (typeof this.outerHTML !== "undefined")//针对IE
        this.outerHTML = "";
}
```

IE中，每一个单独的从页面移除的元素不会被马上回收内存资源，直到离开页面。这样长时间运行的页面就会占用大量内存。

解决方法是，在IE中有一个独有的属性outerHTML，代表元素的HTML字符串。既是getter又是setter，通过设置字符串为空比调用removeChild清除的更彻底，不是全部但也有大部分了。

### 文本内容

textContent属性，
IE中innerText属性

下面的例子说明设置这两个属性后，会清除原来的元素结构，只剩下一个文本节点。
```javascript
<div id="test"><b>Hello</b>, I'm a ninja!</div>
<script type="text/javascript">
window.onload = function () {
    var b = document.getElementById("test");
    var text = b.textContent || b.innerText;
    assert(text === "Hello, I’m a ninja!",
        "Examine the text contents of an element.");
    assert(b.childNodes.length === 2,
        "An element and a text node exist.");
    if (typeof b.textContent !== "undefined") {
        b.textContent = "Some new text";
    }
    else {
        b.innerText = "Some new text";
    }
    text = b.textContent || b.innerText;
    assert(text === "Some new text", "Set a new text value.");
    assert(b.childNodes.length === 1,
        "Only one text node exists now.");
};
</script>
```

#### 设置文本

插入文本和插入html不同在于文本需要进行转义，`<`转义成`&lt`。使用内置的createTextNode方法。

#### 获取文本
想取得精确的文本值，不能通过textContent或者innerText。原因是换行符会被去掉。

只能手动得到每个文本节点的nodeValue
```javascript
function getText(elem) {
    var text = "";
    for (var i = 0; i < elem.childNodes.length; i++) {
        var cur = elem.childNodes[i];
        if (cur.nodeType === 3) //文本节点
            text += cur.nodeValue;
        else if (cur.nodeType === 1) //元素节点，递归调用
            text += getText(cur);
    }
    return text;
}
```

## ch15 css选择器引擎
W3C Selectors API提供了querySelectorAll和querySelector方法。

但是类库提供的选择器比标准考虑了更多因素。比如使用缓存提高效率，扩展性更好，更好的错误报告。

实现CSS选择器引擎有三种方法：

* 使用API
* 使用XPath，一种DOM查询语言
* 纯DOM

### API
querySelectorAll返回节点列表，querySelector返回第一个匹配的节点

问题出现在以元素为基准的查询上，test元素内部没有`div > b`，但是选择器只检查最后的部分，这是违反直觉的。
```javascript
<div id="test">
<b>Hello</b>, I'm a ninja!
</div>
<script type="text/javascript">
window.onload = function () {
    var b = document.getElementById("test").querySelector("div b");
    assert(b, "Only the last part of the selector matters.");
};
</script>
```

解决方法是临时分配一个id给根元素。查完后再恢复。
之所以使用try/catch块是因为API可能抛出异常。
```javascript
(function() {
    var count = 1;
    this.rootedQuerySelectorAll = function (elem, query) {
        var oldID = elem.id;
        elem.id = "rooted" + (count++);
        try {
            return elem.querySelectorAll("#" + elem.id + " " + query);
        }
        catch (e) {
            throw e;
        }
        finally {
            elem.id = oldID;
        }
    };
})();
```

### 使用XPath查找

复杂表达式的表现XPath更好。

Prototype类库中
```
if (typeof document.evaluate === "function") {
    function getElementsByXPath(expression, parentElement) {
        var results = [];
        var query = document.evaluate(expression,
            parentElement || document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(query.snapshotItem(i));
        return results;
    }
}
```

### 纯DOM实现
getElementById/TagName，HTML5中增加ClassName

* IE89支持API，但是67不支持XPath和API
* 向后兼容性
* 有些查询例如ID，纯DOM实现更快
* CSS3选择器浏览器支持各不相同

两种可能的选择器实现：自顶向下，自底向上

考虑的因素：结果按照文档中定义的顺序。不能返回重复的元素。

自顶向下：类似这样的选择`div.ninja a span`

一个简单的实现：按tag查找，问题是有可能返回重复的元素。
```javascript
function find(selector, root){
    root = root || document;
    var parts = selector.split(" "),
        query = parts[0],
        rest = parts.slice(1).join(" "),
        elems = root.getElementsByTagName(query),
        results = [];
    for (var i = 0; i < elems.length; i++) {
        if (rest) {
            results = results.concat(find(rest, elems[i]));//递归查找
        }
        else {
            results.push(elems[i]);
        }
    }
    return results;
};
```

#### 解析选择符
上面的简单例子按照空格分割tag，但是很多选择中包含额外的空格，例如按照属性或者值查询。

注意非捕获组中的三种情况()，[]和非空格，逗号，大小括号。第三种情况将空格剔除。
```javascript
var selector = "div.class > span:not(:first-child) a[href]";
var chunker = /((?:\([^\)]+\)|\[[^\]]+\]|[^ ,\(\[]+)+)(\s*,\s*)?/g;
var parts = [];
chunker.lastIndex = 0;//下一次匹配的开始位置
while ((m = chunker.exec(selector)) !== null) {
    parts.push(m[1]);
    if (m[2]) {//如果有逗号，停止匹配
        extra = RegExp.rightContext;//最后一个匹配后面的字符串
        break;
    }
}
assert(parts.length == 4, "Our selector is broken into 4 unique parts.");
assert(parts[0] === "div.class", "div selector");
assert(parts[1] === ">", "child selector");
assert(parts[2] === "span:not(:first-child)", "span selector");
assert(parts[3] === "a[href]", "a selector");
```

#### 查找元素

getElementById用于ID选择器，IE和Opera会查出name值相同的元素。

getElementsByTagName还有另一个作用，tag为*能够查出文档/元素内部的所有元素。在属性选择器并没有提供tag的情况下，例如`.class`或者`[attr]`

getElementsByName适用于`[name=name]`

getElementsByClassName是HTML5的新方法，加速查询。

#### 过滤结果集

属性过滤：getAttribute()，类过滤也是其中一种，访问className属性。

位置过滤：`:nth-child(even)`或者`:last-child,`，使用children和childNodes这两个方法

#### 递归和合并

之前简单例子中，结果集没有去重。采用遍历元素分配临时的标志，来判断是否之前遇到过。

```javascript
(function(){
    var run = 0;
    this.unique = function(array) {
        var ret = [];
        run++;
        for (var i = 0, length = array.length; i < length; i++) {
            var elem = array[i];
            if (elem.uniqueID !== run) {
                elem.uniqueID = run;
                ret.push(array[i]);
            }
        }
        return ret;
    };
})();
```
### 自底向上的实现

先找到所有符合最后一个表达式的子节点，再向上找父节点。成本高。
优点是不会出现重复。

简单的例子
```javascript
function find(selector, root){
    root = root || document;
    var parts = selector.split(" "),
        query = parts[parts.length - 1],
        rest = parts.slice(0,-1).join(""),
        elems = root.getElementsByTagName(query),
        results = [];
    for (var i = 0; i < elems.length; i++) {
        if (rest) {
            var parent = elems[i].parentNode;
            while (parent && parent.nodeName != rest) {
                parent = parent.parentNode;
            }
            if (parent) {
                results.push(elems[i]);
            }
        } else {
            results.push(elems[i]);
        }
    }
    return results;
};
```