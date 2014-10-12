---
layout: post
title:  "《Async Javascript》读书笔记"
date:   2014-10-11 09:40:40
categories: js async yepnope require
---

# ch1 理解js中的事件

## 调度事件

### 立即执行？

关于setTimeout的描述不完全正确

> Given a callback and a delay of n milliseconds, setTimeout runs that 
> callback n milliseconds later.

下面的代码会输出3个4，而不是1,2,3
<% highlight javascript %>
for (var i = 1; i <= 3; i++) {
	setTimeout(function(){ console.log(i); }, 0);
};
<% endhighlight %>

需要了解3件事

* 循环结束时，i的值是4
* 闭包维持对变量i的引用
* js中 event handlers don’t run until the thread is free

### 阻塞线程

并不会在500ms后就调用定时器回调函数进行输出，至少要1000ms，也就是在while循环结束后才会触发回调。
<% highlight javascript %>
var start = new Date;
setTimeout(function(){
	var end = new Date;
	console.log('Time elapsed:', end - start, 'ms');
}, 500);
while (new Date - start < 1000) {};
<% endhighlight %>

setTimeout并没有使用另一个线程

### 队列

调用setTimeout时，timeout事件进入队列，接着setTimeout下面的代码执行，最后js虚拟机才会到队列中找，调用事件回调函数，此时距离当初定时器设定的时间已经过去很久了。

## 异步函数的类型

### I/O函数

Node.js并不是想让服务端也能运行js才创造的。作者只是想找支持事件驱动服务器的高级语言，js由于十分适合非阻塞I/O，正好支持。

在其他语言中，使用循环能阻塞程序直到某个I/O请求完成。但是在js中不可能。下面的循环会一直运行。
<% highlight javascript %>
	var ajaxRequest = new XMLHttpRequest;
	ajaxRequest.open('GET', url);
	ajaxRequest.send(null);
	while (ajaxRequest.readyState === XMLHttpRequest.UNSENT) {
		// readyState can't change until the loop returns
	};
<% endhighlight %>

在js中，需要绑定回调函数实现，让事件队列执行回调。
<% highlight javascript %>
	var ajaxRequest = new XMLHttpRequest;
	ajaxRequest.open('GET', url);
	ajaxRequest.send(null);
	ajaxRequest.onreadystatechange = function() {
		// ...
	};
<% endhighlight %>

浏览器ajax方法提供async选项，值为false时代表同步，浏览器会不响应直到接收到服务端的响应。Node.js中同步API从方法名就能看出来，如`fs.readFileSync`。

`console.log`在Chrome和Safari中是异步执行的，会输出`{foo:bar}`。原因是WebKit的日志方法会存储对象的引用，在代码返回到事件队列时再输出。
而在Node.js中，是严格同步的，所以输出是`{}`。
<% highlight javascript %>
	var obj = {};
	console.log(obj);
	obj.foo = 'bar';
<% endhighlight %>

### 时间函数

测试一秒钟能触发多少次定时器事件。FF,Chrome和Safari下大概是200/s，Node.js下1000/s。换成简单的while循环后，提高到4000000/s，Node.js中更高一些。
<% highlight javascript %>
var fireCount = 0;
var start = new Date;
var timer = setInterval(function() {
	if (new Date - start > 1000) {
		clearInterval(timer);
		console.log(fireCount);
		return;
	}
	fireCount++;
}, 0);
<% endhighlight %>

setInterval设置间隔为0比while循环慢很多，因为HTML规范中浏览器timeout/interval最小间隔是4ms。

想要更小的间隔有其他选择

* Node.js中`process.nextTick`，超过100000/s
* 现代浏览器包括ie9以上可以使用`requestAnimationFrame`方法，动画60帧每秒

## 异步函数编写

### 什么时候函数是异步的

测试异步函数
<% highlight javascript %>
var functionHasReturned = false;
asyncFunction(function() {
	console.assert(functionHasReturned);
});
functionHasReturned = true;
<% endhighlight %>

### 有时是异步的函数

一个错误的认识：jQuery中$传入的方法会在页面加载完毕后运行。

大多数情况下下面的代码都能正常运行。除非浏览器从缓存中加载页面，此时DOM在脚本运行之前就加载完毕，调用还未被设置的utils方法就会出错。
<% highlight javascript %>
// application.js
$(function() {
	utils.log('Ready');
});
// utils.js
window.utils = {
	log: function() {
		if (window.console) console.log.apply(console, arguments);
	}
};
<script src="application.js"></script>
<script src="util.js"></script>
<% endhighlight %>

### 使用cache的异步函数

[例子](http://webworkersandbox.com/5009efc12245588e410002cf)

<% highlight javascript %>
var calculationCache = {},
	calculationCallbacks = {},
	mathWorker = new Worker('calculator.js');
	
mathWorker.addEventListener('message', function(e) {
	var message = e.data;
	calculationCache[message.formula] = message.result;
	calculationCallbacks[message.formula](message.result);
});

function runCalculation(formula, callback) {
	if (formula in calculationCache) {//同步状态，结果已经被放入了cache中
		return callback(calculationCache[formula]);
	};
	if (formula in calculationCallbacks) {//结果还未发回，调用自己
		return setTimeout(function() {
			runCalculation(formula, callback);
		}, 0);
	};
	mathWorker.postMessage(formula);//公式还未分发给worker,触发事件
	calculationCallbacks[formula] = callback;
}
<% endhighlight %>

### 异步递归和存储回调函数

上面的runCalculation采用了异步递归和简单存储回调函数。

在java中轮询：
<% highlight java %>
while (!calculationCache.get(formula)) {
	Thread.sleep(0);
};
<% endhighlight %>

看起来异步递归更易用，但是js中使用setTimeout的异步递归调用并不好，在等待时触发的timeout事件是没有数量限制的，而且会使程序的事件结构变得不必要地复杂。所以异步递归是反模式。

使用存储回调函数来避免异步递归
<% highlight javascript %>
mathWorker.addEventListener('message', function(e) {
	var message = e.data;
		calculationCache[message.formula] = message.result;
		calculationCallbacks[message.formula]
			.forEach(function(callback) {//统一处理之前未得到结果前压入的函数
			callback(message.result);
		});
});
function runCalculation(formula, callback) {
	if (formula in calculationCache) {
		return callback(calculationCache[formula]);//已经有结果，直接调用回调函数
	};
	if (formula in calculationCallbacks) {//将回调函数压栈
		return calculationCallbacks[formula].push(callback);
	};
	mathWorker.postMessage(formula);
	calculationCallbacks[formula] = [callback];
}
<% endhighlight %>

### 返回值和回调函数混合

`return callback(calculationCache[formula]);`由于返回值没有使用，
可以简单地写成
<% highlight javascript %>
	callback(calculationCache[formula]);
	return;
<% endhighlight %>

但是有些函数的返回值会被回调函数使用。
<% highlight javascript %>
var webSocketCache = {};
function openWebSocket(serverAddress, callback) {
	var socket;
	if (serverAddress in webSocketCache) {//查看缓存
		socket = webSocketCache[serverAddress];
		if (socket.readyState === WebSocket.OPEN) {
			callback();//这里有问题
		} else {
			//使用了Underscore.js，将两个函数包裹成一个新函数
			socket.onopen = _.compose(callback, socket.onopen);
		};
	} else {
		socket = new WebSocket(serverAddress);
		webSocketCache[serverAddress] = socket;
		socket.onopen = callback;
	};
	return socket;
};
<% endhighlight %>

代码的问题在于，如果socket已经被缓存并且是打开的，callback会在openWebSocket函数返回之前运行。而callback函数中使用了返回值socket，就会出错。
<% highlight javascript %>
var socket = openWebSocket(url, function() {
	socket.send('Hello, server!');
});
<% endhighlight %>

解决办法是使用setTimeout，保证在函数返回后才执行回调函数。
<% highlight javascript %>
if (socket.readyState === WebSocket.OPEN) {
	setTimeout(callback, 0);
} else {
// ...
}
<% endhighlight %>

### 处理异步错误

从一个异步回调函数中抛出异常
<% highlight javascript %>
setTimeout(function A() {
	setTimeout(function B() {
		setTimeout(function C() {
			throw new Error('Something terrible has happened!');
		}, 0);
	}, 0);
}, 0);
<% endhighlight %>

stack trace中只有C：`Error: Something terrible has happened! at Timer.C (/AsyncJS/nestedErrors.js:4:13)`。在C运行时，A和B都不在stack中，这三个函数都是直接从事件队列中运行的。

所以外部的try/catch捕获不了异步回调函数抛出的异常：
<% highlight javascript %>
try {
	setTimeout(function() {
		throw new Error('Catch me if you can!');
	}, 0);
} catch (e) {
	console.error(e);
}
<% endhighlight %>

所以Node.js中回调函数会err作为参数，让函数内部决定如何处理。
<% highlight javascript %>
	var fs = require('fs');
	fs.readFile('fhgwgdz.txt', function(err, data) {
		if (err) {
			return console.error(err);
		};
		console.log(data.toString('utf8'));
	});
<% endhighlight %>

客户端脚本如jquery使用两个回调函数（success/failure）

### 处理未捕获的异常

当回调函数抛出异常时，应该由调用者来捕获。但如果异常从未被捕获，不同的js环境有不同的规则。

在浏览器中，将未捕获的异常显示在控制台中，然后返回事件队列。可以为window.onerror添加处理函数改变浏览器行为。返回true会阻止浏览器默认的错误处理行为。
<% highlight javascript %>
	window.onerror = function(err) {
		return true;
	};
<% endhighlight %>

在Node.js中，process对象有类似的uncaughtException事件。
通常遇到未捕获的异常，程序会立即退出。但只要至少存在一个uncaughtException处理器，app就会返回事件队列。
<% highlight javascript %>
process.on('uncaughtException', function(err) {
	console.error(err); // shutdown averted!
});
<% endhighlight %>

但是从0.8.4版本，就被废弃了。推荐使用domain模块。domain会将异常转化成error事件，然后在error事件处理器中进行处理。
<% highlight javascript %>
	var myDomain = require('domain').create();
	myDomain.run(function() {
		setTimeout(function() {
			throw new Error('Listen to me!')
		}, 50);
	});
	myDomain.on('error', function(err) {
		console.log('Error ignored!');//简单的记录
	});
<% endhighlight %>

### 是否抛出异常

Isaac Schlueter认为try/catch是反模式，不推荐使用。
把try当作类似assert的结构使用，在出现重大问题时将程序终止。

## 嵌套的回调函数

常见的反模式，回调函数里嵌套回调函数。目前看来没问题，但是需要扩展时，如处理数据库错误，添加日志等，就会变得很糟。
<% highlight javascript %>
function checkPassword(username, passwordGuess, callback) {
	var queryStr = 'SELECT * FROM user WHERE username = ?';
	db.query(selectUser, username, function (err, result) {
		if (err) throw err;
		hash(passwordGuess, function(passwordGuessHash) {
			callback(passwordGuessHash === result['password_hash']);
		});
	});
}
<% endhighlight %>

下面的写法代码行变多了但是更清晰。将passwordHash拿到外面。
<% highlight javascript %>
function checkPassword(username, passwordGuess, callback) {
	var passwordHash;
	var queryStr = 'SELECT * FROM user WHERE username = ?';
	db.query(selectUser, username, queryCallback);
	function queryCallback(err, result) {
		if (err) throw err;
		passwordHash = result['password_hash'];
		hash(passwordGuess, hashCallback);
	}
	function hashCallback(passwordGuessHash) {
		callback(passwordHash === passwordGuessHash);
	}
}
<% endhighlight %>

# ch2 事件

一个事件由多个处理器处理。发布/订阅模式很适合。

## Pub/Sub模式

早期的js，浏览器允许事件处理器依附在DOM上，缺点是只能合并成一个函数。
<% highlight javascript %>
link.onclick = function() {
	clickHandler1.apply(this, arguments);
	clickHandler2.apply(this, arguments);
};
<% endhighlight %>

W3C在DOM标准中增加了addEventListener，jquery实现了bind。

### EventEmitter

on进行订阅，emit进行发布通知。
<% highlight javascript %>
emitter.on('evacuate', function(message) {
	console.log(message);
});
emitter.emit('evacuate','args');//可以传递参数
<% endhighlight %>

### 简单的实现

EventEmitter中的实现
<% highlight javascript %>
PubSub = {handlers: {}}
PubSub.on = function(eventType, handler) {
	if (!(eventType in this.handlers)) {
		this.handlers[eventType] = [];//每个事件都有处理器数组
	}
	this.handlers[eventType].push(handler);
	return this;
}
PubSub.emit = function(eventType) {
	var handlerArgs = Array.prototype.slice.call(arguments, 1);//截取参数
	for (var i = 0; i < this.handlers[eventType].length; i++) {
		this.handlers[eventType][i].apply(this, handlerArgs);
	}
	return this;
}
<% endhighlight %>

### 同步

会输出foo bar。也就是trigger会立即触发回调函数，然后后面的代码才能执行。
<% highlight javascript %>
$('input[type=submit]')
	.on('click', function() { console.log('foo'); })
	.trigger('click');
console.log('bar');
<% endhighlight %>

如果太多处理器按顺序触发，可能会阻塞线程导致浏览器未响应。更糟糕的情况是当事件从处理器中触发时，会导致死循环。
<% highlight javascript %>
$('input[type=submit]')
	.on('click', function() {
		$(this).trigger('click'); // stack overflow!
	});
<% endhighlight %>

对于许多处理器需要按顺序执行，并且有些处理器很耗时的情况，解决方法是维持一个队列，使用定时器按顺序调用。
<% highlight javascript %>
var tasks = [];
setInterval(function() {
	var nextTask;
	if (nextTask = tasks.shift()) {
		nextTask();
	};
}, 0);
<% endhighlight %>

## Evented Model 可以发布事件的模型

当一个对象拥有Pub/Sub接口，就称作evented object。
特别的，这个对象存储了数据，成为了model，还能在数据改变时发布事件。

在Backbone.js中，可以创建一个model。
和js中对象的区别是，model可以在发生改变时发布通知。使用set方法触发改变。
<% highlight javascript %>
style = new Backbone.Model(
	{font: 'Georgia'}
);
style.on('change:font', function(model, font) {
	alert('Thank you for choosing ' + font + '!');
});
<% endhighlight %>

js中普遍的做法是通过input事件处理器直接改变DOM。而新的做法是对model进行改变，然后通过model发射事件使DOM更新。新的做法更优雅。

## jquery中自定义事件

js中event会被父节点冒泡emit，一直到document根节点，除非调用了event的stopPropagation方法（jquery中只要handler中返回false会自动调用该方法）。jquery中自定义事件也会冒泡。
如果soda是bottle的子节点，会冒泡到父节点。
<% highlight javascript %>
	$('#soda, #bottle').on('fizz', function() {
		console.log(this.id + ' emitted fizz');
	});
	$('#soda').trigger('fizz');
<% endhighlight %>

有时不需要冒泡，jquery中提供不冒泡的[triggerHandler](http://api.jquery.com/triggerHandler/)方法。

### 工具提示的例子

问题：容器中一次只显示一个工具提示，需要在每次添加新提示前移除旧的。
`$('.tooltip').remove();`并且容器之间互不影响，还要支持容器的嵌套。

使用选择器会很麻烦，采用事件的思想。
<% highlight javascript %>
$container.triggerHandler('newTooltip');//不会冒泡到父节点
$container.one('newTooltip', function() {//触发后移除处理器
	$tooltip.remove();
});
<% endhighlight %>

# ch3 Promise和Deferred

jquery1.4中ajax请求需要包含成功/失败/总是执行的处理器。
<% highlight javascript %>
$.get('/mydata', {
	success: onSuccess,
	failure: onFailure,
	always: onAlways
});
<% endhighlight %>

1.5中分离开，返回封装的Promise对象。一个明显的好处是可以对同一个事件绑定多个处理器，拆分功能。例如显示隐藏loading图片的代码就可以被多个ajax调用共用。
<% highlight javascript %>
	var promise = $.get('/mydata');
	promise.done(onSuccess);
	promise.fail(onFailure);
	promise.always(onAlways);
<% endhighlight %>

最大的优点是可以从已有的Promise中获取新的Promise。两个并行的Promise返回代表共同进度的Promise.

## Deferred

Deferred是Promise的超集，可以被直接触发。而Promise需要其他人来触发。
另外，回调函数的运行顺序和绑定顺序一致。always最先绑定，所以最先触发。
<% highlight javascript %>
	var promptDeferred = new $.Deferred();
	//1.6以上版本支持always
	promptDeferred.always(function(){ console.log('A choice was made:'); });
	promptDeferred.done(function(){ console.log('Starting game...'); });
	promptDeferred.fail(function(){ console.log('No game today.'); });
<% endhighlight %>

通过resolve和reject触发Deferred。
<% highlight javascript %>
$('#playGame').focus().on('keypress', function(e) {
	var Y = 121, N = 110;
	if (e.keyCode === Y) {
		promptDeferred.resolve();//只会被调用一次
	} else if (e.keyCode === N) {
		promptDeferred.reject();
	} else {
		return false; // our Deferred remains pending
	};
});
<% endhighlight %>

Promise只能被解决或者拒绝一次，在此之前处于pending等待状态。
1.7版本以上调用state方法查看状态，老版本使用isResovled和isRejected查看。

## Promise

调用Deferred的promise方法得到一个Promise。多次调用会返回同一个Promise。在Promise上继续调用这个方法还是返回同一个对象的引用。

Promise只是Deferred缺少resolve/reject方法的拷贝。内部共享同样的回调函数，所以绑定在Deferred或者生成的Promise上都一样。
`var promptPromise = promptDeferred.promise();`

使用Promise的唯一理由是封装。保留Deferred只传递Promise可以保证控制回调函数的触发。

### jquery中的Promise

动画方法允许传递回调函数，在效果完成后调用。
`$('.error').fadeIn(afterErrorShown);`

1.6之后
<% highlight javascript %>
	var errorPromise = $('.error').fadeIn().promise();
	errorPromise.done(afterErrorShown);
<% endhighlight %>

jquery 1.8+ 以下等价
<% highlight javascript %>
	$(onReady);
	$(document).ready(onReady);
	$.ready.promise().done(onReady);
<% endhighlight %>

## 传递数据到回调函数

通过resolve/reject传递参数到回调函数
<% highlight javascript %>
	var aDreamDeferred = new $.Deferred();
	aDreamDeferred.done(function(subject) {
		console.log('I had the most wonderful dream about', subject);
	});
	aDreamDeferred.resolve('the JS event model');
<% endhighlight %>

resolveWith/rejectWith用于传递上下文作为第一个参数，后面是参数数组
<% highlight javascript %>
	var slashdotter = {
		comment: function(editor){
			console.log('Obviously', editor, 'is the best text editor.');
		}
	};
	var grammarDeferred = new $.Deferred();
	grammarDeferred.done(function(verb, object) {
		this[verb](object);
	});
	grammarDeferred.resolveWith(slashdotter, ['comment', 'Emacs']);
<% endhighlight %>

但想传递上下文使用call/apply就行了，因为resolve/reject会传递上下文到回调函数中
<% highlight javascript %>
	grammarDeferred.resolve.call(slashdotter, 'comment', 'Emacs');
<% endhighlight %>

## 进度通知

不同于resolve/reject，progress方法可以被多次调用。
notify可以传递参数到progress回调函数中。
<% highlight javascript %>
	var nanowrimoing = $.Deferred();
	var wordGoal = 5000;
	nanowrimoing.progress(function(wordCount) {
		var percentComplete = Math.floor(wordCount / wordGoal * 100);
		$('#indicator').text(percentComplete + '% complete');
	});
	nanowrimoing.done(function(){
		$('#indicator').text('Good job!');
	});
	$('#document').on('keypress', function(){
		var wordCount = $(this).val().split(/\s+/).length;
		if (wordCount >= wordGoal) {
			nanowrimoing.resolve();
		};
		nanowrimoing.notify(wordCount);//触发progress回调函数
	});
<% endhighlight %>

## 合并Promise

多个Promise可以使用when合并成一个任务集合，这样就把异步任务抽象成了布尔值，有and关系。
<% highlight javascript %>
	var gameReadying = $.when(tutorialPromise, gameLoadedPromise);
	gameReadying.done(startGame);
<% endhighlight %>

常用的场景，组合多个ajax请求，在都成功后得到通知。
<% highlight javascript %>
	$.when($.post('/1', data1), $.post('/2', data2))
	.then(onPosted, onFailure);
<% endhighlight %>

使用一个全局的数据容器，如Array，存放多个Promise想合并的数据。
<% highlight javascript %>
	var serverData = {};
	var getting1 = $.get('/1')
		.done(function(result) {serverData['1'] = result;});
	var getting2 = $.get('/2')
		.done(function(result) {serverData['2'] = result;});
	$.when(getting1, getting2)
		.done(function() {
			// the GET information is now in serverData...
		});
<% endhighlight %>

## 使用pipe绑定

只有在GET操作完成后才能对postPromise绑定回调函数，之前还不存在。
<% highlight javascript %>
	var getPromise = $.get('/query');
	getPromise.done(function(data) {
		var postPromise = $.post('/search', data);
	});
<% endhighlight %>

1.6之后增加pipe方法。如果返回一个Promise。如果返回一个非Promise甚至没有返回值，
<% highlight javascript %>
	var getPromise = $.get('/query');
	var postPromise = getPromise.pipe(function(data) {
		return $.post('/search', data);
	});
<% endhighlight %>

## 使用Promise替换回调函数

在Node.js中使用jquery`npm install jquery`

大多js框架使用callback而非promise，改写Node.js回调函数风格代码：
<% highlight javascript %>
var fileReading = new $.Deferred();
fs.readFile(filename, 'utf8', function(err) {
	if (err) {
		fileReading.reject(err);
	} else {
		fileReading.resolve(Array.prototype.slice.call(arguments, 1));
	};
});
<% endhighlight %>

改写成通用的工具方法
<% highlight javascript %>
	deferredCallback = function(deferred) {
		return function(err) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(Array.prototype.slice.call(arguments, 1));
			};
		};
	}
	var fileReading = new $.Deferred();
	fs.readFile(filename, 'utf8', deferredCallback(fileReading));
<% endhighlight %>

Q.js中node方法直接使用。
<% highlight javascript %>
	var fileReading = Q.defer();
	fs.readFile(filename, 'utf8', fileReading.node());
<% endhighlight %>

# ch4 使用Async.js控制流程

迭代中保持顺序的问题。

安装async和step`npm install -g async step`

[es5-shim](https://github.com/kriskowal/es5-shim/)

## 异步顺序问题

问题：按字典序读取文件夹下所有文件，然后拼接内容。

使用同步方法：
<% highlight javascript %>
	var fs = require('fs');
	process.chdir('recipes');//切换目录
	var concatenation = '';
	fs.readdirSync('.')
		.filter(function(filename) {//忽略目录
			return fs.statSync(filename).isFile();
		})
		.forEach(function(filename) {//forEach至少需要IE6+
			concatenation += fs.readFileSync(filename, 'utf8');
		});
	console.log(concatenation);
<% endhighlight %>

不能替换成异步版本。原因是拼接任务放在回调函数中，短文件会比长文件先读完，拼接的顺序不可预测。
<% highlight javascript %>
	fs.readFile(filename, 'utf8', function(err, contents) {
		if (err) throw err;
		concatenation += contents;
	});
<% endhighlight %>

## 异步

### 简单的实现

不使用forEach，在前一个回调函数中调用下一个保证执行顺序，在最后一个文件处理完毕后输出。
<% highlight javascript %>
	var fs = require('fs');
	process.chdir('recipes'); // change the working directory
	var concatenation = '';
	fs.readdir('.', function(err, filenames) {
		if (err) throw err;
		function readFileAt(i) {
			var filename = filenames[i];
			fs.stat(filename, function(err, stats) {
				if (err) throw err;
				if (! stats.isFile()) return readFileAt(i + 1);
				fs.readFile(filename, 'utf8', function(err, text) {
					if (err) throw err;
					concatenation += text;
					if (i + 1 === filenames.length) {
						return console.log(concatenation);
					}
					readFileAt(i + 1);//保证顺序
				});
			});
		}
		readFileAt(0);
	});
<% endhighlight %>

### 使用Async.js

提供两种选择

* `async.filter`和`async.forEach`，并行处理数组
* `async.filterSeries`和`async.forEachSeries`，串行处理数组

并行异步操作明显更快，为何还要用串行的？两个原因

* 顺序问题。
* Node同时读取文件的数目有限制，超过会出错。串行读取不会有问题。

<% highlight javascript %>
	var concatenation = '';
	var dirContents = fs.readdirSync('.');
	async.filter(dirContents, isFilename, function(filenames) {
		async.forEachSeries(filenames, readAndConcat, onComplete);
	});
	function isFilename(filename, callback) {
		fs.stat(filename, function(err, stats) {
			if (err) throw err;
			callback(stats.isFile());
		});
	}
	function readAndConcat(filename, callback) {
		fs.readFile(filename, 'utf8', function(err, fileContents) {
			if (err) return callback(err);
			concatenation += fileContents;
			callback();
		});
	}
	function onComplete(err) {
		if (err) throw err;
		console.log(concatenation);
	}
<% endhighlight %>

## Async.js中错误处理

> Async.js follows Node conventions. This means that every I/O
> callback has the form (err, results...)—with the exception of callbacks 
> where the result is a boolean. Boolean callbacks just have the form (result)
> , which is why our isFilename iterator from the previous code example needs 
> to handle errors on its own.

onComplete只会被调用一次，在第一次error出现时或者全部操作成功后。

## 组织任务

### 串行运行异步任务

async.series/async.waterfall
<% highlight javascript %>
var async = require ('async');
var start = new Date;
async.series([
	function(callback) { setTimeout(callback, 100); },
	function(callback) { setTimeout(callback, 300); },
	function(callback) { setTimeout(callback, 200); }
], function(err, results) {
	console.log('Completed in ' + (new Date - start) + 'ms');
});
<% endhighlight %>

### 并行

async.parallel上面的例子可能只要300ms，但无法保证顺序。

## 动态异步队列

series和parallel存在局限性

* 任务数组是静态的，一旦调用不能再添加或者移除。
* 无法得知任务完成进度。
* 只有完全无并发性或者无限的并发性，无法精确控制并发粒度。

### 理解队列

<% highlight javascript %>
var async = require('async');
function worker(data, callback) {
	console.log(data);
	callback();
}
var concurrency = 2;
var queue = async.queue(worker, concurrency);
queue.push(1);
queue.push(2);
queue.push(3);
<% endhighlight %>

## 使用Step进行最小的流程控制

只有一个方法Step，接受函数列表作为参数。

每个函数可以以三种方式控制流程

* 调用this使Step运行列表中下一个函数
* 调用n次callback使Step运行下一个函数n次
* 返回一个值，

下一个函数可以接受前一个的结果，包括返回值或者传递给this方法的参数。
或者前面所有函数的结构，如果前一个通过this.parallel或者this.group调用。
两个函数的区别是parallel将结果作为分离的参数，而group合并成数组。

async.map等同于
<% highlight javascript %>
	var Step = require('step');
	function stepMap(arr, iterator, callback) {
		Step(
			function() {
				var group = this.group();
				for (var i = 0; i < arr.length; i++) {
					iterator(arr[i], group());
				}
			},
			callback
		);
	}
<% endhighlight %>

# ch5 使用Workers多线程

## Web Worker

Html5提供Web Worker。
双方通过监听message事件接收数据，通过postMessage发送数据。
<% highlight javascript %>
	// master script
	var worker = new Worker('boknows.js');
	worker.addEventListener('message', function(e) {
		console.log(e.data);
	});
	worker.postMessage('football');
	worker.postMessage('baseball');
	// boknows.js
	self.addEventListener('message', function(e) {
		self.postMessage('Bo knows ' + e.data);
	});
<% endhighlight %>

[Ace文本编辑器](https://github.com/ajaxorg/ace-builds/)
使用单独的线程进行语法分析，保证编辑界面流畅运行。

通常worker将计算结果发送给主线程，然后由主线程更新页面。如果worker能直接改变页面，就会带来同步问题，需要将DOM操作包装在同步量中，像Java中那样。

所以worker无法看见全局window对象或者主线程和其他worker中的任何对象。
通过postMessage传递对象时，会进行序列化和反序列化，修改原对象不会影响其他线程中的拷贝。

worker只能看到自身的全局对象也就是self对象。包括了标准的js对象和浏览器的ajax方法。worker可以使用XMLHttpRequest和WebSocket，可以独立地向服务器请求数据。

## Node中的cluster

# ch6 异步脚本加载

script的位置，放在head标签中，影响加载速度，长时间的空白。
放在body末尾，无生气的组件。

## 限制和警告

以下方法不适合内联脚本。尽量避免使用，非要用则不要使用defer或者async属性。
避免使用document.write，在异步加载的脚本中的行为是不可预测的。类似DOM操作的GOTO。

## script标签

用户只能看到标题，直到放在head中的script被全部下载完毕并运行。
需要绑定document.onreadystatechange，确保dom加载完成。

所以将脚本放在body的末尾，用户能更快看到页面，
脚本也能看见DOM，无需等待事件触发。

这么做需要注意三点，任何一点不满足就不应该下移：

1. body中是否有inline的js调用末尾的这些脚本
2. 使用[Modernizr](http://modernizr.com/)检测用户的浏览器是否支持HTML5&CSS3 [HTML5 Boilerplate](http://html5boilerplate.com/)将其在顶部引入
3. 脚本是否会影响页面中某些元素（如字体）的展示效果，会显示两次。

## 脚本延迟加载

在文档全部加载完毕之前浏览器不会下载脚本，在大的文档传输中，会成为性能瓶颈。

理想化的场景中，脚本和文档并行加载，不影响DOM的渲染，当文档加载完毕再运行脚本。

使用ajax加载脚本可以满足需求，但是有个更简单的解决方案。
使用script的defer属性：`<script defer src="deferredScript.js">`。
告诉浏览器首先加载，但不会立即执行，直到DOM加载完毕并且之前包含defer的脚本也执行完毕。这样就可以移入head标签中，得到所有之前移入body末尾的好处，还额外获得了加载大文档的速度提升。

缺点是不被所有浏览器支持。
<% highlight html %>
	<html>
	<head>
		<!-- metadata and stylesheets go here -->
		<script src="headScripts.js"></scripts>
		<script defer src="deferredScripts.js"></script>
	</head>
	<body>
		<!-- content goes here -->
	</body>
	</html>
<% endhighlight %>

## 并行加载

有时我们不希望等到一个脚本执行完才开始加载下一个脚本。希望尽快加载所有脚本并运行。现代浏览器提供了async属性，不保证脚本的执行顺序，也不保证执行时DOM是否加载完毕。

同时使用async和defer时，支持async的浏览器中async会覆盖defer。由于defer支持度更高，也能提供在加载脚本的同时渲染DOM的好处，所以推荐在使用async的地方都使用defer。

以下加载顺序是：headScript运行完毕后，dom开始加载，deferredScript在dom显示的同时后台加载，dom显示完毕，两个wigetJs开始执行，顺序未知。
<% highlight html %>
	<html>
	<head>
		<!-- metadata and stylesheets go here -->
		<script src="headScripts.js"></scripts>
		<script src="deferredScripts.js" defer></script>
	</head>
	<body>
		<!-- content goes here -->
		<script async defer src="feedbackWidget.js"></script>
		<script async defer src="chatWidget.js"></script>
	</body>
	</html>
<% endhighlight %>

## 可编程加载

希望在特定的条件下加载脚本。

### 直接加载

浏览器向服务器请求脚本并执行的两种方式：

1. 发出ajax请求，使用eval执行响应内容。
2. 向DOM中插入script标签。

第一种的缺点是eval存在作用域泄露问题。
<% highlight javascript %>
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = '/js/feature.js';
	head.appendChild(script);
<% endhighlight %>

如果想知道script何时加载完成，可以让其触发一个特定事件，但这样太繁琐。
html5中`script.onload = function(){}`可以绑定一个回调函数。但是不被所有
浏览器支持，比如ie8使用`onreadystatechange`。所以推荐使用script加载类库。

### 使用yepnope进行条件加载

yepnope是一个轻量级类库，可以单独使用，也可以配合Modernizr使用。
<% highlight javascript %>
	yepnope({
		load: 'oompaLoompas.js',
		callback: function() {
			console.log('Oompa-Loompas ready!');
		}
	});
<% endhighlight %>

backbone依赖于underscore，加载顺序。complete不同于callback，前者在所有脚本都被加载完毕后运行，而callback为加载列表中每一个资源运行。
<% highlight javascript %>
	yepnope({
		load: ['underscore.js', 'backbone.js'],
		complete: function() {
			// Backbone logic goes here
		}
	});
<% endhighlight %>

yepnope最具代表性的特征是条件加载。

判断设备是否是触屏设备：根据条件判断决定加载文件
<% highlight javascript %>
	yepnope({
		test: Modernizr.touch,
		yep: ['touchStyles.css', 'touchApplication.js'],
		nope: ['mouseStyles.css', 'mouseApplication.js'],
		complete: function() {
			// either way, the application is now ready!
		}
	});
<% endhighlight %>

常用的用法：填补旧版本浏览器缺失的功能
<% highlight javascript %>
	yepnope({
		test: window.json,
		nope: ['json2.js'],
		complete: function() {
			// now we can JSON safely
		}
	});
<% endhighlight %>

### 使用Require.js和AMD智能加载

require函数第一个参数是数组，并行加载数组中的脚本。不同于yepnope，require不保证目标脚本的运行顺序。但是会保证脚本之间的依赖关系，只要脚本满足AMD(Asynchronous Module Definition)规范。
<% highlight javascript %>
	require(['moment'], function(moment) {
		console.log(moment().format('dddd')); // day of the week
	});
<% endhighlight %>

[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)规范。

全局函数define，三个参数：名字，依赖列表和依赖加载完毕后的回调函数。

下面就是一个有效的AMD规范，定义了一个依赖jquery的应用。
<% highlight javascript %>
	define('myApplication', ['jquery'], function($) {
		$('<body>').append('<p>Hello, async world!</p>');
	});
<% endhighlight %>

define是如何捕获jquery对象的呢？jquery的AMD定义返回了jQuery对象。
<% highlight javascript %>
	define( "jquery", [], function () { return jQuery; } );
<% endhighlight %>