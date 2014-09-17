---
layout: post
title:  "《Secrets of JS Ninja》读书笔记 ch8线程和定时器"
date:   2014-09-17 10:51:40
categories: js jquery
---

timer不是js而是浏览器提供的特性。

## 处理计算成本高的任务

下面的任务耗时巨大，浏览器处理时，用户无法交互：
{% highlight javascript %}
var tbody = document.getElementsByTagName("tbody")[0];
for (var i = 0; i < 20000; i++) {
    var tr = document.createElement("tr");
    for (var t = 0; t < 6; t++) {
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(i + "," + t));
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
}
{% endhighlight %}

使用定时器分割任务：
{% highlight javascript %}
var rowCount = 20000;
var divideInto = 4;
var chunkSize = rowCount/divideInto;
var iteration = 0;
var table = document.getElementsByTagName("tbody")[0];
setTimeout(function generateRows(){
    var base = (chunkSize) * iteration;
    for (var i = 0; i < chunkSize; i++) {
        var tr = document.createElement("tr");
        for (var t = 0; t < 6; t++) {
            var td = document.createElement("td");
            td.appendChild(
                document.createTextNode((i + base) + "," + t +
                "," + iteration));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    iteration++;
    if (iteration < divideInto)
        setTimeout(generateRows,0);
},0);
{% endhighlight %}

## central timer control

问题：动画，多个定时器改变不同的属性
特点：

* 页面中同时只有一个运行的定时器
* 可以随时暂停和继续定时器
* 移除回调函数的过程

{% highlight javascript %}
var timers = {
    timerID: 0,
    timers: [],

    add: function(fn) {
        this.timers.push(fn);
    },

    start: function() {
        if (this.timerID) return;
        (function runNext() {
            if (timers.timers.length > 0) {
                for (var i = 0; i < timers.timers.length; i++) {
                    if (timers.timers[i]() === false) {
                        timers.timers.splice(i,1);
                        i--;
                    }
                }
                timers.timerID = setTimeout(runNext, 0);
            }
        })();
    },

    stop: function() {
        clearTimeout(this.timerID);
        this.timerID = 0;
    }
};

var box = document.getElementById("box"), x = 0, y = 20;
timers.add(function() {
    box.style.left = x + "px";
    if (++x > 50) return false;
});
timers.add(function() {
    box.style.top = y + "px";
    y += 2;
    if (y > 120) return false;
});
timers.start();
{% endhighlight %}
除了动画，中心定时器控制还能用于测试前端

## 异步测试

{% highlight javascript %}
(function() {
    var queue = [], paused = false;
    this.test = function(fn) {
        queue.push(fn);
        runTest();
    };
    this.pause = function() {
        paused = true;
    };
    this.resume = function() {
        paused = false;
        setTimeout(runTest, 1);
    };
    function runTest() {
        if (!paused && queue.length) {
            queue.shift()();
            if (!paused) resume();
        }
    }
})();
{% endhighlight %}