---
layout: post
title:  "《Web Development Recipes》读书笔记"
date:   2014-10-12 09:40:40
categories: webrecipes
---

## r10 js模板引擎mustache
handlebars语法类似mustache，`{{}}`表示变量值，`{{{}}}`表示不转义html字符。

## r11 滚动实现分页
QEDServer 测试用服务器，包括products初始数据。

api类似`http://localhost:8080/products.json?page=2`

## r12 维持状态的ajax
ajax请求不能保证浏览器地址发生改变。回退和分享链接无法正常工作。例如前面实现的滚动分页，滚动时地址不变。

HTML5提供了pushState方法，能够不跳转页面改变地址栏地址。

## r16 Highchart

## r18 通过JSONP访问跨站数据
和JSON不是一回事，跟ajax没有关系，虽然jquery把它归入ajax。

通过script元素可以跨域请求，将回调函数名传到服务端，服务端将数据包裹在这个函数中，返回字符串到客户端，这个函数就被执行了。

## r19 widget

## r21 手持设备
css media query在html4和css2时就有，CSS3中进行了扩展，加入device-width/height属性。

media中指明最大宽度为480像素才会使用这个样式表，
增加元标签viewport控制内容在手持设备上的展示方式。因为手持设备的浏览器默认会展示全貌，用户需要放大才能看清。
{% highlight html %}
    <link rel="stylesheet" type="text/css" href="iPhone.css"
    media="only screen and (max-device-width: 480px)">
    <meta name="viewport"
        content="width=device-width;
            height=device-height;
            maximum-scale=1.4;
            initial-scale=1.0;
            user-scalable=yes"/>
{% endhighlight %}

## r24 jquery Mobile
[在线测试](http://testiphone.com/)

## r25 使用css sprite
background-image后两个参数是图片的x,y坐标

## r26 使用栅格系统进行快速响应式设计
[Skeleton](http://getskeleton.com)

查看skeletion.css，将居中的960px的container分成16列。

每一列`float: left; display: inline;`，固定宽度

当屏幕小于480px时，每一列宽度都是420px，堆叠显示。

## r27 使用jekyll创建blog
[jekyll](http://jekyllrb.com/)

`_layouts`文件夹下存放布局文件，post通过文件名引用
{% highlight javascript %}
---
layout: base
---
{% endhighlight %}

`_posts`文件夹下的post按照时间命名，如"2014-08-20-my-post.markdown"

使用`jekyll build`，这样`_posts`文件夹下的文件会被移到新建的`_site`并按照时间分类，放入对应的年月日文件夹下。

`jekyll server`启动

## r28 sass
安装`gem install sass`

可以创建两个文件夹sass存放编译前的scss文件，css文件夹存放编译后的。

输入和输出文件夹`sass --watch sass:css`

定义变量`$button_background_color: #A69520;`

引入样式文件`@import "buttons.scss";`

定义函数
{% highlight css %}
@mixin rounded($radius){
    border-radius: $radius;
    -moz-border-radius: $radius;
    -webkit-border-radius: $radius;
}
{% endhighlight %}

使用函数`@include rounded(12px);`

使用嵌套来减少重复
{% highlight css %}
a{
    color: #300;
    &:hover{
        color: #900;
    }
}
{% endhighlight %}

浏览器前缀
{% highlight css %}
@mixin shadow($x, $y, $offset, $color){
    @each $prefix in "", -moz-, -webkit-, -o-, -khtml- {
        #{$prefix}box-shadow: $x $y $offset $color;
    }
}
{% endhighlight %}

## r29 coffeescript

## r32 跟踪用户行为

[ClickHeat](http://www.labsmedia.com/clickheat/index.html)