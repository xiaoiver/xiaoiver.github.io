---
layout: post
title:  "《Pro Css Techniques》读书笔记"
date:   2014-10-12 09:40:40
categories: css
---

# ch3 特性和层叠

## after/before伪元素

在段落前后添加中括号，不影响html标记
{% highlight css %}
p.note:before {
    content:"[";
}
p.note:after {
    content:"]";
}
{% endhighlight %}

打印样式中对于链接，希望在链接文本后面显示地址
{% highlight css %}
a[href^='http://']:after {
    content:" [" attr(href) "]";font-size:90%;
}
{% endhighlight %}

列表中显示特殊字符如箭头
{% highlight css %}
ul li {
    list-style:none;margin:0;text-indent:-1em;
}
ul li:before {
    content:"\2192 \0020";/*箭头和空白*/
}
{% endhighlight %}

## 层叠，计算特性

[css2.1规定的层叠顺序](http://www.w3.org/TR/CSS21/cascade.html#cascading-order)

计算特性，!important>内联样式>id>类伪类>元素伪元素

特性相同，最后出现的覆盖之前的。

# ch4 浏览器

## ie6存在的问题

### 盒模型

在ie的错误盒模型实现中，width包括了margin，padding和border。会使盒变得更窄。而正常的实现中，width只是内容的宽度。

ie6有两种渲染模式：标准模式(standard compliance mode)和奇怪模式(quirk mode)。前者使用正确的盒模型实现，后者使用错误的实现。两种模式通过DOCTYPE区分，应用严格的DOCTYPE会使用标准模式。所以推荐使用。

### 对hover伪元素的支持

ie只支持对`<a>`应用hover伪元素。想在表格中高亮显示某一行，只能通过js实现。

### 缺少对fixed的支持

当做`display:static`显示。

### 对PNG图片不完全支持

alpha通道透明度。

# ch5 管理css文件

## 样式的快捷属性

[所有支持快捷方式的属性](www.dustindiaz.com/css-shorthand/)

{% highlight css %}
background-color: #dfdfdf;
background-image: url('/img/background.png');
background-position: 15px 5px;
background-repeat: repeat-x;

background: #dfdfdf url('/img/background.png') 15px 5px repeat-x;
{% endhighlight %}

## 注释

使用TODO,BUG等标识
{% highlight css %}
/* TODO: The h1s need further styling, but this gets us started. */
h1 {
    color: #333
}
{% endhighlight %}

对元数据注释
{% highlight css %}
/* -------------------------------------
Filename: base.css
Title : Primary CSS file for jeffcroft.com
Author : Jeff Croft, jeff@jeffcroft.com
URL : http://media.jeffcroft.com/css/base.css
--------------------------------------- */
{% endhighlight %}

列出所有使用的变量，类似LESS的变量概念
{% highlight css %}
/* ---------------------------------------
Main Purple: #50017C
Lighter Purple: #732799
Accent Orange: #ff8800
Accent Green: #99cc00
Accent Blue: #6699cc
Beige: #A5A48C
Light Beige: #C7C3B3

Serif fonts: Georgia, "Times New Roman", serif
Sans-serif fonts: Verdana, Arial, Helvetica, sans-serif
---------------------------------------- */
{% endhighlight %}

表示段落，便于查找
{% highlight css %}
/* ----------------------------------------------------------------------------
   NAVIGATION STYLES
   ----------------------------------------------------------------------------- */

/* =NAVIGATION STYLES */
{% endhighlight %}

## reset

引入
`@import url("reset.css");`

# ch6 hack和替代方法

## ie条件注释

其他浏览器会忽略
{% highlight html %}
<!--[if lte IE 6]>
    <link rel="stylesheet" type="text/css" href="css/IEhacks.css" />
<![endif]-->
{% endhighlight %}

## * html

`* html`其他浏览器或者标准中都不支持这种选择器。
{% highlight css %}
* html body {
    background-image:none;
}
{% endhighlight %}

## Holly hack

以发现者命名。给一个非常小的height触发hasLayout。由于IE中存在的另一个Bug，这个很小的height会被浏览器忽略，高度会被内容撑开。另外，Mac下的ie不存在layout问题，所以需要过滤掉。
{% highlight css %}
/* Hides from IE5-mac \*/
    * html .floatcontainer { height:1%; }
/* End hide from IE5-mac */
{% endhighlight %}

[IE/Mac Filter](http://stopdesign.com/archive/2004/07/06/filtering-css.html)

[IE hasLayout属性](www.satzansatz.de/cssd/onhavinglayout.html)

## 清除浮动

在导航条的实现中，每个li向左浮动后，发现父元素ul没有被撑开。可以通过在ul最后添加div元素清除左右浮动达到撑开效果，但是添加html不够优雅。可以使用after伪元素，效果是一样的。这样只需要在ul上应用clearfix类即可。
{% highlight css %}
    .clearfix:after {
        content:".";/*为空也一样*/
        display:block;
        height:0;
        clear:both;
        visibility:hidden;
    }
    /* Hides from IE-mac \*/
        * html .clearfix { height:1%; }
    /* End hide from IE-mac */
{% endhighlight %}

## 水平居中

想让wrapper水平居中
{% highlight html %}
    <body>
        <div id="wrapper">
        ...
        </div>
    </body>
{% endhighlight %}

ie6中`text-align:center;`即可实现居中，但是包括文字图片也会继承居中。所以wrapper需要恢复左对齐。对于其他浏览器，通过左右外边距auto就能居中。
{% highlight css %}
    body {
        text-align:center;
        min-width:800px;
    }
    #wrapper {
        margin:0 auto;
        width:800px;
        text-align:left;
    }
{% endhighlight %}

# ch7 css布局

## liquid布局

使用百分比，左侧25%，右侧75%。注意增加浮动元素的border哪怕是1px也会产生错误的效果，会被挤到下一行。最好保证加起来不足100%。

## elastic布局

改变浏览器字体大小，元素大小随之改变。

首先需要设置一个基准。大多数浏览器默认的字体大小是16px。为了方便计算，可以化成10单位。这样其他元素可以以此为基准，如2em就代表20px。
{% highlight css %}
    body {
        font-size:62.5%;
    }
    h1 {
        font-size:2em
    }
    #wrapper {
        font-size:1.4em;
        width:56em;
        margin:10px auto;
        text-align:left;
        background:#dade75;
        border:1px solid silver;
    }
{% endhighlight %}

为了防止字体太大元素宽高也变得太大，使用`max-width:25%;`进行限制。

## 响应式布局

随浏览器窗口大小改变布局发生改变

## 负margin

右侧固定宽度200px，需要左侧满足100% -200px的宽度。可以使用负margin实现。
[negativemargins](http://alistapart.com/articles/negativemargins)

# ch9 字体

## line-height

每行上下都有2px的空间。也可以是负的，如果line-height为8px，可能会覆盖在一起。
{% highlight css %}
    p {
        font-size: 10px;
        line-height: 14px;
    }
{% endhighlight %}

当line-height缺少单位如px时。代表倍数。

## kerning

{% highlight css %}
p {
    letter-spacing: -.05em;
}
{% endhighlight %}

# ch10 table

## border

border有两种模型collapsed和separate。后者是大多数浏览器的默认样式，cell之间有空隙。
{% highlight css %}
    table {
        width: 90%;
        margin: 0 auto;
        font-family: Lucida Grande, Verdana, Helvetica, Arial, sans-serif;
        font-size: .9em;
        line-height: 1.4em;
        border-collapse: collapse;
    }
    th {
        text-align: left;
        border-bottom: 1px solid #000;
    }
    td {
        color: #333;
        border: 1px solid #ccc;
    }
{% endhighlight %}

应用了collapse模型后，有如下规则

* table元素没有padding，这意味着表格的边框和最外层的cell之间没有空间。
* cell row col都可以有border
* 相邻的cell只会显示一边的border
* 如果相邻的cell边框border-style不同，取优先级高的。优先级是hidden, double, solid, dashed, dotted, ridge, outset, groove, inset, none
* 如果style和宽度相同，但是颜色不同。按元素优先级cell, row, row group, column, column group, table。取决于浏览器。

## 斑马纹效果

定义odd，even类，css3中使用nth选择器
{% highlight css %}
    tr.odd {
        background-color: #dfdfdf;
    }
    tr:nth-child(odd) {
        background-color: #dfdfdf
    }
{% endhighlight %}

## caption样式

{% highlight css %}
    caption {
        caption-side: bottom;
        line-height: 4em;
        font-family: Georgia, "Times New Roman", serif;
        font-size: .85em;
        font-style: italic;
    }
{% endhighlight %}

# ch11 表单

{% highlight css %}
    label {
        display: block;
        float: left;
        clear: left;
        width: 9em;
        padding-right: 1em;
        text-align: right;
        line-height: 1.8em;
    }
{% endhighlight %}

# ch12 列表

重置ul li默认样式
{% highlight css %}
    #tablinks ul,#tablinks li {
        padding:0;
        margin:0;
        list-style:none;
    }
{% endhighlight %}

自定义
{% highlight css %}
    li {
        list-style-image:url(bullet.gif);
    }
{% endhighlight %}