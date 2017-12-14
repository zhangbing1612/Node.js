 /**
  * 这里暴露的 setup方法 其实就是对外传递了一个 createDebug 工厂方法的闭包
  * 然后 createDebug 通过对 debug 对象的包装 成功创建出了一个 叫 debug 的 console.error  对象 直接 std 输出
  * 用了 ms 包 添加高亮
  * 装饰器模式  工厂模式 
  * 运行： 在这个项目的根目录 打开 cmd  然后  set DEBUG=worker:* node example/node/worker.js
  */
module.exports = function setup(env) {
  createDebug.debug = createDebug['default'] = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = require('ms');

  //通过阅读同级目录下 node.js 文件 exports 暴露的各种方法，在这里，通过node.js的引入，注入了与debug类无关地初始化工厂方法
  //注册了 load 方法  和 init 方法
  //为何不直接封装debug 类 然后通过exports 直接进行暴露，反而要进行一次包装呢，使用工厂模式呢 ？
  //answer  ： 因为要对 stderr 这个流对象进行包装，而采用一种装饰器模式和工厂模式混用地办法，保证 只有一个 debug 类地创建入口 而生成debug 对象
  //类似 js 的偏函数用法
  Object.keys(env).forEach(function(key) {
    createDebug[key] = env[key];
  });

  /**
   * Active `debug` instances.活动的debug实例
   * debug实例
   */
  createDebug.instances = [];

  /**
   * The currently active debug mode names, and names to skip.
   * 当前激活的debug模块名称和跳过的名称
   */

  createDebug.names = [];
  createDebug.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   * 匹配特殊字符%n处理函数，为debug的‘format’参数
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   * 有效的密钥名称是单个、小写或大写字母，即“n”和“n”
   */

  createDebug.formatters = {};

  /**
   * Select a color.
   * @param {String} namespace
   * @return {Number}
   * @api private
   */
  //颜色的选择

  function selectColor(namespace) {
    var hash = 0, i;

    for (i in namespace) {
      hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }
  createDebug.selectColor = selectColor;
  //此函数通过hash为命名空间选择颜色
  //charCodeAt() 方法可返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数。

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */
//工厂模式的体现，装饰器模式 在 同级 node.js 里面体现的 ，
//就哪个 module.exports = require('./common')(exports); 这就动态扩展了这个类了 ，具体实现还是在 setup 方法中
  function createDebug(namespace) {
    var prevTime;//过去时间

    function debug() {
      // disabled?
      if (!debug.enabled) return;//通过检查enabled属性来确定是否启用了调试实例

      var self = debug;

      // set `diff` timestamp
      var curr = +new Date();//当前时间
      var ms = curr - (prevTime || curr);//运行时间
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // turn the `arguments` into a proper Array
      //将'arguments'转换为数组
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

      //Throw the exception if the arguments[0] is typeof Error Object
      //这个地方就是替换Error 的地方 传入 Error 类对象 直接把 args[0] 转换成了报错信息
      args[0] = createDebug.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %O
        args.unshift('%O');
      }

      // apply any `formatters` transformations
      //格式化输出用的  对传入的参数 做一次格式化 然后 输出一种固定到模式
      var index = 0;
      //这 正则替换  e.g.  (This is an example %% , hello) => This is an example hello
      //这是 用 replace 方法替代了循环检查替换
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        index++;
        var formatter = createDebug.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          //这里调用 的 是 node.js 文件里面 各种 格式化输出符号的处理器，进行格式化输出了
          //现在只支持 %o %O 两种
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`现在需要除去args[index]自它内联’format‘后
          //把args[index] 和 之前的 字符串 来一场定位替换 
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // apply env-specific formatting (colors, etc.)
     //函数依赖 调用 信息格式化参数 加上 颜色
      createDebug.formatArgs.call(self, args);

      var logFn = self.log || createDebug.log;
      //这里直接调用的是从装饰器继承过来的方法，然后就输出了
      logFn.apply(self, args);
    }
    //装饰完成之后设置属性
    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    //debug.formatArgs = formatArgs;
    //debug.rawLog = rawLog;

    // env-specific initialization logic for debug instances调试实例的特定于环境的初始化
   //函数依赖
    if ('function' === typeof createDebug.init) {
      createDebug.init(debug);
    }
    //push 应为进行缓，自动注册一个活动地 debug 对象
    createDebug.instances.push(debug);

    //返回装饰过地 stderr 对象 ！
    return debug;
  }
//以下地各种方法 都是控制 debug 对象的  ，也就是 判断是否开启输出啊 销毁对象啊 等
  function destroy () {
    var index = createDebug.instances.indexOf(this);
    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }//判断是否销毁对象

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.通过冒号和通配符分离
   * 
   *
   * @param {String} namespaces
   * @api public
   */
//动态修改应该监听地模块
  function enable(namespaces) {
    createDebug.save(namespaces);

    createDebug.names = [];
    createDebug.skips = [];

    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);//通过冒号和通配符分离字符串
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings忽略空字符串
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }

  /**
   * Disable debug output.禁用debug输出
   *
   * @api public
   */

  function disable() {
    createDebug.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.如果给定的模式名已启用，则返回true，否则为false
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */
//判断 输入的模块是否被激活监听
  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }
    var i, len;
    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */
//判断信息正确与否
  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }

  createDebug.enable(createDebug.load());

  return createDebug;
}
