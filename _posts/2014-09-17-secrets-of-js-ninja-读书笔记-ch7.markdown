---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch7"
date:   2014-09-17 10:45:40
categories: js jquery
---

# ch7正则表达式

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

## 得到透明度

{% highlight javascript %}
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
{% endhighlight %}
由于match会返回匹配数组，而0下标中是整个匹配字符串

`exec()`每次执行返回全局搜索的一个match
{% highlight javascript %}
var html = "<div class='test'><b>Hello</b> <i>world!</i></div>";
var tag = /<(\/?)(\w+)([^>]*?)>/g, match;
var num = 0;
while ((match = tag.exec(html)) !== null) {
    assert(match.length == 4,
        "Every match finds each tag and 3 captures.");
    num++;
}
assert(num == 6, "3 opening and 3 closing tags found.");
{% endhighlight %}

backreference和exec结合使用
{% highlight javascript %}
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
{% endhighlight %}

replace方法中使用$1表示匹配
{% highlight javascript %}
assert("fontFamily".replace(/([A-Z])/g, "-$1").toLowerCase() ==
    "font-family", "Convert the camelCase into dashed notation.");
{% endhighlight %}

## non-capturing group

`var pattern = /((ninja-)+)sword/;`

第一个括号表示sword前的全部字符串，第二个括号表示+之前的ninja-
第二个括号不加入group中：
{% highlight javascript %}
var pattern = /((?:ninja-)+)sword/;
var ninjas = "ninja-ninja-sword".match(pattern);
assert(ninjas.length == 2,"Only one capture was returned.");
assert(ninjas[1] == "ninja-ninja-",
    "Matched both words, without any extra capture.");
{% endhighlight %}

## replace()

replace函数的第二个参数可以是function，传入4类参数：

* The full text of the match
* The captures of the match, one parameter for each（多个）
* The index of the match within the original string
* The source string

{% highlight javascript %}
function upper(all,letter) { return letter.toUpperCase(); }
assert("border-bottom-width".replace(/-(\w)/g,upper)
    == "borderBottomWidth",
    "Camel cased a hyphenated string.");
{% endhighlight %}
无需使用while循环调用exec

## 压缩query字符串

{% highlight javascript %}
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
{% endhighlight %}

## 使用正则表达式解决常见问题

### trim string

{% highlight javascript %}
function trim(str) {
    return (str || "").replace(/^\s+|\s+$/g, "");
}
{% endhighlight %}
p170提供手动解决尾部空格，针对大文档提高效率

### 匹配换行符

{% highlight javascript %}
var html = "<b>Hello</b>\n<i>world!</i>";

assert(/.*/.exec(html)[0] === "<b>Hello</b>",
    "A normal capture doesn't handle endlines.");无法匹配换行符

assert(/[\S\s]*/.exec(html)[0] ===
"<b>Hello</b>\n<i>world!</i>",
"Matching everything with a character set.");使用空格字符检测所有

assert(/(?:.|\s)*/.exec(html)[0] ===
"<b>Hello</b>\n<i>world!</i>",
"Using a non-capturing group to match everything.");\s包括换行符
{% endhighlight %}

### unicode

`var matchAll = /[\w\u0080-\uFFFF_-]+/;`