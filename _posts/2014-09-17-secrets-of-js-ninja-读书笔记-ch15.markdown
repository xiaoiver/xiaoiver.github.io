---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch15css选择器引擎"
date:   2014-09-17 11:14:40
categories: js jquery
---

W3C Selectors API提供了querySelectorAll和querySelector方法。

但是类库提供的选择器比标准考虑了更多因素。比如使用缓存提高效率，扩展性更好，更好的错误报告。

实现CSS选择器引擎有三种方法：

* 使用API
* 使用XPath，一种DOM查询语言
* 纯DOM

## API

querySelectorAll返回节点列表，querySelector返回第一个匹配的节点

问题出现在以元素为基准的查询上，test元素内部没有`div > b`，但是选择器只检查最后的部分，这是违反直觉的。
{% highlight javascript %}
<div id="test">
<b>Hello</b>, I'm a ninja!
</div>
<script type="text/javascript">
window.onload = function () {
    var b = document.getElementById("test").querySelector("div b");
    assert(b, "Only the last part of the selector matters.");
};
</script>
{% endhighlight %}

解决方法是临时分配一个id给根元素。查完后再恢复。
之所以使用try/catch块是因为API可能抛出异常。
{% highlight javascript %}
(function() {
    var count = 1;
    this.rootedQuerySelectorAll = function (elem, query) {
        var oldID = elem.id;
        elem.id = "rooted" + (count++);
        try {
            return elem.querySelectorAll("#" + elem.id + " " + query);
        }
        catch (e) {
            throw e;
        }
        finally {
            elem.id = oldID;
        }
    };
})();
{% endhighlight %}

## 使用XPath查找

复杂表达式的表现XPath更好。

Prototype类库中
{% highlight javascript %}
if (typeof document.evaluate === "function") {
    function getElementsByXPath(expression, parentElement) {
        var results = [];
        var query = document.evaluate(expression,
            parentElement || document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(query.snapshotItem(i));
        return results;
    }
}
{% endhighlight %}

## 纯DOM实现
getElementById/TagName，HTML5中增加ClassName

* IE89支持API，但是67不支持XPath和API
* 向后兼容性
* 有些查询例如ID，纯DOM实现更快
* CSS3选择器浏览器支持各不相同

两种可能的选择器实现：自顶向下，自底向上

考虑的因素：结果按照文档中定义的顺序。不能返回重复的元素。

自顶向下：类似这样的选择`div.ninja a span`

一个简单的实现：按tag查找，问题是有可能返回重复的元素。
{% highlight javascript %}
function find(selector, root){
    root = root || document;
    var parts = selector.split(" "),
        query = parts[0],
        rest = parts.slice(1).join(" "),
        elems = root.getElementsByTagName(query),
        results = [];
    for (var i = 0; i < elems.length; i++) {
        if (rest) {
            results = results.concat(find(rest, elems[i]));//递归查找
        }
        else {
            results.push(elems[i]);
        }
    }
    return results;
};
{% endhighlight %}

### 解析选择符

上面的简单例子按照空格分割tag，但是很多选择中包含额外的空格，例如按照属性或者值查询。

注意非捕获组中的三种情况()，[]和非空格，逗号，大小括号。第三种情况将空格剔除。
{% highlight javascript %}
var selector = "div.class > span:not(:first-child) a[href]";
var chunker = /((?:\([^\)]+\)|\[[^\]]+\]|[^ ,\(\[]+)+)(\s*,\s*)?/g;
var parts = [];
chunker.lastIndex = 0;//下一次匹配的开始位置
while ((m = chunker.exec(selector)) !== null) {
    parts.push(m[1]);
    if (m[2]) {//如果有逗号，停止匹配
        extra = RegExp.rightContext;//最后一个匹配后面的字符串
        break;
    }
}
assert(parts.length == 4, "Our selector is broken into 4 unique parts.");
assert(parts[0] === "div.class", "div selector");
assert(parts[1] === ">", "child selector");
assert(parts[2] === "span:not(:first-child)", "span selector");
assert(parts[3] === "a[href]", "a selector");
{% endhighlight %}

### 查找元素

getElementById用于ID选择器，IE和Opera会查出name值相同的元素。

getElementsByTagName还有另一个作用，tag为*能够查出文档/元素内部的所有元素。在属性选择器并没有提供tag的情况下，例如`.class`或者`[attr]`

getElementsByName适用于`[name=name]`

getElementsByClassName是HTML5的新方法，加速查询。

### 过滤结果集

属性过滤：getAttribute()，类过滤也是其中一种，访问className属性。

位置过滤：`:nth-child(even)`或者`:last-child,`，使用children和childNodes这两个方法

### 递归和合并

之前简单例子中，结果集没有去重。采用遍历元素分配临时的标志，来判断是否之前遇到过。

{% highlight javascript %}
(function(){
    var run = 0;
    this.unique = function(array) {
        var ret = [];
        run++;
        for (var i = 0, length = array.length; i < length; i++) {
            var elem = array[i];
            if (elem.uniqueID !== run) {
                elem.uniqueID = run;
                ret.push(array[i]);
            }
        }
        return ret;
    };
})();
{% endhighlight %}

## 自底向上的实现

先找到所有符合最后一个表达式的子节点，再向上找父节点。成本高。
优点是不会出现重复。

简单的例子
{% highlight javascript %}
function find(selector, root){
    root = root || document;
    var parts = selector.split(" "),
        query = parts[parts.length - 1],
        rest = parts.slice(0,-1).join(""),
        elems = root.getElementsByTagName(query),
        results = [];
    for (var i = 0; i < elems.length; i++) {
        if (rest) {
            var parent = elems[i].parentNode;
            while (parent && parent.nodeName != rest) {
                parent = parent.parentNode;
            }
            if (parent) {
                results.push(elems[i]);
            }
        } else {
            results.push(elems[i]);
        }
    }
    return results;
};
{% endhighlight %}