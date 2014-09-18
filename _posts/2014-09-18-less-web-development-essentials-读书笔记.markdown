---
layout: post
title:  "《Less Web Development Essentials》读书笔记"
date:   2014-09-18 16:48:40
categories: css less
---

# ch1 使用LESS提高开发效率

## css中的继承，层叠

层叠规则：

* 找出所有应用在元素和属性上的CSS声明
* 内联样式优先级最高，除了在属性后的`!important`增加声明的权重。之后检查声明者，用户比浏览器也就是默认的优先级高。
* 计算特性
* 如果多个规则有同样的优先级和特性，取最后定义的。

## css特性

内联样式有最高的特性。但是不利于修改。

选择器中的ID数目，如`#footer #leftcolumn {}`有两个ID。
要注意`div[id="unique"] {}`是属性，拥有0个ID。

类，伪类和属性的数目。

元素，伪元素的数目，如`#footer div a{}`有两个元素

## 使用flexbox布局

CSS3引入的新特性，响应式（不同分辨率屏幕动态改变），更灵活。

使用css
{% highlight css %}
div#wrapper {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flexbox;
    display: -ms-flex;
    display: flex;
}
{% endhighlight %}

使用Less`div#wrapper { .flex-display; }`

## 编译Less

客户端和服务端编译

开发中使用客户端编译，引入js文件。生产环境中应该使用服务端编译成css文件。

另外，在url后面加上`#!watch`可以不用刷新页面，修改less文件看到效果。原因是less.js会每隔1秒发送ajax请求取得最新的样式文件，然后编译成css文件插入head中。

## Debug

将全局对象`less = { env: 'development' };`在less.js引入之前声明，会阻止less进行浏览器缓存。打印语法错误。

## 浏览器前缀

* WebKit: -webkit
* Firefox: -moz
* Opera: -o
* Internet Explorer: -ms

## 圆角

{% highlight css %}
.roundedcornersmixin(@radius: 10px){
    -webkit-border-radius: @radius;
    -moz-border-radius: @radius;
    border-radius: @radius;
}
{% endhighlight %}

## css重置样式避免兼容性问题

传统的[Eric Meyer's CSS Reset](accessible at http://meyerweb.com/eric/tools/css/reset/)

HTML5的[Normalize.css](http://necolas.github.io/normalize.css/)

less使用`@import "normalize.less"`

## 创建背景渐变色

IE9之前不支持渐变，使用background-color作为默认方案
{% highlight css %}
.gradient (@start: black, @stop: white,@origin: left) {
    background-color: @start;
    background-image: -webkit-linear-gradient(@origin, @start, @stop);
    background-image: -moz-linear-gradient(@origin, @start, @stop);
    background-image: -o-linear-gradient(@origin, @start, @stop);
    background-image: -ms-linear-gradient(@origin, @start, @stop);
    background-image: linear-gradient(@origin, @start, @stop);
}
{% endhighlight %}

## transition transformation animation

第一个参数是要改变的属性，例如height,background-color,
第二个参数是时间，第三个是transition-time函数，有一些预定义的。
{% highlight css %}
.transition (@prop: all, @time: 1s, @ease: linear) {
    -webkit-transition: @prop @time @ease;
    -moz-transition: @prop @time @ease;
    -o-transition: @prop @time @ease;
    -ms-transition: @prop @time @ease;
    transition: @prop @time @ease;
}
{% endhighlight %}

## Box-sizing

使用`width:50%;float:left;`进行两栏布局

出现的问题，padding或者border会打乱布局。

默认值是content-box，宽度和高度分别应用到元素的内容框。在宽度和高度之外绘制元素的内边距和边框。

{% highlight css %}
// Box sizing mixin
.box-sizing(@boxmodel) {
    -webkit-box-sizing: @boxmodel;
    -moz-box-sizing: @boxmodel;
    box-sizing: @boxmodel;
}
// Reset the box-sizing
*,
*:before,
*:after {
    .box-sizing(border-box);
}
{% endhighlight %}

## 服务端编译less

命令行`npm install -g less`

`lessc styles.less styles.css`

## 压缩css

使用less命令行，有两种方式

* `-x`使用YUI CSS Compressor
* `--clean-css`使用clean-css，默认选项，速度更快。

# ch2 使用变量和mixin

## 注释

注释会在压缩过程中被去除，所以不用担心文件的大小。

`//`可以嵌套进`/**/`中

重要的注释如license不希望被去除，使用`/*! !*/`

## 变量

`@`打头

## 组织文件

将所有变量放在一个less文件中，便于集中修改。

## 转义值

less不会得到正确的值
{% highlight css %}
@aside-width: 80px;
.content {
    width: calc(100% - @aside-width)
}
{% endhighlight %}

编译成如下结果
{% highlight css %}
.content {
    width: calc(20%);
}
{% endhighlight %}

原因是calc在渲染阶段运行，将单位（百分号和像素）混合。

在less中转义值`width: ~"calc(100% - @{aside-width})"`

由于"aside-width"中有连字符，需要使用大括号包裹，当作字符串。

## Mixin

在less中，Mixin可以通过包含类的名字将这个类的所有属性嵌入到另一个类中。

可以传参数，设置默认值。

## 特殊的变量  @argument @rest

{% highlight css %}
.setmargin(@top:10px; @right:10px; @bottom: 10px; @left 10px;){
    margin: @arguments;
}
p{
    .setmargin();
}
{% endhighlight %}

## 改变mixin的行为

### switch

{% highlight css %}
.color(light)
{
    color: white;
}
.color(dark)
{
    color: black;
}
{% endhighlight %}

### 参数匹配

同名Mixin匹配参数个数

### Guard

同名且参数数目也相同的mixin，使用when来判断参数

{% highlight css %}
mixin(@a) when (@<1){
    color: white;
}
mixin(@a) when (@>=1){
    color: black;
}
.class {
    mixin(0);
}
.class2 {
    mixin(1);
}
{% endhighlight %}

在判断条件中可以包含内置函数如`is_color`

### 使用guard和参数匹配构建循环

{% highlight css %}
.setbackground(@number) when (@number>0){
    .setbackground( @number - 1 );
    .class@{number} { background-image: ~"url(backgroundimage-
        @{number}.png)"; }
}
.setbackground(10);
{% endhighlight %}

### !important关键字

在`.mixin()`后加上最高优先级，超越内联样式。

# ch3 嵌套规则，操作和内置函数

## 命名空间

和ID选择器语法一样
{% highlight css %}
    #namespace {
        .nav(){
            li{
                width:100%;
            }
        }
    }
    #sidebar {
        ul{
            #namespace > .nav;
        }
    }
{% endhighlight %}

## &符号

当前选择器的父元素，常用于伪类选择
{% highlight css %}
.clearfix() {
    &:before,
    &:after {
        content: " "; /* 1 */
        display: table; /* 2 */
    }
    &:after {
        clear: both;
    }
}
{% endhighlight %}

extend伪类是less加入的，如果不加上all关键字，hover伪类不会被继承
{% highlight css %}
.hyperlink{
    color: blue;
    &:hover {
        color: red;
    }
}
.other-hyperlink:extend(.hyperlink all){};
{% endhighlight %}

## 属性合并

CSV:以逗号分隔的值，如font-family。`+`表示合并。

{% highlight css %}
.alternative-font()
{
    font-family+: Georgia,Serif;
}
.font()
{
    font-family+: Arial;
    .alternative-font;
}
body {
    .font;
}
{% endhighlight %}

## 内置函数

内置函数可以在mixin内操作less的值，也可以在guard表达式中使用。

[函数列表](http://lesscss.org/functions/)

## javascript

可以使用js的函数，但是未来版本可能不支持。

{% highlight css %}
    @max: ~"`Math.max(10,100)+'px'`";
    p {
        width: @max;
    }
{% endhighlight %}

避免使用js，因为使用其他语言编写的less编译器就不能解析。

## list函数

extract和length可以用于循环。取出列表中的元素和返回列表长度。

使用[Font Awesome](http://fontawesome.io/ for more information):可伸缩的向量图标，用css操作。并且只要一次HTTP请求就能加载所有图标。

引入样式
{% highlight html %}
<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
{% endhighlight %}

通过class引入对应图标
{% highlight html %}
<i class="fa fa-camera-retro"></i> fa-camera-retro
{% endhighlight %}

也可以不用class，使用before伪类选择器
{% highlight css %}
i:before {
    font-family:'FontAwesome';
    content:"\f083";
}
{% endhighlight %}

[全部的图标和css content的对应](http://astronautweb.co/snippet/font-awesome/)

构建循环，`\00a0`是图标和链接之间的空格，`e()`是字符串函数，等价于`~""`
{% highlight css %}
@icons: "\f007","\f004","\f108","\f112","\f072","\f17c";
.add-icons-to-list(@i) when (@i > 0) {
    .add-icons-to-list((@i - 1));
    @icon_: e(extract(@icons, @i));
    li:nth-child(@{i}):before {
        font-family:'FontAwesome';
        content: "@{icon_}\00a0";
    }
}
.add-icons-to-list(length(@icons));
{% endhighlight %}

创建超链接和图标的关系，如href包含linux的a
{% highlight css %}
    #content a[href*="linux"]:before {
        font-family:'FontAwesome';
        content: "\f17c\00a0";
    }
{% endhighlight %}

## color函数

{% highlight css %}
.selector {
    color1: rgb(32,143,60);
    color2: rgba(32,143,60,50%);
    color3: hsl(90, 100%, 50%);
}
{% endhighlight %}

## darken和lighten函数

## box-shadow mixin

{% highlight css %}
.box-shadow(@style, @c) when (iscolor(@c)) {
    -webkit-box-shadow: @style @c;
    -moz-box-shadow: @style @c;
    box-shadow: @style @c;
}
.box-shadow(@style, @alpha: 50%) when (isnumber(@alpha)) {
    .box-shadow(@style, rgba(0, 0, 0, @alpha));
}
{% endhighlight %}

# ch4 避免重新发明轮子

## style guide

`npm install -g styledocco`

在less文件中添加markdown描述，包含描述和html代码

`styledocco -n "Less Web Development Essentials Styleguide" less/*`

在doc文件夹下生成style guide

## 预建立的mixin

很多类库建立了Mixin

* [Less Elements](http://lesselements.com)
* [Less Hat](http://lesshat.madebysource.com/)
* [3L](http://mateuszkocz.github.io/3l/)
* [ClearLess](http://clearleft.github.com/clearless/)
* [Preboot](http://markdotto.com/bootstrap/)

可以使用命名空间

{% highlight css %}
    #{library-name}{@import "{library-name}";}
{% endhighlight %}

# ch5 集成less到项目中

## 使用@import规则

这里的keyword可以使用以下规则reference, inline, less, css, once和multiple。
{% highlight css %}
    @import (keyword) "filename";
{% endhighlight %}

reference规则：只是使用filename的mixin和类，不会将它们编译进结果css文件中。

## 媒体查询和响应式设计

小于500px时取消浮动，取消1/3宽度
{% highlight css %}
    #sidebar {
        width: 1 / 3 * 100%;
        float:right;
        @media (max-width:500px) {
            width:100%;
            float:none;
        }
    }
{% endhighlight %}

### 检测在手机中的布局

{% highlight html %}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
{% endhighlight %}

### 首先为手机编码

首先为手机编写css，然后使用媒体查询改变样式以适应更大的屏幕。

元素默认堆叠，当屏幕变大时才会水平显示
{% highlight css %}
@media (min-width:501px) {
    float: left;
    width: ((@basic-width/3)-@footer-gutter);
}
{% endhighlight %}

## 使用栅格

好处是方便还原设计到最终的实现。同样适合响应式设计，因为栅格的宽度可以重新调整。

前面介绍过的flex box和column可以使用，但是大多数浏览器还不支持。

栅格的宽度可以定义成百分比或者固定宽度。

流动栅格定义宽度为一个百分比，随屏幕宽度改变，但是设计者不能精确控制实际宽度。所以，大多数响应式栅格使用流动和固定栅格的混合版。

### css float在栅格中的作用

{% highlight css %}
@grid-container-width: 100%;
@column-number: 2;
.container {
    width: @grid-container-width;
    .row {
        .col {
            float: left;
            width: (@grid-container-width/@column-number);
        }
        .col2{
            width: 100%;
        }
    }
}
{% endhighlight %}

### 使栅格响应式

定义屏幕宽度的断点，还是首先定义手机的样式

{% highlight css %}
@grid-container-width: 100%;
@column-number: 2;
@break-point: 768px;
.container {
    width: @grid-container-width;
    .row {
        clear: both;
        .col, .col2 {
            width: 100%;
        }
        @media(min-width: @break-point) {
            .col {
                float: left;
                width: (@grid-container-width/@column-number);
            }
        }
    }
}
{% endhighlight %}

### clearfix的作用

为`.row`应用clearfix样式，确保元素只在row上浮动。

## 使用更加语义化的策略

很多css框架如bootstrap，ZURB Foundation实现自己的栅格系统。批评者认为打破了HTML5的语义。甚至和以前使用table进行布局的做法进行类比。

HTML5定义了很多语义化的标签如header

使用mixin而不是类可以将栅格变得更加语义化。
{% highlight css %}
.make-columns(@number) {
    width: 100%;
    @media(min-width: @break-point) {
        float: left;
        width: (@grid-container-width* ( @number / @grid-columns ));
    }
}
/* variables */
@grid-columns: 12;
@grid-container-width: 800px;
@break-point: 768px;

header,footer,nav{.make-columns(12);}
main{.make-columns(8);}
aside{.make-columns(4);}
{% endhighlight %}

## 使用栅格类建立布局

使用循环和之前的"make-column"mixin定义栅格类
{% highlight css %}
.make-grid-classes(@number) when (@number>0) {
    .make-grid-classes(@number - 1);
    .col-@{number} {
        .make-columns(@number);
    }
}
.make-grid-classes(12);
{% endhighlight %}

## 建立嵌套的栅格

{% highlight css %}
section#content {
    .make-columns(8);
    div.content-column {
        .make-columns(4);
    }
}
{% endhighlight %}

# ch6 Bootstrap

## Bootstrap的less文件

查看Gruntfile.js发现编译成两个css文件：bootstrap.css和theme.css

bootstrap.less文件由四部份组成

* Core variables and mixins
* Reset
* Core CSS
* Components

## 自定义按钮样式

找到buttons.less文件
{% highlight css %}
.btn-default {
    .button-variant(@btn-default-color; @btn-default-bg; @btn-default-border);
}
{% endhighlight %}

通过改变mixin的参数。
{% highlight css %}
.btn-colored {
    .button-variant(blue;red;green);
}
{% endhighlight %}

可以将自定义的css代码放入custom.less文件中，然后在custombootstrap.less中引入两个
{% highlight css %}
@import "bootstrap.less";
@import "custom.less";
{% endhighlight %}

有时候只需要使用bootstrap的button样式
{% highlight css %}
@import (reference) "bootstrap.less";
.btn:extend(.btn){};
.btn-colored {
    .button-variant(blue;red;green);
}
{% endhighlight %}

## bootstrap主题

### 1pxdeep

[1pxdeep](http://rriepe.github.io/1pxdeep/)可视化选择色彩主题。

### 使用bootstrap的自定义工具

