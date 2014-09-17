---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch10with语句 & ch11跨浏览器策略"
date:   2014-09-17 11:01:40
categories: js jquery
---

## ch10 with语句

### 在with scope中引用属性

性能差，this指向全局对象，可以给已有属性赋值，但是如果想要增加新属性，
必须通过`object.prop`才能创建，否则在全局对象中创建。

### 现实中使用with的例子

Prototype中提高代码可读性
{% highlight javascript %}
Object.extend(String.prototype.escapeHTML, {
    div: document.createElement('div'),
    text: document.createTextNode('')
});
with (String.prototype.escapeHTML) div.appendChild(text);
{% endhighlight %}

但是不一定要这样做，使用立即执行function也可以办到，虽然还是需要短小的前缀
{% highlight javascript %}
(function(s){
    s.div.appendChild(s.text);
})(String.prototype.escapeHTML);
{% endhighlight %}

### 导入命名空间中的代码

{% highlight javascript %}
with (YAHOO.util.Dom) {
    YAHOO.util.Event.on([get('item'), get('otheritem')], 'click',
        function(){ setStyle(this,'color','#c00'); });
}
{% endhighlight %}

### 测试

{% highlight javascript %}
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
{% endhighlight %}

### 模板

{% highlight javascript %}
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
{% endhighlight %}

## ch11 跨浏览器策略

### 封装代码

不影响加载页面中的其他代码

### 避免属性冲突

使用hasOwnProperty判断，和in的区别是前者不会检查原型链

### 贪婪的id

没有取到form的action属性，而是input#action
{% highlight javascript %}
<form id="form" action="/conceal">
<input type="text" id="action"/>
<input type="submit" id="submit"/>
</form>

var what = document.getElementById('form').action;
{% endhighlight %}
原因是浏览器会将form中每个input元素作为属性(prop)增加到form中，属性名就是input的id。所以产生了冲突，form的本身属性被覆盖了。

可以查看node信息获得正确的action值
`var actionValue = element.getAttibuteNode("action").nodeValue;`