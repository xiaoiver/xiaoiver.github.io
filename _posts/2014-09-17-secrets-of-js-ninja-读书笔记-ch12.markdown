---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch12 attr/prop/css"
date:   2014-09-17 11:05:40
categories: js jquery
---

attribute是dom构建的完整部分，property是元素保存运行时信息，提供访问的主要方式

奇怪的测试，给img.src赋值，但是结果却不一样。没有改变attribute，但是还是变了。
{% highlight javascript %}
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
{% endhighlight %}

## 浏览器命名不同

大多数浏览器可以通过getAttribute("class")取到class，但是IE使用className，保持和property一致。

## 命名限制

attr和prop不能做到一一对应，因为要考虑到保留字，比如label的for(attr)，就只能通过htmlFor(prop)。
另外，由多个词组合成的attr，对应的prop要使用驼峰命名方式，如maxLength,rowSpan。
这是因为通过prop访问`element.style.font-size;`连字符会被当做减号。

## xml和html间的区别

attr和prop的对应关系是HTML DOM的特性，在处理XML DOM时，prop不会自动创建代表attr。

判断XML
{% highlight javascript %}
function isXML(elem) {
    return elem.ownerDocument ||
        elem.documentElement.nodeName.toLowerCase() !== "html";
}
{% endhighlight %}

## 自定义attr

自定义attr，只能通过get/setAttribute
`var value = element.someValue ? element.someValue :element.getAttribute('someValue');`

## 性能考虑

通常prop访问比getAttribute速度快

## url标准化

浏览器特性：当访问指向url的prop时，如src,action,href，URL值会被标准化成完整的路径。attr不会。

## style attr

例子`<div style='color:red;'></div>`

`element.style.color`通过prop可以取得style对象的属性值，但如果我们想访问style中整个字符串，通过prop显然不行。
通过`getAttribute("style")`在大多数浏览器中可行。IE在style对象中增加cssText属性存储，所以可以通过`element.style.cssText`访问。

## type attr

IE9之前的版本不允许修改input的type attr，一旦它被插入文档中。P267

## style的位置

style属性优先级最高，比!important还高。
{% highlight javascript %}
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
{% endhighlight %}

## 像素值

有些属性需要加上单位
{% highlight javascript %}
element.style.height = "10px";
element.style.height = 10 + "px";
{% endhighlight %}

## 度量height和width

两者的值根据内容变化，无法通过height和width属性得到精确值。

offsetHeight和offsetWidth属性包括padding。但是对于`display:none`的元素，值是0。

如果想度量一个隐藏元素非隐藏时的大小

1. display: block 使offsetHeight/Width可度量
2. visibility: hidden 不显示
3. position: absolute 虽然不显示，但会留下空洞，需要脱离正常的显示流
4. 抓取值
5. 恢复改变的属性

## 透明度

所有现代浏览器包括IE9，支持`opacity: 0.5`，
IE9之前，使用`filter: alpha(opacity=50)`

2大困难

* filter种类除了alpha还有很多，不能确定
* 即使不支持opacity，IE8或者更早的版本还是会返回style.opacity的值，尽管浏览器会忽略，导致无法判断浏览器是否支持。

还是有办法判断：
`opacity: .5`，支持的浏览器会规范化成0.5，而不支持的浏览器会简单返回.5
{% highlight javascript %}
var div = document.createElement("div");
div.setAttribute('style','opacity:.5');
var OPACITY_SUPPORTED = div.style.opacity === "0.5";
assert(OPACITY_SUPPORTED,
    "Opacity is supported.");
{% endhighlight %}

## 颜色

表达方式多种
[jQuery Color plugin](http://plugins.jquery.com/project/color)

## 获取计算后的样式

`window.getComputedStyle()`IE9+，接受element作为参数，返回一个接口。
返回的接口有方法`getPropertyValue()`来获取计算后的样式值。

与style.prop不同，getPropertyValue接受css属性值(非驼峰)作为参数。

IE9之前的版本，每个元素有currentStyle属性

{% highlight javascript %}
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
{% endhighlight %}