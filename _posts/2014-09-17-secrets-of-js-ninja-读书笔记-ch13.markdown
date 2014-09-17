---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch13事件"
date:   2014-09-17 11:06:40
categories: js jquery
---

DOM Level 0 Event Model 
{% highlight javascript %}
<body onload="doSomething()">
window.onload = doSomething;
{% endhighlight %}

DOM Level 2 Event Model

## 绑定事件处理器

add/removeEventListener 主流浏览器 IE9+

attach/detachEvent IE9-  IE MODEL

IE Model不提供监听事件捕获阶段，只有冒泡阶段。
在冒泡阶段，事件从目标向DOM根节点传播，在捕获阶段反向传播。

并且，IE MODEL不设置处理器上下文，导致处理器内部this指向全局对象。不传递事件信息到处理器，而是传到全局上下文window对象。

### 解决设置上下文的问题

{% highlight javascript %}
if (document.addEventListener) {
    this.addEvent = function (elem, type, fn) {
        elem.addEventListener(type, fn, false);
        return fn;
    };
    this.removeEvent = function (elem, type, fn) {
        elem.removeEventListener(type, fn, false);
    };
}
else if (document.attachEvent) {
    this.addEvent = function (elem, type, fn) {
        var bound = function () {
            return fn.apply(elem, arguments);
        };
        elem.attachEvent("on" + type, bound);
        return bound;
    };
    this.removeEvent = function (elem, type, fn) {
        elem.detachEvent("on" + type, fn);
    };
}
{% endhighlight %}

## 解决事件对象的问题

主要修复IE MODEL存在的问题
{% highlight javascript %}
function fixEvent(event) {
    function returnTrue() { return true; }
    function returnFalse() { return false; }
    if (!event || !event.stopPropagation) {
        var old = event || window.event;
        // Clone the old object so that we can modify the values
        event = {};
        for (var prop in old) {
            event[prop] = old[prop];
        }
        // The event occurred on this element
        if (!event.target) {
            event.target = event.srcElement || document;
        }
        // Handle which other element the event is related to
        event.relatedTarget = event.fromElement === event.target ?
            event.toElement :
            event.fromElement;
        // Stop the default browser action
        event.preventDefault = function () {
            event.returnValue = false;
            event.isDefaultPrevented = returnTrue;
        };
        event.isDefaultPrevented = returnFalse;
        // Stop the event from bubbling
        event.stopPropagation = function () {
            event.cancelBubble = true;
            event.isPropagationStopped = returnTrue;
        };
        event.isPropagationStopped = returnFalse;
        // Stop the event from bubbling and executing other handlers
        event.stopImmediatePropagation = function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        };
        event.isImmediatePropagationStopped = returnFalse;
        // Handle mouse position
        if (event.clientX != null) {
            var doc = document.documentElement, body = document.body;
            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0);
        }
        // Handle key presses
        event.which = event.charCode || event.keyCode;
        // Fix button for mouse clicks:
        // 0 == left; 1 == middle; 2 == right
        if (event.button != null) {
            event.button = (event.button & 1 ? 0 :
                (event.button & 4 ? 1 :
                (event.button & 2 ? 2 : 0)));
        }
    }
    return event;
}
{% endhighlight %}

## 处理器管理

一个元素绑定了多个事件处理器，难以管理

### 存储相关信息

{% highlight javascript %}
<div title="Ninja Power!"> 忍者パワー!</div>
<div title="Secrets"> 秘密</div>
<script type="text/javascript">
    (function () {
        var cache = {},
            guidCounter = 1,
            expando = "data" + (new Date).getTime(); //保证对象之前没有同名属性
        this.getData = function (elem) {
            var guid = elem[expando];
            if (!guid) {
                guid = elem[expando] = guidCounter++;
                cache[guid] = {};
            }
            return cache[guid];
        };
        this.removeData = function (elem) {
            var guid = elem[expando];
            if (!guid) return;
            delete cache[guid];
            try {
                delete elem[expando];
            }
            catch (e) {
                if (elem.removeAttribute) {
                    elem.removeAttribute(expando);
                }
            }
        };
    })();
    var elems = document.getElementsByTagName('div');
    for (var n = 0; n < elems.length; n++) {
        getData(elems[n]).ninja = elems[n].title;
    }
    for (var n = 0; n < elems.length; n++) {
        assert(getData(elems[n]).ninja === elems[n].title,
            "Stored data is " + getData(elems[n]).ninja);
    }
    for (var n = 0; n < elems.length; n++) {
        removeData(elems[n]);
        assert(getData(elems[n]).ninja === undefined,
            "Stored data has been destroyed.")
    }
</script>
{% endhighlight %}

### 管理事件处理器

绑定事件处理器
{% highlight javascript %}
(function(){
    var nextGuid = 1;
    this.addEvent = function (elem, type, fn) {
        var data = getData(elem); //取得存储对象，后面要多次引用
        if (!data.handlers) data.handlers = {};
        if (!data.handlers[type])
            data.handlers[type] = []; //存储参数事件的处理器数组
        if (!fn.guid) fn.guid = nextGuid++; //每个回调函数存储独特的guid
        data.handlers[type].push(fn); //添加回调函数
        if (!data.dispatcher) {
            data.disabled = false;
            data.dispatcher = function (event) { //创建分发器
                if (data.disabled) return;
                event = fixEvent(event); //使用修复过的event
                var handlers = data.handlers[event.type];
                if (handlers) {
                    for (var n = 0; n < handlers.length; n++) {
                        handlers[n].call(elem, event); //调用回调函数，并将事件对象传递到函数中，修复IE MODEL的问题
                    }
                }
            };
        }
        if (data.handlers[type].length == 1) { //第一次注册dispatcher
            if (document.addEventListener) {
                elem.addEventListener(type, data.dispatcher, false);
            }
            else if (document.attachEvent) {
                elem.attachEvent("on" + type, data.dispatcher);
            }
        }this.removeEvent = function (elem, type, fn) {
    };
})();
{% endhighlight %}

回收资源工具方法，需要多次调用
{% highlight javascript %}
function tidyUp(elem, type) {
    function isEmpty(object) { //内部使用
        for (var prop in object) {
            return false;
        }
        return true;
    }
    var data = getData(elem);
    if (data.handlers[type].length === 0) {// 某个事件的处理器数组空了，回收数组
        delete data.handlers[type]; 
        if (document.removeEventListener) {
            elem.removeEventListener(type, data.dispatcher, false);
        }
        else if (document.detachEvent) {
            elem.detachEvent("on" + type, data.dispatcher);
        }
    }
    if (isEmpty(data.handlers)) { //如果处理器对象空了，回收对象和分发器
        delete data.handlers;
        delete data.dispatcher;
    }
    if (isEmpty(data)) { //如果导致存储对象空了，回收整个对象
        removeData(elem);
    }
}
{% endhighlight %}

解除绑定，使用变长参数列表
{% highlight javascript %}
this.removeEvent = function (elem, type, fn) {// 可以通过检查elem的data-属性判断elem是否合理
    var data = getData(elem);
    if (!data.handlers) return;
    var removeType = function(t){ //移除事件类型参数的处理器数组
        data.handlers[t] = [];
        tidyUp(elem,t);
    };
    if (!type) { //如果没有传入特定的事件类型参数，清空所有事件处理器
        for (var t in data.handlers) removeType(t);
        return;
    }
    var handlers = data.handlers[type];
    if (!handlers) return;
    if (!fn) { //如果没有回调函数参数，清空该事件类型的所有处理器
        removeType(type);
        return;
    }
    if (fn.guid) { //在addEvent中添加的属性
        for (var n = 0; n < handlers.length; n++) {
            if (handlers[n].guid === fn.guid) {
                handlers.splice(n--, 1); //可能有多个同样的处理器，不能找到一个就终止，在数组中删除当前的元素，指针前移
            }
        }
    }
    tidyUp(elem, type);
};
{% endhighlight %}

## 触发事件

事件触发时：

* 目标元素绑定的处理器被触发
* 事件冒泡，触发其他绑定的处理器
* 目标元素如果有默认的action，触发，比如目标元素定义了focus方法，focus事件需要能触发它

第二个参数可以是event对象或者是表示事件类型的string
{% highlight javascript %}
function triggerEvent(elem, event) {
    var elemData = getData(elem),
        parent = elem.parentNode || elem.ownerDocument;
    if (typeof event === "string") {
        event = { type:event, target:elem };
    }
    event = fixEvent(event);
    if (elemData.dispatcher) {
        elemData.dispatcher.call(elem, event);
    }
    if (parent && !event.isPropagationStopped()) { //没有显式停止传播，递归调用向上冒泡
        triggerEvent(parent, event);
    }
    else if (!parent && !event.isDefaultPrevented()) { //已到达dom顶端，触发默认的action，比如目标元素有focus方法
        var targetData = getData(event.target);
        if (event.target[event.type]) {
            targetData.disabled = true;
            event.target[event.type]();
            targetData.disabled = false;
        }
    }
}
{% endhighlight %}

## 自定义事件

需要在不同场合下多次调用一段代码，使用全局函数？自定义事件，松耦合。

### ajax例子

需要在ajax开始和结束时显示隐藏图片，绑定在body上，这样事件总会冒泡上来
{% highlight javascript %}
var body = document.getElementsByTagName('body')[0];
addEvent(body, 'ajax-start', function(e){
    document.getElementById('whirlyThing').style.display = 'inline-block';
});
addEvent(body, 'ajax-complete', function(e){
    document.getElementById('whirlyThing').style.display = 'none';
});
{% endhighlight %}
这其实是事件的委托。

## 冒泡和委托

委托：在目标节点更高级的dom节点上建立事件处理器

### 委托事件给祖先节点

场景：点击每一个td使其变色

最初的想法：在每个td上绑定click事件处理器
{% highlight javascript %}
var cells = document.getElementsByTagName('td');
for (var n = 0; n < cells.length; n++) {
    addEvent(cells[n], 'click', function(){
        this.style.backgroundColor = 'yellow';
    });
}
{% endhighlight %}

能工作，但是在数百个元素上绑定同样的处理器，做同样的事。不够优雅。
event.target可以取得事件放生的元素，委托祖先节点处理。
{% highlight javascript %}
var table = document.getElementById('#someTable');
addEvent(table, 'click', function(event){
    if (event.target.tagName.toLowerCase() == 'td')
        event.target.style.backgroundColor = 'yellow';
});
{% endhighlight %}

### 浏览器缺陷

submit,change,focus,blur在不同浏览器的冒泡实现中，存在严重问题。

事件冒泡检测代码，使用div是因为包含最多的冒泡事件种类
{% highlight javascript %}
function isEventSupported(eventName) {
    var element = document.createElement('div'),
    isSupported;
    eventName = 'on' + eventName;
    isSupported = (eventName in element);
    if (!isSupported) {
        element.setAttribute(eventName, 'return;');
        isSupported = typeof element[eventName] == 'function';
    }
    element = null;
    return isSupported;
}
{% endhighlight %}
#### submit事件冒泡

submit在IE MODEL中不能正确冒泡，有两种方式触发：

* type为submit的input/button元素，或者type为image的input元素。可以通过点击，也可以在取得焦点后通过回车或者空格键触发。
* 在type为text/password的input元素中按回车。

通过可以正常冒泡的click和keyress事件处理器触发submit事件。
{% highlight javascript %}
(function(){
    var isSubmitEventSupported = isEventSupported("submit");
    function isInForm(elem) { //判断元素是否在form元素内部
        var parent = elem.parentNode;
        while (parent) {
            if (parent.nodeName.toLowerCase() === "form") {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    function triggerSubmitOnClick(e) {
        var type = e.target.type;
        if ((type === "submit" || type === "image") &&
            isInForm(e.target)) {
            return triggerEvent(this,"submit");
        }
    }

    function triggerSubmitOnKey(e) {
        var type = e.target.type;
        if ((type === "text" || type === "password") &&
            isInForm(e.target) && e.keyCode === 13) {
            return triggerEvent(this,"submit");
        }
    }

    this.addSubmit = function (elem, fn) {
        addEvent(elem, "submit", fn);
        if (isSubmitEventSupported) return; //如果浏览器支持，短路
        if (elem.nodeName.toLowerCase() !== "form" && //如果是form不存在冒泡不正确的问题
                getData(elem).handlers.submit.length === 1) { //如果是第一个被绑定的处理器
            addEvent(elem, "click", triggerSubmitOnClick);
            addEvent(elem, "keypress", triggerSubmitOnKey);
        }
    };
    this.removeSubmit = function (elem, fn) {
        removeEvent(elem, "submit", fn);
        if (isEventSupported("submit")) return;
        var data = getData(elem);
        if (elem.nodeName.toLowerCase() !== "form" &&
                !data || !data.events || !data.events.submit) {
            removeEvent(elem, "click", triggerSubmitOnClick);
            removeEvent(elem, "keypress", triggerSubmitOnKey);
        }
    };
})();
{% endhighlight %}

#### change事件冒泡

需要绑定更多的事件

* The focusout event for checking the value after moving away from the form element
* The click and keydown events for checking the value the instant it’s been changed
* The beforeactivate event for getting the previous value before a new one is set

{% highlight javascript %}
(function(){
    this.addChange = function (elem, fn) {
        addEvent(elem, "change", fn);
        if (isEventSupported("change")) return;
        if (getData(elem).events.change.length === 1) {
            addEvent(elem, "focusout", triggerChangeIfValueChanged);
            addEvent(elem, "click", triggerChangeOnClick);
            addEvent(elem, "keydown", triggerChangeOnKeyDown);
            addEvent(elem, "beforeactivate", triggerChangeOnBefore);
        }
    };
    this.removeChange = function (elem, fn) {
        removeEvent(elem, "change", fn);
        if (isEventSupported("change")) return;
        var data = getData(elem);
        if (!data || !data.events || !data.events.submit) {
            addEvent(elem, "focusout", triggerChangeIfValueChanged);
            addEvent(elem, "click", triggerChangeOnClick);
            addEvent(elem, "keydown", triggerChangeOnKeyDown);
            addEvent(elem, "beforeactivate", triggerChangeOnBefore);
        }
    };
    function triggerChangeOnClick(e) {
        var type = e.target.type;
        if (type === "radio" || type === "checkbox" ||
                e.target.nodeName.toLowerCase() === "select") {
            return triggerChangeIfValueChanged.call(this, e);
        }
    }
    function triggerChangeOnKeyDown(e) {
        var type = e.target.type,
        key = e.keyCode;
        if (key === 13 && e.target.nodeName.toLowerCase() !== "textarea" ||
                key === 32 && (type === "checkbox" || type === "radio") ||
                type === "select-multiple") {
            return triggerChangeIfValueChanged.call(this, e);
        }
    }
    function triggerChangeOnBefore(e) { //保存改变前的值
        getData(e.target)._change_data = getVal(e.target);
    }
    function getVal(elem) {
        var type = elem.type,
        val = elem.value;
        if (type === "radio" || type === "checkbox") {
            val = elem.checked;
        } else if (type === "select-multiple") {
            val = "";
            if (elem.selectedIndex > -1) {
                for (var i = 0; i < elem.options.length; i++) {
                    val += "-" + elem.options[i].selected;
                }
            }
        } else if (elem.nodeName.toLowerCase() === "select") {
            val = elem.selectedIndex;
        }
        return val;
    }
    function triggerChangeIfValueChanged(e) {
        var elem = e.target, data, val;
        var formElems = /textarea|input|select/i;
        if (!formElems.test(elem.nodeName) || elem.readOnly) {
            return;
        }
        data = getData(elem)._change_data;
        val = getVal(elem);
        if (e.type !== "focusout" || elem.type !== "radio") {
            getData(elem)._change_data = val;
        }
        if (data === undefined || val === data) { //值没发生改变，不触发
            return;
        }
        if (data != null || val) {
            return triggerEvent(elem, "change");
        }
    }
})();
{% endhighlight %}

#### focusin 和 focusout

IE MODEL中在focus和blur之前会触发非标准的focusin和focusout事件，所以只要在addEvent中判断即可

{% highlight javascript %}
if (document.addEventListener) {
    elem.addEventListener(
        type === "focusin" ? "focus" :
        type === "focusout" ? "blur" : type,
        data.handler, type === "focusin" || type === "focusout");
}
else if (document.attachEvent) {
    elem.attachEvent("on" + type, data.handler);
}
{% endhighlight %}
#### mouseenter和mouseleave事件

IE MODEL自定义的两个事件

通常使用标准的mouseover和mouseout事件，问题是由于事件的冒泡机制，除了父元素，在子元素之间移动时也会触发事件。这在实际场景例如菜单等交互元素中，我们只想知道是否还在父元素内，而不是离开一个子元素到另一个时也触发事件。

并且，当鼠标从父元素移动到内部的子元素时，mouseout事件会触发，尽管直观上并没有离开父元素。同理，从子元素离开时，mouseover事件会被触发。

所以IE MODEL实现的这两个事件还是很有用的，需要在其他浏览器中模拟。
{% highlight javascript %}
(function() {
    if (isEventSupported("mouseenter")) { //IE MODEL
        this.hover = function (elem, fn) {
            addEvent(elem, "mouseenter", function () {
                fn.call(elem, "mouseenter");
            });
            addEvent(elem, "mouseleave", function () {
                fn.call(elem, "mouseleave");
            });
        };
    }
    else { //不支持mouseenter和mouseleave的浏览器
        this.hover = function (elem, fn) {
            addEvent(elem, "mouseover", function (e) {
                withinElement(this, e, "mouseenter", fn);
            });
            addEvent(elem, "mouseout", function (e) {
                withinElement(this, e, "mouseleave", fn);
            });
        };
    }
    function withinElement(elem, event, type, handle) {
        var parent = event.relatedTarget; //取得从哪进入或者离开去哪
        while (parent && parent != elem) {
            try {
                parent = parent.parentNode;
            }
            catch (e) {
                break;
            }
        }
        if (parent != elem) { //relatedTarget不在elem内部
            handle.call(elem, type);
        }
    }
})();
{% endhighlight %}

## document ready事件

DOMContentLoaded，当整个DOM文档加载完毕触发ready事件，但是在页面展示之前。对于IE9之前的版本：

* 把文档滚动到最左边的操作会失败，除非文档加载完毕。
* 监听document的onreadystatechange事件，会比第一种晚一点触发，但是仍会在window的load事件之前。
* 检查document的readyState属性，这被所有浏览器支持，用来记录加载DOM文档的完整程度。

{% highlight javascript %}
(function () {
    var isReady = false,
        contentLoadedHandler;
    function ready() {
        if (!isReady) {
            triggerEvent(document, "ready");
            isReady = true;
        }
    }

    if (document.readyState === "complete") {//如果此时已经加载完成，触发事件即可
        ready();
    }

    if (document.addEventListener) {//W3C 浏览器
        contentLoadedHandler = function () {
            document.removeEventListener(
                "DOMContentLoaded", contentLoadedHandler, false);
            ready();
        };
        document.addEventListener(
            "DOMContentLoaded", contentLoadedHandler, false);
    }
    else if (document.attachEvent) {//IE MODEL
        contentLoadedHandler = function () {
            if (document.readyState === "complete") {
                document.detachEvent(
                    "onreadystatechange", contentLoadedHandler);
                ready();
            }
        };
        document.attachEvent(
            "onreadystatechange", contentLoadedHandler);
        var toplevel = false;
        try {
            toplevel = window.frameElement == null;
        }
        catch (e) {
        }
        if (document.documentElement.doScroll && toplevel) { //不在iframe中
            doScrollCheck();
        }
    }

    function doScrollCheck() {
        if (isReady) return;
        try {
            document.documentElement.doScroll("left");
        }
        catch (error) {
            setTimeout(doScrollCheck, 1); //移动失败继续尝试
            return;
        }
        ready();
    }
})();
{% endhighlight %}