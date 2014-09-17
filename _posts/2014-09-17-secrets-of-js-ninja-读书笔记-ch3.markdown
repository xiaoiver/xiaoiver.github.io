---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch3"
date:   2014-09-17 10:02:40
categories: js jquery
---

## ch3

### 函数作为first-class对象

对象有以下能力：
* 可以被分配给变量，数组的成员，其他对象的属性
* 当做参数传给函数
* 当做函数返回值
* 拥有可以被动态创建和分配的属性

function都有，所以first-class object

### 浏览器事件循环

程序中编写事件处理器，但是事件出现的时间和顺序都是不确定的，所以叫做“异步”调用处理器。

事件类型：

* 浏览器事件，例如页面加载完成
* 网络事件，例如ajax请求的响应
* 用户事件，鼠标点击，移动，按键
* 定时器事件，定时到期，间隔时间触发

`window.onload = function() { /* do something wonderful */ };`
当然也可以使用`<body>`的onload属性，但是这样违背了非侵入式js的原则。

### 作用域和函数

function可以在声明前引用,变量不可以

scope是由function定义的，而不是诸如if block
```javascript
if (window) {
    var x = 213;
}
alert(x); //213
```

调用function的四种方式：

1. 直接调用function
2. 对象中的method
3. 作为对象的构造函数当对象被创建时调用
4. apply,call

向function传参数时，不足的参数赋值undefined，多余的不会报错，也不会赋值。

所有对function的调用都会传递两个隐式变量arguments 和 this

arguments变量有length属性，能通过下标取得某一个参数，但是它并不是一个array，不能通过array的方法使用它。

this是java中的概念，但是指向的对象根据调用function方法的不同

function的调用方法：

1. 直接调用中function的上下文是全局上下文window对象
2. 通过对象method使用时，上下文是owner对象，通过this指向
```javascript
var o = {};
o.whatever = function(){};
o.whatever();
```
3. constructor:通过new调用构造函数。
`function creep(){ return this; }`

`new creep();`虽然能用，但是这样不合适，因为有显式的返回值，我们想得到对象本身

当对象的构造函数被调用后，发生3件事：
1. 一个空的对象被创建了
2. 这个对象被传递给了构造函数，通过this指向，成为构造函数的上下文
3. 如果没有显式的返回值，这个对象将作为构造函数的返回值

直接通过function调用一个对象的构造函数是不好的，虽然合法
`var whatever = Ninja();` this指向的是window对象而非创建的对象
```javascript
function Ninja() {
    this.skulk = function() { return this; };
}
var ninja1 = new Ninja();
var ninja2 = new Ninja();
assert(ninja1.skulk() === ninja1,
    "The 1st ninja is skulking");
assert(ninja2.skulk() === ninja2,
    "The 2nd ninja is skulking");
```
为了区分，一般构造方法首字母大写

4. apply和call
目的：向方法传递任意上下文。
apply两个参数，上下文对象和array参数列表，call直接传递参数，没有列表。
常用在callback函数中。
