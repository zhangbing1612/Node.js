# Node.js-
#安装
```bash
 $npm安装调试
 ```
# 用法
## debug公开功能; 只需传递这个函数的模块名称，它就会返回一个console.error给你传递调试语句。这将允许您切换模块的不同部分以及对不同模块调试输出。
#用例 [_app.js_](./examples/node/app.js):

```js
var debug = require('debug')('http')
  , http = require('http')
  , name = 'My App';

// fake app

debug('booting %o', name);

http.createServer(function(req, res){
  debug(req.method + ' ' + req.url);
  res.end('hello\n');
}).listen(3000, function(){
  debug('listening');
});

// fake worker of some kind

require('./worker');
```
用例 [_worker.js_](./examples/node/worker.js):

```js
var a = require('debug')('worker:a')
  , b = require('debug')('worker:b');

function work() {
  a('doing lots of uninteresting work');
  setTimeout(work, Math.random() * 1000);
}

work();

function workb() {
  b('doing some work');
  setTimeout(workb, Math.random() * 2000);
}

workb();
```
debug的环境变量被用于提供给基于空格或逗号分隔的名字
这里有一些用例：
<img width="647" alt="screen shot 2017-08-08 at 12 53 04 pm" src="https://user-images.githubusercontent.com/71256/29091703-a6302cdc-7c38-11e7-8304-7c0b3bc600cd.png">
<img width="647" alt="screen shot 2017-08-08 at 12 53 38 pm" src="https://user-images.githubusercontent.com/71256/29091700-a62a6888-7c38-11e7-800b-db911291ca2b.png">
<img width="647" alt="screen shot 2017-08-08 at 12 53 25 pm" src="https://user-images.githubusercontent.com/71256/29091701-a62ea114-7c38-11e7-826a-2692bedca740.png">

### Windows 笔记
在Windows上环境变量用于设置`set`命令
```cmd
set DEBUG=*,-not_this
```
记录PowerShell使用不同语法去设置环境变量

```cmd
$env:DEBUG = "*,-not_this"
```
接着像平常一样运行需要【被调试的程序

## 命令行颜色
每个调试实例都有一个基于它的命名空间名称生成的颜色。这有助于在视觉上分析调试输出，以确定调试行属于哪一个调试实例
### node.js
在Node.js中颜色是可变的当错误流是一个TTY。你也需要安装 [`supports-color`](https://npmjs.org/supports-color) 模块与调试，
否则调试只使用少量的基本颜色。
<img width="521" src="https://user-images.githubusercontent.com/71256/29092181-47f6a9e6-7c3a-11e7-9a14-1928d8a711cd.png">

#### 网页浏览器
颜色同样被用于可理解`%c`格式化选项的"Web Inspectors"。这些是Firefox（从版本31）和Firefox的Firebug插件（任何版本）。
(https://hacks.mozilla.org/2014/05/editable-box-model-multiple-selection-sublime-text-keys-much-more-firefox-developer-tools-episode-31/))

## 毫秒差异
在积极开发一个应用程序时，看看一次debug()通话和下一次通话之间的时间是非常有用的。例如，假设你debug()在请求一个资源之前调用，之后“+ NNNms”将显示你在多次调用之间花了多少时间。
<img width="647" src="https://user-images.githubusercontent.com/71256/29091486-fa38524c-7c37-11e7-895f-e7ec8e1039b6.png">
当stdout不是TTY时，Date#toISOString()使用它，使得它更加有用地记录调试信息，如下所示：

<img width="647" src="https://user-images.githubusercontent.com/71256/29091956-6bd78372-7c39-11e7-8c55-c948396d6edd.png">
## 约定
如果您在一个或多个库中使用这个库，则应该使用库的名称，以便开发人员可以根据需要切换调试，而不用猜测名称。如果你有多个调试器，你应该在它们前加上库名，并用“：”来分隔特性。例如Connect中的“bodyParser”就是“connect：bodyParser”。如果在名称末尾附加“*”，则不管DEBUG环境变量的设置如何，都将始终启用它。然后，您可以将其用于正常输出以及调试输出。

## 通配符

该*字符可以用作通配符。假设你的库有一个名为“connect：bodyParser”，“connect：compress”，“connect：session”的调试器，而不是列出所有三个 DEBUG=connect:bodyParser,connect:compress,connect:session，你可以简单的做 DEBUG=connect:*，或者使用这个模块来运行一切DEBUG=*。

您也可以通过给它们加一个“ - ”字符来排除特定的调试器。例如，DEBUG=*,-connect:*将包括除了以“connect：”开头的所有调试器。

## 环境变量
在运行Node.js时，可以设置一些环境变量来改变调试日志的行为：
| Name      | Purpose                                         |
|-----------|-------------------------------------------------|
| `DEBUG`   | 启用/禁用特定的调试命名空间。 |
| `DEBUG_HIDE_DATE` |隐藏调试输出的日期（非TTY）。 |
| `DEBUG_COLORS`| 是否在调试输出中使用颜色。 |
| `DEBUG_DEPTH` | 对象检查深度。                    |
| `DEBUG_SHOW_HIDDEN` | 显示检查对象的隐藏属性。 |

注意：环境变量DEBUG_最终将被转换为一个Options对象，并与%o/ %Oformatters一起使用。有关util.inspect() 完整列表，请参阅Node.js文档 。

## 格式化程序
调试使用printf样式的格式。以下是官方支持的格式化程序：
| Formatter | Representation |
|-----------|----------------|
| `%O`      |在多行打印一个对象。 |
| `%o`      |在一行打印一个对象。 |
| `%s`      | 字符串 |
| `%d`      | 数字（整数和浮点数） |
| `%j`      | JSON。如果参数包含循环引用，则替换为字符串“[Circular]”。 |
| `%%`      | 单一百分号（'％'）。这不会消耗一个参数。 |

### 自定义格式化程序

您可以通过扩展debug.formatters对象来添加自定义格式器。例如，如果您想添加对以十六进制渲染缓冲区的支持 %h，则可以执行如下操作：

```js
const createDebug = require('debug')
createDebug.formatters.h = (v) => {
  return v.toString('hex')
}

// …elsewhere
const debug = createDebug('foo')
debug('this is hex: %h', new Buffer('hello world'))
//   foo this is hex: 68656c6c6f20776f726c6421 +0ms
```

## 浏览器支持

您可以使用browserify构建一个浏览器就绪的脚本，或者只是使用browserify-as-a-service 构建，如果您不想自己构建它的话。

调试的启用状态当前被保存localStorage。考虑下面，你必须所示的情况worker:a和worker:b，并希望同时调试。你可以使用localStorage.debug以下命令启用它
```js
localStorage.debug = 'worker:*'
```
然后刷新页面。
```js
a = debug('worker:a');
b = debug('worker:b');

setInterval(function(){
  a('doing some work');
}, 1000);

setInterval(function(){
  b('doing some work');
}, 1200);
```

## 输出流

默认情况下debug会记录到stderr，但是可以通过重写log方法来配置每个命名空间：

```js
var debug = require('debug');
var error = debug('app:error');

// by default stderr is used
error('goes to stderr!');

var log = debug('app:log');
// set this namespace to log via console.log
log.log = console.log.bind(console); // don't forget to bind to console!
log('goes to stdout');
error('still goes to stderr!');

// set all output to go via console.info
// overrides all per-namespace log settings
debug.log = console.info.bind(console);
error('now goes to stdout via console.info');
log('still goes to stdout, but via console.info now');
```
## 动态设置
您也可以通过调用enable()方法来动态启用调试：
```js
let debug = require('debug');

console.log(1, debug.enabled('test'));

debug.enable('test');
console.log(2, debug.enabled('test'));

debug.disable();
console.log(3, debug.enabled('test'));

```
打印：
```
1 false
2 true
3 false
```
用法：
`enable(namespaces)`  
`namespaces 可以包含由冒号和通配符分隔的模式。
请注意，调用enable()完全覆盖以前设置的DEBUG变量：

```
$ DEBUG=foo node -e 'var dbg = require("debug"); dbg.enable("bar"); console.log(dbg.enabled("foo"))'
=> false
```
## 检查调试目标是否被启用
创建调试实例之后，可以通过检查enabled属性来确定是否启用了调试实例：
```javascript
const debug = require('debug')('http');

if (debug.enabled) {
  // do stuff...
}
```
您也可以手动切换此属性以强制启用或禁用调试实例。

