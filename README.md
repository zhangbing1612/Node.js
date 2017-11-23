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
颜色同样被用于可理解`%c`格式化选项的"Web Inspectors"。这些是




