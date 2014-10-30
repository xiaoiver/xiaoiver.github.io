---
layout: post
title:  "《Effective Javascript》读书笔记"
date:   2014-10-30 19:48:40
categories: javascript
---

## ch1

### 了解js的版本

1999被ES3被广泛支持，2009年的ES5。

很多非标准特性被一些js引擎支持，比如const。并且各个实现不完全相同，
有的const声明的变量不允许修改，有的就被当成var，允许修改。

ES5中引入strict mode。通过在程序的最前面加上`"use strict";`，
保证了向后兼容性，老版本的js引擎当作无关紧要的语句，不影响执行。

重复定义arguments变量在严格模式下是不允许的。

不要简单的拼接在严格模式下执行的文件和非严格文件。因为声明必须在前面，拼接不保证顺序。

如果要拼接，使用立即执行的函数表达式(IIFE)
{% highlight javascript %}
    // no strict-mode directive
    (function() {
        // file1.js
        "use strict";
        function f() {
            // ...
        }
    })();
    (function() {
        // file2.js
        // no strict-mode directive
        function f() {
            var arguments = [];
            // ...
        }
    })();
{% endhighlight %}

### 理解js中的浮点数

js中的number是双精度浮点数

js中的Integer只是double的子集

浮点数的运算不一定精确，最好转化成整数的运算
{% highlight javascript %}
    0.1 + 0.2; // 0.30000000000000004
    (0.1 + 0.2) + 0.3; // 0.6000000000000001
    0.1 + (0.2 + 0.3); // 0.6
{% endhighlight %}

toString的参数表示进制
{% highlight javascript %}
    (8).toString(2); // "1000"
    parseInt("1001", 2); // 9
{% endhighlight %}

### 隐式转换

js中对类型错误十分宽容`3 + true; //4`

但是也有很多类型错误会立即报错
{% highlight javascript %}
    "hello"(1); // error: not a function
    null.x; // error: cannot read property 'x' of null
{% endhighlight %}

很多运算符`- * / %`都会在计算前尝试将参数转换成number，`+`还有字符串拼接功能

如果是字符串和数字的拼接，将数字转换成字符串`"2" + 3; // "23"`

这种隐式转换虽然很方便，比如用户的输入，读取文件，但是也会隐藏错误。
比如null会转成0，undefined会转成NaN，很难检测。
{% highlight javascript %}
    var x = NaN;
    x === NaN; // false
{% endhighlight %}

但是NaN又是js里唯一自己不等于自己的。
{% highlight javascript %}
    function isReallyNaN(x) {
        return x !== x;
    }
{% endhighlight %}

Object可以通过定义toString和valueOf转换成String/number

7个"falsy"值：false, 0, -0, "", NaN, null, undefined。

可以看出数字和字符串都是有可能转成false的，通过这种办法判断参数是否定义是不对的

例子：默认值，传入0时出错
{% highlight javascript %}
    function point(x, y) {
        if (!x) {
            x = 320;
        }
        if (!y) {
            y = 240;
        }
        return { x: x, y: y };
    }
{% endhighlight %}

正确的做法是：通过typeof判断，或者直接`if (x === undefined)`
{% highlight javascript %}
    function point(x, y) {
        if(typeof x === "undefined"){
            x = 320;
        }
    }
{% endhighlight %}

Underscore.js中的实现：通过void 0返回undefined。
void和typeof一样，可以当做函数也可以当做运算符(不加大括号)。
{% highlight javascript %}
    // Is a given variable undefined?
      _.isUndefined = function(obj) {
        return obj === void 0;
      };
{% endhighlight %}

### 优先使用原始类型而非Object   wrapper

5种原始类型：boolean number string null undefined

很奇怪：`typeof null === "object"`

另外标准库提供boolean,number,string的object wrapper
`var s = new String("hello");`

每个String对象都是独立的，非严格比较"=="结果也是一样
{% highlight javascript %}
    var s1 = new String("hello");
    var s2 = new String("hello");
    s1 === s2; // false
{% endhighlight %}

隐式wrapper：`"hello".toUpperCase(); // "HELLO"`

但是这样就可以给原始类型添加属性了，虽然无法访问
{% highlight javascript %}
    "hello".someProperty = 17;
    "hello".someProperty; // undefined
{% endhighlight %}

### 避免使用==比较不同类型的变量

左右在比较前会被隐式转换成number，都是1
`"1.0e0" == { valueOf: function() { return true; } };`

下面的代码通过增加+告诉读代码的人两边比较的都是数字，并且用严格等于代替==
{% highlight javascript %}
    var today = new Date();
    if (+form.month.value === (today.getMonth() + 1) &&
        +form.day.value === today.getDate()) {
    }
{% endhighlight %}

不同类型==的转换规则

* null == undefined   true
* null/undefined == 除了这两个的其他值  false
* 原始类型string/boolean/number == Date对象 原始类型转成数字，Date对象先尝试toString，再尝试valueOf
* 原始类型string/boolean/number == 非Date对象 原始类型转成数字，Date对象先尝试valueOf，再尝试toString
* 原始类型string/boolean/number 转换成number

### 省略;的局限

js中语句终止符;可以省略，有很多规则不会自动插入;

## ch2 变量作用域

### 少用全局对象

增加修改全局变量会自动更新全局对象（绑定到window变量上），反过来也是一样
{% highlight javascript %}
    this.foo; // undefined
    foo = "global foo";
    this.foo; // "global foo"
{% endhighlight %}

利用这点可以探测平台支持哪些特性。
{% highlight javascript %}
    if (!this.JSON) {
        this.JSON = {
            parse: ...,
            stringify: ...
        };
    }
{% endhighlight %}

### 多声明局部变量

给未声明的变量赋值并不会报错，而是创建了一个同名的全局变量。

### 避免使用with

使用with的动机是好的，多次调用对象方法时避免重复引用同一个对象
{% highlight javascript %}
    function status(info) {
        var widget = new Widget();
        with (widget) {
            setBackground("blue");
            setForeground("white");
            setText("Status: " + info); // ambiguous reference
            show();
        }
    }
{% endhighlight %}

类似import的作用
{% highlight javascript %}
    function f(x, y) {
        with (Math) {
            return min(round(x), sqrt(y)); // ambiguous references
        }
    }
{% endhighlight %}

js从最内层scope向外查找变量。在with块内，从指定变量的属性开始查找，如果没找到继续向外搜索。

### 变量提升

js没有块作用域，只有函数作用域。变量的声明可以看做声明和赋值两部分。js将声明部分提升到函数作用域的前面，赋值留在原位。

### 使用IIFE创建局部作用域

错误的代码
{% highlight javascript %}
    function wrapElements(a) {
        var result = [], i, n;
        for (i = 0, n = a.length; i < n; i++) {
            result[i] = function() { return a[i]; };
        }
        return result;
    }
    var wrapped = wrapElements([10, 20, 30, 40, 50]);
    var f = wrapped[0];
    f(); // ?
{% endhighlight %}
闭包保存的是变量的引用而不是值，i会是最终值也就是5，返回undefined

使用IIFE创建局部作用域
{% highlight javascript %}
    function wrapElements(a) {
        var result = [];
        for (var i = 0, n = a.length; i < n; i++) {
            (function() {
                var j = i;
                result[i] = function() { return a[j]; };
            })();
        }
        return result;
    }
{% endhighlight %}

### 命名函数表达式

{% highlight javascript %}
    var f = function find(tree, key) {
        if (!tree) {
            return null;
        }
        if (tree.key === key) {
            return tree.value;
        }
        return find(tree.left, key) ||
                find(tree.right, key);
    };
{% endhighlight %}

函数名在函数内部作用域可见。但是用于递归时，使用外部作用域的名字甚至是直接声明就可以了。

真正的作用是debug，stacktrace中的条目会显示函数名。

### 局部块作用域函数声明

避免将函数声明放在局部作用域内。

### 间接eval比直接eval好

eval不同于一般的函数，一般的函数拥有定义处的作用域的访问权限。但是eval拥有被调用地点的全部作用域。

这导致编译器优化时遇到问题，函数调用需要使作用域在运行时可见。

作为妥协，语言标准区分eval，直接调用和间接调用两种。

直接调用拥有调用者的作用域
{% highlight javascript %}
    var x = "global";
    function test() {
        var x = "local";
        return eval("x"); // direct eval
    }
    test(); // "local"
{% endhighlight %}

间接调用拥有全局作用域
{% highlight javascript %}
    var x = "global";
    function test() {
        var x = "local";
        var f = eval;
        return f("x"); // indirect eval
    }
    test(); // "global"
{% endhighlight %}

间接调用的推荐写法`(0,eval)(src);`，0被解析但是值被忽略。

## ch3 functions

### function method和构造函数

function 最简单的函数调用
{% highlight javascript %}
    function hello(username) {
        return "hello, " + username;
    }
    hello("Keyser Söze"); // "hello, Keyser Söze"
{% endhighlight %}

method 对象的属性刚好是一个函数

new User 构造函数

### higher-order function出现恶劣

就是以函数为参数的函数，一般是回调函数

### 不要修改arguments对象

arguments并不是Array类型，不能直接调用类似shift的方法。可以通过call/apply移除arguments中的前两个参数，将剩余的参数传入返回的方法。
看起来可行，但是有错误。
{% highlight javascript %}
    function callMethod(obj, method) {
        var shift = [].shift;
        shift.call(arguments);
        shift.call(arguments);
        return obj[method].apply(obj, arguments);
    }
    var obj = {
        add: function(x, y) { return x + y; }
    };
    callMethod(obj, "add", 17, 25);
    // error: cannot read property "apply" of undefined
{% endhighlight %}

原因是arguments对象不是函数参数列表的拷贝。参数列表中obj始终对应arguments[0]，而method始终对应arguments[1]。使用shift移除了前两个元素后，obj就成了17，而method成了25。js将17自动提升为一个Number对象，试图访问它名为"25"的属性，结果当然是undefined，而试图在undefined上访问apply最终导致了错误。

在ES5的严格模式下，arguments和函数参数不是别名的关系。
{% highlight javascript %}
    function strict(x) {
        "use strict";
        arguments[0] = "modified";
        return x === arguments[0];
    }
    function nonstrict(x) {
        arguments[0] = "modified";
        return x === arguments[0];
    }
    strict("unmodified"); // false
    nonstrict("unmodified"); // true
{% endhighlight %}

可见对arguments的修改会导致函数参数列表对应错乱。将arguments拷贝到一个真正的数组中是好的解决方案。`var args = [].slice.call(arguments);`

slice方法不传入参数就是对数组的拷贝。之前的程序可以修改为：
{% highlight javascript %}
    function callMethod(obj, method) {
        var args = [].slice.call(arguments, 2);
        return obj[method].apply(obj, args);
    }
{% endhighlight %}

### 使用变量保存对arguments的引用

迭代器的实现，对集合类数据提供顺序访问。下面代码的问题在于每个函数都有自己的arguments对象，next函数中返回的并不是values的arguments对象。需要使用变量存储，在next中引用。
{% highlight javascript %}
    function values() {
        var i = 0, n = arguments.length;
        return {
            hasNext: function() {
                return i < n;
            },
            next: function() {
                if (i >= n) {
                    throw new Error("end of iteration");
                }
                return arguments[i++]; // wrong arguments
            }
        };
    }
{% endhighlight %}

### 使用bind指定上下文

在ES5的forEach实现中，使用全局对象作为回调函数的上下文，全局对象没有entries属性，自然出错。forEach的第二个参数就是回调函数的上下文，可以传入buffer。
{% highlight javascript %}
    var buffer = {
        entries: [],
        add: function(s) {
            this.entries.push(s);
        },
        concat: function() {
            return this.entries.join("");
        }
    };
    var source = ["867", "-", "5309"];
    source.forEach(buffer.add); // error: entries is undefined
{% endhighlight %}

但并不是所有函数都提供附加参数来指定回调函数的上下文。一个好的方法是创建一个匿名函数确保通过对象的method方式调用。因为this的指向依据调用方式，应用隐式绑定规则。这样无论这个匿名函数是通过什么形式被调用，this都指向buffer对象。
{% highlight javascript %}
    var source = ["867", "-", "5309"];
    source.forEach(function(s) {
        buffer.add(s);
    });
    buffer.join(); // "867-5309"
{% endhighlight %}

ES5中bind接受上下文作为参数，返回一个wrapper函数。
`source.forEach(buffer.add.bind(buffer));`

### 使用bind传递部分参数（curry）

bind不仅仅能指定上下文。考虑拼接URL的场景：
{% highlight javascript %}
    function simpleURL(protocol, domain, path) {
        return protocol + "://" + domain + "/" + path;
    }
    var urls = paths.map(function(path) {
        return simpleURL("http", siteDomain, path);
    });
{% endhighlight %}

在map的每次迭代中，由于protocol和domain是固定的，只有第三个参数path是变化的。
通过bind返回一个新的函数委托给simpleURL，由于simpleURL中没有this，不用考虑上下文。第一个参数可以传入null或者undefined，后面的参数会和传入的参数也就是path作拼接，一起委托给simpleURL("http", siteDomain, path)进行处理。
{% highlight javascript %}
    var urls = paths.map(simpleURL.bind(null, "http", siteDomain));
{% endhighlight %}

### 使用闭包而非字符串封装代码

eval的问题就是直接调用会在全局作用域解析。当全局作用域没有start和end变量时，调用benchmark抛出ReferenceError异常。
{% highlight javascript %}
    function repeat(n, action) {
        for (var i = 0; i < n; i++) {
            eval(action);
        }
    }
    function benchmark() {
        var start = [], end = [], timings = [];
        repeat(1000,
            "start.push(Date.now()); f(); end.push(Date.now())");
        for (var i = 0, n = start.length; i < n; i++) {
            timings[i] = end[i] - start[i];
        }
        return timings;
    }
{% endhighlight %}

应当接受函数作为参数而非字符串。
{% highlight javascript %}
    function repeat(n, action) {
        for (var i = 0; i < n; i++) {
            action();
        }
    }
{% endhighlight %}

### 避免依赖函数的toString方法

js有这样的特性，调用function的toString可以得到源代码。
{% highlight javascript %}
    (function(x) {
        return x + 1;
    }).toString(); // "function (x) {\n return x + 1;\n}"
{% endhighlight %}

由于ECMAScript没有标准，不同的js引擎生成不同的字符串。
当函数是用js写的时候，引擎会尝试返回最贴近源代码的字符串。但是有些函数是内置的类库提供的。比如bind，在很多宿主环境中由c实现的，编译好的函数是没有js源代码的。
另外，不同js的实现会有细微的差别，比如空白的格式。
{% highlight javascript %}
    (function(x) {
        return x + 1;
    }).bind(16).toString(); // "function (x) {\n [native code]\n}"
{% endhighlight %}

最后，字符串中无法提供闭包关联的变量信息。比如内层函数的闭包包含了函数x，绑定了42，无法在字符串中体现。
{% highlight javascript %}
    (function(x) {
        return function(y) {
            return x + y;
        }
    })(42).toString(); // "function (y) {\n return x + y;\n}"
{% endhighlight %}

### 避免使用非标准的调用栈属性

在一些老版本的js环境中，arguments对象有两个属性：caller和callee。

callee能够引用调用arguments的函数
{% highlight javascript %}
    var factorial = (function(n) {
        return (n <= 1) ? 1 : (n * arguments.callee(n - 1));
    });
{% endhighlight %}

但这并不是很有用，因为直接用函数名就能递归调用自身：
{% highlight javascript %}
    function factorial(n) {
        return (n <= 1) ? 1 : (n * factorial(n - 1));
    }
{% endhighlight %}

caller由于安全性，在大多数环境中被移除了。但是大多数环境提供了功能类似的属性caller，指向函数最近的调用者。
{% highlight javascript %}
    function revealCaller() {
        return revealCaller.caller;
    }
    function start() {
        return revealCaller();
    }
    start() === start; // true
{% endhighlight %}

利用caller实现stack trace
{% highlight javascript %}
    function getCallStack() {
        var stack = [];
        for (var f = getCallStack.caller; f; f = f.caller) {
            stack.push(f);
        }
        return stack;
    }
{% endhighlight %}

简单的调用栈正常工作：
{% highlight javascript %}
    function f1() {
        return getCallStack();
    }
    function f2() {
        return f1();
    }
    var trace = f2();
    trace; // [f1, f2]
{% endhighlight %}

但是在递归中，f的caller还是导致无限循环。
{% highlight javascript %}
    function f(n) {
        return n === 0 ? getCallStack() : f(n - 1);
    }
    var trace = f(1); // infinite loop
{% endhighlight %}

以上的栈检测方式都是非标准的，在ES5的严格模式下被完全禁止。
{% highlight javascript %}
    function f() {
        "use strict";
        return f.caller;
    }
    f(); // error: caller may not be accessed on strict functions
{% endhighlight %}

## ch4 对象和原型

js中的继承：使用动态委托的方式重用代码或者数据。不同于其他面向对象语言，js的继承基于原型而非类。在很多语言中，每一个对象都是相关类的实例，类共享代码给所有的实例。而在js中，对象继承自其他对象，每个对象与其他对象关联，也就是原型。

### prototype getPrototypeOf 和 `__proto__`

* `C.prototype`用于建立通过`new C()`创建的对象的原型
* `Object.getPrototypeOf(obj)`是ES5的标准方法，用于获得obj的原型对象
* `obj.__proto__`是非标准的方法，也用于获得obj的原型对象

简单的例子
{% highlight javascript %}
    function User(name, passwordHash) {
        this.name = name;
        this.passwordHash = passwordHash;
    }
    User.prototype.toString = function() {
        return "[User " + this.name + "]";
    };
    User.prototype.checkPassword = function(password) {
        return hash(password) === this.passwordHash;
    };
    var u = new User("sfalken", "0ef33ae791068ec64b502d6cb0191387");
{% endhighlight %}

获取对象的原型对象，前者是ES5的标准方法。有些环境不支持，使用非标准的属性。
{% highlight javascript %}
    Object.getPrototypeOf(u) === User.prototype; // true
    u.__proto__ === User.prototype; // true
{% endhighlight %}

js中的类是构造函数(User)和一个原型对象(User.prototype)的组合。

### 推荐使用Object.prototypeOf

`__proto__`由于是非标准的，在不同实现中有差异。例如对原型是null的对象：
{% highlight javascript %}
    var empty = Object.create(null);
    "__proto__" in empty;//有些环境下true有些false
{% endhighlight %}

对于不支持ES5 API的js环境，简单的实现：
{% highlight javascript %}
    if (typeof Object.getPrototypeOf === "undefined") {
        Object.getPrototypeOf = function(obj) {
            var t = typeof obj;
            if (!obj || (t !== "object" && t !== "function")) {
                throw new TypeError("not an object");
            }
            return obj.__proto__;
        };
    }
{% endhighlight %}

### 永远不要修改`__proto__`

在性能方面，所有的现代js引擎都会对对象属性的读写做优化，因为这两种操作太普遍了。这些优化基于引擎对这个对象结构的完全掌握的前提，当对象内部的结构发生改变，比如对象或者原型链上的属性发生了修改或者移除/增加，有些优化就无效了。对`__proto__`的修改比普通属性更严重。

更重要的原因是修改会导致对象行为的不可预测。

对于支持ES5的环境，使用`Object.create`创建基于自定义的原型的对象。
对于不支持的，下面有不使用`__proto__`的方法。

### 让构造方法容忍非new调用

调用者忘记使用new就直接调用构造方法。
这会导致构造方法内部的this指向了全局变量，在严格模式下指向undefined。

使用new创建对象时，内部的this指向新创建的对象。利用这一点使用instanceof判断，如果不是通过new调用，就以正常的方法创建新对象返回。
{% highlight javascript %}
    function User(name, passwordHash) {
        if (!(this instanceof User)) {
            return new User(name, passwordHash);
        }
        this.name = name;
        this.passwordHash = passwordHash;
    }
{% endhighlight %}

上面的方法需要额外的方法调用。使用ES5的Object.create，传入原型对象，返回一个新对象。
由于构造器重载，显式的return返回任意对象，而没有return时返回this绑定的对象。
{% highlight javascript %}
    function User(name, passwordHash) {
        var self = this instanceof User
                ? this
                : Object.create(User.prototype);
        self.name = name;
        self.passwordHash = passwordHash;
        return self;
    }
{% endhighlight %}

对于不支持ES5的浏览器，补救措施。这也只是简单的实现，第二个参数是属性描述符。
{% highlight javascript %}
    if (typeof Object.create === "undefined") {
        Object.create = function(prototype) {
            function C() { }
            C.prototype = prototype;
            return new C();
        };
    }
{% endhighlight %}

### 在Prototype中存储方法

将方法放在构造函数中导致每个实例对象都需要拷贝方法，而定义在原型对象上，所有实例通过委托进行访问。由于现代js引擎优化原型查找，速度很快，而拷贝方法会占用更多的空间。

### 使用闭包存储私有数据

对象的属性名都是字符串，通过for in循环或者ES5的`Object.keys()`和`Object.getOwnPropertyNames()`可以取得对象的所有属性名。

可以通过代码规范表示私有变量，比如以下划线开头的属性是私有属性。

真正实现信息隐藏依靠闭包。闭包和对象的策略是相反的，对象的属性是暴露给外界的，而闭包中的变量是自动隐藏的，只有通过闭包内的函数显式提供访问。

不使用this，这样User的实例对象无法直接访问name和password。缺点是方法定义在构造函数中占用空间。
{% highlight javascript %}
    function User(name, passwordHash) {
        this.toString = function() {
            return "[User " + name + "]";
        };
        this.checkPassword = function(password) {
            return hash(password) === passwordHash;
        };
    }
{% endhighlight %}

### 只在实例对象上存储实例状态

例如children这种实例的状态，不应该定义在原型对象上，否则children将包含每次调用addChild产生的节点。方法可以在不同实例间共享是因为无状态。
{% highlight javascript %}
    function Tree(x) {
        this.value = x;
        this.children = []; // instance state
    }
    Tree.prototype = {
        addChild: function(x) {
            this.children.push(x);
        }
    };
{% endhighlight %}

### this绑定

实现CSV阅读器

使用map处理分隔符数组。注意在正则表达式的构造函数中，除了需要使用"\"转义分隔符，"\"本身也需要转义。最后使用"|"拼接返回的数组。
{% highlight javascript %}
    function CSVReader(separators) {
        this.separators = separators || [","];
        this.regexp =
            new RegExp(this.separators.map(function(sep) {
                return "\\" + sep[0];
            }).join("|"));
    }
{% endhighlight %}

先利用换行符分行，再对每行使用分隔符。
出错的原因是在map的回调函数中，this指向lines对象而非CSVReader。
{% highlight javascript %}
    CSVReader.prototype.read = function(str) {
        var lines = str.trim().split(/\n/);
        return lines.map(function(line) {
            return line.split(this.regexp); // wrong this!
        });
    };
    var reader = new CSVReader();
    reader.read("a,b,c\nd,e,f\n"); // [["a,b,c"], ["d,e,f"]]
{% endhighlight %}

map函数接受上下文作为第二个参数。其他不支持的函数可以使用`var self = this;`存储。或者使用ES5的bind方法。

### 在子类构造方法中调用父类的构造方法

由于使用new创建对象时，内部this指向创建的新对象，所以通过call指定它为Actor构造方法的上下文，确保Actor构造函数中创建的属性都被加在新对象上。后面加上自己的初始化。
{% highlight javascript %}
    function SpaceShip(scene, x, y) {
        Actor.call(this, scene, x, y);
        this.points = 0;
    }
{% endhighlight %}

作为子类，它的原型对象必须继承父类的原型对象，最好的办法还是ES5的Object.create方法。`SpaceShip.prototype = Object.create(Actor.prototype);`

如果使用父类的构造函数创建子类的原型对象：`SpaceShip.prototype = new Actor();`，会带来一些问题。首先不知道传递什么参数给Actor。其次Actor构造函数中的一些属性例如xy坐标，应该属于每个实例对象的状态而非原型对象。另外，Actor构造函数中包含对实例对象的操作，而不应该操作原型对象。

这是一个子类遇到的普遍问题，父类的构造函数只应该被子类构造函数调用，而不应该在子类原型对象创建时被调用。

p104的图十分清晰

### 永远不要重用父类的属性名

### 避免继承标准类

Array Function Date 标准类

试图继承Array类，但是length属性不起作用。
原因是length属性只在内部被认为是array的对象上起作用，ES5通过不可见的内部属性[[Class]]指明，例如通过Array构造函数或者[]创建的对象[[Class]]属性为"Array"。
只有在Array对象中，length才会随内部元素增减自动变化。
{% highlight javascript %}
    function Dir(path, entries) {
        this.path = path;
        for (var i = 0, n = entries.length; i < n; i++) {
            this[i] = entries[i];
        }
    }
    Dir.prototype = Object.create(Array.prototype);
    var dir = new Dir("/tmp/mysite",
        ["index.html", "script.js", "style.css"]);
    dir.length; // 0
{% endhighlight %}

当我们通过原型链继承Array对象时，子类没有通过new或者字面量[]创建，该对象的[[Class]]属性值为"Object"。这一点可以通过`Object.prototype.toString`验证，因为该方法会查询内部[[Class]]属性。
{% highlight javascript %}
    var dir = new Dir("/", []);
    Object.prototype.toString.call(dir); // "[object Object]"
    Object.prototype.toString.call([]); // "[object Array]"
{% endhighlight %}

p108有一张[[Class]]属性和构造方法的对应表。

正确的做法是维护一个内部Array变量，在原型对象上重新定义所有关于Array的操作，委托这个内部变量执行：
{% highlight javascript %}
    function Dir(path, entries) {
        this.path = path;
        this.entries = entries; // array property
    }
    Dir.prototype.forEach = function(f, thisArg) {
        if (typeof thisArg === "undefined") {
            thisArg = this;
        }
        this.entries.forEach(f, thisArg);
    };
{% endhighlight %}

### 将原型当做实现细节

对象是接口，实现放在原型对象中。

### 避免monkey-patching

例如两个库都扩展了Array原型对象：
{% highlight javascript %}
    Array.prototype.split = function(i) { // alternative #1
        return [this.slice(0, i), this.slice(i)];
    };
    Array.prototype.split = function() { // alternative #2
        var i = Math.floor(this.length / 2);
        return [this.slice(0, i), this.slice(i)];
    };
{% endhighlight %}

polyfill是一段代码(或者插件)，提供了那些开发者们希望浏览器原生提供支持的功能。由于浏览器版本众多，标准API支持程度不同。例如ES5中Array的forEach，map，filter方法。

首先检测方法是否已经存在，避免冲突：
{% highlight javascript %}
    if (typeof Array.prototype.map !== "function") {
        Array.prototype.map = function(f, thisArg) {
            var result = [];
            for (var i = 0, n = this.length; i < n; i++) {
                result[i] = f.call(thisArg, this[i], i);
            }
            return result;
        };
    }
{% endhighlight %}

## ch5 数组和字典

### 轻量级字典

JS对象本质就是一个将字符串属性映射到值的表。这就使对象实现字典变得无比简单，JS甚至提供for in循环遍历属性名。

但是对象会通过原型对象继承属性，for in循环也会将原型链上的属性遍历出来。

“轻量”的意思就是使用Object的实例而不是子类。
{% highlight javascript %}
    var dict = {};
    dict.alice = 34;
    dict.bob = 24;
    dict.chris = 62;
    var names = [];
    for (var name in dict) {
        names.push(name);
    }
    names; // ["alice", "bob", "chris"]
{% endhighlight %}

### 使用null原型对象避免原型污染

在ES5之前，想要创建一个原型对象为null的对象：
{% highlight javascript %}
    function C() { }
    C.prototype = null;
{% endhighlight %}

但是这样创建的对象经不起getPrototypeOf的检验：
{% highlight javascript %}
    var o = new C();
    Object.getPrototypeOf(o) === null; // false
    Object.getPrototypeOf(o) === Object.prototype; // true
{% endhighlight %}

ES5提供：
{% highlight javascript %}
    var x = Object.create(null);
    Object.getPrototypeOf(o) === null; // true
{% endhighlight %}

非标准：对象字面语法也支持：
{% highlight javascript %}
    var x = { __proto__: null };
    x instanceof Object; // false (non-standard)
{% endhighlight %}


### 使用hasOwnProperty避免原型污染

用in判断时，即使是空对象，也会从Object.prototype对象继承很多属性，如toString。

hasOwnProperty不去原型链上查找。当我们调用这个方法时，回去Object.prototype上查找，如果我们在对象上覆盖了这个属性：
{% highlight javascript %}
    dict.hasOwnProperty = 10;
    dict.hasOwnProperty("alice");
    // error: dict.hasOwnProperty is not a function
{% endhighlight %}

首先从空对象或者Object.prototype也就是可靠来源中提取hasOwnProperty方法：
{% highlight javascript %}
    var hasOwn = Object.prototype.hasOwnProperty;
    var hasOwn = {}.hasOwnProperty;
{% endhighlight %}

使用call/apply调用：
{% highlight javascript %}
    hasOwn.call(dict, "alice");
{% endhighlight %}

完整的字典：
{% highlight javascript %}
    function Dict(elements) {
        this.elements = elements || {}; // simple Object
    }
    Dict.prototype.has = function(key) {
        return {}.hasOwnProperty.call(this.elements, key);
    };
    Dict.prototype.get = function(key) {
        return this.has(key)
            ? this.elements[key]
            : undefined;
    };
    Dict.prototype.set = function(key, val) {
        this.elements[key] = val;
    };
    Dict.prototype.remove = function(key) {
        delete this.elements[key];
    };
{% endhighlight %}

### 有序集合采用Array而不是字典

ES标准没有明确属性的存储顺序。而for in得按顺序遍历，不同JS引擎的实现导致这个顺序不确定。

### 永远不要添加可枚举的属性到Object.prototype上

原型污染：直接添加在原型对象上的属性方法会被forin遍历出来。
{% highlight javascript %}
    Object.prototype.allKeys = function() {
        var result = [];
        for (var key in this) {
            result.push(key);
        }
        return result;
    };
    ({ a: 1, b: 2, c: 3 }).allKeys(); // ["allKeys", "a", "b", "c"]
{% endhighlight %}

不太优雅的做法：定义function而不是对象方法
{% highlight javascript %}
    function allKeys(obj) {
        var result = [];
        for (var key in obj) {
            result.push(key);
        }
        return result;
    }
{% endhighlight %}

ES5提供了更好的办法，属性描述符：在原型对象上添加属性，但是不被forin可见。
{% highlight javascript %}
    Object.defineProperty(Object.prototype, "allKeys", {
        value: function() {
            var result = [];
            for (var key in this) {
                result.push(key);
            }
            return result;
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
{% endhighlight %}

### 避免在枚举中修改对象

### Array遍历中使用for而不是forin

一个有趣的问题：首先，score是键而不是值。其次，也不是0+1+2..，因为对象属性总是字符串，会拼接成"00123456"。
{% highlight javascript %}
    var scores = [98, 74, 85, 77, 93, 100, 89];
    var total = 0;
    for (var score in scores) {
        total += score;
    }
    var mean = total / scores.length;
    mean; // ?
{% endhighlight %}

所以应该使用for循环。

### 迭代方法优于循环

ES5中forEach，map和filter。
{% highlight javascript %}
    players.forEach(function(p) {
        p.score++;
    });
    var trimmed = input.map(function(s) {
        return s.trim();
    });
    listings.filter(function(listing) {//只留下返回true的元素
        return listing.price >= min && listing.price <= max;
    });
{% endhighlight %}

但是循环的优点是通过break和continue能控制流程。

### 在类似Array的对象上重用Array的方法

典型的就是arguments对象：
{% highlight javascript %}
    function highlight() {
        [].forEach.call(arguments, function(widget) {
            widget.setBackground("yellow");
        });
    }
{% endhighlight %}

通过`document.getElementsByTagName`等方法生成的结果集，也就是DOM的NodeList对象，有类似Array的行为，但是没有继承Array.prototype。

类似Array的对象只要满足两个条件就可以兼容所有Array原型对象定义的方法：

* 拥有length属性，取值是0~2^32-1的正整数
* length属性比对象最大的index大。index是0~2^32-2的正整数，字符串表现是对象属性的键。

所有即使是一个拥有length属性的简单对象：
{% highlight javascript %}
    var arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
    var result = Array.prototype.map.call(arrayLike, function(s) {
        return s.toUpperCase();
    }); // ["A", "B", "C"]
{% endhighlight %}

String对象也是：
{% highlight javascript %}
    var result = Array.prototype.map.call("abc", function(s) {
        return s.toUpperCase();
    }); // ["A", "B", "C"]
{% endhighlight %}

在Array的方法中concat是一个特例，该方法会检查参数的[[Class]]内部属性。发现参数不是真正的Array时，作为整个元素进行拼接：
{% highlight javascript %}
    function namesColumn() {
        return ["Names"].concat(arguments);
    }
    namesColumn("Alice", "Bob", "Chris");
    // ["Names", { 0: "Alice", 1: "Bob", 2: "Chris" }]
{% endhighlight %}

正确做法是将arguments变成真正的Array对象：
{% highlight javascript %}
    function namesColumn() {
        return ["Names"].concat([].slice.call(arguments));
    }
    namesColumn("Alice", "Bob", "Chris");
    // ["Names", "Alice", "Bob", "Chris"]
{% endhighlight %}

### 使用Array字面形式优于构造函数

使用构造函数时，要注意重新绑定Array变量的问题，或者修改全局的Array变量：
{% highlight javascript %}
    function f(Array) {
        return new Array(1, 2, 3, 4, 5);
    }
    f(String); // new String(1)
    Array = String;
    new Array(1, 2, 3, 4, 5); // new String(1)
{% endhighlight %}

另外，当传入Array构造函数的参数是一个单独的数字时，会造成完全不同的效果：
不会加入任何元素，而是将length设置成参数值。
这意味着`["hello"]`和`new Array("hello")`是相同的，而`[17]`和`Array(17)`完全不同。

## ch6 类库和API设计

### 维持一致的约定

关键的约定包括参数的顺序。例如宽高，css中上右下左。
如果使用option对象就不用考虑参数顺序了。

### 将undefined作为没有值

声明变量没有赋值
{% highlight javascript %}
    var x;
    x; // undefined
{% endhighlight %}

访问不存在的对象属性
{% highlight javascript %}
    var obj = {};
    obj.x; // undefined
{% endhighlight %}

没有返回值
{% highlight javascript %}
    function f() {
        return;
    }
    function g() { }
    f(); // undefined
    g(); // undefined
{% endhighlight %}

使用默认值，可以通过直接判断，或者使用逻辑或。但是逻辑或不一定正确，因为falsy值有很多，比如0。
{% highlight javascript %}
    function Server(port, hostname) {
        if (hostname === undefined) {
            hostname = "localhost";
        }
        hostname = String(hostname);
        // ...
    }
    function Server(port, hostname) {
        hostname = String(hostname || "localhost");
        // ...
    }
{% endhighlight %}

### 接受option对象作为关键参数

必备的参数和option对象
{% highlight javascript %}
    function Alert(parent, message, opts) {
        opts = opts || {}; // default to an empty options object
        this.width = opts.width === undefined ? 320 : opts.width;
        this.height = opts.height === undefined
                ? 240
                : opts.height;
        this.x = opts.x === undefined
                ? (parent.width / 2) - (this.width / 2)
                : opts.x;
        this.y = opts.y === undefined
                ? (parent.height / 2) - (this.height / 2)
                : opts.y;
        this.title = opts.title || "Alert";
        this.titleColor = opts.titleColor || "gray";
        this.bgColor = opts.bgColor || "white";
        this.textColor = opts.textColor || "black";
        this.icon = opts.icon || "info";
        this.modal = !!opts.modal;
        this.message = message;
    }
{% endhighlight %}

很多JS库都会提供extend方法扩展对象。第二次extend是因为xy需要先计算出width和height。最后一次是为了给对象赋值。
{% highlight javascript %}
    function Alert(parent, message, opts) {
        opts = extend({
            width: 320,
            height: 240
        });
        opts = extend({
            x: (parent.width / 2) - (opts.width / 2),
            y: (parent.height / 2) - (opts.height / 2),
            title: "Alert",
            titleColor: "gray",
            bgColor: "white",
            textColor: "black",
            icon: "info",
            modal: false
        }, opts);
        extend(this, opts);
    }
{% endhighlight %}

下面是Underscore.js提供的extend实现：
{% highlight javascript %}
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
          if (source) {
            for (var prop in source) {
              obj[prop] = source[prop];
            }
          }
        });
        return obj;
      };
{% endhighlight %}

### 避免不必要的状态

不知道canvas在drawMyImage中间有没有被修改。这就属于和状态相关的API。
{% highlight javascript %}
    c.fillStyle = "blue";
    drawMyImage(c); // did drawMyImage change c?
    c.fillText("hello, world!", 75, 25);
{% endhighlight %}

和状态无关的API避免了变量在程序任何地方被修改导致的错误，提高了代码的可读性。

### 区分Array和类似Array的对象

API中常出现函数重载现象，通过判断参数类型进行不同的处理。
对于数字和Array使用typeof很好区分：前提是只接受这两种参数类型！
{% highlight javascript %}
    BitVector.prototype.enable = function(x) {
        if (typeof x === "number") {
            this.enableBit(x);
        } else { // assume x is array-like
            for (var i = 0, n = x.length; i < n; i++) {
                this.enableBit(x[i]);
            }
        }
    };
{% endhighlight %}

区分Array和非Array对象就不是那么简单了，由于Array也是对象，仅通过typeof无法判断。通过检查是否包含名为length的属性也不能保证，普通对象也可以有。

通过instanceof判断过于严格：每个frame都有独立的标准库的拷贝，在不同frame之间通信时，一个frame中的array不会继承自另一个frame的Array原型对象。
{% highlight javascript %}
    StringSet.prototype.add = function(x) {
        if (typeof x === "string") {
            this.addString(x);
        } else if (x instanceof Array) { // too restrictive
            x.forEach(function(s) {
                this.addString(s);
            }, this);
        } else {
            for (var key in x) {
                this.addString(key);
            }
        }
    };
{% endhighlight %}

ES5中引入了Array.isArray方法，检查内部属性[[Class]]是否是"Array"。

不支持ES5的环境使用`Object.prototype.toString`进行判断，该方法使用内部属性[[Class]]。
{% highlight javascript %}
    var toString = Object.prototype.toString;
    function isArray(x) {
        return toString.call(x) === "[object Array]";
    }
{% endhighlight %}

Underscore.js中也是这么判断的：
{% highlight javascript %}
    var ObjProto = Object.prototype;
    var nativeIsArray = Array.isArray;
    var toString = ObjProto.toString;
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) == '[object Array]';
      };
{% endhighlight %}

### 支持方法的链式调用

在HTML中符号的转义：
{% highlight javascript %}
    function escapeBasicHTML(str) {
        return str.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&apos;");
    }
{% endhighlight %}

对于和状态相关的，方法应该返回this。和状态无关的返回新生成的对象。

## ch7 并发

ECMAScript标准从来不提并发。

