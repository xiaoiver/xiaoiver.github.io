---
layout: post
title:  "《Responsive Design》读书笔记"
date:   2014-11-30 13:35:40
categories: responsive css javascript
---

# ch1

[各种设备的viewport宽度](http://viewportsizes.com)

[Awwwards给网站颁奖](https://www.awwwards.com/websites/responsive-design/)

HTML5简化doctype声明的原因，HTML在标准化的过程中，不同浏览器会不断添加新特性，不用改变doctype。

## 新的元标签

viewport的元标签，最早由手机上的Safari提出。content是用逗号分隔的键值对。
还包括user-scalable，设置为no可以禁止用户缩放，不建议这么做。
另外还有maximum-scale，也不建议设置。
{% highlight html %}
    <meta name="viewport" content="width=device-width, initial-scale=1">
{% endhighlight %}

对于一个非响应式的网站，如宽度为980px居中，可以设置`width=1024`让两边留白。
对于响应式网站，设置成`width=device-width`有两个原因：首先，设计CSS时针对viewport的宽度设计，肯定希望viewport宽度等于设备宽度。其次，告诉设备这个站点是为手机优化的，无需按照默认的视口加载页面。

Apple touch icon，当用户保存网页到主屏幕时应用的图标。
{% highlight html %}
<link rel="apple-apple-icon" href="apple-icon-iphone.png">
<link rel="apple-apple-icon" sizes="76x76" href="apple-icon-ipad.png">
<link rel="apple-apple-icon" sizes="120x120" href="apple-icon-iphone-retina.png">
<link rel="apple-apple-icon" sizes="152x152" href="apple-icon-ipad-retina.png">
{% endhighlight %}

## Shim

一些HTML5的polyfills

* [Respond.js](https://github.com/scottjehl/Respond) 为IE6-8提供CSS3 min/max-width媒体查询
* [HTML5 Shiv](https://github.com/aFarkas/html5shiv) HTML5语义标签
* [CupCake.js](http://www.rivindu.com/p/cupcakejs.html) localStorage和sessionStorage
* [FlashCanvas](http://flashcanvas.net)基于Flash的HTML5 Canvas [一个很有趣的例子](http://flashcanvas.net/examples/www.chiptune.com/kaleidoscope/)

# ch2

[作者的Blog](www.jonathanfielding.com)

# ch3 媒体查询

## 媒体类型

CSS2中引入了媒体类型，建议针对不同类型的样式合并在同一个样式表中，减少HTTP请求。另外，有些浏览器会等待print样式表下载完毕后才开始渲染，尽管如手机浏览器都用不到。

## 媒体查询的属性

使用width而不是device-width的好处是，在桌面浏览器调整大小时，就能进行测试，因为device-width不会变。而且，在meta标签中设置了width=device-width，只要对width进行媒体查询就行了。

height可以用在以下场景：调整内容以适应用户最佳可见。

aspect-ratio长/宽，可以调整如视频的最佳分辨率。

orientation横向竖向

resolution支持三种单位：

* dpi dots/CSS 英寸
* dpcm dots/CSS 厘米
* dppx dots/像素单位，1dppx = 96dpi

## 媒体查询语法

在CSS中使用
`@media (not/only) screen and (max-width: 700px) and (...)`

## 高像素密度

推荐使用dppx，如果使用dpi，Chrome会给出警告，因为dpi中CSS英寸和屏幕实际英寸不同。由于部分浏览器的实现使用设备的实际分辨率而不是CSS resolution，另外有些没有实现dppx，只能用dpi。
考虑兼容性的高像素密度设备检测：
{% highlight css %}
    @media only screen and (-webkit-min-device-pixel-ratio: 2),
    only screen and (-o-min-device-pixel-ratio: 2/1),
    only screen and (-moz-min-device-pixel-ratio: 2),
    only screen and (min-device-pixel-ratio: 2),
    only screen and (min-resolution: 192dpi),
    only screen and (min-resolution: 2dppx) {
    /* High resolution styles here */
    }
{% endhighlight %}

可以对高像素密度设备使用高清图片。

# ch4 流式布局

## 布局类型

### 固定宽度

大多使用960px，因为960能被3,4,5,6,8,10,12,15整除，方便划分。

优点是图片能完美适应固定宽高。缺点：需要针对手机开发新页面。

### 弹性布局

使用em而不是px度量宽度。em和font-size相关。如果设置font-size为16px，那么2em就是32px。

如果用户不改变字体大小，还是固定宽度布局。另外，em相对父元素字体大小计算，如果父元素定义的大小和body不同，得不到想要的宽度。使用rem相对body计算，忽略父元素，但是旧浏览器又不支持。

### 流式布局

使用百分比。大屏幕显示更多内容。

关键原则：

* 不使用固定高度
* 不要水平滚动条
* 考虑图片大小
* 考虑包裹内容
* 考虑内容间的空白
* 文本

### 不使用固定高度

因为内容大小会改变。

利用CSS制造假的分栏效果，设置容器的背景颜色，可以使用线性渐变达到多栏的效果。
{% highlight css %}
.col-container{
    background: linear-gradient(to right, #000000 0%,#000000 33%,#a0a0a0 33%,#a0a0a0 66%,#a0a0a0 66%,#707070 66%);
    color: #fff;
}
{% endhighlight %}

使用JavaScript使所有栏达到同样的高度：IE9以上才支持getElementsByClassName，相关的[polyfill](https://gist.github.com/eikes/2299607)
{% highlight javascript %}
    var columns = document.getElementsByClassName('col'),
        height = 0;
    for (var i = 0; i < columns.length; i++) {
        if(height < columns[i].clientHeight){
            height = columns[i].clientHeight;
        }
    }
    for (var i = 0; i < columns.length; i++) {
        columns[i].style.height = height + "px";
    }
{% endhighlight %}

但是每次窗口大小改变需要重新计算：监听window的resize事件，而且每次重新计算前都要重置所有栏的高度到auto。

### 不使用水平滚动条

图片是直接放在img标签中，还是使用CSS定义background-image属性。
关于background-size属性，有4种取值，分别是高度宽度（只有一个值时，第二个为auto），高度宽度（父元素的百分比），cover（图片覆盖背景区域，图片可能显示不全），contain（最大宽高适应）。

对img标签的缩放，通过`max-width:100%;`使图片超过容器宽度时缩放到容器宽度，不足时保持原宽度。_响应式加载图片_似乎是更高的方案，根据视口宽度断点加载不同尺寸的图片。

对background-image的缩放，使用CSS3 background-size属性。使用容器元素包裹，
width可以设置为百分比，而高度却没办法，又要保持一致的宽高比。padding的百分比值是相对父元素宽度的，利用这点来设置高度。最后设置background-size使图片达到容器元素的宽高。
{% highlight css %}
    .image{
        width: 100%;
        position: relative;
        padding-bottom: 125%;
        background: url(scalableimage.jpg) 0 0 no-repeat;
        background-size: 100% 100%;
    }
{% endhighlight %}

### 考虑内容的大小

比如侧边栏占25%，在视口宽度只有320px的情况下，只有80px，就不用维持原本的结构，如左侧浮动，可以和主内容堆叠。

### 考虑空白

如果内容width为100%，再加上左右30px的padding，就会出现水平滚动条。

ie中的quirk mode，不声明doctype就会使用。
width/height包括了内容，padding和border。对于开发者反而很方便，利用padding就能实现内容间的空白，但是总不能让页面强制进入quirk mode。
在CSS3中，使用box-sizing指定盒模型的工作方式。

* content-box width/height只包括内容，是默认的CSS标准。
* padding-box 包括了padding但不包括border。
* border-box 等于quirk mode 重置样式时应用全部元素，要加上浏览器前缀。

{% highlight css %}
* {
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box; /* Firefox, other Gecko */
    box-sizing: border-box; /* Opera/IE 8+ */
}
{% endhighlight %}

### 考虑文本行距

由于在大尺寸屏幕，一行内容过多，影响阅读。这也是报纸分栏的原因，换行方便。
使用max/min-width控制。

## 使用CSS Grid

gutter就是column之间的距离，通过padding实现。缺点是直接对column设置背景会使gutter也显示。解决方法是对column内部元素设置背景。
{% highlight css %}
    [class*="col-span"] {
        box-sizing: border-box;
        padding-left: 15px;
        padding-right: 15px;
    }
{% endhighlight %}

定义column，手机也就是小屏幕优先，这样媒体查询可以覆盖。
{% highlight css %}
    [class*="col-span"]{
        float: left;
    }
    .sm-col-span-1{
        width: 25%;
    }
    .sm-col-span-2{
        width: 50%;
    }
    @media screen and (min-width: 768px){
        .lg-col-span-1{
            width: 25%;
        }
        .lg-col-span-2{
            width: 50%;
        }
    }
{% endhighlight %}

定义row，由于column是浮动元素脱离了页面流，前后的元素就看不到了，需要清楚浮动。
{% highlight css %}
    .row:after{
        content: ' ';
        clear: both;
        display: block;
    }
{% endhighlight %}

最后定义wrapper，包裹所有的row，主要是设置左右padding。

在应用中，考虑每行包含的文字数量，对wrapper设置max-width并通过margin居中。

# ch5 流行的框架

## Grid框架

[Fluidable](http://fluidable.com/) LESS编写，更改变量如gutter，列数都非常方便。

[CSS Smart Grid](http://dryan.github.io/css-smart-grid/) Sass编写，不需要额外的JS文件作为polyfill就支持IE8，使用了html条件注释类，对IE8提供默认的960px。

[csswizardry-grids](http://csswizardry.com/csswizardry-grids/) Sass编写，对column使用inline-block而不是float。坏处是列之间不能有空白，可以通过使用HTML注释或者相邻div紧接着写。而好处是可以通过HTML的dir属性改变阅读方向，从右到左，并且不需要清除浮动。
{% highlight html %}
    <div class="one-half">
        lorem ipsum
    </div><!--
    --><div class="one-half">
        lorem ipsum
    </div>
{% endhighlight %}

## CSS框架

Bootstrap

### 基于Bootstrap的第三方组件

[Fuel UX](http://exacttarget.github.io/fuelux/)

# ch6 改造已经存在的页面

## 已有的样式表和JS脚本

移除没用到的样式规则。Firefox插件Dust-Me Selectors。

即使使用CSS隐藏图片，浏览器还是会下载，只有对想要隐藏的图片元素的父元素应用display:none才能使浏览器不去下载图片。

## 定义断点

# ch7 工具和工作流

# ch8 用户体验

## 内容优先级

使用flex，至少IE10以上支持。

声明容器，direction取值可以使row，column，row-reverse，column-reverse
`display: flex;flex-direction: column;`

这样容器中的子元素都是flex item，通过order控制优先级。

## 模态对话框

手持设备浏览器不完全支持，因为通过fixed定位实现。[研究](http://bradfrostweb.com/blog/mobile/fixed-position)。可以通过JS实现固定定位。

另外，对话框内容过长，用户需要滚动，在手机上不方便操作，有些浏览器只有滚动时才出现滚动条，导致用户不知道内容是可以滚动的。关闭也不方便。

因此，在图片长廊这样的应用场景中，在大屏幕上点击小图弹出对话框展示大图，在小屏幕上点击小图打开新窗口，这可以通过JS实现。

## Tab页

小屏幕没位置显示太多Tab标题，可以转成accordion，利用全部屏幕宽度。

## 下拉菜单

由于手机无法实现hover，Bootstrap中完全放弃下拉菜单的hover，通过click/tap打开关闭菜单。

## 视差滚动Parallax

也使用了position:fixed，会有兼容性问题。另外，桌面浏览器onscroll事件会在滚动中持续触发，而手机浏览器只有用户停止滚动才会触发onscroll事件。

background-attachment属性scroll默认，fixed不会随页面其余部分滚动。

background-position取值水平，垂直top/center/bottom，
left/center/right或者百分比或者px。主要通过这个属性，在scroll事件处理器中改变垂直高度。

[例子](http://www.ok-studios.de/home/)
[教程](http://ianlunn.co.uk/articles/recreate-nikebetterworld-parallax)

# ch9 不同响应状态中应用JS

## 特性检测

很多手机媒体类型都是screen，只通过CSS无法判断。

对于全局对象，在window中判断是否存在某个属性，例如localStorage：
{% highlight javascript %}
    var hasLocalStorage = function(){
        return 'localStorage' in window;
    }
{% endhighlight %}

判断元素的属性：创建一个新元素，调用新方法看是否返回undefined，例如canvas。另外使用!!强制转换成布尔值。
{% highlight javascript %}
    var hasCanvas = function(){
        var elem = document.createElement('canvas');
        return !!(elem.getContext)
    }
{% endhighlight %}

Modernizr

## window.matchMedia

IE10以上支持

API返回一个MediaQueryList对象，包含matches属性，值为布尔值。
{% highlight javascript %}
    if (window.matchMedia("(max-width: 767px)").matches) {
        // the viewport is a small device
    } else {
        // the viewport is a larger device
    }
{% endhighlight %}

更有用的是可以对MediaQueryList对象添加监听器
{% highlight javascript %}
var smallMediaQuery = window.matchMedia("(max-width:767px)"),
    mediumMediaQuery = window.matchMedia("(min-width:768px) and (max-width:991px)"),
    largeMediaQuery = window.matchMedia("(min-width:992px)");

var smallListener = function(e){
    if(e.matches){
        console.log('enter small device');
    }
};

var mediumListener = function(e){
    if(e.matches){
        console.log('enter medium device');
    }
};

var largeListener = function(e){
    if(e.matches){
        console.log('enter large device');
    }
};
smallMediaQuery.addListener(smallListener);
mediumMediaQuery.addListener(mediumListener);
largeMediaQuery.addListener(largeListener);
{% endhighlight %}

## window.onresize

不同浏览器中得到视口的宽度：
{% highlight javascript %}
var getWidth = function () {
    var x = 0;
    if (typeof(document.body.clientWidth) == 'number') {
        // Newer generation of browsers
        x = document.body.clientWidth;
    }
    else if( typeof( window.innerWidth ) == 'number' ) {
        //None Internet Explorer
        x = window.innerWidth;
    }
    else if( document.documentElement && document.documentElement.clientWidth ) {
        //Internet Explorer 6 and above in 'standards compliant mode'
        x = document.documentElement.clientWidth;
    }
    return x;
};
{% endhighlight %}

resize事件的处理函数，给state赋值
{% highlight javascript %}
var onResizePage = function () {
    if (getWidth() < 768) {
        if (state !== "small") {
            //Enter mobile method goes here
            state = "small";
        }
    }
    else if (getWidth() >= 768 && getWidth() < 992 && state !== "medium") {
        if (state !== "medium") {
            //Enter tablet method goes here
            state = "medium";
        }
    }
    else if (getWidth() < 992) {
        if (state !== "large") {
            //Enter desktop method goes here
            state = "large";
        }
    }
};
{% endhighlight %}

很多window.matchMedia的polyfill就是采用这种方式，因为浏览器支持好(IE7 8 9)。

## 类库

### [SimpleStateManager](www.simplestatemanager.com)

基于window.onresize API

定义状态和进入状态的处理函数，除了onEnter还有onLeave离开状态和onResize状态激活时window的resize事件。
{% highlight javascript %}
ssm.addStates([
    {
        id: 'mobile',
        maxWidth: 767,
        onEnter: function(){
            console.log('enter mobile');
        }
    },
{% endhighlight %}

### [enquire.js](http://wicky.nillia.ms/enquire.js/)

基于window.matchMedia

_Wrapper.js_ Grunt rig使用rig注释`//= ../Util.js`，通过CommonJS RequireJS或者全局对象暴露：
{% highlight javascript %}
    ;(function (name, context, factory) {
        var matchMedia = window.matchMedia;

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = factory(matchMedia);
        }
        else if (typeof define === 'function' && define.amd) {
            define(function() {
                return (context[name] = factory(matchMedia));
            });
        }
        else {
            context[name] = factory(matchMedia);
        }
    }('enquire', this, function (matchMedia) {

        'use strict';

    //= ../Util.js
    //= ../QueryHandler.js
    //= ../MediaQuery.js
    //= ../MediaQueryDispatch.js

        return new MediaQueryDispatch();

    }));
{% endhighlight %}

_MediaQueryDispatch.js_构造函数 
queries用于缓存MediaQuery对象，browserIsIncapable判断浏览器是否真正支持matchMedia，而不是简单的应用了polyfill。
{% highlight javascript %}
    function MediaQueryDispatch () {
        if(!matchMedia) {
            throw new Error('matchMedia not present, legacy browsers require a polyfill');
        }
        this.queries = {};
        this.browserIsIncapable = !matchMedia('only all').matches;
    }
{% endhighlight %}

_MediaQueryDispatch.js_原型方法 注册handler。第一个参数是媒体查询字符串，第二个参数是handler数组，也可以是options对象，也可以是function（随后会被规范为对象（认为是match）），最后变成数组。第三个是是否在不支持的浏览器中始终执行handler，默认是false，因为是undefined。规范之后遍历数组，添加到之前创建的MediaQuery对象中，最后返回this便于链式处理。
{% highlight javascript %}
    register : function(q, options, shouldDegrade) {
        var queries         = this.queries,
            isUnconditional = shouldDegrade && this.browserIsIncapable;

        if(!queries[q]) {
            queries[q] = new MediaQuery(q, isUnconditional);
        }

        //normalise to object in an array
        if(isFunction(options)) {
            options = { match : options };
        }
        if(!isArray(options)) {
            options = [options];
        }
        each(options, function(handler) {
            if (isFunction(handler)) {
                handler = { match : handler };
            }
            queries[q].addHandler(handler);//添加处理器
        });

        return this;
    },
    unregister : function(q, handler) {
        var query = this.queries[q];//从缓存中取

        if(query) {
            if(handler) {//指明了handler就移除特定的
                query.removeHandler(handler);
            }
            else {//否则全部清除
                query.clear();
                delete this.queries[q];
            }
        }

        return this;
    }
{% endhighlight %}

_MediaQuery.js构造函数_ 使用matchMediaAPI得到MediaQueryList对象，添加listener
{% highlight javascript %}
function MediaQuery(query, isUnconditional) {
        this.query = query;
        this.isUnconditional = isUnconditional;
        this.handlers = []; //处理器数组
        this.mql = matchMedia(query);

        var self = this;
        this.listener = function(mql) {
            self.mql = mql;
            self.assess();
        };
        this.mql.addListener(this.listener);
    }
{% endhighlight %}

根据matches结果调用on或者off
{% highlight javascript %}
    assess : function() {
        var action = this.matches() ? 'on' : 'off';
        each(this.handlers, function(handler) {
            handler[action]();
        });
    }
{% endhighlight %}

addHandler：包装成QueryHandler对象加入handlers数组，如果已经匹配，直接调用对象的on方法。
removeHandler：遍历handlers数组，通过equals比较移除指定的handler并调用destroy方法。
matches：matchMedia实际结果与强制执行标志做或运算。
{% highlight javascript %}
    addHandler : function(handler) {
        var qh = new QueryHandler(handler);
        this.handlers.push(qh);

        this.matches() && qh.on();
    },
    removeHandler : function(handler) {
        var handlers = this.handlers;
        each(handlers, function(h, i) {
            if(h.equals(handler)) {
                h.destroy();
                return !handlers.splice(i,1);
            }
        });
    },
    matches : function() {
        return this.mql.matches || this.isUnconditional;
    },
{% endhighlight %}

_QueryHandler.js_ 简单的调用options对象中设置的match/unmatch方法。

# ch10 优化

## 图片优化

### Sprite

减少HTTP请求数量，减少文件大小（多张图片多个文件格式描述）。

[SpritePad](http://wearekiss.com/spritepad)在线合并工具

共用一张图片，通过background-position移动图片左上角。负值表示向左移动。
设置宽度高度保证其余部分不可见。
{% highlight javascript %}
.orange-smile-icon,
.green-smile-icon,
.blue-smile-icon,
.pink-smile-icon {
    width: 25px;
    height: 25px;
    background: url('sprite.png') 0 0 no-repeat;
}
.orange-smile-icon{
    background-position: 0 0;
}
.green-smile-icon{
    background-position: -25px 0;
}
{% endhighlight %}

### 内联图片

使用[Base64 File Encoder](http://jpillora.com/base64-encoder/)将图片编码，这样可以作为data uri直接使用，例如在样式表中。但是会增大样式表文件大小，虽然减少了外部资源的数量。

### 正确使用文件格式

* GIF 8-bit图片，适合颜色较少的图片例如Logo和动画效果。
* JPEG 24-bit图片，很好的压缩率，不支持透明度。不适合颜色较少的图片，压缩后容易被看出。
* PNG PNG-8和PNG-24
* SVG 

### 图片压缩工具

`npm install node-smushit -g`

`smushit images/`

也可以作为Grunt的插件使用

### 图片响应式加载

#### img元素

根据像素密度决定，src作为不支持srcset的补救措施
`<img srcset="low-res-image.png 1x, high-res-image.png 2x" src="low-res-image.png">`

更好的办法是使用媒体查询，vw是相对长度，1%的视口宽度。
`<img srcset="low-res.png 500w, high-res.png 1000w" sizes="(min-width:480px) 50vw, 100vw" >`

[picturefill](https://github.com/scottjehl/picturefill)作为polyfill

#### picture元素

{% highlight html %}
<picture>
    <source srcset="large.jpg" media="(min-width: 1200px)">
    <source srcset="medium.jpg" media="(min-width: 600px)">
    <img src="small.jpg" srcset="small.jpg" alt="The church where I got married">
</picture>
{% endhighlight %}

## 动态加载内容

## 域名碎片 Domain Sharding

浏览器同时请求数量有限（2-8），将资源分散到多个子域名上。

[Mobify](http://www.mobify.com/blog/domain-sharding-bad-news-mobile-performance/)在手机上表现不佳。

## 服务器配置

浏览器在请求头中附带支持的压缩格式GZIP或者deflate。

在Apache中配置.htaccess文件：
AddOutputFilterByType DEFLATE text/plain
AddOutputFilterByType DEFLATE text/html
AddOutputFilterByType DEFLATE text/css
AddOutputFilterByType DEFLATE application/javascript

另一种方法是
`<files *.html>SetOutputFilter DEFLATE</files>`

## 使用Expires头

希望使用缓存的文件类型：CSS,JS,图片。不希望的类型：Ajax,动态页面。

## SPDY/HTTP 2.0

Google开发的新协议：[SPDY白皮书](http://www.chromium.org/spdy/spdy-whitepaper)指出HTTP存在的问题。

* 一次连接只能一次请求
* 只有客户端才能发送请求
* HTTP头不能被压缩
* 冗余的HTTP头

Apache安装mod_spdy模块。

## Critical Rendering Path

> the code and resources required to render the initial view of a web page

浏览器首先下载HTML文件，然后进行解析。现代浏览器有两个独立的解析器：预解析器（speculative parser）和主要的HTML解析器。

预解析器请求需要下载的资源，例如样式表js文件和图片。不会创建或者修改DOM树。
同时主解析器解析HTML构建DOM树。尽管浏览器在下载CSS文档时不会阻止解析HTML，但是会阻止渲染页面。有些浏览器在CSS被完全下载之前甚至会阻塞脚本。但是主解析器遇到脚本，由于无法判断脚本需不需要立即执行，就需要等待脚本被下载并且执行才能构建DOM树，造成阻塞现象。

### 减少阻塞

脚本移到HTML的底部，为script标签加上defer属性告诉浏览器在文档解析完毕之后再运行。

对于自己的脚本可以这么做，但是第三方脚本例如社交分享按钮和分析工具。

[Socialite.js](http://socialitejs.com/)控制加载社交分享所需的外部资源。

对于分析工具，通常建议放在head标签或者body顶部。主要原因是希望跟踪用户，即使在页面完全加载之前用户就离开了。

### 移除无用CSS

在DOM树构建完毕后，CSS引擎会遍历每个元素，匹配CSS选择器。

### 明确图片宽高

浏览器在下载完成之前不知道图片具体大小，下载完毕后需要重绘。

### 延迟加载图片

利用滚动，在用户可见时再加载图片。[Echo.js](https://github.com/toddmotto/echo)

## Device Description Repository (DDR)

User-Agent嗅探不好使。
