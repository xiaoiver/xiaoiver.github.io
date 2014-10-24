---
layout: post
title:  "《You dont know js》读书笔记"
date:   2014-10-24 19:16:40
categories: js
---

# Part1 scope & closure

## ch2 语法作用域

> lexical scope is the set of rules about how the engine can look up a 
> variable and where it will find it.

作用域的查找在第一次匹配时就停止。使用 __eval__ 欺骗语法作用域，但是
会影响性能。

## function的scope

## try/catch的block scope
{% highlight javascript %}
try {
    undefined(); // illegal operation to force an exception!
}
catch (err) {
    console.log( err ); // works!
}
console.log( err ); // ReferenceError: `err` not found
{% endhighlight %}

## let
ES6中引入let，将声明的变量加入包含的block的scope中
{% highlight javascript %}
var foo = true;
if (foo) {
    let bar = foo * 2;
    bar = something( bar );
    console.log( bar );
}
console.log( bar ); // ReferenceError
{% endhighlight %}
可以用显式的{}

## hoisting 变量提升

> declarations being taken as existing for the entire scope in which they occur

let无法做到：
{% highlight javascript %}
{
    console.log( bar ); // ReferenceError!
    let bar = 2;
}
{% endhighlight %}

## block scope的用法

### 回收变量

使用显式的block告诉engine可以回收someReallyBigData，否则由于click函数的闭包包括了整个作用域，无法回收。
{% highlight javascript %}
function process(data) {
// do something interesting
}
// anything declared inside this block can go away after!
{
    let someReallyBigData = { .. };
    process( someReallyBigData );
}
var btn = document.getElementById( "my_button" );
btn.addEventListener( "click", function click(evt){
    console.log("button clicked");
}, /*capturingPhase=*/false );
{% endhighlight %}

### for loop
for循环中使用let，每次循环重新绑定变量值
{% highlight javascript %}
for (let i=0; i<10; i++) {
    console.log( i );
}
console.log( i ); // ReferenceError
{% endhighlight %}

---------------
const也能创建block作用域

## hoisting:变量的声明会提升

下面的代码会输出2而不是undefined
{% highlight javascript %}
a = 2;
var a;
console.log( a );
{% endhighlight %}

而下面的代码会输出undefined，不是2也不会抛出ReferenceError
{% highlight javascript %}
console.log( a );
var a = 2;
{% endhighlight %}

engine在解释前会先编译，编译器会将变量的声明和scope关联起来。
var a = 2;其实分成两步，var a;和a=2;第一步的声明是在编译阶段完成的。
第二步赋值在运行时完成。
第一段代码等价于：
{% highlight javascript %}
var a;
a = 2;
console.log( a );
{% endhighlight %}
而第二段：
{% highlight javascript %}
var a;
console.log( a );
a = 2;
{% endhighlight %}

可以执行，foo也是变量
{% highlight javascript %}
foo();
function foo() {
console.log( a ); // undefined
var a = 2;
}
{% endhighlight %}

提升是在scope内的，a不会提升到global scope
{% highlight javascript %}
foo(); // TypeError!
bar(); // ReferenceError
var foo = function bar() {
    // ...
};
{% endhighlight %}
等价于
{% highlight javascript %}
var foo;
foo(); // TypeError
bar(); // ReferenceError
foo = function() {
    var bar = ...self...
    // ...
}
{% endhighlight %}

函数声明提升在变量之前：
{% highlight javascript %}
foo(); // 1
var foo;
function foo() {
console.log( 1 );
}
foo = function() {
console.log( 2 );
};
{% endhighlight %}

## 避免在block中声明函数

{% highlight javascript %}
foo(); // "b"
var a = true;
if (a) {
function foo() { console.log("a"); }
}
else {
function foo() { console.log("b"); }
}
{% endhighlight %}

## ch5闭包

{% highlight javascript %}
function foo() {
    var a = 2;
    function bar() {
        console.log( a ); // 2
    }
    bar();
}
foo();
{% endhighlight %}
换一种写法: 
{% highlight javascript %}
function foo() {
    var a = 2;
    function bar() {
        console.log( a );
    }
    return bar;
}
var baz = foo();
baz(); // 2 -- Whoa, closure was just observed, man.
{% endhighlight %}
原本foo函数执行之后，其内部scope应该被垃圾回收器回收，但是bar函数仍在
使用该scope

当我们将内部函数转移到其语法作用域之外，该函数会维护一个scope引用指向
原本函数声明的地方。

### 循环和闭包

#### 问题：每隔1秒输出1，2，3，4，5

首先想到：
{% highlight javascript %}
for (var i=1; i<=5; i++) {
    setTimeout( function timer(){
        console.log( i );
    }, i*1000 );
}
{% endhighlight %}
每隔一秒输出6，首先循环全部结束才会运行定时回调函数，即使将间隔设为0，
此时i=6，5个timer函数处于同一个共享scope，保持对同一个i的引用。
因此想到，为每个回调函数创建一个闭包。使用IIFE为每个循环创建新的作用域。
{% highlight javascript %}
for (var i=1; i<=5; i++) {
    (function(){
        setTimeout( function timer(){
            console.log( i );
        }, i*1000 );
    })();
}
{% endhighlight %}
但是这样还是不够，作用域是空的，需要添加变量：
{% highlight javascript %}
for (var i=1; i<=5; i++) {
    (function(){
        var j = i;
        setTimeout( function timer(){
            console.log( j );
        }, j*1000 );
    })();
}
{% endhighlight %}
改变一下写法：
{% highlight javascript %}
for (var i=1; i<=5; i++) {
    (function(j){
        setTimeout( function timer(){
            console.log( j );
        }, j*1000 );
    })( i );
}
{% endhighlight %}
同样的，使用let创建块作用域也能实现：
{% highlight javascript %}
for (var i=1; i<=5; i++) {
    let j = i; // yay, block-scope for closure!
    setTimeout( function timer(){
        console.log( j );
    }, j*1000 );
}
{% endhighlight %}
换一种写法：每次循环i都会被重新声明一次
{% highlight javascript %}
for (let i=1; i<=5; i++) {
    setTimeout( function timer(){
        console.log( i );
    }, i*1000 );
}
{% endhighlight %}
### Module
返回对象
{% highlight javascript %}
function CoolModule() {
    var something = "cool";
    var another = [1, 2, 3];
    function doSomething() {
        console.log( something );
    }
    function doAnother() {
        console.log( another.join( " ! " ) );
    }
    return {
        doSomething: doSomething,
        doAnother: doAnother
    };
}
var foo = CoolModule();
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
{% endhighlight %}
实现module需要：

1. 需要有包裹的function，并且至少被调用一次。
2. 包裹function至少返回一个内部function，这样内部function拥有私有scope的闭包，能够访问修改私有变量的状态。

使用IIFE实现模块的singleton：
{% highlight javascript %}
var foo = (function CoolModule() {
    var something = "cool";
    var another = [1, 2, 3];
    function doSomething() {
        console.log( something );
    }
    function doAnother() {
        console.log( another.join( " ! " ) );
    }
    return {
        doSomething: doSomething,
        doAnother: doAnother
    };
})();
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
{% endhighlight %}

### p66 js是没有动态作用域的，但是this的作用和动态作用域相似：
> The key contrast: lexical scope is write-time, whereas dynamic scope
> (and this!) are runtime. Lexical scope cares where a function was
> declared, but dynamic scope cares where a function was called from.

如果有动态作用域：
{% highlight javascript %}
function foo() {
    console.log( a ); // 3 (not 2!)
}
function bar() {
    var a = 3;
    foo();
}
var a = 2;
bar();
{% endhighlight %}
# Part2 this & prototype

当函数被调用时，一个执行上下文就被创建了。包括了函数是从哪里调用的(call-stack)，如何调用的，传递的参数，还有this。

* this既不是一个指向函数本身的引用，也不是函数语法作用域的引用。
* this是函数被调用时创建的绑定，指向的东西在调用时确定。

## 4个绑定规则

### 默认绑定
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var a = 2;
foo(); // 2
{% endhighlight %}
首先，在全局作用域中声明的变量，window会有一个同名的属性，两者不同，像硬币的两面。默认绑定将this指向全局对象window，为何是默认绑定？因为在foo的调用地点查看其调用方式，发现是平常的，不加装饰的调用，其他规则不适用。
但在严格模式下：
{% highlight javascript %}
function foo() {
    "use strict";
    console.log( this.a );
}
var a = 2;
foo(); // TypeError: `this` is `undefined`
{% endhighlight %}

### 隐式绑定
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
obj.foo(); // 2
{% endhighlight %}
obj对象在调用时拥有foo函数，查看调用地点，obj.foo()是有上下文的，this指向obj。

只有对象最后一层的属性引用链决定调用地点。
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj2 = {
    a: 42,
    foo: foo
};
var obj1 = {
    a: 2,
    obj2: obj2
};
obj1.obj2.foo(); // 42
{% endhighlight %}

隐式绑定会丢失，退化成默认绑定，this指向window或者严格模式下undefined。
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
var bar = obj.foo; // function reference/alias!
var a = "oops, global"; // `a` also property on global object
bar(); // "oops, global"
{% endhighlight %}
bar只是foo的引用，而非obj.foo的引用，而且调用地点bar()没有装饰的调用，使用默认绑定规则。

下面通过参数传递，fn也只是foo的引用，所以结果一样。
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
function doFoo(fn) {
    // `fn` is just another reference to `foo`
    fn(); // <-- call-site!
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // `a` also property on global object
doFoo( obj.foo ); // "oops, global"
{% endhighlight %}

就算将回调函数传递进原生函数而非自定义函数，结果还是一样。
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // `a` also property on global object
setTimeout( obj.foo, 100 ); // "oops, global"
{% endhighlight %}
因为setTimeout内部调用地点：
{% highlight javascript %}
function setTimeout(fn,delay) {
    // wait (somehow) for `delay` milliseconds
    fn(); // <-- call-site!
}
{% endhighlight %}

### 显式绑定
call和apply的第一个参数就是this指向的对象
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2
};
foo.call( obj ); // 2
{% endhighlight %}
boxing: 如果传入的参数是原生类型：例如string,boolean,number，会被包装成对应的对象形式：new String()

#### 硬绑定hard binding
无论如何改变bar的调用方式，foo的上下文都是obj
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2
};
var bar = function() {
    foo.call( obj );
};
bar(); // 2
setTimeout( bar, 100 ); // 2
// hard-bound `bar` can no longer have its `this` overridden
bar.call( window ); // 2
{% endhighlight %}

##### 应用：简单的bind实现
{% highlight javascript %}
function bind(fn, obj) {
    return function() {
        return fn.apply( obj, arguments );
    };
}
{% endhighlight %}
ES5中已经内置Function.prototype.bind

### new绑定
当一个函数以new的方式调用时：

1. 新的对象被创建
2. 对象Prototype
3. 在函数调用中，这个对象指定为this绑定
4. 除非函数显式返回对象，新创建的对象被返回

{% highlight javascript %}
function foo(a) {
    this.a = a;
}
var bar = new foo( 2 );
console.log( bar.a ); // 2
{% endhighlight %}
## 4个规则的优先级
### 默认绑定最低

### 测试隐式和显式
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var obj1 = {
    a: 2,
    foo: foo
};
var obj2 = {
    a: 3,
    foo: foo
};
obj1.foo(); // 2
obj2.foo(); // 3
obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
{% endhighlight %}
结果：显式优先级更高

### 测试new和隐式
{% highlight javascript %}
function foo(something) {
    this.a = something;
}
var obj1 = {
    foo: foo
};
var obj2 = {};
obj1.foo( 2 );
console.log( obj1.a ); // 2
obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3
var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
{% endhighlight %}
结果：new更高
----------------------
p40不太懂 New和显式的比较
----------------------

### currying
bind函数第一个上下文参数之后的参数将作为被绑定函数预定义的部分参数： partial application
{% highlight javascript %}
function foo(p1,p2) {
    this.val = p1 + p2;
}
// using `null` here because we don't care about
// the `this` hard-binding in this scenario, and
// it will be overridden by the `new` call anyway!
var bar = foo.bind( null, "p1" );
var baz = new bar( "p2" );
baz.val; // p1p2
{% endhighlight %}

## 规则的特例
### 传递null,undefined当作call的参数，会退化成默认绑定
{% highlight javascript %}
function foo() {
console.log( this.a );
}
var a = 2;
foo.call( null ); // 2
{% endhighlight %}
那么为什么要传入null作为上下文呢？不需要提供上下文：展开数组作为参数列表，currying
{% highlight javascript %}
function foo(a,b) {
    console.log( "a:" + a + ", b:" + b );
}
// spreading out array as parameters
foo.apply( null, [2, 3] ); // a:2, b:3
// currying with `bind(..)`
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
{% endhighlight %}
防止null出问题，创建一个空对象，当作上下文
{% highlight javascript %}
// our DMZ empty object
var ø = Object.create( null );
{% endhighlight %}

### 间接，表达式赋值，调用地点其实是foo，默认绑定
{% highlight javascript %}
function foo() {
    console.log( this.a );
}
var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };
o.foo(); // 3
(p.foo = o.foo)(); // 2
{% endhighlight %}

### 软绑定
提供不同于默认绑定的默认值，并且能够通过显式隐式绑定改变this指向
{% highlight javascript %}
if (!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        var fn = this;
        // capture any curried parameters
        var curried = [].slice.call( arguments, 1 );
        var bound = function() {
        return fn.apply(
            (!this || this === (window || global)) ?
            obj : this,                                  //原文此处缺少逗号
            curried.concat.apply( curried, arguments )
            );
        };
        bound.prototype = Object.create( fn.prototype );
        return bound;
    };
}
{% endhighlight %}
用法：
{% highlight javascript %}
function foo() {
console.log("name: " + this.name);
}
var obj = { name: "obj" },
obj2 = { name: "obj2" },
obj3 = { name: "obj3" };
var fooOBJ = foo.softBind( obj );
fooOBJ(); // name: obj
obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2 <---- look!!!
fooOBJ.call( obj3 ); // name: obj3 <---- look!
setTimeout( obj2.foo, 10 );
// name: obj <---- falls back to soft-binding
{% endhighlight %}

## ch3对象
function是object的子类型，可调用的对象。
js中6种原生类型：

* string
* number
* boolean
* null
* undefined
* object

内置对象：

* String
* Number
* Boolean
* Object
* Function
* Array
* Date
* RegExp
* Error

当我们使用string,number,boolean原生类型的方法或属性时，引擎会自动转换成对应的对象。
{% highlight javascript %}
var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"
{% endhighlight %}
null和undefined没有对应的object作为包装，相反Date只能以对象形式创建。

### 对象的内容
{% highlight javascript %}
var myObject = {
a: 2
};
myObject.a; // 2            属性访问
myObject["a"]; // 2         键值访问
{% endhighlight %}

属性名都是string，其他类型会被首先转换成string
{% highlight javascript %}
var myObject = { };
myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";
myObject["true"]; // "foo"
myObject["3"]; // "bar"
myObject["[object Object]"]; // "baz"
{% endhighlight %}

### Array
数组也是对象，所以可以添加属性，但是length不会改变
{% highlight javascript %}
var myArray = [ "foo", 42, "bar" ];
myArray.baz = "baz";
myArray.length; // 3
myArray.baz; // "baz"
{% endhighlight %}

除非属性名看起来像数字：
{% highlight javascript %}
var myArray = [ "foo", 42, "bar" ];
myArray["3"] = "baz";
myArray.length; // 4
myArray[3]; // "baz"
{% endhighlight %}

### 对象的复制
JSON-safe：可以被序列化的对象，还原时反序列化
{% highlight javascript %}
var newObj = JSON.parse( JSON.stringify( someObj ) );
{% endhighlight %}

#### 浅层拷贝
ES6定义了Object.assign(..)
{% highlight javascript %}
var newObj = Object.assign( {}, myObject );
newObj.a; // 2
newObj.b === anotherObject; // true
newObj.c === anotherArray; // true
newObj.d === anotherFunction; // true
{% endhighlight %}

### 属性的描述符 ES5以后
读取：
{% highlight javascript %}
var myObject = {
a: 2
};
Object.getOwnPropertyDescriptor( myObject, "a" );
// {
// value: 2,
// writable: true,
// enumerable: true,
// configurable: true
// }
{% endhighlight %}

定义：
{% highlight javascript %}
var myObject = {};
Object.defineProperty( myObject, "a", {
    value: 2,
    writable: true,
    configurable: true,
    enumerable: true
} );
myObject.a; // 2
{% endhighlight %}

#### writable
{% highlight javascript %}
var myObject = {};
Object.defineProperty( myObject, "a", {
    value: 2,
    writable: false, // not writable!
    configurable: true,
    enumerable: true
} );
myObject.a = 3;
myObject.a; // 2
{% endhighlight %}

严格模式下会抛出类型错误
{% highlight javascript %}
"use strict";
var myObject = {};
Object.defineProperty( myObject, "a", {
    value: 2,
    writable: false, // not writable!
    configurable: true,
    enumerable: true
} );
myObject.a = 3; // TypeError
{% endhighlight %}

#### configurable
单向不可逆：
{% highlight javascript %}
Object.defineProperty( myObject, "a", {
    value: 4,
    writable: true,
    configurable: false, // not configurable!
    enumerable: true
} );
myObject.a; // 4
myObject.a = 5;
myObject.a; // 5
Object.defineProperty( myObject, "a", {
    value: 6,
    writable: true,
    configurable: true,
    enumerable: true
} ); // TypeError
{% endhighlight %}
不可配置之后delete无法删除对象的属性

#### enumerable
false之后无法通过遍历对象访问属性

### 用法
#### 定义对象常量
{% highlight javascript %}
var myObject = {};
Object.defineProperty( myObject, "FAVORITE_NUMBER", {
    value: 42,
    writable: false,
    configurable: false
} );
{% endhighlight %}

#### 禁止扩展
{% highlight javascript %}
var myObject = {
    a: 2
};
myObject.b = 3;
myObject.b; // undefined
{% endhighlight %}

#### Object.seal(..)
调用Object.preventExtensions( myObject );
然后将对象的所有属性设为configurable:false

#### Object.freeze(..)
调用seal并且所有属性writable:false

### [[Get]]
{% highlight javascript %}
var myObject = {
    a: 2
};
myObject.a; // 2
{% endhighlight %}
对象上类似[[Get]]()的函数调用

无法判断属性是不存在 还是值就是undefined：
{% highlight javascript %}
var myObject = {
    a: undefined
};
myObject.a; // undefined
myObject.b; // undefined
{% endhighlight %}

通过询问对象属性是否存在来判断
{% highlight javascript %}
var myObject = {
    a: 2
};
("a" in myObject); // true
("b" in myObject); // false
myObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "b" ); // false
{% endhighlight %}

除了在对象本身查找，in还会在原型链上查找，hasOwnProperty就不会。
另外，in不能判断数组中是否存在某个对象：
4 in [2, 4, 6]会返回false

### [[Put]]
如果属性存在：

1. 是否定义了setter，如果有，调用
2. 描述符writable是否是false，非严格模式下默默失败，严格模式下TypeErorr
3. 设置值

不存在：
。。。

### getter&setter
{% highlight javascript %}
var myObject = {
    // define a getter for `a`
    get a() {
        return 2;
    }
};
Object.defineProperty(
    myObject, // target
    "b", // property name
    { // descriptor
        // define a getter for `b`
        get: function(){ return this.a * 2 },
        // make sure `b` shows up as an object property
        enumerable: true
    }
);
myObject.a; // 2
myObject.b; // 4

var myObject = {
    // define a getter for `a`
    get a() {
        return this._a_;
    },
    // define a setter for `a`
    set a(val) {
        this._a_ = val * 2;
    }
};
myObject.a = 2;
myObject.a; // 4
{% endhighlight %}

遍历中
{% highlight javascript %}
Object.defineProperty(
    myObject,
    "b",
    // make `b` NON-enumerable
    { enumerable: false, value: 3 }
);
myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty( "b" ); // true
// .......
for (var k in myObject) {
    console.log( k, myObject[k] );
}
// "a" 2
{% endhighlight %}
对Array最好使用传统的Index遍历，因为for in会把其他属性遍历进来

分辨可枚举和不可枚举的属性：
{% highlight javascript %}
var myObject = { };
Object.defineProperty(
    myObject,
    "a",
    // make `a` enumerable, as normal
    { enumerable: true, value: 2 }
);
Object.defineProperty(
    myObject,
    "b",
    // make `b` nonenumerable
    { enumerable: false, value: 3 }
);
myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false
Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
{% endhighlight %}

## iteration
for in 会遍历可枚举的属性（包括原型链上的），不保证顺序。
需要遍历所有的值：
传统的：通过Index访问
{% highlight javascript %}
var myArray = [1, 2, 3];
for (var i = 0; i < myArray.length; i++) {
    console.log( myArray[i] );
}
// 1 2 3
{% endhighlight %}

> ES5引入的forEach,every,some其实就是在循环中加入终止条件。

ES6引入for of直接得到值，无须通过Index或者属性名访问
{% highlight javascript %}
var myArray = [ 1, 2, 3 ];
for (var v of myArray) {
    console.log( v );
}
// 1
// 2
// 3
{% endhighlight %}

### mixins(extend)
显式：
{% highlight javascript %}
// vastly simplified `mixin(..)` example:
function mixin( sourceObj, targetObj ) {
    for (var key in sourceObj) {
        // only copy if not already present
        if (!(key in targetObj)) {
            targetObj[key] = sourceObj[key];
        }
    }
    return targetObj;
}
var Vehicle = {
    engines: 1,
    ignition: function() {
        console.log( "Turning on my engine." );
    },
    drive: function() {
        this.ignition();
        console.log( "Steering and moving forward!" );
    }
};
var Car = mixin( Vehicle, {
    wheels: 4,
    drive: function() {
        Vehicle.drive.call( this ); //伪多态，为了区别drive方法只能加上对象名，传入当前对象上下文
        console.log(
            "Rolling on all " + this.wheels + " wheels!"
        );
    }
} );
{% endhighlight %}

> 不像JAVA在类定义时就指明继承关系，这种方式可读性差，难以维护，避免使用。

寄生式的继承：
{% highlight javascript %}
// "Traditional JS Class" `Vehicle`
function Vehicle() {
    this.engines = 1;
}
Vehicle.prototype.ignition = function() {
    console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
    this.ignition();
    console.log( "Steering and moving forward!" );
};
// "Parasitic Class" `Car`
function Car() {
    // first, `car` is a `Vehicle`
    var car = new Vehicle();
    // now, let's modify our `car` to specialize it
    car.wheels = 4;
    // save a privileged reference to `Vehicle::drive()`
    var vehDrive = car.drive;
    // override `Vehicle::drive()`
    car.drive = function() {
        vehDrive.call( this );
        console.log(
        "Rolling on all " + this.wheels + " wheels!"
    );
    return car;
}
var myCar = new Car();
myCar.drive();
// Turning on my engine.
// Steering and moving forward!
// Rolling on all 4 wheels!
{% endhighlight %}

## Prototype
{% highlight javascript %}
var anotherObject = {
    a: 2
};
// create an object linked to `anotherObject`
var myObject = Object.create( anotherObject );
myObject.a; // 2
{% endhighlight %}

> 对象原型链的终点是Object.prototype对象

当foo不在myObject上而在更高的原型链上时，myObject.foo = "bar"
的三种场景：

1. 更高原型链上的foo属性的描述符不为writable:false，也就是非只读时，新的属性foo被添加到myObject上，shadowed property出现了，因为myObject.foo只会找到最低原型链上的属性，高级链上的就被忽略了。
2. 原型链上有，但是是只读，属性创建失败，严格模式下抛出异常。
3. 原型链上有，是setter，setter被直接调用，foo不会被创建在myObject上，setter也不会被重新定义。

> 如果想在2，3场景下shadow，需要使用defineProperty才行。
> 应该避免使用shadow属性。

### Foo.prototype到底是什么？
所有通过new Foo创建的对象原型链指向Foo.prototype，下面是验证：

{% highlight javascript %}
function Foo() {
// ...
}
var a = new Foo();
Object.getPrototypeOf( a ) === Foo.prototype; // true
{% endhighlight %}

不同于java这样的面向对象语言，Js中new一个对象并没有实例化一个类，拷贝
类定义的行为到实例对象中。只是使两个对象连在一起而已。
委托行为，一个对象将属性方法的访问委托给另一个对象。

{% highlight javascript %}
function Foo() {
// ...
}
Foo.prototype.constructor === Foo; // true
var a = new Foo();
a.constructor === Foo; // true 通过原型链找到constructor属性
{% endhighlight %}

> function本身不是constructor，但是当且仅当new使用时，function调用就变成了
> constructor调用

### Mechanics
{% highlight javascript %}
function Foo(name) {
    this.name = name;
}
Foo.prototype.myName = function() {
    return this.name;
};
var a = new Foo( "a" );
var b = new Foo( "b" );
a.myName(); // "a"
b.myName(); // "b"
{% endhighlight %}
上面的代码
1. this.name为每个对象增加了name属性
2. 为Foo.prototype增加了myName方法，a和b通过委托访问

#### constructor并不等于被创建

Foo.prototype有个属性constructor，对象实例就是这样通过委托访问构造方法的，因此
改变Foo.prototype可以使对象的constructor访问出错，原因是改变后Foo.prototype也找不到constructor属性了，只能继续委托Object.prototype也就是委托链的顶端，这次有了constructor属性指向内置的Object()方法。
{% highlight javascript %}
function Foo() { /* .. */ }
Foo.prototype = { /* .. */ }; // create a new prototype object
var a1 = new Foo();
a1.constructor === Foo; // false!
a1.constructor === Object; // true!
{% endhighlight %}

当然也可以重新添加constructor属性，使其不可枚举。
{% highlight javascript %}
function Foo() { /* .. */ }
Foo.prototype = { /* .. */ }; // create a new prototype object
// Need to properly "fix" the missing `.constructor`
// property on the new object serving as `Foo.prototype`.
// See Chapter 3 for `defineProperty(..)`.
Object.defineProperty( Foo.prototype, "constructor" , {
    enumerable: false,
    writable: true,
    configurable: true,
    value: Foo // point `.constructor` at `Foo`
} );
{% endhighlight %}

> 因此，像a.constructor这样的代码并不可靠，应该避免使用。

### 继承 (Prototypal) Inheritance
前面已经见过a继承Foo.prototype，获得myName的访问。但是继承应该是两个对象的关系，而不是类和实例之间的关系。

![继承][protoInheritance]

[protoInheritance]: img/prototypeInheritance.png "继承"

{% highlight javascript %}
function Foo(name) {
    this.name = name;
}
Foo.prototype.myName = function() {
    return this.name;
};
function Bar(name,label) {
    Foo.call( this, name );
    this.label = label;
}
// here, we make a new `Bar.prototype`
// linked to `Foo.prototype`
Bar.prototype = Object.create( Foo.prototype );
// Beware! Now `Bar.prototype.constructor` is gone,
// and might need to be manually "fixed" if you're
// in the habit of relying on such properties!
Bar.prototype.myLabel = function() {
    return this.label;
};
var a = new Bar( "a", "obj a" );
a.myName(); // "a"
a.myLabel(); // "obj a"
{% endhighlight %}

`Bar.prototype = Object.create( Foo.prototype );`这段创建了一个新的Bar.prototype对象，并连接到Foo.prototype对象上。
以下两种做法都是错误的
{% highlight javascript %}
// doesn't work like you want!
Bar.prototype = Foo.prototype;

// works kinda like you want, but with
// side effects you probably don't want :(
Bar.prototype = new Foo();
{% endhighlight %}

* 第一种没有创建一个新的对象供Bar.prototype连接，只是简单地引用Foo.prototype。当我们开始赋值时：`Bar.prototype.myLabel =`会影响其他引用Foo.prototype的对象。如果真的想这么做，还不如直接使用Foo而不是Bar。
* 第二种能工作，但是使用Foo的构造函数调用，如果这个函数有任何副作用，连接时就会出现。
* 使用`Object.create()`创建一个新对象，但是避免调用Foo

ES6 adds a Object.setPrototypeOf(..)
{% highlight javascript %}
// pre-ES6
// throws away default existing `Bar.prototype`
Bar.prototype = Object.create( Foo.prototype );
// ES6+
// modifies existing `Bar.prototype`
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
{% endhighlight %}

### 查看类之间的关系

想知道一个对象委托给哪个对象
{% highlight javascript %}
    function Foo() {
    // ...
    }
    Foo.prototype.blah = ...;
    var a = new Foo();
{% endhighlight %}

使用instanceof查看`a instanceof Foo; // true`，但问题是必须知道Foo，如果是两个对象实例a和b，就无法查看两者的关系了。

instanceof存在的问题，通过中间对象F，o1实际上跟F没有关系，但是却返回true。
{% highlight javascript %}
    function isRelatedTo(o1, o2) {
        function F(){}
        F.prototype = o2;
        return o1 instanceof F;
    }
    var a = {};
    var b = Object.create( a );
    isRelatedTo( b, a ); // true
{% endhighlight %}





