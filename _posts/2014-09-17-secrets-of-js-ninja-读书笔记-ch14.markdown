---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch14操作DOM"
date:   2014-09-17 11:12:40
categories: js jquery
---

很多lib实现考虑效率问题。比如插入html，使用[createContextualFragment](https://developer.mozilla.org/en/DOM/range.createContextualFragment)效率就比通常使用的createElement高。

一个DOM操作实现[metamorph.js](https://github.com/tomhuda/metamorph.js/blob/master/lib/metamorph.js)

## 注入HTML到DOM中

DOM操作API

1. 将合法的HTML/XML字符串转化成DOM结构
2. 将DOM结构注入到DOM的任意有效位置
3. 执行字符串中包含的行内脚本

### HTML字符串 -> DOM

使用DOM元素的innerHTML属性

* 确保html字符串是合法的
* 用标记包装字符串
* 使用DOM元素的innerHTML属性插入HTML字符串
* 返回DOM节点

#### 预处理XML/HTML源字符串

比如要支持自闭合的标签比如`<table/>`，需要转换成`<table></table>`，便于所有浏览器支持。

列出只能以自闭合形式出现的标签
{% highlight javascript %}
var tags =
    /^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i;
function convert(html) {
    return html.replace(/(<(\w+)[^>]*?)\/>/g, function (all, front, tag) {
        return tags.test(tag) ?
            all :
            front + "></" + tag + ">";
    });
}
{% endhighlight %}

#### HTML包装

一些HTML元素必须被容器元素包裹。例如`<option>`必须在`<select>`中

有两种方法解决这个问题，都需要构建元素和容器的映射

#### 生成DOM

{% highlight javascript %}
function getNodes(htmlString, doc, fragment) {
    var map = {
        "<td":[3,"<table><tbody><tr>","</tr></tbody></table>"],
        "<th":[3,"<table><tbody><tr>","</tr></tbody></table>"],
        "<tr":[2,"<table><thead>","</thead></table>"],
        "<option":[1,"<select multiple='multiple'>","</select>"],
        "<optgroup":[1,"<select multiple='multiple'>","</select>"],
        "<legend":[1,"<fieldset>","</fieldset>"],
        "<thead":[1,"<table>","</table>"],
        "<tbody":[1,"<table>","</table>"],
        "<tfoot":[1,"<table>","</table>"],
        "<colgroup":[1,"<table>","</table>"],
        "<caption":[1,"<table>","</table>"],
        "<col":[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],
        "<link":[3,"<div></div><div>","</div>"]
    };
    var tagName = htmlString.match(/<\w+/),
        mapEntry = tagName ? map[tagName[0]] : null;
    if (!mapEntry) mapEntry = [0, " ". " " ];
    var div = (doc || document).createElement("div"); //默认document
    div.innerHTML = mapEntry[1] + htmlString + mapEntry[2];//使用容器元素进行包裹
    while (mapEntry[0]--) div = div.lastChild; //按照层数取得最内层的节点，就是想要创建的节点

    if(fragment){//DOM fragment供元素注入
        while(div.firstChild){
            fragment.appendChild(div.firstChild);
        }
    }
    return div.childNodes;
}
assert(getNodes("<td>test</td><td>test2</td>").length === 2,
    "Get two nodes back from the method.");
assert(getNodes("<td>test</td>")[0].nodeName === "TD",
    "Verify that we're getting the right node.");
{% endhighlight %}

IE中还存在bug，在空的table中会创建`<tbody>`元素。修复方法可以检查table是否为空，如果是空的，就移除所有子节点。

另外，IE会对传入innerHTML属性的字符串进行trim，但是html会忽略空格。修复方法可以检查生成的第一个节点是否是文本节点。

#### 插入document

使用W3C DOM标准的DOM fragment，被所有浏览器支持。

如果要将元素插入多个地方，需要复制fragment，这比复制每个节点效率高。因为多次调用append之类的方法，每次都要刷新页面，而将节点都加入一个fragment，再将fragment一次性添加到document中，只要刷新一次页面。

另外，如果想要将tr直接加入table元素，一般都认为是加入tbody元素中。

以下代码来自jquery中的应用
{% highlight javascript %}
function root(elem, cur) {
    return elem.nodeName.toLowerCase() === "table" &&
        cur.nodeName.toLowerCase() === "tr" ?
        (elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild(elem.ownerDocument.createElement("tbody"))) ://创建tbody并返回新添加的节点
        elem;
}

window.onload = function () {
    function insert(elems, args, callback) {
        if (elems.length) {
            var doc = elems[0].ownerDocument || elems[0],
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(args, doc, fragment),
                first = fragment.firstChild;
            if (first) {
                for (var i = 0; elems[i]; i++) {
                    callback.call(root(elems[i], first),                        i > 0 ? fragment.cloneNode(true) : fragment);//除了第一次都要进行复制
                }
            }
        }
    }
    var divs = document.getElementsByTagName("div");
    insert(divs, ["<b>Name:</b>"], function (fragment) {//传入字符串？
        this.appendChild(fragment);
    });
    insert(divs, ["<span>First</span> <span>Last</span>"],
        function (fragment) {
        this.parentNode.insertBefore(fragment, this);
    });
};
{% endhighlight %}

#### 执行脚本

在插入到document之前，将内联脚本提取出来。ret数组保存所有生成的DOM节点。scripts数组保存所有提取出来的脚本节点。在插入操作完成后，解释执行这些脚本。
{% highlight javascript %}
for (var i = 0; ret[i]; i++) {//ret的大小可能会改变，所以判断条件是ret[i]非空
    if (jQuery.nodeName(ret[i], "script") &&
        (!ret[i].type ||
            ret[i].type.toLowerCase() === "text/javascript")) {//没有显式的type或者type是text/javascript
        scripts.push(ret[i].parentNode ?
            ret[i].parentNode.removeChild(ret[i]) :
            ret[i]);
    } else if (ret[i].nodeType === 1) {//检查子树中是否包含脚本节点
        ret.splice.apply(ret, [i + 1, 0].concat(//添加进ret数组中的当前下一个位置
            jQuery.makeArray(ret[i].getElementsByTagName("script"))));
    }
}
{% endhighlight %}

解析出的脚本应该在全局上下文中执行。ch9中介绍过，通过在head中创建script元素并移除。
{% highlight javascript %}
function globalEval(data) {
    data = data.replace(/^\s+|\s+$/g, "");//移除首尾空白符
    if (data) {
        var head = document.getElementsByTagName("head")[0] ||
                document.documentElement,
            script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        head.insertBefore(script, head.firstChild);
        head.removeChild(script);
    }
}
{% endhighlight %}

加上对非本地脚本的处理
{% highlight javascript %}
function evalScript(elem) {
    if (elem.src)
        jQuery.ajax({
            url:elem.src,
            async:false,
            dataType:"script"
        });
    else
        jQuery.globalEval(elem.text || "");
    if (elem.parentNode)
        elem.parentNode.removeChild(elem);
}
{% endhighlight %}

## 克隆元素

cloneNode方法，参数表示是否拷贝所有子节点。

首先检测cloneNode是否会拷贝事件处理器包括扩展属性，IE中的问题
{% highlight javascript %}
var div = document.createElement("div");
if (div.attachEvent && div.fireEvent) {
    div.attachEvent("onclick", function () {
        jquery.support.noCloneEvent = false;//标志
        div.detachEvent("onclick", arguments.callee);
    });
    div.cloneNode(true).fireEvent("onclick");
}
{% endhighlight %}

其次，解决第一个问题的方法首先想到去移除clone元素上的事件处理器，扩展属性。但是在IE中，如果这么做，原节点的也会被移除。

最终的解决方案：克隆元素到另一个元素，读取innerHTML，再转换成DOM节点。在IE中还是有bug，innerHTML并不一定反映元素属性的正确状态。比如input元素的name属性动态改变了，innerHTML不会显示这一点。

{% highlight javascript %}
function clone() {
    var ret = this.map(function () {
        if (!jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this)) {
            var clone = this.cloneNode(true),
            container = document.createElement("div");
            container.appendChild(clone);
            return jQuery.clean([container.innerHTML])[0];
        }
        else
            return this.cloneNode(true);
    });
    var clone = ret.find("*").andSelf().each(function () {
        if (this[ expando ] !== undefined)
            this[ expando ] = null;
    });
    return ret;
}
{% endhighlight %}

## 删除元素
在简单地调用removeChild之前，还要做清理工作。

首先，所有绑定的事件处理器要清理。其次，元素关联的外部数据要清理。
在ch13中，没有将数据直接依附在元素上，而是使用额外的数据结构存储。这样清理起来就很方便。

另外，子元素也要这样做。

{% highlight javascript %}
function remove() {
    jQuery("*", this).add([this]).each(function () {//遍历子元素
        jQuery.event.remove(this);
        jQuery.removeData(this);
    });
    if (this.parentNode)
        this.parentNode.removeChild(this);
    if (typeof this.outerHTML !== "undefined")//针对IE
        this.outerHTML = "";
}
{% endhighlight %}

IE中，每一个单独的从页面移除的元素不会被马上回收内存资源，直到离开页面。这样长时间运行的页面就会占用大量内存。

解决方法是，在IE中有一个独有的属性outerHTML，代表元素的HTML字符串。既是getter又是setter，通过设置字符串为空比调用removeChild清除的更彻底，不是全部但也有大部分了。

## 文本内容

textContent属性，
IE中innerText属性

下面的例子说明设置这两个属性后，会清除原来的元素结构，只剩下一个文本节点。
{% highlight javascript %}
<div id="test"><b>Hello</b>, I'm a ninja!</div>
<script type="text/javascript">
window.onload = function () {
    var b = document.getElementById("test");
    var text = b.textContent || b.innerText;
    assert(text === "Hello, I’m a ninja!",
        "Examine the text contents of an element.");
    assert(b.childNodes.length === 2,
        "An element and a text node exist.");
    if (typeof b.textContent !== "undefined") {
        b.textContent = "Some new text";
    }
    else {
        b.innerText = "Some new text";
    }
    text = b.textContent || b.innerText;
    assert(text === "Some new text", "Set a new text value.");
    assert(b.childNodes.length === 1,
        "Only one text node exists now.");
};
</script>
{% endhighlight %}

### 设置文本

插入文本和插入html不同在于文本需要进行转义，`<`转义成`&lt`。使用内置的createTextNode方法。

### 获取文本

想取得精确的文本值，不能通过textContent或者innerText。原因是换行符会被去掉。

只能手动得到每个文本节点的nodeValue
{% highlight javascript %}
function getText(elem) {
    var text = "";
    for (var i = 0; i < elem.childNodes.length; i++) {
        var cur = elem.childNodes[i];
        if (cur.nodeType === 3) //文本节点
            text += cur.nodeValue;
        else if (cur.nodeType === 1) //元素节点，递归调用
            text += getText(cur);
    }
    return text;
}
{% endhighlight %}