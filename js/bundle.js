(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":10,"util/":5}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":12,"inherits":3}],6:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],7:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],8:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":6,"buffer":8,"ieee754":9}],9:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],10:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],11:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
const { Matrix } = require('./modules/matrix');
const assert = require('assert');

window.test =function test(){
    var matrixA = new Matrix(2, 2);
    matrixA.insertColumn(0, [0, 0]);
    matrixA.insertColumn(1, [1, 1]);
    let col0 = matrixA.getColumn(0);
    let col1 = matrixA.getColumn(1);
    let row0 = matrixA.getRow(0);
    let row1 = matrixA.getRow(1);

    assert.equal(col0[0], 0);
    assert.equal(col0[1], 0);
    assert.equal(col1[0], 1);
    assert.equal(col1[1], 1);

    assert.equal(row0[0], 0);
    assert.equal(row0[1], 1);
    assert.equal(row1[0], 0);
    assert.equal(row1[1], 1);
    console.log(matrixA.print(3));
}
test();
},{"./modules/matrix":18,"assert":2}],14:[function(require,module,exports){
const acorn = require('acorn');
const Sqrl = require('squirrelly');
const { Util } = require("./util.js");

let space = 0;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function hasBeenDeclared(codeGen, name) {
    return codeGen.getType(name) !== null;
}

function genSpace(space) {
    let s = [];
    for (let i = 0; i < space; ++i) {
        s.push(' ');
    }
    return s.join('');
}
function isMainFunction(codeGen) {
    return getFunctionName(codeGen) === 'main';
}

function getFunctionName(codeGen) {
    return codeGen.function.id.name;
}

function checkAndReturnParameter(codeGen, node) {
    let name;
    if (node.type === 'AssignmentPattern') {
        name = node.left.name;
    } else {
        throw formatThrowMessage(node, 'function parameters need to have default values assigned')
    };

    if (codeGen.getScope().variables.get(name)) {
        throw formatThrowMessage(node, 'variable ' + name + ' already has been declared in this scope')
    }
    return name;
}
function getParameter(codeGen,name){
    return codeGen.parameters.get(name);
}
function setParameter(codeGen,name,type){
    return  codeGen.parameters.set(name, type);
}

function storeArgument(codeGen, node, functionNode, name) {
    //store name and type of parameter, needed for later assertion
    let type = codeGen.type2String(node);
    codeGen.declareVariable(name, type);
    setParameter(codeGen,name,type);

    //store parameter in processed node, needed for later processing
    functionNode.parameters.push({ node: functionNode, name: getFunctionName(codeGen) + '_' + name, type: type });
    return type;
}

function processMainFunctionParameters(nodes, node, index, sb) {
    let name = checkAndReturnParameter(this.codeGen, node);
    //store the arguments of the function
    
    storeArgument(this.codeGen, node, this.functionNode, name);
    this.codeGen.handleType(node, sb);

    //check if there are more parameters to come
    if ((index + 1) < nodes.length) {
        sb.push(',');
    }
}
function processAnyFunctionParameters(nodes, node, index, sb) {
    let name = checkAndReturnParameter(this.codeGen, node);
    storeArgument(this.codeGen, node, this.functionNode, name);

    let tmp = [];
    this.codeGen.handleType(node, tmp);

    if (Util.isArray(tmp.join('')) ) {
        sb.push('in sampler2D sampler_' + name);
        sb.push(',');
        sb.push('float sampler_' + name + '_width');
    } else if (Util.is2DArray(tmp.join(''))) {
        sb.push('in sampler2D sampler_' + name);
        sb.push(',');
        sb.push('float sampler_' + name + '_width');
        sb.push(',');
        sb.push('float sampler_' + name + '_height');
    }else{
        sb.push(tmp.join(''));
    }

    //check if there are more parameters to come
    if ((index + 1) < nodes.length) {
        sb.push(',');
    }
}
/**
 * Translate the array access  into a glsl function
 */
function handleMemberExpression(codeGen, node, sb) {
    let data = {};
    let object = node;

    while (typeof object !== 'undefined' && object.type !== 'Identifier') {
        object = object.object;
    }

    if (typeof object === 'undefined') {
        let tmp = [];
        codeGen.handleType(node, tmp);
        let result = tmp.join('').replaceAll('this.thread.x', 'vKernelX');
        result = result.replaceAll('this.thread.y', 'vKernelY');
        return sb.push(result);
    }

    //check if variable has been defined
    if (!hasBeenDeclared(codeGen, object.name)) {
        throw formatThrowMessage(object, object.name + " has not been declared");
    }
    data.name = object.name;
    data.properties = [];

    //due to setting a transformation request, data will contain all properties after handling type
    setTransformationRequest(codeGen,'memberExpression',data)
    codeGen.handleType(node, []);
    deleteTransformationRequest(codeGen,'memberExpression');//remove transformation request

    //set name of glsl function
    sb.push('readTexture');
    sb.push('(');

    //set parameters of function
    for (let i = 0; i < data.properties.length; i++) {
        data.properties[i] = data.properties[i].replaceAll('this.thread.x', 'vKernelX');
        data.properties[i] = data.properties[i].replaceAll('this.thread.y', 'vKernelY');
        sb.push(data.properties[i]);
        if (i + 1 < data.properties.length) {
            sb.push(',');
        }
    }

    if (data.properties.length > 0) {
        sb.push(',');
        if (isMainFunction(codeGen)) {
            sb.push('uSampler_' + getFunctionName(codeGen) + "_" + data.name + "_width");
        } else {
            sb.push('sampler_' + data.name + "_width");
        }

    }
    if (data.properties.length > 1) {
        sb.push(',');
        if (isMainFunction(codeGen)) {
            sb.push('uSampler_' + getFunctionName(codeGen) + "_" + data.name + "_height");
        } else {
            sb.push('sampler_' + data.name + "_height");
        }
    }
    if (data.properties.length > 0) {
        sb.push(',');
        if (isMainFunction(codeGen)) {
            sb.push('uSampler_' + getFunctionName(codeGen) + "_" + data.name);
        } else {
            sb.push('sampler_' + data.name);
        }

    }
    sb.push(')');
}
class Visitor {
    constructor() {
        this.codenodes = [];
    }

    handleBlockStatement(node) {
        this.codenodes.push(node);
        let prevCodenodes = this.codenodes;
        this.codenodes = [];
        this.visitNodes(node.body);
        node.codenodes = this.codenodes;
        this.codenodes = prevCodenodes;
    }

    visitNodes(nodes) {
        for (const node of nodes) {
            this.visitNode(node)
        }
    }

    visitNode(node) {
        if (node === null || typeof node === 'undefined') {
            return;
        }

        switch (node.type) {
            case 'BlockStatement': this.handleBlockStatement(node); break;
            default: this.codenodes.push(node);
        }
    }

    run(nodes) {
        this.visitNodes(nodes);
        return this.codenodes;
    }
}

class Interpreter {
    constructor(visitor, source) {
        this.visitor = visitor;
        this.source = source;
    }
    interpret(nodes) {
        return this.visitor.run(nodes);
    }
}


function castNeeded(a, b) {
    a = a.replace(/ /g, ''); //remove whitespace
    b = b.replace(/ /g, ''); //remove whitespace

    if (a === b) {
        return null;

    }
    if ((a.includes('float') && !b.includes('float')) || !(a.includes('float') && b.includes('float'))) {
        return 'float';
    }

    return null;
}

function formatThrowMessage(node, message) {
    return '[' + node.start + ',' + node.end + ']:' + message;
}

function setTransformationRequest(codeGen,key,value){
    codeGen.transformationRequests.set(key,value);
}

function getTransformationRequest(codeGen,key){
    return codeGen.transformationRequests.get(key);
}

function deleteTransformationRequest(codeGen,key){
    codeGen.transformationRequests.delete(key);
}

class CodeGenerator {

    constructor() {
        this.scopes = [];
        this.code = "";
        this.function = null;
        this.sequenceID = 0;
        this.scopeIndex = -1;
        this.parameters = new Map();
        this.transformationRequests = new Map();
    }

    translate(source) {
        this.interpreter = new Interpreter(new Visitor(), source);
        this.body = acorn.parse(source, { preserveParens: true }).body;
        this.codenodes = this.interpreter.interpret(this.body);
        this.pushScope();

        let sb = [];
        this.iterate(this.codenodes, sb);
        this.code = sb.join('');
        return this.code;
    }


    pushScope() {
        if (this.scopeIndex <= (this.scopes.length - 1)) {
            let newScope = {};
            newScope.variables = new Map();
            this.scopes.push(newScope);
            this.scopeIndex++;
        }
        return this.getScope();
    }
    getScope() {
        return this.scopes[this.scopeIndex];
    }
    popScope() {
        this.scopeIndex--;
    }
    getType(name) {
        let type = null;
        for (let index = (this.scopes.length - 1); index >= 0; index--) {
            let scope = this.scopes[index];
            if (typeof scope.variables.get(name) !== 'undefined') {
                type = scope.variables.get(name);
                break;
            }
        }
        return type;
    }
    
    declareVariable(name, type) {
        this.getScope().variables.set(name, type);
    }

    iterate(codenodes, sb) {
        codenodes.forEach(node => {
            this.handleType(node, sb);
        });
    }
    iteratePlus(codenodes, sb, action) {
        for (let i = 0; i < codenodes.length; ++i) {
            action(codenodes, codenodes[i], i, sb);
        }
    }

    handleType(node, sb) {
        //console.log(node.type);
        switch (node.type) {
            case 'BreakStatement': return this.genBreakStatement(node, sb);
            case 'VariableDeclarator': return this.genVariableDeclarator(node, sb);
            case 'VariableDeclaration': return this.genVariableDeclaration(node, sb);
            case 'ForStatement': return this.genForStatement(node, sb);
            case 'BinaryExpression': return this.genBinaryExpression(node, sb);
            case 'Identifier': return this.genIdentifier(node, sb);
            case 'Literal': return this.genLiteral(node, sb);
            case 'UpdateExpression': return this.genUpdateExpression(node, sb);
            case 'BlockStatement': return this.genBlockStatement(node, sb);
            case 'ExpressionStatement': return this.genExpressionStatement(node, sb);
            case 'CallExpression': return this.genCallExpression(node, sb);
            case 'MemberExpression': return this.genMemberExpression(node, sb);
            case 'IfStatement': return this.genIfStatement(node, sb);
            case 'WhileStatement': return this.genWhileStatement(node, sb);
            case 'AssignmentExpression': return this.genAssignmentExpression(node, sb);
            case 'ArrayExpression': return this.genArrayExpression(node, sb);
            case 'FunctionDeclaration': return this.genFunctionDeclaration(node, sb);
            case 'ThisExpression': return this.genThisExpression(node, sb);
            case 'ReturnStatement': return this.genReturnStatement(node, sb);
            case 'AssignmentPattern': return this.genAssignmentPattern(node, sb);
            case 'ParenthesizedExpression': return this.getParenthesizedExpression(node, sb);
        }
    }
    genAssignmentPattern(node, sb) {
        //let b = a; and a = [] or a = [[]] => This is not yet supported so throw an exception
        /*if (Util.isArray(this.type2String(node.right)) || Util.is2DArray(this.type2String(node.right))){
            throw formatThrowMessage(node,'arrays can not be assigned');
        }*/
        //let b = a; => Give b the same type as a
        sb.push(this.type2String(node.right) + ' ');
        this.handleType(node.left, sb);
    }
    genReturnStatement(node, sb) {

        let tmp = [];
        if (node.argument.type === 'MemberExpression') {
            handleMemberExpression(this, node.argument, tmp);
        } else {
            this.handleType(node.argument, tmp);
        }

        if ( getTransformationRequest(this,'replaceReturnStatement')  === true) {
            //sb.push(Sqrl.Render('gl_FragData[0] = vec4({{returnValue}},0.,0.,0.);', { returnValue: tmp.join('') }));
            sb.push(Sqrl.Render('write({{returnValue}},{{functionName}});', { returnValue: tmp.join(''),functionName: getFunctionName(this).toUpperCase() }));
            deleteTransformationRequest(this,'replaceReturnStatement');
        } else {
            sb.push(Sqrl.Render('return write({{returnValue}},{{functionName}});', { returnValue: tmp.join(''),functionName: getFunctionName(this).toUpperCase() }));
        }
    }
    genArrayExpression(node, sb) {

    }
    genThisExpression(node, sb) {
        sb.push('this');
    }
    genFunctionDeclaration(node, sb) {
        this.function = node;

        let signature = [];
        let tmp = [];
        this.handleType(node.id, tmp);
        let name = tmp.join('');

        //if the function has the name 'main' it needs to be handled specially
        if (name === 'main') {
            signature.push('void ');
            setTransformationRequest(this,'replaceReturnStatement', true);
        } else {
            signature.push('float ');
        }
        signature.push(name);
        signature.push('(');
      
        //process function parameters 
        tmp = [];
        node.parameters = [];
        const scope = {
            codeGen: this,
            functionNode: node
        }
        if (isMainFunction(this)) {
            this.iteratePlus(node.params, tmp, processMainFunctionParameters.bind(scope));
        } else {
            this.iteratePlus(node.params, tmp, processAnyFunctionParameters.bind(scope));
        }

        if (name === 'main') {
            signature.push('void');
        } else {
            signature.push(tmp.join(''));
        }

        signature.push(')');
        this.function.signature = signature.join('');

        sb.push(signature.join(''));
        if(isMainFunction(this)){
            setTransformationRequest(this,'mainBody', true);
        }
        this.handleType(node.body, sb);
       
        deleteTransformationRequest(this,'replaceReturnStatement');
        node.code = sb.join('');
    }
    
    getParenthesizedExpression(node, sb) {
        sb.push('(');
        this.handleType(node.expression, sb);
        sb.push(')');
    }
    genAssignmentExpression(node, sb) {
        this.handleType(node.left, sb);
        sb.push(node.operator);
        if (node.right.type === 'MemberExpression') {
            handleMemberExpression(this, node.right, sb);
        } else {
            this.handleType(node.right, sb);
        }
        
    }
    genWhileStatement(node, sb) {
        sb.push('while (')
        this.handleType(node.test, sb);
        sb.push(')')
        this.handleType(node.body, sb);
    }
    genIfStatement(node, sb) {
        sb.push('if(');
        this.handleType(node.test, sb);
        sb.push(')');
        this.handleType(node.consequent, sb);
        if (node.alternate !== null) {
            sb.push('else ');
            this.handleType(node.alternate, sb);
        }
    }
    genBlockStatement(node, sb) {
        this.pushScope();
        sb.push('{');
        if(getTransformationRequest(this,'mainBody')=== true){
            sb.push('  init();');
            deleteTransformationRequest(this,'mainBody');
        }
        this.iterate(node.body, sb);
        sb.push('}');
        this.popScope();
    }
    genExpressionStatement(node, sb) {
        let tmp = [];

        if (node.expression.type === 'MemberExpression') {
            let object = node.expression.object;

            while (object.type !== "Identifier") {
                object = object["object"];
            }
            if (!hasBeenDeclared(this, object.name)) {
                throw formatThrowMessage(node, node.expression.object.name + ' undefined');
            }
            if (!Util.isArray(this.getType(object.name))) {
                throw formatThrowMessage(node, object.name + ' is of type ' + this.getType(object.name) + ' but must be array type');
            }

            handleMemberExpression(this, node.expression, sb);
            sb.push(';');
            deleteTransformationRequest(this,'memberExpression');
        } else {
            this.handleType(node.expression, tmp);
            sb.push(tmp.join(''));
            sb.push(';');
        }
    }
    genCallExpression(node, sb) {
        this.handleType(node.callee, sb);
        sb.push('(');
        let self = this;
        this.iteratePlus(node.arguments, sb, function (nodes, node, index, sb) {
            let tmp = [];
            if (node.type === 'MemberExpression') {
                handleMemberExpression(self, node, sb);
            } else {
                self.handleType(node, tmp);
                //make sure that identifier has been declared
                if (node.type === 'Identifier' && !hasBeenDeclared(self, node.name)) {
                    throw formatThrowMessage(node, tmp.join('') + " unknown identifier");
                }
                /*  Check if functioan call argument is an array.
                    If this is the case, replace the argument by the sampler, texture-width and texture-height
                */
                let type = self.getType(tmp.join(''));
                
                //This is required if argument is a constant like 1.0 or if argument is a function call
                if (type === null){
                    type = tmp.join('');
                }

                if (Util.isArray(type)) {
                    if (isMainFunction(self)) {
                        sb.push('uSampler_' + getFunctionName(self) + "_" + tmp.join(''));
                        sb.push(',');
                        sb.push('uSampler_' + getFunctionName(self) + "_" + tmp.join('') + '_width');
                    }else{
                        sb.push('sampler_'+ tmp.join(''));
                        sb.push(',');
                        sb.push('sampler_'+ tmp.join('') + '_width');
                    }
                } else if (Util.is2DArray(type)) {
                    if (isMainFunction(self)) {
                        sb.push('uSampler_' + getFunctionName(self) + "_" + tmp.join(''));
                        sb.push(',');
                        sb.push('uSampler_' + getFunctionName(self) + "_" + tmp.join('') + '_width');
                        sb.push(',');
                        sb.push('uSampler_' + getFunctionName(self) + "_" + tmp.join('') + '_height');
                    }else{
                        sb.push('sampler_'+ tmp.join(''));
                        sb.push(',');
                        sb.push('sampler_'+ tmp.join('') + '_width');
                        sb.push(',');
                        sb.push('sampler_'+ tmp.join('') + '_height');
                    }
                } else {
                    sb.push(tmp.join(''));
                }

                //be ready for next argument
                if ((index + 1) < nodes.length) {
                    sb.push(',');
                }
            }

        })
        sb.push(')');
    }
    genMemberExpression(node, sb) {
        this.handleType(node.object, sb);
        node.computed === false ? sb.push('.') : sb.push('[');
        this.handleType(node.property, sb);

        if (node.computed) {
            //check that property (variable) has been defined.
            if (node.property.type === 'Identifier' && !hasBeenDeclared(this,node.property.name)) {
                throw formatThrowMessage(node, node.property.name + ' undefined')
            }
            if (typeof getTransformationRequest(this,'memberExpression')  != 'undefined') {
                let tmp = [];
                this.handleType(node.property, tmp);
                getTransformationRequest(this,'memberExpression').properties.push(tmp.join(''));
            }

            sb.push(']');
        }
    }
    type2String(node) {
        if (node.type === 'MemberExpression') {
            return 'float';
        }
        if (node.type === 'ParenthesizedExpression') {
            return this.type2String(node.expression);
        }
        if (node.type === 'Identifier') {
            return this.getType(node.name);
        }
        if (node.type === 'Literal' && typeof node.value === 'number') {
            if (node.raw.includes(".")) {
                return "float";
            } else {
                return "int";
            }
        }

        if (node.type === 'AssignmentPattern') {
            return this.type2String(node.right);
        }

        if (node.type === 'ArrayExpression') {
            if (node.elements.length > 1) {
                throw 'Only 1D or 2D arrays can be handled';
            } else if (node.elements.length === 1) {
                return "float [][]";
            }
            return "float []";
        }

        if (node.type === 'BinaryExpression') {
            switch (node.operator) {

                case '%': ;//we do not put a break here since we want + logic to be executed
                case '/': ;//we do not put a break here since we want + logic to be executed
                case '*': ;//we do not put a break here since we want + logic to be executed
                case '+': {
                    let left = this.type2String(node.left);
                    let right = this.type2String(node.right);

                    if (left.includes('float')) {
                        return left;
                    }
                    if (right.includes('float')) {
                        return right;
                    }

                    if (!left.includes('unknown')) {
                        return left;
                    }
                    return right;
                }
            }
        }

        if (node.type === 'UpdateExpression') {
            return "int";
        }

        if (node.type === 'CallExpression') {
            return "float";
        }
        return "unknown";
    }
    genBreakStatement(node, sb){
        sb.push('break;');
    }
    genVariableDeclarator(node, sb) {
        if (node.init === null && !hasBeenDeclared(this,node.id.name)) {
            throw formatThrowMessage(node, "Variable declarator must be initialized");
        }
        let type;
        if (node.init === null) {
            type = this.getType(node.id.name);
        } else {
            type = this.type2String(node.init);
        }

        if (Util.isArray(type) || Util.is2DArray(type)){
            throw formatThrowMessage(node,'assignment of array to variable not supported');
        }
        this.declareVariable(node.id.name, type);
        sb.push(type + ' ');
        sb.push(node.id.name);
        sb.push('=');

        if (node.init.type === 'MemberExpression') {
            let tmp = []
            handleMemberExpression(this, node.init, tmp);
            sb.push(tmp.join(''));
            sb.push(';');
            return;
        } else {
            this.handleType(node.init, sb)
        }

        sb.push(';');
    }
    genVariableDeclaration(node, sb) {
        this.iterate(node.declarations, sb);
    }
    genForStatement(node, sb) {
        sb.push(genSpace(space));
        sb.push('for(');
        this.handleType(node.init, sb);
        //sb.push(';');
        this.handleType(node.test, sb);
        sb.push(';');
        this.handleType(node.update, sb);
        sb.push(')');
        this.handleType(node.body, sb);
    }
    genBody(node, sb) {
        sb.push('{');
        if (isMainFunction(this)){
            sb.push('//Hello World');
        }
        
        this.iterate(node, sb);
        sb.push('}');
    }

    genBinaryExpression(node, sb) {
        let intermediate = [];
        let typeLeft = this.type2String(node.left);
        let typeRight = this.type2String(node.right);

        /*if typeLeft != typeRight get the type to which 
        one of the sides needs to get casted to*/
        let castType = castNeeded(typeLeft, typeRight);


        let leftSide = "";
        let tmp = [];
        if (node.left.type === 'MemberExpression') {
            handleMemberExpression(this, node.left, tmp);
            leftSide = tmp.join('');
        } else {
            this.handleType(node.left, tmp);
            leftSide = tmp.join('');
        }

        let rightSide = "";
        tmp = [];
        if (node.right.type === 'MemberExpression') {
            handleMemberExpression(this, node.right, tmp);
            rightSide = tmp.join('');
        } else {
            this.handleType(node.right, tmp);
            rightSide = tmp.join('');
        }

        //check if left side needs to get casted
        if (castType !== null && typeLeft !== castType) {
            intermediate.push(castType + '(')
            intermediate.push(leftSide);
            intermediate.push(')')
        } else {
            intermediate.push(leftSide);
        }

        if (node.operator === '%') {
            intermediate.push(',');
        } else {
            intermediate.push(node.operator);
        }

        //check if right side needs to get casted
        if (castType !== null && typeRight !== castType) {
            intermediate.push(castType + '(');
            intermediate.push(rightSide);
            intermediate.push(')');
        } else {
            intermediate.push(rightSide);
        }

        if (node.operator === '%') {
            sb.push('mod(');
            sb.push(intermediate.join(''));
            sb.push(')');
        } else {
            sb.push(intermediate.join(''));
        }
    }

    genIdentifier(node, sb) {
        let type = this.parameters.get(node.name);

        //if its not an array type and main function is processed then it is a uniform 
        if (type && !(Util.isArray(type) || Util.is2DArray(type)) && isMainFunction(this)) {
            sb.push("u_" + getFunctionName(this) + "_" + node.name);
        } else {
            sb.push(node.name);
        }

    }
    genLiteral(node, sb) {
        sb.push(node.raw);
    }
    genUpdateExpression(node, sb) {
        if (typeof node.argument !== 'undefined' && isMainFunction(this)){
            let identifierName = node.argument.name;
            let parameter =getParameter(this,identifierName);
            if ( typeof parameter !== 'undefined' && parameter !== null ){
                throw 'update operation can not be performed on parameter of main function';
            }
        }
        
        if (node.argument.type === 'MemberExpression') {
            throw formatThrowMessage(node.argument, 'Update operation not allowed on array member');
        }
        (node.prefix === true) ? sb.push(node.operator) : "";
        this.handleType(node.argument, sb);
        (node.prefix !== true) ? sb.push(node.operator) : "";
    }
}

module.exports.CodeGenerator = CodeGenerator
},{"./util.js":24,"acorn":25,"squirrelly":87}],15:[function(require,module,exports){
const beautify = require('js-beautify')
 
class Formatter {
    constructor() {
        this.INDENTSIZE = 4;
    }
   
    format(code) {
        code = beautify(code, { indent_size: 2, space_in_empty_paren: true })
        return code;
    }
}
module.exports.Formatter = Formatter;
},{"js-beautify":63}],16:[function(require,module,exports){
class FrameBuffer{
    constructor(gl,frameBuffer,texture,width,height){
		this.gl = gl,
		this.glFrameBuffer = frameBuffer,
		this.texture = texture,
		this.width = width,
		this.height = height
    }

    delete(){
		this.gl.deleteFramebuffer(this.glFrameBuffer);
    }
};

module.exports.FrameBufferFactory = class FrameBufferFactory {
	//http://www.songho.ca/opengl/gl_fbo.html
	//https://github.com/tsherif/webgl2examples/blob/master/deferred.html
	//https://hacks.mozilla.org/2014/01/webgl-deferred-shading/
	//https://stackoverflow.com/questions/34154300/readpixels-on-multiple-draw-buffers-in-webgl
	//https://www.cs.cornell.edu/courses/cs4620/2017sp/cs4621/lecture08/exhibit03.html
	static createFrameBuffer(gl, texture) {
		// create and bind framebuffer
		var glFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, /*level*/ 0);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			throw "Error: binding of framebuffer failed";

		return new FrameBuffer(gl,glFrameBuffer,texture,texture.width,texture.height);
	}

	static createFrameBufferMultiAttachement(gl, textures) {
		let ext = gl.getExtension('WEBGL_draw_buffers');
		let offset = ext.COLOR_ATTACHMENT0_WEBGL;
		let buffers = [];
		let i = 0;

		textures.forEach(() => {
			buffers.push(offset + i);
			i++;
		});

		var frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		i = 0;
		textures.forEach(arg => {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, arg.texture, /*level*/ 0);
			++i;
		});

		ext.drawBuffersWEBGL(buffers);
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			console.log("Error: binding of framebuffer failed");

		var result = {
			gl:gl,
			glFrameBuffer: frameBuffer,
			delete: function(){
				this.gl.deleteFramebuffer(this.glFrameBuffer);
			}
		}

		return result;
	}
}
},{}],17:[function(require,module,exports){
function checkDimensions(impl) {
  if (typeof impl.dimensions === 'undefined') {
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';
  }
}
function checkArguments(args, options) {
  if (options.parameterMap.size !== args.length) {
    throw "mismatch between number of declared function parameters and number of actually passed arguments"
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    let type = options.parameterMap.get(i).type;

    if (Util.isArray(type)) {
      if (Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type 1d array but is 2d array';
      }
      if (!Array.isArray(arg) && !ArrayBuffer.isView(arg)) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
    }

    if (Util.is2DArray(type)) {
      if (!Array.isArray(arg[0])  && !ArrayBuffer.isView(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }
    }

    if (Util.isInteger(type)) {
      if (!Util.isArgumentInteger(arg)) {
        throw 'expected function argument ' + i + ' to be of type integer';
      }
    }

    if (Util.isFloat(type)) {
      if (Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type float';
      }
    }
  }
}

function getUniformLocation(program, id) {
  let location = program.gl.getUniformLocation(program.glProgram, id);

  if (location === null) {
    throw 'could not find unifrom ' + id;
  }

  return location;
}

function setUniformLocationFloat(program, id, value) {
  let gl = program.gl;
  gl.uniform1f(getUniformLocation(program, id), value);
}

function setUniformLocationInt(program, id, value) {
  let gl = program.gl;
  gl.uniform1i(getUniformLocation(program, id), value);
}

function setUniforms(program, width, height, args, options) {
  let textures = [];
  let gl = program.gl;

  setUniformLocationFloat(program, "uResultTextureWidth", width);
  setUniformLocationFloat(program, "uResultTextureHeight", height);

  for (let i = 0; i < args.length; ++i) {
    let arg = args[i];
    let type = options.parameterMap.get(i).type;
    let name = options.parameterMap.get(i).name;

    if (Util.isArray(type) || Util.is2DArray(type)) {
      //width and height of inputTexture not required to be same dimensions as resultTexture
      let width = arg.length;
      let height = 1.0;

      //set propper height
      if (Util.is2DArray(type)) {
        width = arg[0].length;
        height = arg.length;
        setUniformLocationFloat(program, "uSampler_" + name + "_height", height);
      }
      setUniformLocationFloat(program, "uSampler_" + name + "_width", width);

      let inputTexture = TextureFactory.createTextureByDimension(gl, "texture_uSampler_" + name, width, height, Util.data2Texel(width, height, arg, 'R'));
      textures.push(inputTexture);
      setUniformLocationInt(program, "uSampler_" + name, inputTexture.index);

    }

    if (Util.isInteger(type)) {
      setUniformLocationInt(program, "u_" + name, arg);
    }

    if (Util.isFloat(type)) {
      setUniformLocationFloat(program, "u_" + name, arg);
    }

  }

  return textures;
}

//The dictionary is a map which is mapping function names to function code
function createFunctionDictonary() {
  let dictionary = {};
  
  //add properties
  dictionary.functionMap = new Map();
  //function property that retrieves all dictionary excluding the main function
  dictionary.getFunctionsExclusiveMain = function () {
    let result = [];
    this.functionMap.forEach(function (fnct, name) {
      if (name !== 'main') {
        result.push(fnct);
      }
    });
    return result;
  }

  //function property that retrieves all functions
  dictionary.getAll = function () {
    let result = [];
    this.functionMap.forEach(function (fnct) {
      result.push(fnct);
    });
    return result;
  }

  //get function by name
  dictionary.get = function (name) {
    return this.functionMap.get(name);
  }

  //set function by name
  dictionary.set = function (name, fnct) {
    this.functionMap.set(name, fnct);
  }

  return dictionary;
}

/** 
  Create options to be passed to template engine. 
  One set of options per function.

  @param functions functions that have been passed as arguments
  @param dictionary dictionary to lookup functions
*/
function setupTemplateOptions(functions, dictionary) {
  for (let i = 0; i < functions.length; ++i) {
    let options = {};
    options.samplers = [];
    options.samplers2D = [];
    options.integers = [];
    options.floats = [];
    options.signature = "";
    options.parameterMap = new Map();

    let codeGen = functions[i].codeGen;
    let parameters = codeGen.function.parameters; //parameters of function

    options.signature = codeGen.function.signature;
    options.functionName = codeGen.function.id.name;

    if (typeof dictionary.get(codeGen.function.id.name) !== 'undefined') {
      throw "function names must be unique. " + codeGen.function.id.name + " has already been defined";
    }

    dictionary.set(codeGen.function.id.name, functions[i]);
    let paramIndex = 0;

    parameters.forEach(param => {
      let type = param.type;
      let value = { name: param.name, type: type, index: paramIndex };

      if (Util.isArray(type)) {
        options.samplers.push(value);
      }

      if (Util.is2DArray(type)) {
        options.samplers2D.push(value);
      }

      if (Util.isInteger(type)) {
        options.integers.push(value);
      }

      if (Util.isFloat(type)) {
        options.floats.push(value);
      }

      options.parameterMap.set(paramIndex, value);
      paramIndex++;
    });
    functions[i].options = options;
  }

  return dictionary;
}
function setAdditionalOptions(mainOptions, dictionary) {
  let functions = dictionary.getFunctionsExclusiveMain();
  let i = 1;
  let numResultTextures = Math.floor((functions.length)/4)+1;
  mainOptions.numResults=numResultTextures;
  functions.forEach(funct => {
    mainOptions.functions.push((new Formatter()).format(funct.glslCode));
    mainOptions.signatures.push(funct.options.signature);
    mainOptions.preprocessor.push({ name: funct.options.functionName.toUpperCase(), id: i });
    funct.options.targetIndex = i; //used for result lookup
    i++;
  });
}

function createdictionary(functions) {
  let dictionary = createFunctionDictonary();
  dictionary = setupTemplateOptions(functions, dictionary);

  let main = dictionary.get('main');
  let mainOptions = main.options;
  mainOptions.main = (new Formatter()).format(main.glslCode);
  mainOptions['functions'] = [];
  mainOptions['signatures'] = [];
  mainOptions['preprocessor'] = [];
  mainOptions['targetIndex'] = 0;

  setAdditionalOptions(mainOptions, dictionary);

  return dictionary;
}


class FunctionBuilder {
  /**
   * 
   * 
   * @param functions Multiple functions can be passed to the Kernel
   */
  static buildFunction(functions) {
    //let options = createOptions(codeGen.function.parameters, glslCode);
    let dictionary = createdictionary(functions);
    let fragmentShaderCode = ShaderCode.generateFragmentShader(dictionary);
    let vertexShaderCode = ShaderCode.generateVertexShaderCode();
    let inputTextures;
    let resultTextures;
    let program;

    function implementation(...args) {
      //check(implementation, args, implementation.options);
      let options = dictionary.get('main').options;
      checkDimensions(implementation);
      checkArguments(args, options);

      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      program = new Program(width, height);

      //console.log(vertexShaderCode);
      //console.log(fragmentShaderCode);

      program.buildProgram(vertexShaderCode, fragmentShaderCode);
      inputTextures = setUniforms(program, width, height, args, options);

      resultTextures = program.execute(options.numResults);

      /*resultTextures.forEach(texture => {
        texture.delete();
      })*/
      return implementation;
    }

    implementation.fragmentShaderCode = fragmentShaderCode;
    implementation.vertexShaderCode = vertexShaderCode;
    implementation.dictionary = dictionary;

    implementation.getVertexShaderCode = function () {
      return implementation.vertexShaderCode;
    }

    implementation.getFragmentShaderCode = function () {
      return implementation.fragmentShaderCode;
    }

    implementation.result = function (name) {
      if (typeof name === 'undefined') {
        name = 'main';
      }
      let targetIndex = implementation.dictionary.get(name).options.targetIndex;

      if (typeof targetIndex === 'undefined') {
        throw 'could not lookup result of function ' + name;
      }

      let textureIndex = Math.floor(targetIndex/4);
      targetIndex = targetIndex % 4;
      return Util.texture2array(program.gl, resultTextures[textureIndex], targetIndex);
    }

    implementation.delete = function () {
      program.delete();
      resultTextures.forEach(texture => {
        texture.delete();
      });
      inputTextures.forEach(texture => {
        texture.delete();
      });
    }

    implementation.setOutput = function (dimensions) {
      this.dimensions = dimensions;
      return implementation;
    };

    return implementation;
  }
}

class Kernel {
  constructor() { }

  static create(...fncts) {
    let functions = [];
    for (let i = 0; i < fncts.length; ++i) {
      let codeGen = new CodeGenerator();
      let glslCode = codeGen.translate(fncts[i].toString());
      functions.push({ codeGen: codeGen, glslCode: glslCode });
    }
    let result = FunctionBuilder.buildFunction(functions);
    return result;
  }
}
module.exports = {
  Kernel,
  FunctionBuilder
}
const { CodeGenerator } = require('./../modules/codegenerator.js');
const { Util } = require( './../modules/util.js');
const { ShaderCode } = require('./../modules\\shadercode.js');
const { Program } = require('./../modules/program.js');
const { TextureFactory } = require('./../modules\\texturefactory.js');
const { Formatter } = require("./formatter.js");
},{"./../modules/codegenerator.js":14,"./../modules/program.js":19,"./../modules/util.js":24,"./../modules\\shadercode.js":22,"./../modules\\texturefactory.js":23,"./formatter.js":15}],18:[function(require,module,exports){
const  {Kernel} = require('./kernel.js');
module.exports.Matrix = class Matrix {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Array();
        for (var row = 0; row < this.height; row++) {
            this.data.push(new Array(width));
        }
    }

    /**
     * Initializes the matrix to zeros.
     * @returns This matrix.
     */
    zeroInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = 0;
            }
        }
        return this;
    }

    /**
     * Randomly initialzes the matrix.
     * Note that the math random number is divided by 10 in order to
     * generate small numbers.
     * @returns This matrix
     */
    randomInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = Math.random() / 10.0;
            }
        }
        return this;
    }

    /**
     * Initializes the matrix to ones
     * @returns This matrix
     */
    oneInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = 1;
            }
        }
        return this;
    }

    /**
     * Add column at given column index to matrix
     * @param column index of column
     * @param columnVector column data to be set
     * @returns this matrix
     */

    insertColumn(column, columnVector) {
        if (columnVector.length != this.height) {
            throw 'column vector length does not match matrix height'
        }
        if (column >= this.width) {
            throw 'column index is out of scope'
        }

        for (var row = 0; row < this.height; row++) {
            this.data[row][column] = columnVector[row];
        }

        return this;
    }

    /**
     * Add columnVector values to column at given column index
     * @param column index of column
     * @param columnVector column data to be set
     * @returns this matrix
     */

    addColumn(column, columnVector) {
        if (columnVector.length != this.height) {
            throw 'column vector length does not match matrix height'
        }
        if (column >= this.width) {
            throw 'column index is out of scope'
        }

        for (var row = 0; row < this.height; row++) {
            this.data[row][column] += columnVector[row];
        }

        return this;
    }

    /** 
     * Add rowVector values to row at given row index
    * @returns This matrix
    */
    addRow(row, data) {

        for (var col = 0; col < this.width; col++) {
            this.data[row][col] += data[col];
        }

        return this;
    }
    /** 
     * Add row at given row index to matrix
     * @param row index of row
     * @param rowVector row data to be set
     * @returns this matrix
     */

    insertRow(row, rowVector) {
        if (rowVector.length != this.width) {
            throw 'row vector length does not match matrix width'
        }
        if (row >= this.height) {
            throw 'row index is out of scope'
        }
        this.data[row] = rowVector;

        return this;
    }
    /** Initializes the matrix to an ascending sequence.
    * @returns This matrix
    */
    sequenzeInitialize(factor) {
        if (typeof factor === 'undefined'){
            factor = 1;
        }
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = ((row * this.width) + col) / factor;
            }
        }
        return this;
    }

    /** Initializes each row in the matrix in ascending order starting from 0.
    * @returns This matrix
    */
   sequenzeInitializePerRow() {
    for (var row = 0; row < this.height; row++) {
        for (var col = 0; col < this.width; col++) {
            this.data[row][col] = col;
        }
    }
    return this;
}

    /**
     * Return that matrix value at the given row and column.
     * @param {Integer} row row of matrix
     * @param {Integer} col column of matrix
     * @returns Requested value, null if row and/or col arguments are not in the range of the matrix dimension.
     */
    getValue(row, col) {
        if (row < this.height && col < this.width) {
            return this.data[row][col];
        }
        return null;
    }

    /**
     * Returns the matrix values of the given column.
     * @param {Integer} col 
     */
    getColumn(col) {
        var column = new Array();

        if (col < this.width) {
            for (var row = 0; row < this.height; row++) {
                column.push(this.data[row][col]);
            }
        }

        return column;
    }
    /**
     * Returns the matrix values of the given row.
     * @param {Integer} row
     * @returns row as array, empty array if the given row argument is out of matrix scope. 
     */
    getRow(row) {
        if (row < this.height) {
            return this.data[row];
        }
        return [];
    }

    /**
     * Set matrix value at the given row and column
     * @param {Integer} row 
     * @param {Integer} col
     * @param {Number} value
     * @returns This matrix
     */
    setValue(row, col, value) {
        if (row < this.height && col < this.width) {
            this.data[row][col] = value;
        }
        return this;
    }

    /**
     * Set matrix data
     * @param {array} data 2 dimensional array containing the matrix data 
     * @returns this matrix
     */
    setData(data) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                this.data[row][col] = data[row][col];
            }
        }
        return this;
    }

    /**
     * Returns the matrix as a string in order to log it to the console
     * @param {Integer} decimals number of decimals to be printed 
     * @returns the matrix data
     */
    print(decimals) {

        let result = "";
        let rowContent = "";
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                rowContent += (this.data[row][col]).toFixed(decimals) + " ; "
            }
            result += rowContent + "\r\n";
            rowContent = "";
        }
        return result;
    }

    /** 
     * Returns the data as non typed 2D array
     * @returns Matrix data as non typed 2D array
     */
    as2DArray() {
        let result = [];

        for (let row = 0; row < this.height; row++) {
            result[row] = [];
            for (let col = 0; col < this.width; col++) {
                result[row].push(this.data[row][col]);
            }
        }
        return result;
    }

    getRow(rowIndex) {
        return this.data[rowIndex];
    }

    mergeRow(texelRowOrig, texelRowCopy, copyComponent, targetComponent) {
        let length = Math.min(texelRowOrig.length, texelRowCopy.length);
        let copyOffset = 0;

        switch (copyComponent) {
            //R component of RGBA color
            case 'R':
                copyOffset = 4;
                break;
            //G component of RGBA color
            case 'G':
                copyOffset = 3;
                break;
            //B component of RGBA color
            case 'B':
                copyOffset = 2;
                break;
            //A component of RGBA color
            case 'A':
                copyOffset = 1;
                break;
            default:
                throw "mergeRow: copyComponent " + copyComponent + " unknown";
        }

        for (let cnt = 4; cnt < length; cnt += 4) {

            switch (targetComponent) {
                //R component of RGBA color
                case 'R':
                    texelRowOrig[cnt - 4] = texelRowCopy[cnt - copyOffset];
                    break;
                //G component of RGBA color
                case 'G':
                    texelRowOrig[cnt - 3] = texelRowCopy[cnt - copyOffset];
                    break;
                //B component of RGBA color
                case 'B':
                    texelRowOrig[cnt - 2] = texelRowCopy[cnt - copyOffset];
                    break;
                //A component of RGBA color
                case 'A':
                    texelRowOrig[cnt - 1] = texelRowCopy[cnt - copyOffset];
                    break;
                default:
                    throw "mergeRow: targetComponent " + targetComponent + " unknown";
            }
        }
    }

    componentToIndex(component) {
        switch (component) {
            //R component of RGBA color
            case 'R':
                return 0;
            //G component of RGBA color
            case 'G':
                return 1;
            //B component of RGBA color
            case 'B':
                return 2;
            //A component of RGBA color
            case 'A':
                return 3;
            default:
                throw "componentToIndex: component " + component + " unknown";
        }
    }

    getTexels(component) {
        let result = new Float32Array(4 * this.height * this.width);
        let cnt = 0;

        if (component === undefined) {
            component = "R";
        }

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;

                switch (component) {
                    //R component of RGBA color
                    case 'R':
                        result[cnt - 4] = this.data[row][col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = this.data[row][col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = this.data[row][col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = this.data[row][col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }

    getResultMatrixDimensions(matrixB) {
        let thisHeight = this.height;
        let otherWidth = matrixB.width;

        return {
            height: thisHeight,
            width: otherWidth
        };
    }

    /**
	 * multiply this matrix by the given matrix and return the matrix multiplication result as new matrix
     * 
     * @param {Matrix} matrixB -   The matrix to be multiplied with this matrix
     * @return {Texture} - The result of the matrix multiplication stored in a texture
    */
    multiply(matrixB) {

        let dimension = this.getResultMatrixDimensions(matrixB);
        let test = Kernel.create(function main(a=[[]],b=[[]],width = 0) {
            let result = 0.;
            for(let j=0; j < 2048;j++){
                if (j == width) break;
                result +=  a[this.thread.y][j] *b[j][this.thread.x];
            }
            return result;
        }).setOutput([dimension.width, dimension.height]);
        
        let result = new Matrix(dimension.width, dimension.height);
        result.setData(test(this.data,matrixB.data,this.width).result());
        test.delete();
        return result;
    }
}






},{"./kernel.js":17}],19:[function(require,module,exports){
var headlessGL = require('gl');

function genTextures(gl,num,width,height) {
	let textures = [];
	for (let i=0; i < num;++i){
		textures.push(TextureFactory.createReadableTexture(gl, 'resultTexture', { width: width, height: height }));
	}
	return textures;
}
class Program {

	constructor(width, height, gl) {
		this.glProgram = null;
		this.debug = false;
		this.vertexBuffer = null;
		this.texCoords = null;
		this.width = width;
		this.height = height;

		if (typeof gl === 'undefined' && typeof this.gl === 'undefined') {
			this.gl = Program.createGl(width, height);
		} else {
			this.gl = gl;
		}
	}

	static createGl(width, height) {
		let gl = headlessGL(width, height, {
			premultipliedAlpha: false,
			preserveDrawingBuffer: false
		});

		if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		let ext;
		try {
			ext = gl.getExtension("OES_texture_float");
		} catch (e) { }

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}

		return gl;
	}


	doBindings(textureA, textureB, program, targetIndex) {
		this.doUniformBindings(textureA, textureB, program, targetIndex);
		//this.doVertexBindings(program);
	}

	doSingleTextureBindings(texture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex) {
		this.doUniformBindingsSingleTexture(texture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex);
		//this.doVertexBindings(program);
	}

	doUniformBindings(textureA, textureB, program, targetIndex) {
		var gl = this.gl;

		var uStepInCol = gl.getUniformLocation(program, "uStepInCol");
		var uNumInputColumns = gl.getUniformLocation(program, "uNumInputColumns");
		var uTargetIndex = undefined;

		if (targetIndex !== undefined) {
			uTargetIndex = gl.getUniformLocation(program, "uTargetIndex");
		}
		gl.uniform1i(gl.getUniformLocation(program, "usamplerA"), textureA.index);
		gl.uniform1i(gl.getUniformLocation(program, "usamplerB"), textureB.index);

		gl.uniform1i(uNumInputColumns, textureA.width);
		gl.uniform1f(uStepInCol, 1. / textureA.width);

		if (targetIndex !== undefined) {
			gl.uniform1i(uTargetIndex, targetIndex);
		}
	}
	doGenericUniformBinding(unifroms) {

	}
	doUniformBindingsSingleTexture(inputTexture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex) {
		var gl = this.gl;

		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexA"), componentIndexA);
		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexB"), componentIndexB);
		gl.uniform1i(gl.getUniformLocation(program, "uTargetIndex"), targetIndex);

		gl.uniform1i(gl.getUniformLocation(program, "usampler"), inputTexture.index);
		gl.uniform1f(gl.getUniformLocation(program, "uWidth"), inputTexture.width);
		gl.uniform1f(gl.getUniformLocation(program, "uStepY"), 1. / inputTexture.height);

		gl.uniform1f(gl.getUniformLocation(program, "uResultWidth"), outputDimensions.width);
		gl.uniform1f(gl.getUniformLocation(program, "uResultHeight"), outputDimensions.height);
	}

	doVertexBindings() {

		let gl = this.gl;
		// bind vertices
		let aPosition = gl.getAttribLocation(this.glProgram, "aPosition");
		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

		let vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		// bind texture cords
		let aTexture = gl.getAttribLocation(this.glProgram, "aTexture");
		this.texCoords = gl.createBuffer();
		let textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoords);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aTexture);

		// index to vertices
		let indices = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
		let vertexIndices = [0, 1, 2, 0, 2, 3];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
	}


	execute(num) {
		let numTextures = num;

		if (typeof numTextures === 'undefined'){
			numTextures = 1;
		}

		let textures = genTextures(this.gl,numTextures,this.width,this.height);
		return this.executeUsingTextures(textures);
	}

	executeUsingTextures(textures) {
		let gl = this.gl;
		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, this.width, this.height);

		let frameBuffer = FrameBufferFactory.createFrameBufferMultiAttachement(gl, textures);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);

		frameBuffer.delete();
		return textures;
	}

	getResult(texture) {
		Util.texture2array(texture);
	}

	buildProgram(vertexShaderCode, fragmentShaderCode) {
		let gl = this.gl;
		// link into a program
		this.glProgram = gl.createProgram();

		this.vShader = ShaderFactory.createVertexShader(gl, vertexShaderCode);
		this.fShader = ShaderFactory.createFragmentShader(gl, fragmentShaderCode);


		gl.attachShader(this.glProgram, this.vShader);
		gl.attachShader(this.glProgram, this.fShader);
		gl.linkProgram(this.glProgram);
		gl.useProgram(this.glProgram);
		gl.validateProgram(this.glProgram);

		if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
			var info = gl.getProgramInfoLog(this.glProgram);
			throw 'Could not compile WebGL program.' + info;
		}

		this.doVertexBindings();

		return this.glProgram;
	}

	compute(textureA, textureB, textureC, outputDimensions) {
		var t0 = Date.now();
		var gl = this.gl;
		var canvas = this.getRenderCanvas(this.width, this.height);

		canvas.width = outputDimensions.width;
		canvas.height = outputDimensions.height;

		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, canvas.width, canvas.height);

		var frameBuffer = FrameBufferFactory.createFrameBuffer(gl, textureC);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		this.doBindings(textureA, textureB, this.glProgram);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		frameBuffer.delete();

		var t1 = Date.now();
		textureC.duration = t1 - t0;
		return textureC;
	}

	multiplySingleTexture(texture, outputDimensions, componentA, componentB, targetIndex) {
		let gl = this.gl;

		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, outputDimensions.width, outputDimensions.height);

		let resultTexture = TextureFactory.createReadableTexture(gl, 'resultTexture', outputDimensions);
		let frameBuffer = FrameBufferFactory.createFrameBuffer(gl, resultTexture);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		this.doSingleTextureBindings(texture, resultTexture, this.glProgram, componentA, componentB, targetIndex);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		frameBuffer.delete();

		return resultTexture;
	}

	debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}

	delete() {
		let gl = this.gl;

		gl.deleteShader(this.vShader);
		this.debugPrint("Deleted vertex shader");
		gl.deleteShader(this.fShader);
		this.debugPrint("Deleted fragment shader");
		gl.deleteProgram(this.glProgram);
		this.debugPrint("Deleted program");
		gl.deleteBuffer(this.vertexBuffer);
		this.debugPrint("Deleted vertex buffer");
		gl.deleteBuffer(this.texCoords);
		this.debugPrint("Deleted texture coordinates");
	}
}

module.exports.Program = Program
const { FrameBufferFactory } = require("./framebufferfactory.js");
const { TextureFactory } = require("./texturefactory.js");
const { ShaderFactory } = require("./shader.js");
const { Util } = require("./util.js");

},{"./framebufferfactory.js":16,"./shader.js":21,"./texturefactory.js":23,"./util.js":24,"gl":29}],20:[function(require,module,exports){
//See requirements at the end of the file. Requirements are at the end of the file due to circular dependencies.
class ResultReader{
	constructor(gl,width,height){
		this.gl = gl;
		this.build(width,height);
	}

	build(width,height){		
		this.program  = new Program(width,height,this.gl);
		this.program.buildProgram(ShaderCode.getCode("VERTEX"),ShaderCode.getCode("READABLE"));
	}

	runShaders(textureA,textureB,targetIndex) {
        var gl = this.gl;

		gl.useProgram(this.program.glProgram);
        gl.viewport(0, 0,textureB.width,textureB.height);
		gl.scissor(0, 0, textureB.width,textureB.height);
		var frameBuffer = FrameBufferFactory.createFrameBuffer(gl,textureB);
		
		//gl.activeTexture(gl.TEXTURE0 + textureB.index);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		this.program.doBindings(textureA,textureB,this.program.glProgram,targetIndex);
        
		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		return frameBuffer;
    }
	
	read(textureA,textureB,targetIndex){
		this.runShaders(textureA,textureB,targetIndex);
		
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(textureB.width * textureB.height * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  textureB.width,textureB.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(textureB.height,textureB.width);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
	//http://www.realtimerendering.com/blog/webgl-2-basics/
	readByResultDimension(inputTexture,outputTexture,dimension,targetIndex){
		var gl = this.gl;
		let frameBuffer = this.runShaders(inputTexture,outputTexture,targetIndex);
		
	  
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(dimension.height * dimension.width * 4);
		var glresult = new Uint8Array(rawBuffer);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, textureA.frameBuffer);
		//gl.readBuffer(ext.COLOR_ATTACHMENT1_WEBGL);
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
        gl.readPixels(0, 0,  dimension.width,dimension.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(dimension.width,dimension.height);
        result.setData(new Float32Array(rawBuffer));
	
		frameBuffer.delete();
		return result;
	}

	readResult2Array(inputTexture,outputTexture,dimension,targetIndex){
		var gl = this.gl;
		let frameBuffer = this.runShaders(inputTexture,outputTexture,targetIndex);
		
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(dimension.height * dimension.width * 4);
		var glresult = new Uint8Array(rawBuffer);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, textureA.frameBuffer);
		//gl.readBuffer(ext.COLOR_ATTACHMENT1_WEBGL);
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
        gl.readPixels(0, 0,  dimension.width,dimension.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        
		frameBuffer.delete();
		return new Float32Array(rawBuffer);
	}
	
	delete(){		
		var gl = this.gl;
		this.program.delete();
		gl.canvas.width = 1;
		gl.canvas.height = 1;
	}
}

module.exports.ResultReader = ResultReader
const {ShaderCode} = require("./shadercode.js");
const {Program} = require("./program.js");
const {FrameBufferFactory} = require("./framebufferfactory.js");
const Matrix = require("./matrix.js");
},{"./framebufferfactory.js":16,"./matrix.js":18,"./program.js":19,"./shadercode.js":22}],21:[function(require,module,exports){
class ShaderFactory{

	static createVertexShader(gl,vertexShaderCode) {
        var shader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(shader, vertexShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
    }
	
	static createFragmentShader(gl,fragmentShaderCode) {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
	}
	
	static delete(gl,shader){
		gl.deleteShader(shader);
	}
}

module.exports.ShaderFactory = ShaderFactory
},{}],22:[function(require,module,exports){
var Sqrl = require('squirrelly');
const { Formatter } = require("./formatter.js");

class ShaderCode {

    static getCode(type) {
        switch (type) {
            case "READABLE": return ShaderCode.getReadableShaderCode();
            case "READABLE2": return ShaderCode.getReadableShaderCode2();
            case "SINGLE": return ShaderCode.getSingleTextureCode();
            case "DUAL": return ShaderCode.getDualTextureCode();
            case "VERTEX": return ShaderCode.getVertexShaderCode();
            default: throw "getCode " + type + " not known.";
        }
    }

    static getVertexShaderCode() {
        var code = `
        
        // vertex shader for a single quad 
        // work is performed based on the texels being passed 
        // through to the texture shader. 
        #ifdef GL_ES
            precision highp float; 
        #endif 
        attribute highp vec3 aPosition; 
        attribute highp vec2 aTexture; 
        varying   highp vec2 vTexture; 
        void main(void) 
        { 
            // just pass the position and texture coords 
            gl_Position = vec4(aPosition, 1.0); 
            vTexture = aTexture; 
        }`;
        return code;
    }
    static getReadableShaderCode2() {
        var code = ` 
            /*ShaderFactory that creates a texture that can be converted to byte.
             *This is needed when reading a texture from javascript.*/

            #ifdef GL_ES 
                precision highp float; 
            #endif 
          
            varying highp vec2	   		vTexture;		    // row, column to calculate 
            uniform highp sampler2D     usamplerA;			// matrixA
            uniform highp sampler2D     usamplerB;			// matrixB
            uniform highp int 			uNumInputColumns;	//
            uniform highp float	  		uStepInCol; 		// increment across source texture
            uniform int					uTargetIndex;       // index where to read result;

            highp float readValue(highp float col,highp float row,int targetIndex){
                
                highp vec4 result = texture2D(usamplerA, vec2(col,row));
                
                /*if (targetIndex == 0) return result.x;
                if (targetIndex == 1) return result.y;
                if (targetIndex == 2) return result.z;
                if (targetIndex == 3) return result.w;*/

                if (targetIndex == 0) return result.r;
                if (targetIndex == 1) return result.g;
                if (targetIndex == 2) return result.b;
                if (targetIndex == 3) return result.a;
                
                //This return statement should not be reached
                return -1.0;
            }
            void main(void) { 
                 
                // coordinate system is explained here
                // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                highp float  row = vTexture.t;
                highp float  col = vTexture.s;
                
                highp float v = readValue(col,row,uTargetIndex);				
                if (v==0.) { 
                    gl_FragColor = vec4(0.,0.,0.,0.); 
                    return; 
                } 
               
                highp float a = abs(v);                   			// encode absolute value + sign
                highp float exp = floor(log2(a));         			// number of powers of 2
                highp float mant = (a * pow(2.,23.-exp)); 			// multiply to fill 24 bits (implied leading 1) 
                highp float mant1 = floor(mant / 256. / 256.);    	// first 8 bits of mantissa 
                highp float mant2 = mod(floor(mant / 256.),256.); 	// second 8 bits 
                highp float mant3 = mod(mant,256.);               	// third 8 bits 

                highp float sign = 128.-128.*(a/v);					// sign bit is 256 
                highp float e = (sign+exp+127.)/510.;				// exponent and sign 
                highp float m1 = (mant1-(128.*(1.-mod(exp+127.,2.))))/255.; // handle leading bit 
                highp float m2 = (mant2)/255.;						// middle part 
                highp float m3 = (mant3+.5)/255.;					// scale to 0 - 255 
                gl_FragColor = vec4(m3,m2,m1,e);					// output an IEEE754 32-bit floating point number 
            }
        `;
        return code;
    }

    static getReadableShaderCode() {
        var code = ` 
            /*ShaderFactory that creates a texture that can be converted to byte.
             *This is needed when reading a texture from javascript.*/

            #ifdef GL_ES 
                precision highp float; 
            #endif 
          
            varying highp vec2	   		vTexture;		    // row, column to calculate 
            uniform highp sampler2D     usamplerA;			// matrixA
            uniform highp sampler2D     usamplerB;			// matrixB
            uniform highp int 			uNumInputColumns;	//
            uniform highp float	  		uStepInCol; 		// increment across source texture
            uniform int					uTargetIndex;       // index where to read result;

            highp float readValue(highp float col,highp float row,int targetIndex){
                
                highp vec4 result = texture2D(usamplerA, vec2(col,row));
                
                if (targetIndex == 0) return result.r;
                if (targetIndex == 1) return result.g;
                if (targetIndex == 2) return result.b;
                if (targetIndex == 3) return result.a;
                
                //This return statement should not be reached
                return -1.0;
            }
            void main(void) { 

                highp float  row = vTexture.t;
                highp float  col = vTexture.s;
                
                highp float value = readValue(col,row,uTargetIndex);				

             
                if (value == 0.0) {
                    gl_FragColor = vec4(0.,0.,0.,0.);
                    return;
                }
                
                
                float exponent;
                float mantissa;
                vec4  result;
                float sgn;
                
                sgn = step(0.0, -value);
                value = abs(value);
                exponent = floor(log2(value));
                mantissa = value*pow(2.0, -exponent)-1.0;
                exponent = exponent+127.0;
                result   = vec4(0,0,0,0);
                result.a = floor(exponent/2.0);
                exponent = exponent - result.a*2.0;
                result.a = result.a + 128.0*sgn;
                result.b = floor(mantissa * 128.0);
                mantissa = mantissa - result.b / 128.0;
                result.b = result.b + exponent*128.0;
                result.g = floor(mantissa*32768.0);
                mantissa = mantissa - result.g/32768.0;
                result.r = floor(mantissa*8388608.0);
                gl_FragColor = result/255.0;					// output an IEEE754 32-bit floating point number 
            }
        `;
        return code;
    }

    static getDualTextureCode() {
        var code = `
            //Do matrix multiplication using two textures
            #ifdef GL_ES
                    precision highp float;
            #endif

            varying highp vec2          vTexture;                   	// row, column to calculate
            uniform highp sampler2D     usamplerA;                  	// matrixA
            uniform highp sampler2D     usamplerB;                  	// matrixB
            uniform int					uNumInputColumns;   			
            uniform highp float         uStepInCol;						// increment across source texture

            highp float matrixmul(float col, float row){
                    highp float sum = 0.;
                    highp float cc = 0.;

                    for (int index=0; index < 2048; index ++){
                            if (index>=uNumInputColumns) break;

                            float m1 = texture2D(usamplerA,vec2(cc,row)).r;
                            float m2 = texture2D(usamplerB,vec2(col,cc)).r;

                            cc  += uStepInCol;
                            sum += (m1*m2);
                    }
                    return sum;
                    //return texture2D(usamplerA,vec2(col * uStepInCol,row * uStepInCol)).r;
            }

            void main(void) {
                    // The texture coordinates are coming from the target texture
                    // WebGL coordinate system is explained here
                    // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                    highp float  col = vTexture.s;
                    highp float  row = vTexture.t;


                    float v = matrixmul(col,row);
                    gl_FragColor = vec4(v,0.,0.,0.);
            }
    `;
        return code;
    }


    static getSingleTextureCode() {
        var code = `
            /* Do matrix multiplication using a single texture 
            *  Upto four matrices can be stored in a single texture using the RGBA components. */
            #extension GL_EXT_draw_buffers : require
            #ifdef GL_ES 
                precision highp float; 
            #endif 
         
            varying highp vec2          vTexture;			// row, column to calculate 
            uniform highp sampler2D     usampler;			// merged matrix texels
            uniform highp float			uWidth;	    		// input texture width
            uniform highp float			uHeight;	    	// input texture height
            uniform highp float			uResultWidth;	    // result texture width
            uniform highp float			uResultHeight;	    // result texture height

            uniform 	  int 			uRGBAIndexA;        // R,G,B,A index matrixA
            uniform       int           uRGBAIndexB;        // R,G,B,A index matrixB
            uniform       int           uTargetIndex;       // vec4 index where to put result
            
            float getMatrixValue(float x, float y,int rgbaIndex){
                if (rgbaIndex == 0) return texture2D(usampler,vec2(x,y)).x;
                if (rgbaIndex == 1) return texture2D(usampler,vec2(x,y)).y;
                if (rgbaIndex == 2) return texture2D(usampler,vec2(x,y)).z;
                if (rgbaIndex == 3) return texture2D(usampler,vec2(x,y)).w;
                
                return 0.;
            }
            
            vec4 getResultValue(float col, float row,float value,int targetIndex){
                vec4 result = texture2D(usampler,vec2(col,row));
                
                if (targetIndex == 0) result.x = value; return result;
                if (targetIndex == 1) result.y = value; return result;
                if (targetIndex == 2) result.z = value; return result;
                if (targetIndex == 3) result.w = value; return result;

                return result;
            }
            
            float matrixmul(float col, float row){
                highp float sum = 0.;
                
                //convert pixel coordinate to texture coordinate
                highp float x = (col/uWidth)+(1.0/(2.0*uWidth));
                highp float y = (row/uHeight)+(1.0/(2.0*uHeight));
                
                //colum a and row b to multiply
                highp float columnA = y;
                highp float rowB    = x;

                //initialize x and y to zero texture coordinate
                x = (0.0/uWidth)+(1.0/(2.0*uWidth));
                y = (0.0/uHeight)+(1.0/(2.0*uHeight));

                highp float stepX = 1.0/uWidth;
                highp float stepY = 1.0/uHeight;

                for (int index=0; index < 2048; index ++){
                    if (index>=int(uWidth)) break;

                    float m1 = getMatrixValue(x,columnA,uRGBAIndexA);
                    float m2 = getMatrixValue(rowB,y,uRGBAIndexB);
                    
                    x  += stepX;
                    y  += stepY;

                    sum += (m1*m2);
                }
                return sum;
            }
            
            void main(void) { 
                // The texture coordinates are coming from the target texture 
                // WebGL coordinate system is explained here
                // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                highp float  col = vTexture.s;
                highp float  row = vTexture.t;
                
                //convert result texture coordinates to result texture pixel coordinates
                highp float  x = (col-(1.0/(2.0*uResultWidth)))*uResultWidth;
                highp float  y = (row-(1.0/(2.0*uResultHeight)))*uResultHeight;
                
                //x = (x/uResultWidth)+(1.0/(2.0*uResultWidth));
                //y = (y/uResultHeight)+(1.0/(2.0*uResultHeight));

                float v = matrixmul(x,y);
                //gl_FragColor = getResultValue(x,y,v,uTargetIndex);
                gl_FragData[0] = getResultValue(x,y,v,uTargetIndex);
            }
        `;
        return code;
    }

   
    static generateVertexShaderCode() {
        var code = `
// vertex shader for a single quad 
// work is performed based on the texels being passed 
// through to the texture shader.

#ifdef GL_ES
    precision highp float; 
#endif 
attribute highp vec3 aPosition; 
attribute highp vec2 aTexture;
        
uniform float uResultTextureWidth; // result texture width
uniform float uResultTextureHeight; // result texture height

varying float vKernelX; 
varying float vKernelY; 
varying highp vec2 vTexture;
//U = S = x dimension
//V = T = y dimension

void main(void) { 
    // just pass the position and texture coords 
    gl_Position = vec4(aPosition, 1.0); 
            
    //convert texture coordinates to pixel coordinates
    vKernelX = (aTexture.s-(1.0/(2.0*uResultTextureWidth)))*uResultTextureWidth;
    vKernelY = (aTexture.t-(1.0/(2.0*uResultTextureHeight)))*uResultTextureHeight;
    vTexture = aTexture;
}`;
        return code;
    }
    static generateFragmentShader(functionsDescriptor) {

        var shaderTemplate = `
/**
* This is a generated fragment shader.
*/
#extension GL_EXT_draw_buffers : require        
#ifdef GL_ES 
  precision highp float; 
#endif

varying highp float vKernelX; 
varying highp float vKernelY; 
varying highp vec2  vTexture;

{{resultDeclarations(options.numResults)}}
{{/resultDeclarations}}

#define MAIN 0
{{each(options.preprocessor)}}
#define {{@this.name}} {{@this.id}}

{{/each}}
{{each(options.samplers)}}

uniform sampler2D uSampler_{{@this.name}};
uniform float uSampler_{{@this.name}}_width;
uniform float uSampler_{{@this.name}}_height;

{{/each}}
{{each(options.samplers2D)}}
uniform sampler2D uSampler_{{@this.name}};
uniform float uSampler_{{@this.name}}_width;
uniform float uSampler_{{@this.name}}_height;

{{/each}}

{{each(options.integers)}}
uniform int u_{{@this.name}};
{{/each}}
{{each(options.floats)}}
uniform float u_{{@this.name}};
{{/each}}
float readTexture(int x, float width, in sampler2D sampler);
float readTexture(float x, int width, in sampler2D sampler);
float readTexture(int x, int width, in sampler2D sampler);
float readTexture(int x, float y,float width,float height, in sampler2D sampler);
float readTexture(float x, int y,float width,float height, in sampler2D sampler);
float readTexture(int x, int y,float width,float height, in sampler2D sampler);

float write (float value, int index){
    int vecIndex = index / 4;
    int vecComponentIndex = int(mod(float(index),4.0));
    vec4 vector2set = vResults[vecIndex];

    if (vecComponentIndex == 0) { vector2set = vec4(value,vector2set.y,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 1) { vector2set = vec4(vector2set.x,value,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 2) { vector2set = vec4(vector2set.x,vector2set.y,value,vector2set.w); }
    if (vecComponentIndex == 3) { vector2set = vec4(vector2set.x,vector2set.y,vector2set.z,value); }

    vResults[vecIndex] = vector2set;
    gl_FragData[vecIndex] = vector2set;
    return value;
}

float write (int value, int index){
    int vecIndex = index / 4;
    int vecComponentIndex = int(mod(float(index),4.0));
    vec4 vector2set = vResults[vecIndex];

    if (vecComponentIndex == 0) { vector2set = vec4(float(value),vector2set.y,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 1) { vector2set = vec4(vector2set.x,float(value),vector2set.z,vector2set.w); }
    if (vecComponentIndex == 2) { vector2set = vec4(vector2set.x,vector2set.y,float(value),vector2set.w); }
    if (vecComponentIndex == 3) { vector2set = vec4(vector2set.x,vector2set.y,vector2set.z,float(value)); }

    vResults[vecIndex] = vector2set;
    gl_FragData[vecIndex] = vector2set;

    return float(value);
}

{{if(options.samplers.length > 0)}}
/*
*  functions for accessing values of a 1D array which is represented by a 2D texture
*  parameter x:       pixel coordinate of result texture beeing shaded
*  parameter width:   width of texture which is read by given sampler
*  parameter sampler: sampler which is used to read values from texture
*/
float readTexture(float x, float width, in sampler2D sampler){
    int index = 0;
    //convert pixel coordinates of result texture to texture coordinates of sampled texture
    float y = (x + 0.5)/(width);

    if (index == 0) return texture2D(sampler,vec2(y,0.)).x;
    if (index == 1) return texture2D(sampler,vec2(y,0.)).y;
    if (index == 2) return texture2D(sampler,vec2(y,0.)).z;
    if (index == 3) return texture2D(sampler,vec2(y,0.)).w;
}
float readTexture(int x, float width, in sampler2D sampler){
    return readTexture(float(x),width,sampler);
}

float readTexture(float x, int width, in sampler2D sampler){
    return readTexture(x,float(width),sampler);
}

float readTexture(int x, int width, in sampler2D sampler){
    return readTexture(float(x),float(width),sampler);
}
{{/if}}

{{if(options.samplers2D.length > 0)}}
/*
*  functions for accessing values of a 2D array which is represented by a 2D texture
*  parameter x:       x pixel coordinate of result texture beeing shaded
*  parameter y:       y pixel coordinate of result texture beeing shaded
*  parameter width:   width of texture which is read by given sampler
*  parameter height:  height of texture which is read by given sampler
*  parameter sampler: sampler which is used to read values from texture
*/
float readTexture(float y, float x,float width,float height, in sampler2D sampler ){
   int index = 0;

   //convert pixel coordinates of result texture to texture coordinates of sampler texture
   float xx = (x+0.5)/width;
   float yy = (y+0.5)/height;

   
   if (index == 0) return texture2D(sampler,vec2(xx,yy)).x;
   if (index == 1) return texture2D(sampler,vec2(xx,yy)).y;
   if (index == 2) return texture2D(sampler,vec2(xx,yy)).z;
   if (index == 3) return texture2D(sampler,vec2(xx,yy)).w;

   /*if (index == 0) return texture2D(sampler,vec2(yy,xx)).x;
   if (index == 1) return texture2D(sampler,vec2(yy,xx)).y;
   if (index == 2) return texture2D(sampler,vec2(yy,xx)).z;
   if (index == 3) return texture2D(sampler,vec2(yy,xx)).w;*/

   return -1.0;
}

float readTexture(int x, float y,float width,float height, in sampler2D sampler){
    return readTexture(float(x), y, width,height, sampler);
}

float readTexture(float x, int y,float width,float height, in sampler2D sampler){
    return readTexture(x, float(y), width,height, sampler);
}

float readTexture(int x, int y,float width,float height, in sampler2D sampler){
    return readTexture(float(x), float(y), width,height, sampler);
}
{{/if}}
{{each(options.signatures)}}
{{@this}};
{{/each}}

{{each(options.functions)}}
{{@this}}

{{/each}}
{{init(options.numResults)}}
{{/init}}
{{main}}
`;
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };

        let oldRender = Sqrl.Render;
        Sqrl.Render = function (...args) {
            let result = oldRender.apply(this, arguments);
            return result.replaceAll('&lt;', '<');
        }

        Sqrl.defineHelper("resultDeclarations", function (args, content, blocks, options) {
            let result = "";
            if (args[0] > 0){
                result+="vec4 vResults[" + args[0] + "];\r\n";
            }
            
            return result;
        })

        Sqrl.defineHelper("init", function (args, content, blocks, options) {
            let result = "void init(){\r\n";
            if (args[0] > 0){
                for (let i =0; i < args[0];++i){
                    result+="   vResults[" + i + "] = vec4(0.,0.,0.,0.);\r\n";
                }
            }
            result += "}\r\n";
            return result;
        })

        Sqrl.definePartial("mypartial", "Partial content: the value of arr is ")
        return Sqrl.Render(shaderTemplate, functionsDescriptor.get('main').options);
        //return extendedRender(shaderTemplate, options);
    }
}
module.exports.ShaderCode = ShaderCode
},{"./formatter.js":15,"squirrelly":87}],23:[function(require,module,exports){
let usedIndices = new Array();

function removeFromArray(array,value){
	var index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	 } 
}

class Texture{
    constructor(gl,texture,index,name,width,height){
        this.gl = gl;
        this.texture= texture;
        this.index =  index;
        this.name= name;
        this.width = width;
        this.height= height;
    }

    delete(){
		this.gl.deleteTexture(this.texture);
		removeFromArray(usedIndices,this.index);
		
    }
};

class TextureFactory {
	
	static fetchFreeIndex(){
		if ( usedIndices.length === 0){
			return 0;
		}
		usedIndices.sort(function(a, b){return a - b});

		let i = 0;
		while(usedIndices.includes(i)){
			++i;
		}
		return i;
	}

	static useIndex(index){
		usedIndices.push(index);
	}

	static createReadableTexture(gl,name, outputdimensions) {
		var texture = gl.createTexture();
		
		let index = TextureFactory.fetchFreeIndex();
		TextureFactory.useIndex(index);

		gl.activeTexture(gl.TEXTURE0 + index );
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, outputdimensions.width, outputdimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        return new Texture(gl,texture,index,name,outputdimensions.width, outputdimensions.height);
	}

	static createTexture(gl, name, matrix, component) {
		return this.createTextureByDimension(gl,name, matrix.width, matrix.height, matrix.getTexels(component));
	}

	static createReadableTexture(gl, name, outputdimensions) {
		return this.createTextureByDimension(gl,name, outputdimensions.width, outputdimensions.height, null);
	}

	static createTextureByDimension(gl, name, width, height, data) {
		var texture = gl.createTexture();
		
		let index = TextureFactory.fetchFreeIndex();
		TextureFactory.useIndex(index);

		gl.activeTexture(gl.TEXTURE0 + index );
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// clamp to edge to support non-power of two textures
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// don't interpolate when getting data from texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);

		return (new Texture(gl,texture,index,name,width, height));
	}

	static debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}
}

module.exports.TextureFactory = TextureFactory
},{}],24:[function(require,module,exports){
const { TextureFactory } = require( "./texturefactory.js");
const { FrameBufferFactory } = require("./framebufferfactory.js");
const { ResultReader } = require("./resultreader.js");

class Util {
    static isArray(value) {
        if (Util.is2DArray(value)) {
            return false;
        }
        return value.includes("[]");
    }

    static is2DArray(value) {
        return value.includes("[][]");
    }

    static isArgumentInteger(argument) {
        if (Number.isInteger(argument) && !argument.toString().includes('.')) {
            return true;
        }
        return false;
    }

    static isArgumentFloat(argument) {
        if (!Number.isInteger(argument) && argument.toString().includes('.')) {
            return true;
        }
        return false;
    }

    static isInteger(argument) {
        return argument === 'int';
    }

    static isFloat(argument) {
        return argument === 'float';
    }

    static data2Texel(width, height, data, component) {
        let result = new Float32Array(4 * height * width);
        let cnt = 0;

        if (component === undefined) {
            component = "R";
        }


        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;

                switch (component) {
                    //R component of RGBA color
                    case 'R':
                        result[cnt - 4] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }


    static createReadableTexture(gl, name, width, height) {
        return TextureFactory.createReadableTexture(gl, name, { width: width, height: height });
    }

    static createFrameBuffer(gl, texture) {
        return FrameBufferFactory.createFrameBuffer(gl, texture);
    }

    /**
    * converts the given texture to an array
    * 
    * @param {gl} gl -   WebGL context
    * @param {Texture} texture -   Texture to read  values from
    * @return {Integer} sourceIndex - The component index (R,G,B,A) to read the values from
   */
    static texture2array(gl, texture, sourceIndex) {
        let dimension = { width: texture.width, height: texture.height };
        let readableTexture = TextureFactory.createReadableTexture(gl, 'readableTexture', dimension);
        let resultReader = new ResultReader(gl, texture.width, texture.height);
        let result = resultReader.readResult2Array(texture, readableTexture, dimension, sourceIndex);
        let finalResult = [];

        for (let row = 0; row < texture.height; row++) {
            finalResult[row] = [];
            for (let col = 0; col < texture.width; col++) {
                finalResult[row].push(result[(row * texture.width)+col]);
            }
        }

        if (texture.height === 1){
            finalResult = finalResult[0];
        }

        readableTexture.delete();
        return finalResult;
    }

}
module.exports.Util = Util;

},{"./framebufferfactory.js":16,"./resultreader.js":20,"./texturefactory.js":23}],25:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.acorn = {}));
}(this, function (exports) { 'use strict';

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  var keywordRelationalOperator = /^in(stanceof)?$/;

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.
  // Generated by `bin/generate-identifier-regex.js`.
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fef\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7bf\ua7c2-\ua7c6\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab67\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range. They were
  // generated by bin/generate-identifier-regex.js

  // eslint-disable-next-line comma-spacing
  var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,477,28,11,0,9,21,155,22,13,52,76,44,33,24,27,35,30,0,12,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,21,0,33,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,14,0,72,26,230,43,117,63,32,0,161,7,3,38,17,0,2,0,29,0,11,39,8,0,22,0,12,45,20,0,35,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,270,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,689,63,129,74,6,0,67,12,65,1,2,0,29,6135,9,754,9486,286,50,2,18,3,9,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,2357,44,11,6,17,0,370,43,1301,196,60,67,8,0,1205,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,15,7472,3104,541];

  // eslint-disable-next-line comma-spacing
  var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,525,10,176,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,4,9,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,232,6,3,6,4,0,29,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,135,4,60,6,26,9,1014,0,2,54,8,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,262,6,10,9,419,13,1495,6,110,6,6,9,792487,239];

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) { return false }
      pos += set[i + 1];
      if (pos >= code) { return true }
    }
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) { return code === 36 }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) { return code === 36 }
    if (code < 58) { return true }
    if (code < 65) { return false }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  // Map keyword names to token types.

  var keywords$1 = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywords$1[name] = new TokenType(name, options)
  }

  var types = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code, ecma2019String) {
    return code === 10 || code === 13 || (!ecma2019String && (code === 0x2028 || code === 0x2029))
  }

  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;

  // Checks if an object has a property.

  function has(obj, propName) {
    return hasOwnProperty.call(obj, propName)
  }

  var isArray = Array.isArray || (function (obj) { return (
    toString.call(obj) === "[object Array]"
  ); });

  function wordsRegexp(words) {
    return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
  }

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      lineBreakG.lastIndex = cur;
      var match = lineBreakG.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        return new Position(line, offset - cur)
      }
    }
  }

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (2015), 7 (2016), 8 (2017), 9 (2018), or 10
    // (2019). This influences support for strict mode, the set of
    // reserved words, and support for new syntax features. The default
    // is 10.
    ecmaVersion: 10,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called
    // when a semicolon is automatically inserted. It will be passed
    // the position of the comma as an offset, and if `locations` is
    // enabled, it is given the location as a `{line, column}` object
    // as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program.
    allowImportExportEverywhere: false,
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: false,
    // When enabled, hashbang directive in the beginning of file
    // is allowed and treated as a line comment.
    allowHashBang: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // Interpret and default an options object

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

    if (options.ecmaVersion >= 2015)
      { options.ecmaVersion -= 2009; }

    if (options.allowReserved == null)
      { options.allowReserved = options.ecmaVersion < 5; }

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      { options.onComment = pushComment(options, options.onComment); }

    return options
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
      if (options.ranges)
        { comment.range = [start, end]; }
      array.push(comment);
    }
  }

  // Each scope gets a bitset that may contain these flags
  var
      SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  }

  // Used in checkLVal and declareName to determine the type of a binding
  var
      BIND_NONE = 0, // Not a binding
      BIND_VAR = 1, // Var-style binding
      BIND_LEXICAL = 2, // Let- or const-style binding
      BIND_FUNCTION = 3, // Function declaration
      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      for (var v = options.ecmaVersion;; v--)
        { if (reserved = reservedWords[v]) { break } }
      if (options.sourceType === "module") { reserved += " await"; }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = types.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;

    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    // Labels in scope.
    this.labels = [];
    // Thus-far undefined exports.
    this.undefinedExports = {};

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      { this.skipLineComment(2); }

    // Scope tracking for duplicate variable names (see scope.js)
    this.scopeStack = [];
    this.enterScope(SCOPE_TOP);

    // For RegExp validation
    this.regexpState = null;
  };

  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true } };

  Parser.prototype.parse = function parse () {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node)
  };

  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };
  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };
  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };
  prototypeAccessors.allowSuper.get = function () { return (this.currentThisScope().flags & SCOPE_SUPER) > 0 };
  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };
  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  // Switch to a getter for 7.0.0.
  Parser.prototype.inNonArrowFunction = function inNonArrowFunction () { return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0 };

  Parser.extend = function extend () {
      var plugins = [], len = arguments.length;
      while ( len-- ) plugins[ len ] = arguments[ len ];

    var cls = this;
    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
    return cls
  };

  Parser.parse = function parse (input, options) {
    return new this(options, input).parse()
  };

  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
  };

  Parser.tokenizer = function tokenizer (input, options) {
    return new this(options, input)
  };

  Object.defineProperties( Parser.prototype, prototypeAccessors );

  var pp = Parser.prototype;

  // ## Parser utilities

  var literal = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)")/;
  pp.strictDirective = function(start) {
    for (;;) {
      // Try to find string literal.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) { return false }
      if ((match[1] || match[2]) === "use strict") { return true }
      start += match[0].length;

      // Skip semicolon, if any.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";")
        { start++; }
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp.isContextual = function(name) {
    return this.type === types.name && this.value === name && !this.containsEsc
  };

  // Consumes contextual keyword if possible.

  pp.eatContextual = function(name) {
    if (!this.isContextual(name)) { return false }
    this.next();
    return true
  };

  // Asserts that following token is given contextual keyword.

  pp.expectContextual = function(name) {
    if (!this.eatContextual(name)) { this.unexpected(); }
  };

  // Test whether a semicolon can be inserted at the current position.

  pp.canInsertSemicolon = function() {
    return this.type === types.eof ||
      this.type === types.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp.semicolon = function() {
    if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
  };

  pp.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma)
        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
      if (!notNext)
        { this.next(); }
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1;
  }

  pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) { return }
    if (refDestructuringErrors.trailingComma > -1)
      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
  };

  pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) { return false }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
    if (shorthandAssign >= 0)
      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
    if (doubleProto >= 0)
      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  };

  pp.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
    if (this.awaitPos)
      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  };

  pp.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      { return this.isSimpleAssignTarget(expr.expression) }
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$1 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$1.parseTopLevel = function(node) {
    var exports = {};
    if (!node.body) { node.body = []; }
    while (this.type !== types.eof) {
      var stmt = this.parseStatement(null, true, exports);
      node.body.push(stmt);
    }
    if (this.inModule)
      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
        {
          var name = list[i];

          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
        } }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType;
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  pp$1.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    // For ambiguous cases, determine if a LexicalDeclaration (or only a
    // Statement) is allowed here. If context is not empty then only a Statement
    // is allowed. However, `let [` is an explicit negative lookahead for
    // ExpressionStatement, so special-case it first.
    if (nextCh === 91) { return true } // '['
    if (context) { return false }

    if (nextCh === 123) { return true } // '{'
    if (isIdentifierStart(nextCh, true)) {
      var pos = next + 1;
      while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
      var ident = this.input.slice(next, pos);
      if (!keywordRelationalOperator.test(ident)) { return true }
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$1.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$1.parseStatement = function(context, topLevel, exports) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet(context)) {
      starttype = types._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case types._debugger: return this.parseDebuggerStatement(node)
    case types._do: return this.parseDoStatement(node)
    case types._for: return this.parseForStatement(node)
    case types._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
      return this.parseFunctionStatement(node, false, !context)
    case types._class:
      if (context) { this.unexpected(); }
      return this.parseClass(node, true)
    case types._if: return this.parseIfStatement(node)
    case types._return: return this.parseReturnStatement(node)
    case types._switch: return this.parseSwitchStatement(node)
    case types._throw: return this.parseThrowStatement(node)
    case types._try: return this.parseTryStatement(node)
    case types._const: case types._var:
      kind = kind || this.value;
      if (context && kind !== "var") { this.unexpected(); }
      return this.parseVarStatement(node, kind)
    case types._while: return this.parseWhileStatement(node)
    case types._with: return this.parseWithStatement(node)
    case types.braceL: return this.parseBlock(true, node)
    case types.semi: return this.parseEmptyStatement(node)
    case types._export:
    case types._import:
      if (this.options.ecmaVersion > 10 && starttype === types._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40) // '('
          { return this.parseExpressionStatement(node, this.parseExpression()) }
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
        if (!this.inModule)
          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
      }
      return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) { this.unexpected(); }
        this.next();
        return this.parseFunctionStatement(node, true, !context)
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
        { return this.parseLabeledStatement(node, maybeName, expr, context) }
      else { return this.parseExpressionStatement(node, expr) }
    }
  };

  pp$1.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
    else if (this.type !== types.name) { this.unexpected(); }
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    var i = 0;
    for (; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
        if (node.label && isBreak) { break }
      }
    }
    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$1.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$1.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      { this.eat(types.semi); }
    else
      { this.semicolon(); }
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$1.parseForStatement = function(node) {
    this.next();
    var awaitAt = (this.options.ecmaVersion >= 9 && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) && this.eatContextual("await")) ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types.parenL);
    if (this.type === types.semi) {
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, null)
    }
    var isLet = this.isLet();
    if (this.type === types._var || this.type === types._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
        if (this.options.ecmaVersion >= 9) {
          if (this.type === types._in) {
            if (awaitAt > -1) { this.unexpected(awaitAt); }
          } else { node.await = awaitAt > -1; }
        }
        return this.parseForIn(node, init$1)
      }
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, init$1)
    }
    var refDestructuringErrors = new DestructuringErrors;
    var init = this.parseExpression(true, refDestructuringErrors);
    if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLVal(init);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  pp$1.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  };

  pp$1.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$1.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
      { this.raise(this.start, "'return' outside of function"); }
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$1.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types.braceL);
    this.labels.push(switchLabel);
    this.enterScope(0);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    var cur;
    for (var sawDefault = false; this.type !== types.braceR;) {
      if (this.type === types._case || this.type === types._default) {
        var isCase = this.type === types._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types.colon);
      } else {
        if (!cur) { this.unexpected(); }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$1.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  pp$1.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types.parenL)) {
        clause.param = this.parseBindingAtom();
        var simple = clause.param.type === "Identifier";
        this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
        this.checkLVal(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
        this.expect(types.parenR);
      } else {
        if (this.options.ecmaVersion < 10) { this.unexpected(); }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      { this.raise(node.start, "Missing catch or finally clause"); }
    return this.finishNode(node, "TryStatement")
  };

  pp$1.parseVarStatement = function(node, kind) {
    this.next();
    this.parseVar(node, false, kind);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$1.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$1.parseWithStatement = function(node) {
    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement")
  };

  pp$1.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$1.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
      {
      var label = list[i$1];

      if (label.name === maybeName)
        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    } }
    var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        // Update information about previous labels on this node
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else { break }
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$1.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$1.parseBlock = function(createNewLexicalScope, node) {
    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
    if ( node === void 0 ) node = this.startNode();

    node.body = [];
    this.expect(types.braceL);
    if (createNewLexicalScope) { this.enterScope(0); }
    while (!this.eat(types.braceR)) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (createNewLexicalScope) { this.exitScope(); }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$1.parseFor = function(node, init) {
    node.init = init;
    this.expect(types.semi);
    node.test = this.type === types.semi ? null : this.parseExpression();
    this.expect(types.semi);
    node.update = this.type === types.parenR ? null : this.parseExpression();
    this.expect(types.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$1.parseForIn = function(node, init) {
    var isForIn = this.type === types._in;
    this.next();

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (
        !isForIn ||
        this.options.ecmaVersion < 8 ||
        this.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier"
      )
    ) {
      this.raise(
        init.start,
        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
      );
    } else if (init.type === "AssignmentPattern") {
      this.raise(init.start, "Invalid left-hand side in for-loop");
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  };

  // Parse a list of variable declarations.

  pp$1.parseVar = function(node, isFor, kind) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (kind === "const" && !(this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
        this.unexpected();
      } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === types._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types.comma)) { break }
    }
    return node
  };

  pp$1.parseVarId = function(decl, kind) {
    decl.id = this.parseBindingAtom();
    this.checkLVal(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };

  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  // Parse a function declaration or literal (depending on the
  // `statement & FUNC_STATEMENT`).

  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  pp$1.parseFunction = function(node, statement, allowExpressionBody, isAsync) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types.star && (statement & FUNC_HANGING_STATEMENT))
        { this.unexpected(); }
      node.generator = this.eat(types.star);
    }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    if (statement & FUNC_STATEMENT) {
      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
        // If it is a regular function declaration in sloppy mode, then it is
        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
        // mode depends on properties of the current scope (see
        // treatFunctionsAsVar).
        { this.checkLVal(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
    }

    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));

    if (!(statement & FUNC_STATEMENT))
      { node.id = this.type === types.name ? this.parseIdent() : null; }

    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$1.parseFunctionParams = function(node) {
    this.expect(types.parenL);
    node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$1.parseClass = function(node, isStatement) {
    this.next();

    // ecma-262 14.6 Class Definitions
    // A class definition is always strict mode code.
    var oldStrict = this.strict;
    this.strict = true;

    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types.braceL);
    while (!this.eat(types.braceR)) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) { this.raise(element.start, "Duplicate constructor in the same class"); }
          hadConstructor = true;
        }
      }
    }
    node.body = this.finishNode(classBody, "ClassBody");
    this.strict = oldStrict;
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$1.parseClassElement = function(constructorAllowsSuper) {
    var this$1 = this;

    if (this.eat(types.semi)) { return null }

    var method = this.startNode();
    var tryContextual = function (k, noLineBreak) {
      if ( noLineBreak === void 0 ) noLineBreak = false;

      var start = this$1.start, startLoc = this$1.startLoc;
      if (!this$1.eatContextual(k)) { return false }
      if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) { return true }
      if (method.key) { this$1.unexpected(); }
      method.computed = false;
      method.key = this$1.startNodeAt(start, startLoc);
      method.key.name = k;
      this$1.finishNode(method.key, "Identifier");
      return false
    };

    method.kind = "method";
    method.static = tryContextual("static");
    var isGenerator = this.eat(types.star);
    var isAsync = false;
    if (!isGenerator) {
      if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
        isAsync = true;
        isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
      } else if (tryContextual("get")) {
        method.kind = "get";
      } else if (tryContextual("set")) {
        method.kind = "set";
      }
    }
    if (!method.key) { this.parsePropertyName(method); }
    var key = method.key;
    var allowsDirectSuper = false;
    if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
        key.type === "Literal" && key.value === "constructor")) {
      if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
      method.kind = "constructor";
      allowsDirectSuper = constructorAllowsSuper;
    } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }
    this.parseClassMethod(method, isGenerator, isAsync, allowsDirectSuper);
    if (method.kind === "get" && method.value.params.length !== 0)
      { this.raiseRecoverable(method.value.start, "getter should have no params"); }
    if (method.kind === "set" && method.value.params.length !== 1)
      { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
    if (method.kind === "set" && method.value.params[0].type === "RestElement")
      { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
    return method
  };

  pp$1.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
    return this.finishNode(method, "MethodDefinition")
  };

  pp$1.parseClassId = function(node, isStatement) {
    if (this.type === types.name) {
      node.id = this.parseIdent();
      if (isStatement)
        { this.checkLVal(node.id, BIND_LEXICAL, false); }
    } else {
      if (isStatement === true)
        { this.unexpected(); }
      node.id = null;
    }
  };

  pp$1.parseClassSuper = function(node) {
    node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
  };

  // Parses module export declaration.

  pp$1.parseExport = function(node, exports) {
    this.next();
    // export * from '...'
    if (this.eat(types.star)) {
      this.expectContextual("from");
      if (this.type !== types.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
      this.semicolon();
      return this.finishNode(node, "ExportAllDeclaration")
    }
    if (this.eat(types._default)) { // export default ...
      this.checkExport(exports, "default", this.lastTokStart);
      var isAsync;
      if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
        var fNode = this.startNode();
        this.next();
        if (isAsync) { this.next(); }
        node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
      } else if (this.type === types._class) {
        var cNode = this.startNode();
        node.declaration = this.parseClass(cNode, "nullableID");
      } else {
        node.declaration = this.parseMaybeAssign();
        this.semicolon();
      }
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseStatement(null);
      if (node.declaration.type === "VariableDeclaration")
        { this.checkVariableExport(exports, node.declaration.declarations); }
      else
        { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
      node.specifiers = [];
      node.source = null;
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports);
      if (this.eatContextual("from")) {
        if (this.type !== types.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
      } else {
        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
          // check for keywords used as local names
          var spec = list[i];

          this.checkUnreserved(spec.local);
          // check if export is defined
          this.checkLocalExport(spec.local);
        }

        node.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$1.checkExport = function(exports, name, pos) {
    if (!exports) { return }
    if (has(exports, name))
      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
    exports[name] = true;
  };

  pp$1.checkPatternExport = function(exports, pat) {
    var type = pat.type;
    if (type === "Identifier")
      { this.checkExport(exports, pat.name, pat.start); }
    else if (type === "ObjectPattern")
      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
        {
          var prop = list[i];

          this.checkPatternExport(exports, prop);
        } }
    else if (type === "ArrayPattern")
      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];

          if (elt) { this.checkPatternExport(exports, elt); }
      } }
    else if (type === "Property")
      { this.checkPatternExport(exports, pat.value); }
    else if (type === "AssignmentPattern")
      { this.checkPatternExport(exports, pat.left); }
    else if (type === "RestElement")
      { this.checkPatternExport(exports, pat.argument); }
    else if (type === "ParenthesizedExpression")
      { this.checkPatternExport(exports, pat.expression); }
  };

  pp$1.checkVariableExport = function(exports, decls) {
    if (!exports) { return }
    for (var i = 0, list = decls; i < list.length; i += 1)
      {
      var decl = list[i];

      this.checkPatternExport(exports, decl.id);
    }
  };

  pp$1.shouldParseExportStatement = function() {
    return this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$1.parseExportSpecifiers = function(exports) {
    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(types.braceL);
    while (!this.eat(types.braceR)) {
      if (!first) {
        this.expect(types.comma);
        if (this.afterTrailingComma(types.braceR)) { break }
      } else { first = false; }

      var node = this.startNode();
      node.local = this.parseIdent(true);
      node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
      this.checkExport(exports, node.exported.name, node.exported.start);
      nodes.push(this.finishNode(node, "ExportSpecifier"));
    }
    return nodes
  };

  // Parses import declaration.

  pp$1.parseImport = function(node) {
    this.next();
    // import '...'
    if (this.type === types.string) {
      node.specifiers = empty;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$1.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types.name) {
      // import defaultObj, { x, y as z } from '...'
      var node = this.startNode();
      node.local = this.parseIdent();
      this.checkLVal(node.local, BIND_LEXICAL);
      nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
      if (!this.eat(types.comma)) { return nodes }
    }
    if (this.type === types.star) {
      var node$1 = this.startNode();
      this.next();
      this.expectContextual("as");
      node$1.local = this.parseIdent();
      this.checkLVal(node$1.local, BIND_LEXICAL);
      nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
      return nodes
    }
    this.expect(types.braceL);
    while (!this.eat(types.braceR)) {
      if (!first) {
        this.expect(types.comma);
        if (this.afterTrailingComma(types.braceR)) { break }
      } else { first = false; }

      var node$2 = this.startNode();
      node$2.imported = this.parseIdent(true);
      if (this.eatContextual("as")) {
        node$2.local = this.parseIdent();
      } else {
        this.checkUnreserved(node$2.imported);
        node$2.local = node$2.imported;
      }
      this.checkLVal(node$2.local, BIND_LEXICAL);
      nodes.push(this.finishNode(node$2, "ImportSpecifier"));
    }
    return nodes
  };

  // Set `ExpressionStatement#directive` property for directive prologues.
  pp$1.adaptDirectivePrologue = function(statements) {
    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$1.isDirectiveCandidate = function(statement) {
    return (
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "Literal" &&
      typeof statement.expression.value === "string" &&
      // Reject parenthesized strings.
      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
    )
  };

  var pp$2 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
        break

      case "ObjectPattern":
      case "ArrayPattern":
      case "RestElement":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];

        this.toAssignable(prop, isBinding);
          // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
          if (
            prop.type === "RestElement" &&
            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
          ) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
        this.toAssignable(node.value, isBinding);
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        this.toAssignableList(node.elements, isBinding);
        break

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern")
          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
        break

      case "AssignmentExpression":
        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        // falls through to AssignmentPattern

      case "AssignmentPattern":
        break

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break

      case "MemberExpression":
        if (!isBinding) { break }

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$2.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) { this.toAssignable(elt, isBinding); }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        { this.unexpected(last.argument.start); }
    }
    return exprList
  };

  // Parses spread element.

  pp$2.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$2.parseRestBinding = function() {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (this.options.ecmaVersion === 6 && this.type !== types.name)
      { this.unexpected(); }

    node.argument = this.parseBindingAtom();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$2.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern")

      case types.braceL:
        return this.parseObj(true)
      }
    }
    return this.parseIdent()
  };

  pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) { first = false; }
      else { this.expect(types.comma); }
      if (allowEmpty && this.type === types.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break
      } else if (this.type === types.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types.comma) { this.raise(this.start, "Comma is not permitted after the rest element"); }
        this.expect(close);
        break
      } else {
        var elem = this.parseMaybeDefault(this.start, this.startLoc);
        this.parseBindingListItem(elem);
        elts.push(elem);
      }
    }
    return elts
  };

  pp$2.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // Verify that a node is an lval — something that can be assigned
  // to.
  // bindingType can be either:
  // 'var' indicating that the lval creates a 'var' binding
  // 'let' indicating that the lval creates a lexical ('let' or 'const') binding
  // 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

  pp$2.checkLVal = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "Identifier":
      if (bindingType === BIND_LEXICAL && expr.name === "let")
        { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
      if (checkClashes) {
        if (has(checkClashes, expr.name))
          { this.raiseRecoverable(expr.start, "Argument name clash"); }
        checkClashes[expr.name] = true;
      }
      if (bindingType !== BIND_NONE && bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
      break

    case "MemberExpression":
      if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
      break

    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1)
        {
      var prop = list[i];

      this.checkLVal(prop, bindingType, checkClashes);
    }
      break

    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLVal(expr.value, bindingType, checkClashes);
      break

    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];

      if (elem) { this.checkLVal(elem, bindingType, checkClashes); }
      }
      break

    case "AssignmentPattern":
      this.checkLVal(expr.left, bindingType, checkClashes);
      break

    case "RestElement":
      this.checkLVal(expr.argument, bindingType, checkClashes);
      break

    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, bindingType, checkClashes);
      break

    default:
      this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  // A recursive descent parser operates by defining functions for all

  var pp$3 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      { return }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      { return }
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) { refDestructuringErrors.doubleProto = key.start; }
          // Backwards-compat kludge. Can be removed in version 6.0
          else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
        }
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        { this.raiseRecoverable(key.start, "Redefinition of property"); }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$3.parseExpression = function(noIn, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
    if (this.type === types.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types.comma)) { node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors)); }
      return this.finishNode(node, "SequenceExpression")
    }
    return expr
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) { return this.parseYield(noIn) }
      // The tokenizer will assume an expression is allowed after
      // `yield`, but this isn't that kind of yield
      else { this.exprAllowed = false; }
    }

    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldShorthandAssign = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldShorthandAssign = refDestructuringErrors.shorthandAssign;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.shorthandAssign = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types.parenL || this.type === types.name)
      { this.potentialArrowAt = this.start; }
    var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
      if (!ownDestructuringErrors) { DestructuringErrors.call(refDestructuringErrors); }
      refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
      this.checkLVal(left);
      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
    }
    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
    if (oldShorthandAssign > -1) { refDestructuringErrors.shorthandAssign = oldShorthandAssign; }
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(noIn, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    if (this.eat(types.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types.colon);
      node.alternate = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
    var prec = this.type.binop;
    if (prec != null && (!noIn || this.type !== types._in)) {
      if (prec > minPrec) {
        var logical = this.type === types.logicalOR || this.type === types.logicalAND;
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
      }
    }
    return left
  };

  pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction))) {
      expr = this.parseAwait();
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) { this.checkLVal(node.argument); }
      else if (this.strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
      else { sawUnary = true; }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLVal(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!sawUnary && this.eat(types.starstar))
      { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
    else
      { return expr }
  };

  // Parse call, dot, and `[]`-subscript expressions.

  pp$3.parseExprSubscripts = function(refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors);
    var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
    if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) { return expr }
    var result = this.parseSubscripts(expr, startPos, startLoc);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
    }
    return result
  };

  pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd === base.end && !this.canInsertSemicolon() && this.input.slice(base.start, base.end) === "async";
    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow);
      if (element === base || element.type === "ArrowFunctionExpression") { return element }
      base = element;
    }
  };

  pp$3.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow) {
    var computed = this.eat(types.bracketL);
    if (computed || this.eat(types.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = computed ? this.parseExpression() : this.parseIdent(this.options.allowReserved !== "never");
      node.computed = !!computed;
      if (computed) { this.expect(types.bracketR); }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0)
          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true)
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types.backQuote) {
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({isTagged: true});
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$3.parseExprAtom = function(refDestructuringErrors) {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.type === types.slash) { this.readRegexp(); }

    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
    case types._super:
      if (!this.allowSuper)
        { this.raise(this.start, "'super' keyword outside a method"); }
      node = this.startNode();
      this.next();
      if (this.type === types.parenL && !this.allowDirectSuper)
        { this.raise(node.start, "super() call outside constructor of a subclass"); }
      // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )
      if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
        { this.unexpected(); }
      return this.finishNode(node, "Super")

    case types._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression")

    case types.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
        { return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true) }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types.arrow))
          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types.arrow))
            { this.unexpected(); }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
        }
      }
      return id

    case types.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case types.num: case types.string:
      return this.parseLiteral(this.value)

    case types._null: case types._true: case types._false:
      node = this.startNode();
      node.value = this.type === types._null ? null : this.type === types._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case types.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          { refDestructuringErrors.parenthesizedAssign = start; }
        if (refDestructuringErrors.parenthesizedBind < 0)
          { refDestructuringErrors.parenthesizedBind = start; }
      }
      return expr

    case types.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case types.braceL:
      return this.parseObj(false, refDestructuringErrors)

    case types._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0)

    case types._class:
      return this.parseClass(this.startNode(), false)

    case types._new:
      return this.parseNew()

    case types.backQuote:
      return this.parseTemplate()

    case types._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport()
      } else {
        return this.unexpected()
      }

    default:
      this.unexpected();
    }
  };

  pp$3.parseExprImport = function() {
    var node = this.startNode();
    this.next(); // skip `import`
    switch (this.type) {
    case types.parenL:
      return this.parseDynamicImport(node)
    default:
      this.unexpected();
    }
  };

  pp$3.parseDynamicImport = function(node) {
    this.next(); // skip `(`

    // Parse node.source.
    node.source = this.parseMaybeAssign();

    // Verify ending.
    if (!this.eat(types.parenR)) {
      var errorPos = this.start;
      if (this.eat(types.comma) && this.eat(types.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }

    return this.finishNode(node, "ImportExpression")
  };

  pp$3.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1); }
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$3.parseParenExpression = function() {
    this.expect(types.parenL);
    var val = this.parseExpression();
    this.expect(types.parenR);
    return val
  };

  pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      // Do not save awaitIdentPos to allow checking awaits nested in parameters
      while (this.type !== types.parenR) {
        first ? first = false : this.expect(types.comma);
        if (allowTrailingComma && this.afterTrailingComma(types.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this.type === types.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types.comma) { this.raise(this.start, "Comma is not permitted after the rest element"); }
          break
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.start, innerEndLoc = this.startLoc;
      this.expect(types.parenR);

      if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList)
      }

      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
      if (spreadStart) { this.unexpected(spreadStart); }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$3.parseParenItem = function(item) {
    return item
  };

  pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty$1 = [];

  pp$3.parseNew = function() {
    var node = this.startNode();
    var meta = this.parseIdent(true);
    if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
      node.meta = meta;
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target" || containsEsc)
        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target"); }
      if (!this.inNonArrowFunction())
        { this.raiseRecoverable(node.start, "new.target can only be used in functions"); }
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc, isImport = this.type === types._import;
    node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
    if (isImport && node.callee.type === "ImportExpression") {
      this.raise(startPos, "Cannot use new with import()");
    }
    if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
    else { node.arguments = empty$1; }
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$3.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;

    var elem = this.startNode();
    if (this.type === types.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value,
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$3.parseTemplate = function(ref) {
    if ( ref === void 0 ) ref = {};
    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({isTagged: isTagged});
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types.eof) { this.raise(this.pos, "Unterminated template literal"); }
      this.expect(types.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  pp$3.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
      (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  // Parse an object literal or binding pattern.

  pp$3.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types.braceR)) {
      if (!first) {
        this.expect(types.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types.braceR)) { break }
      } else { first = false; }

      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types.comma) {
          this.raise(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement")
      }
      // To disallow parenthesized identifier via `this.toAssignable()`.
      if (this.type === types.parenL && refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0) {
          refDestructuringErrors.parenthesizedAssign = this.start;
        }
        if (refDestructuringErrors.parenthesizedBind < 0) {
          refDestructuringErrors.parenthesizedBind = this.start;
        }
      }
      // Parse argument.
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      // To disallow trailing comma via `this.toAssignable()`.
      if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      // Finish
      return this.finishNode(prop, "SpreadElement")
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern)
        { isGenerator = this.eat(types.star); }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
      this.parsePropertyName(prop, refDestructuringErrors);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property")
  };

  pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types.colon)
      { this.unexpected(); }

    if (this.eat(types.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
      if (isPattern) { this.unexpected(); }
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
    } else if (!isPattern && !containsEsc &&
               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type !== types.comma && this.type !== types.braceR)) {
      if (isGenerator || isAsync) { this.unexpected(); }
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      prop.value = this.parseMethod(false);
      var paramCount = prop.kind === "get" ? 0 : 1;
      if (prop.value.params.length !== paramCount) {
        var start = prop.value.start;
        if (prop.kind === "get")
          { this.raiseRecoverable(start, "getter should have no params"); }
        else
          { this.raiseRecoverable(start, "setter should have exactly one param"); }
      } else {
        if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
          { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
      }
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = startPos; }
      prop.kind = "init";
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else if (this.type === types.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          { refDestructuringErrors.shorthandAssign = this.start; }
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else {
        prop.value = prop.key;
      }
      prop.shorthand = true;
    } else { this.unexpected(); }
  };

  pp$3.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  };

  // Initialize empty function node.

  pp$3.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
    if (this.options.ecmaVersion >= 8) { node.async = false; }
  };

  // Parse object or class method.

  pp$3.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      { node.generator = isGenerator; }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

    this.expect(types.parenL);
    node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$3.parseArrowExpression = function(node, params, isAsync) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$3.parseFunctionBody = function(node, isArrowFunction, isMethod) {
    var isExpression = isArrowFunction && this.type !== types.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign();
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) { this.strict = true; }

      // Add the params to varDeclaredNames to ensure that an error is thrown
      // if a let/const declaration in the function clashes with one of the params.
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      node.body = this.parseBlock(false);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();

    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    if (this.strict && node.id) { this.checkLVal(node.id, BIND_OUTSIDE); }
    this.strict = oldStrict;
  };

  pp$3.isSimpleParamList = function(params) {
    for (var i = 0, list = params; i < list.length; i += 1)
      {
      var param = list[i];

      if (param.type !== "Identifier") { return false
    } }
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$3.checkParams = function(node, allowDuplicates) {
    var nameHash = {};
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLVal(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types.comma)
        { elt = null; }
      else if (this.type === types.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$3.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$3.parseIdent = function(liberal, isBinding) {
    var node = this.startNode();
    if (this.type === types.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
          (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  // Parses yield expression inside generator.

  pp$3.parseYield = function(noIn) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types.semi || this.canInsertSemicolon() || (this.type !== types.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types.star);
      node.argument = this.parseMaybeAssign(noIn);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$3.parseAwait = function() {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$5 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$5.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$5.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$5.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$5.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$5.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$5.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$5.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$5.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$6 = Parser.prototype;

  pp$6.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$6.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$6.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$6.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  // The algorithm used to determine whether a regexp can appear at a

  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types$1 = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$7 = Parser.prototype;

  pp$7.initialContext = function() {
    return [types$1.b_stat]
  };

  pp$7.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types$1.f_expr || parent === types$1.f_stat)
      { return true }
    if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types._return || prevType === types.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow)
      { return true }
    if (prevType === types.braceL)
      { return parent === types$1.b_stat }
    if (prevType === types._var || prevType === types._const || prevType === types.name)
      { return false }
    return !this.exprAllowed
  };

  pp$7.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$7.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Token-specific context update code

  types.parenR.updateContext = types.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types$1.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
    this.exprAllowed = true;
  };

  types.dollarBraceL.updateContext = function() {
    this.context.push(types$1.b_tmpl);
    this.exprAllowed = true;
  };

  types.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
    this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
    this.exprAllowed = true;
  };

  types.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types._function.updateContext = types._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
        !(prevType === types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
      { this.context.push(types$1.f_expr); }
    else
      { this.context.push(types$1.f_stat); }
    this.exprAllowed = false;
  };

  types.backQuote.updateContext = function() {
    if (this.curContext() === types$1.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types$1.q_tmpl); }
    this.exprAllowed = false;
  };

  types.star.updateContext = function(prevType) {
    if (prevType === types._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types$1.f_expr)
        { this.context[index] = types$1.f_expr_gen; }
      else
        { this.context[index] = types$1.f_gen; }
    }
    this.exprAllowed = true;
  };

  types.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // This file contains Unicode properties extracted from the ECMAScript
  // specification. The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }
  buildUnicodeData(9);
  buildUnicodeData(10);
  buildUnicodeData(11);

  var pp$8 = Parser.prototype;

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 11 ? 11 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = [];
    this.backReferenceNames = [];
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i) {
    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    return (c << 10) + s.charCodeAt(i + 1) - 0x35FDC00
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i) {
    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i);
    if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current () {
    return this.at(this.pos)
  };

  RegExpValidationState.prototype.lookahead = function lookahead () {
    return this.at(this.nextIndex(this.pos))
  };

  RegExpValidationState.prototype.advance = function advance () {
    this.pos = this.nextIndex(this.pos);
  };

  RegExpValidationState.prototype.eat = function eat (ch) {
    if (this.current() === ch) {
      this.advance();
      return true
    }
    return false
  };

  function codePointToString(ch) {
    if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
    ch -= 0x10000;
    return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
  }

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$8.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
    }
  };

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$8.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$8.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames.length = 0;
    state.backReferenceNames.length = 0;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* [ */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (state.groupNames.indexOf(name) === -1) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$8.regexp_disjunction = function(state) {
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      this.regexp_alternative(state);
    }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$8.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state))
      { }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$8.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$8.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$8.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$8.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$8.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$8.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$8.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
        this.regexp_disjunction(state);
        if (state.eat(0x29 /* ) */)) {
          return true
        }
        state.raise("Unterminated group");
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$8.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$8.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$8.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$8.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$8.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier[U] ::
  //   [empty]
  //   `?` GroupName[?U]
  pp$8.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (this.regexp_eatGroupName(state)) {
        if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
          state.raise("Duplicate capture group name");
        }
        state.groupNames.push(state.lastStringValue);
        return
      }
      state.raise("Invalid group");
    }
  };

  // GroupName[U] ::
  //   `<` RegExpIdentifierName[?U] `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$8.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName[U] ::
  //   RegExpIdentifierStart[?U]
  //   RegExpIdentifierName[?U] RegExpIdentifierPart[?U]
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$8.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart[U] ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[?U]
  pp$8.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var ch = state.current();
    state.advance();

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart[U] ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[?U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$8.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var ch = state.current();
    state.advance();

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$8.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$8.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$8.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$8.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$8.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$8.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$8.regexp_eatRegExpUnicodeEscapeSequence = function(state) {
    var start = state.pos;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (state.switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        state.switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$8.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$8.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$8.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return true
    }

    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      (ch === 0x50 /* P */ || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      if (
        state.eat(0x7B /* { */) &&
        this.regexp_eatUnicodePropertyValueExpression(state) &&
        state.eat(0x7D /* } */)
      ) {
        return true
      }
      state.raise("Invalid property name");
    }

    return false
  };
  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$8.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return true
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
      return true
    }
    return false
  };
  pp$8.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!has(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };
  pp$8.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (!state.unicodeProperties.binary.test(nameOrValue))
      { state.raise("Invalid property name"); }
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$8.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$8.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$8.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$8.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      state.eat(0x5E /* ^ */);
      this.regexp_classRanges(state);
      if (state.eat(0x5D /* [ */)) {
        return true
      }
      // Unreachable since it threw "unterminated regular expression" error before.
      state.raise("Unterminated character class");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$8.regexp_classRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$8.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* [ */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$8.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$8.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$8.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$8.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$8.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$8.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$8.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$8.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp$9 = Parser.prototype;

  // Move to the next token

  pp$9.next = function() {
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp$9.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp$9[Symbol.iterator] = function() {
      var this$1 = this;

      return {
        next: function () {
          var token = this$1.getToken();
          return {
            done: token.type === types.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  pp$9.curContext = function() {
    return this.context[this.context.length - 1]
  };

  // Read a single token, updating the parser object's token-related
  // properties.

  pp$9.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp$9.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp$9.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xe000) { return code }
    var next = this.input.charCodeAt(this.pos + 1);
    return (code << 10) + next - 0x35fdc00
  };

  pp$9.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      lineBreakG.lastIndex = start;
      var match;
      while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
        ++this.curLine;
        this.lineStart = match.index + match[0].length;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp$9.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp$9.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp$9.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp$9.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types.dot)
    }
  };

  pp$9.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.slash, 1)
  };

  pp$9.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types.star : types.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp$9.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
  };

  pp$9.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.bitwiseXOR, 1)
  };

  pp$9.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.plusMin, 1)
  };

  pp$9.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
      return this.finishOp(types.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types.relational, size)
  };

  pp$9.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types.arrow)
    }
    return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
  };

  pp$9.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types.parenL)
    case 41: ++this.pos; return this.finishToken(types.parenR)
    case 59: ++this.pos; return this.finishToken(types.semi)
    case 44: ++this.pos; return this.finishToken(types.comma)
    case 91: ++this.pos; return this.finishToken(types.bracketL)
    case 93: ++this.pos; return this.finishToken(types.bracketR)
    case 123: ++this.pos; return this.finishToken(types.braceL)
    case 125: ++this.pos; return this.finishToken(types.braceR)
    case 58: ++this.pos; return this.finishToken(types.colon)
    case 63: ++this.pos; return this.finishToken(types.question)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 126: // '~'
      return this.finishOp(types.prefix, 1)
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString$1(code) + "'");
  };

  pp$9.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp$9.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp$9.readInt = function(radix, len) {
    var start = this.pos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);
      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      ++this.pos;
      total = total * radix + val;
    }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  pp$9.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = typeof BigInt !== "undefined" ? BigInt(this.input.slice(start, this.pos)) : null;
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp$9.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var str$1 = this.input.slice(start, this.pos);
      var val$1 = typeof BigInt !== "undefined" ? BigInt(str$1) : null;
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types.num, val$1)
    }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var str = this.input.slice(start, this.pos);
    var val = octal ? parseInt(str, 8) : parseFloat(str);
    return this.finishToken(types.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp$9.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  function codePointToString$1(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  pp$9.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else {
        if (isNewLine(ch, this.options.ecmaVersion >= 10)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp$9.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp$9.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp$9.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types.template || this.type === types.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp$9.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break
        }
      // falls through

      case "`":
        return this.finishToken(types.invalidTemplate, this.input.slice(this.start, this.pos))

      // no default
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp$9.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString$1(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp$9.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp$9.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString$1(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp$9.readWord = function() {
    var word = this.readWord1();
    var type = types.name;
    if (this.keywords.test(word)) {
      if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword " + word); }
      type = keywords$1[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.

  var version = "7.1.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types,
    keywordTypes: keywords$1,
    TokContext: TokContext,
    tokContexts: types$1,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api].
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  function parse(input, options) {
    return Parser.parse(input, options)
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
  }

  exports.Node = Node;
  exports.Parser = Parser;
  exports.Position = Position;
  exports.SourceLocation = SourceLocation;
  exports.TokContext = TokContext;
  exports.Token = Token;
  exports.TokenType = TokenType;
  exports.defaultOptions = defaultOptions;
  exports.getLineInfo = getLineInfo;
  exports.isIdentifierChar = isIdentifierChar;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isNewLine = isNewLine;
  exports.keywordTypes = keywords$1;
  exports.lineBreak = lineBreak;
  exports.lineBreakG = lineBreakG;
  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokContexts = types$1;
  exports.tokTypes = types;
  exports.tokenizer = tokenizer;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],26:[function(require,module,exports){
(function (process,__filename){
/**
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  fileURLToPath = require('file-uri-to-path'),
  join = path.join,
  dirname = path.dirname,
  exists =
    (fs.accessSync &&
      function(path) {
        try {
          fs.accessSync(path);
        } catch (e) {
          return false;
        }
        return true;
      }) ||
    fs.existsSync ||
    path.existsSync,
  defaults = {
    arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
    platform: process.platform,
    arch: process.arch,
    nodePreGyp:
      'node-v' +
      process.versions.modules +
      '-' +
      process.platform +
      '-' +
      process.arch,
    version: process.versions.node,
    bindings: 'bindings.node',
    try: [
      // node-gyp's linked version in the "build" dir
      ['module_root', 'build', 'bindings'],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ['module_root', 'build', 'Debug', 'bindings'],
      ['module_root', 'build', 'Release', 'bindings'],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Debug', 'bindings'],
      ['module_root', 'Debug', 'bindings'],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Release', 'bindings'],
      ['module_root', 'Release', 'bindings'],
      // Legacy from node-waf, node <= 0.4.x
      ['module_root', 'build', 'default', 'bindings'],
      // Production "Release" buildtype binary (meh...)
      ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings'],
      // node-qbs builds
      ['module_root', 'addon-build', 'release', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'debug', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'default', 'install-root', 'bindings'],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ['module_root', 'lib', 'binding', 'nodePreGyp', 'bindings']
    ]
  };

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings(opts) {
  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts };
  } else if (!opts) {
    opts = {};
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function(i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName());
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node';
  }

  // https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
  var requireFunc =
    typeof __webpack_require__ === 'function'
      ? __non_webpack_require__
      : require;

  var tries = [],
    i = 0,
    l = opts.try.length,
    n,
    b,
    err;

  for (; i < l; i++) {
    n = join.apply(
      null,
      opts.try[i].map(function(p) {
        return opts[p] || p;
      })
    );
    tries.push(n);
    try {
      b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
      if (!opts.path) {
        b.path = n;
      }
      return b;
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND' &&
          e.code !== 'QUALIFIED_PATH_RESOLUTION_FAILED' &&
          !/not find/i.test(e.message)) {
        throw e;
      }
    }
  }

  err = new Error(
    'Could not locate the bindings file. Tried:\n' +
      tries
        .map(function(a) {
          return opts.arrow + a;
        })
        .join('\n')
  );
  err.tries = tries;
  throw err;
}
module.exports = exports = bindings;

/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName(calling_file) {
  var origPST = Error.prepareStackTrace,
    origSTL = Error.stackTraceLimit,
    dummy = {},
    fileName;

  Error.stackTraceLimit = 10;

  Error.prepareStackTrace = function(e, st) {
    for (var i = 0, l = st.length; i < l; i++) {
      fileName = st[i].getFileName();
      if (fileName !== __filename) {
        if (calling_file) {
          if (fileName !== calling_file) {
            return;
          }
        } else {
          return;
        }
      }
    }
  };

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy);
  dummy.stack;

  // cleanup
  Error.prepareStackTrace = origPST;
  Error.stackTraceLimit = origSTL;

  // handle filename that starts with "file://"
  var fileSchema = 'file://';
  if (fileName.indexOf(fileSchema) === 0) {
    fileName = fileURLToPath(fileName);
  }

  return fileName;
};

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot(file) {
  var dir = dirname(file),
    prev;
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd();
    }
    if (
      exists(join(dir, 'package.json')) ||
      exists(join(dir, 'node_modules'))
    ) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir;
    }
    if (prev === dir) {
      // Got to the top
      throw new Error(
        'Could not find module root given file: "' +
          file +
          '". Do you have a `package.json` file? '
      );
    }
    // Try the parent dir next
    prev = dir;
    dir = join(dir, '..');
  }
};

}).call(this,require('_process'),"/node_modules/bindings/bindings.js")
},{"_process":12,"file-uri-to-path":28,"fs":1,"path":11}],27:[function(require,module,exports){
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

"use strict"; "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}


},{}],28:[function(require,module,exports){

/**
 * Module dependencies.
 */

var sep = require('path').sep || '/';

/**
 * Module exports.
 */

module.exports = fileUriToPath;

/**
 * File URI to Path function.
 *
 * @param {String} uri
 * @return {String} path
 * @api public
 */

function fileUriToPath (uri) {
  if ('string' != typeof uri ||
      uri.length <= 7 ||
      'file://' != uri.substring(0, 7)) {
    throw new TypeError('must pass in a file:// URI to convert to a file path');
  }

  var rest = decodeURI(uri.substring(7));
  var firstSlash = rest.indexOf('/');
  var host = rest.substring(0, firstSlash);
  var path = rest.substring(firstSlash + 1);

  // 2.  Scheme Definition
  // As a special case, <host> can be the string "localhost" or the empty
  // string; this is interpreted as "the machine from which the URL is
  // being interpreted".
  if ('localhost' == host) host = '';

  if (host) {
    host = sep + sep + host;
  }

  // 3.2  Drives, drive letters, mount points, file system root
  // Drive letters are mapped into the top of a file URI in various ways,
  // depending on the implementation; some applications substitute
  // vertical bar ("|") for the colon after the drive letter, yielding
  // "file:///c|/tmp/test.txt".  In some cases, the colon is left
  // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
  // colon is simply omitted, as in "file:///c/tmp/test.txt".
  path = path.replace(/^(.+)\|/, '$1:');

  // for Windows, we need to invert the path separators from what a URI uses
  if (sep == '\\') {
    path = path.replace(/\//g, '\\');
  }

  if (/^.+\:/.test(path)) {
    // has Windows drive at beginning of path
  } else {
    // unix path…
    path = sep + path;
  }

  return host + path;
}

},{"path":11}],29:[function(require,module,exports){
if (typeof WebGLRenderingContext !== 'undefined') {
  module.exports = require('./src/javascript/browser-index')
} else {
  module.exports = require('./src/javascript/node-index')
}

},{"./src/javascript/browser-index":31,"./src/javascript/node-index":40}],30:[function(require,module,exports){
module.exports={
  "_from": "gl",
  "_id": "gl@4.4.0",
  "_inBundle": false,
  "_integrity": "sha512-4FIq5tqiltTsadrLh6DGY4R9+aQwj25OM2WlXEv81N6YN1q1C0qR7ct0SKp1uUJdnBqbKhUJP3zQ1td40AVeJg==",
  "_location": "/gl",
  "_phantomChildren": {},
  "_requested": {
    "type": "tag",
    "registry": true,
    "raw": "gl",
    "name": "gl",
    "escapedName": "gl",
    "rawSpec": "",
    "saveSpec": null,
    "fetchSpec": "latest"
  },
  "_requiredBy": [
    "#USER",
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/gl/-/gl-4.4.0.tgz",
  "_shasum": "3d448769a9222ba809da4db80dd1f3c4b85498a0",
  "_spec": "gl",
  "_where": "C:\\nowak\\development\\git\\Simplicity\\js\\test",
  "author": {
    "name": "Mikola Lysenko"
  },
  "browser": "browser_index.js",
  "bugs": {
    "url": "https://github.com/stackgl/headless-gl/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "bindings": "^1.5.0",
    "bit-twiddle": "^1.0.2",
    "glsl-tokenizer": "^2.0.2",
    "nan": "^2.14.0",
    "node-gyp": "^4.0.0",
    "prebuild-install": "^5.1.0"
  },
  "deprecated": false,
  "description": "Creates a WebGL context without a window",
  "devDependencies": {
    "angle-normals": "^1.0.0",
    "bunny": "^1.0.1",
    "faucet": "0.0.1",
    "gl-conformance": "^2.0.9",
    "prebuild": "^8.0.1",
    "snazzy": "^8.0.0",
    "standard": "^12.0.1",
    "tape": "^4.7.0"
  },
  "directories": {
    "test": "test"
  },
  "engines": {
    "node": ">=8.0.0"
  },
  "gypfile": true,
  "homepage": "https://github.com/stackgl/headless-gl#readme",
  "keywords": [
    "webgl",
    "opengl",
    "gl",
    "headless",
    "server",
    "gpgpu"
  ],
  "license": "BSD-2-Clause",
  "main": "index.js",
  "name": "gl",
  "repository": {
    "type": "git",
    "url": "git://github.com/stackgl/headless-gl.git"
  },
  "scripts": {
    "install": "prebuild-install || node-gyp rebuild",
    "prebuild": "prebuild --all --strip",
    "rebuild": "node-gyp rebuild --verbose",
    "test": "standard | snazzy && tape test/*.js | faucet"
  },
  "version": "4.4.0"
}

},{}],31:[function(require,module,exports){
function createContext (width, height, options) {
  width = width | 0
  height = height | 0
  if (!(width > 0 && height > 0)) {
    return null
  }

  const canvas = document.createElement('canvas')
  if (!canvas) {
    return null
  }
  let gl
  canvas.width = width
  canvas.height = height

  try {
    gl = canvas.getContext('webgl', options)
  } catch (e) {
    try {
      gl = canvas.getContext('experimental-webgl', options)
    } catch (e) {
      return null
    }
  }

  const _getExtension = gl.getExtension
  const extDestroy = {
    destroy: function () {
      const loseContext = _getExtension.call(gl, 'WEBGL_lose_context')
      if (loseContext) {
        loseContext.loseContext()
      }
    }
  }

  const extResize = {
    resize: function (w, h) {
      canvas.width = w
      canvas.height = h
    }
  }

  const _supportedExtensions = gl.getSupportedExtensions().slice()
  _supportedExtensions.push(
    'STACKGL_destroy_context',
    'STACKGL_resize_drawingbuffer')
  gl.getSupportedExtensions = function () {
    return _supportedExtensions.slice()
  }

  gl.getExtension = function (extName) {
    const name = extName.toLowerCase()
    if (name === 'stackgl_resize_drawingbuffer') {
      return extResize
    }
    if (name === 'stackgl_destroy_context') {
      return extDestroy
    }
    return _getExtension.call(gl, extName)
  }

  return gl || null
}

module.exports = createContext

},{}],32:[function(require,module,exports){
const { gl } = require('../native-gl')
const { vertexCount } = require('../utils')

class ANGLEInstancedArrays {
  constructor (ctx) {
    this.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88fe
    this.ctx = ctx

    this._drawArraysInstanced = gl._drawArraysInstanced.bind(ctx)
    this._drawElementsInstanced = gl._drawElementsInstanced.bind(ctx)
    this._vertexAttribDivisor = gl._vertexAttribDivisor.bind(ctx)
  }

  drawArraysInstancedANGLE (mode, first, count, primCount) {
    const { ctx } = this
    mode |= 0
    first |= 0
    count |= 0
    primCount |= 0
    if (first < 0 || count < 0 || primCount < 0) {
      ctx.setError(gl.INVALID_VALUE)
      return
    }
    if (!ctx._checkStencilState()) {
      return
    }
    const reducedCount = vertexCount(mode, count)
    if (reducedCount < 0) {
      ctx.setError(gl.INVALID_ENUM)
      return
    }
    if (!ctx._framebufferOk()) {
      return
    }
    if (count === 0 || primCount === 0) {
      return
    }
    let maxIndex = first
    if (count > 0) {
      maxIndex = (count + first - 1) >>> 0
    }
    if (this.checkInstancedVertexAttribState(maxIndex, primCount)) {
      return this._drawArraysInstanced(mode, first, reducedCount, primCount)
    }
  }

  drawElementsInstancedANGLE (mode, count, type, ioffset, primCount) {
    const { ctx } = this
    mode |= 0
    count |= 0
    type |= 0
    ioffset |= 0
    primCount |= 0

    if (count < 0 || ioffset < 0 || primCount < 0) {
      ctx.setError(gl.INVALID_VALUE)
      return
    }

    if (!ctx._checkStencilState()) {
      return
    }

    const elementBuffer = ctx._activeElementArrayBuffer
    if (!elementBuffer) {
      ctx.setError(gl.INVALID_OPERATION)
      return
    }

    // Unpack element data
    let elementData = null
    let offset = ioffset
    if (type === gl.UNSIGNED_SHORT) {
      if (offset % 2) {
        ctx.setError(gl.INVALID_OPERATION)
        return
      }
      offset >>= 1
      elementData = new Uint16Array(elementBuffer._elements.buffer)
    } else if (ctx._extensions.oes_element_index_uint && type === gl.UNSIGNED_INT) {
      if (offset % 4) {
        ctx.setError(gl.INVALID_OPERATION)
        return
      }
      offset >>= 2
      elementData = new Uint32Array(elementBuffer._elements.buffer)
    } else if (type === gl.UNSIGNED_BYTE) {
      elementData = elementBuffer._elements
    } else {
      ctx.setError(gl.INVALID_ENUM)
      return
    }

    let reducedCount = count
    switch (mode) {
      case gl.TRIANGLES:
        if (count % 3) {
          reducedCount -= (count % 3)
        }
        break
      case gl.LINES:
        if (count % 2) {
          reducedCount -= (count % 2)
        }
        break
      case gl.POINTS:
        break
      case gl.LINE_LOOP:
      case gl.LINE_STRIP:
        if (count < 2) {
          ctx.setError(gl.INVALID_OPERATION)
          return
        }
        break
      case gl.TRIANGLE_FAN:
      case gl.TRIANGLE_STRIP:
        if (count < 3) {
          ctx.setError(gl.INVALID_OPERATION)
          return
        }
        break
      default:
        ctx.setError(gl.INVALID_ENUM)
        return
    }

    if (!ctx._framebufferOk()) {
      return
    }

    if (count === 0 || primCount === 0) {
      this.checkInstancedVertexAttribState(0, 0)
      return
    }

    if ((count + offset) >>> 0 > elementData.length) {
      ctx.setError(gl.INVALID_OPERATION)
      return
    }

    // Compute max index
    let maxIndex = -1
    for (let i = offset; i < offset + count; ++i) {
      maxIndex = Math.max(maxIndex, elementData[i])
    }

    if (maxIndex < 0) {
      this.checkInstancedVertexAttribState(0, 0)
      return
    }

    if (this.checkInstancedVertexAttribState(maxIndex, primCount)) {
      if (reducedCount > 0) {
        this._drawElementsInstanced(mode, reducedCount, type, ioffset, primCount)
      }
    }
  }

  vertexAttribDivisorANGLE (index, divisor) {
    const { ctx } = this
    index |= 0
    divisor |= 0
    if (divisor < 0 ||
      index < 0 || index >= ctx._vertexAttribs.length) {
      ctx.setError(gl.INVALID_VALUE)
      return
    }
    const attrib = ctx._vertexAttribs[index]
    attrib._divisor = divisor
    this._vertexAttribDivisor(index, divisor)
  }

  checkInstancedVertexAttribState (maxIndex, primCount) {
    const { ctx } = this
    const program = ctx._activeProgram
    if (!program) {
      ctx.setError(gl.INVALID_OPERATION)
      return false
    }

    const attribs = ctx._vertexAttribs
    let hasZero = false
    for (let i = 0; i < attribs.length; ++i) {
      const attrib = attribs[i]
      if (attrib._isPointer) {
        const buffer = attrib._pointerBuffer
        if (program._attributes.indexOf(i) >= 0) {
          if (!buffer) {
            ctx.setError(gl.INVALID_OPERATION)
            return false
          }
          let maxByte = 0
          if (attrib._divisor === 0) {
            hasZero = true
            maxByte = attrib._pointerStride * maxIndex +
              attrib._pointerSize +
              attrib._pointerOffset
          } else {
            maxByte = attrib._pointerStride * (Math.ceil(primCount / attrib._divisor) - 1) +
              attrib._pointerSize +
              attrib._pointerOffset
          }
          if (maxByte > buffer._size) {
            ctx.setError(gl.INVALID_OPERATION)
            return false
          }
        }
      }
    }

    if (!hasZero) {
      ctx.setError(gl.INVALID_OPERATION)
      return false
    }

    return true
  }
}

function getANGLEInstancedArrays (ctx) {
  return new ANGLEInstancedArrays(ctx)
}

module.exports = { ANGLEInstancedArrays, getANGLEInstancedArrays }

},{"../native-gl":39,"../utils":41}],33:[function(require,module,exports){
class OESElementIndexUint {}

function getOESElementIndexUint (context) {
  let result = null
  const exts = context.getSupportedExtensions()

  if (exts && exts.indexOf('OES_element_index_uint') >= 0) {
    result = new OESElementIndexUint()
  }

  return result
}

module.exports = { getOESElementIndexUint, OESElementIndexUint }

},{}],34:[function(require,module,exports){
class OESTextureFloat {}

function getOESTextureFloat (context) {
  let result = null
  const exts = context.getSupportedExtensions()

  if (exts && exts.indexOf('OES_texture_float') >= 0) {
    result = new OESTextureFloat()
  }

  return result
}

module.exports = { getOESTextureFloat, OESTextureFloat }

},{}],35:[function(require,module,exports){
class STACKGLDestroyContext {
  constructor (ctx) {
    this.destroy = ctx.destroy.bind(ctx)
  }
}

function getSTACKGLDestroyContext (ctx) {
  return new STACKGLDestroyContext(ctx)
}

module.exports = { getSTACKGLDestroyContext, STACKGLDestroyContext }

},{}],36:[function(require,module,exports){
class STACKGLResizeDrawingBuffer {
  constructor (ctx) {
    this.resize = ctx.resize.bind(ctx)
  }
}

function getSTACKGLResizeDrawingBuffer (ctx) {
  return new STACKGLResizeDrawingBuffer(ctx)
}

module.exports = { getSTACKGLResizeDrawingBuffer, STACKGLResizeDrawingBuffer }

},{}],37:[function(require,module,exports){
const { gl } = require('../native-gl')

class WebGLDrawBuffers {
  constructor (ctx) {
    this.ctx = ctx
    const exts = ctx.getSupportedExtensions()

    if (exts && exts.indexOf('WEBGL_draw_buffers') >= 0) {
      Object.assign(this, ctx.extWEBGL_draw_buffers())
      this._buffersState = [ctx.BACK]
      this._maxDrawBuffers = ctx._getParameterDirect(this.MAX_DRAW_BUFFERS_WEBGL)
      this._ALL_ATTACHMENTS = []
      this._ALL_COLOR_ATTACHMENTS = []
      const allColorAttachments = [
        this.COLOR_ATTACHMENT0_WEBGL,
        this.COLOR_ATTACHMENT1_WEBGL,
        this.COLOR_ATTACHMENT2_WEBGL,
        this.COLOR_ATTACHMENT3_WEBGL,
        this.COLOR_ATTACHMENT4_WEBGL,
        this.COLOR_ATTACHMENT5_WEBGL,
        this.COLOR_ATTACHMENT6_WEBGL,
        this.COLOR_ATTACHMENT7_WEBGL,
        this.COLOR_ATTACHMENT8_WEBGL,
        this.COLOR_ATTACHMENT9_WEBGL,
        this.COLOR_ATTACHMENT10_WEBGL,
        this.COLOR_ATTACHMENT11_WEBGL,
        this.COLOR_ATTACHMENT12_WEBGL,
        this.COLOR_ATTACHMENT13_WEBGL,
        this.COLOR_ATTACHMENT14_WEBGL,
        this.COLOR_ATTACHMENT15_WEBGL
      ]
      while (this._ALL_ATTACHMENTS.length < this._maxDrawBuffers) {
        const colorAttachment = allColorAttachments.shift()
        this._ALL_ATTACHMENTS.push(colorAttachment)
        this._ALL_COLOR_ATTACHMENTS.push(colorAttachment)
      }
      this._ALL_ATTACHMENTS.push(
        gl.DEPTH_ATTACHMENT,
        gl.STENCIL_ATTACHMENT,
        gl.DEPTH_STENCIL_ATTACHMENT
      )
    }
  }

  drawBuffersWEBGL (buffers) {
    const { ctx } = this
    if (buffers.length < 1) {
      ctx.setError(gl.INVALID_OPERATION)
      return
    }
    if (buffers.length === 1 && buffers[0] === gl.BACK) {
      this._buffersState = buffers
      ctx.drawBuffersWEBGL([this.COLOR_ATTACHMENT0_WEBGL])
      return
    } else if (!ctx._activeFramebuffer) {
      if (buffers.length > 1) {
        ctx.setError(gl.INVALID_OPERATION)
        return
      }
      for (let i = 0; i < buffers.length; i++) {
        if (buffers[i] > gl.NONE) {
          ctx.setError(gl.INVALID_OPERATION)
          return
        }
      }
    }
    this._buffersState = buffers
    ctx.drawBuffersWEBGL(buffers)
  }
}

function getWebGLDrawBuffers (ctx) {
  const exts = ctx.getSupportedExtensions()

  if (exts && exts.indexOf('WEBGL_draw_buffers') >= 0) {
    return new WebGLDrawBuffers(ctx)
  } else {
    return null
  }
}

module.exports = {
  getWebGLDrawBuffers,
  WebGLDrawBuffers
}

},{"../native-gl":39}],38:[function(require,module,exports){
class Linkable {
  constructor (_) {
    this._ = _
    this._references = []
    this._refCount = 0
    this._pendingDelete = false
    this._binding = 0
  }

  _link (b) {
    this._references.push(b)
    b._refCount += 1
    return true
  }

  _unlink (b) {
    let idx = this._references.indexOf(b)
    if (idx < 0) {
      return false
    }
    while (idx >= 0) {
      this._references[idx] = this._references[this._references.length - 1]
      this._references.pop()
      b._refCount -= 1
      b._checkDelete()
      idx = this._references.indexOf(b)
    }
    return true
  }

  _linked (b) {
    return this._references.indexOf(b) >= 0
  }

  _checkDelete () {
    if (this._refCount <= 0 &&
      this._pendingDelete &&
      this._ !== 0) {
      while (this._references.length > 0) {
        this._unlink(this._references[0])
      }
      this._performDelete()
      this._ = 0
    }
  }

  _performDelete () {}
}

module.exports = { Linkable }

},{}],39:[function(require,module,exports){
(function (process){
const NativeWebGL = require('bindings')('webgl')
const { WebGLRenderingContext: NativeWebGLRenderingContext } = NativeWebGL
process.on('exit', NativeWebGL.cleanup)

const gl = NativeWebGLRenderingContext.prototype

// from binding.gyp
delete gl['1.0.0']

// from binding.gyp
delete NativeWebGLRenderingContext['1.0.0']

module.exports = { gl, NativeWebGL, NativeWebGLRenderingContext }

}).call(this,require('_process'))
},{"_process":12,"bindings":26}],40:[function(require,module,exports){
const bits = require('bit-twiddle')
const { WebGLContextAttributes } = require('./webgl-context-attributes')
const { WebGLRenderingContext, wrapContext } = require('./webgl-rendering-context')
const { WebGLTextureUnit } = require('./webgl-texture-unit')
const { WebGLVertexAttribute } = require('./webgl-vertex-attribute')

let CONTEXT_COUNTER = 0

function flag (options, name, dflt) {
  if (!options || !(typeof options === 'object') || !(name in options)) {
    return dflt
  }
  return !!options[name]
}

function createContext (width, height, options) {
  width = width | 0
  height = height | 0
  if (!(width > 0 && height > 0)) {
    return null
  }

  const contextAttributes = new WebGLContextAttributes(
    flag(options, 'alpha', true),
    flag(options, 'depth', true),
    flag(options, 'stencil', false),
    false, // flag(options, 'antialias', true),
    flag(options, 'premultipliedAlpha', true),
    flag(options, 'preserveDrawingBuffer', false),
    flag(options, 'preferLowPowerToHighPerformance', false),
    flag(options, 'failIfMajorPerformanceCaveat', false))

  // Can only use premultipliedAlpha if alpha is set
  contextAttributes.premultipliedAlpha =
    contextAttributes.premultipliedAlpha && contextAttributes.alpha

  let ctx
  try {
    ctx = new WebGLRenderingContext(
      1,
      1,
      contextAttributes.alpha,
      contextAttributes.depth,
      contextAttributes.stencil,
      contextAttributes.antialias,
      contextAttributes.premultipliedAlpha,
      contextAttributes.preserveDrawingBuffer,
      contextAttributes.preferLowPowerToHighPerformance,
      contextAttributes.failIfMajorPerformanceCaveat)
  } catch (e) {}
  if (!ctx) {
    return null
  }

  ctx.drawingBufferWidth = width
  ctx.drawingBufferHeight = height

  ctx._ = CONTEXT_COUNTER++

  ctx._contextAttributes = contextAttributes

  ctx._extensions = {}
  ctx._programs = {}
  ctx._shaders = {}
  ctx._buffers = {}
  ctx._textures = {}
  ctx._framebuffers = {}
  ctx._renderbuffers = {}

  ctx._activeProgram = null
  ctx._activeFramebuffer = null
  ctx._activeArrayBuffer = null
  ctx._activeElementArrayBuffer = null
  ctx._activeRenderbuffer = null

  // Initialize texture units
  const numTextures = ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
  ctx._textureUnits = new Array(numTextures)
  for (let i = 0; i < numTextures; ++i) {
    ctx._textureUnits[i] = new WebGLTextureUnit(i)
  }
  ctx._activeTextureUnit = 0
  ctx.activeTexture(ctx.TEXTURE0)

  ctx._errorStack = []

  // Initialize vertex attributes
  const numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS)
  ctx._vertexAttribs = new Array(numAttribs)
  for (let i = 0; i < numAttribs; ++i) {
    ctx._vertexAttribs[i] = new WebGLVertexAttribute(ctx, i)
  }

  // Store limits
  ctx._maxTextureSize = ctx.getParameter(ctx.MAX_TEXTURE_SIZE)
  ctx._maxTextureLevel = bits.log2(bits.nextPow2(ctx._maxTextureSize))
  ctx._maxCubeMapSize = ctx.getParameter(ctx.MAX_CUBE_MAP_TEXTURE_SIZE)
  ctx._maxCubeMapLevel = bits.log2(bits.nextPow2(ctx._maxCubeMapSize))

  // Unpack alignment
  ctx._unpackAlignment = 4
  ctx._packAlignment = 4

  // Allocate framebuffer
  ctx._allocateDrawingBuffer(width, height)

  const attrib0Buffer = ctx.createBuffer()
  ctx._attrib0Buffer = attrib0Buffer

  // Initialize defaults
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null)
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null)
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null)

  // Set viewport and scissor
  ctx.viewport(0, 0, width, height)
  ctx.scissor(0, 0, width, height)

  // Clear buffers
  ctx.clearDepth(1)
  ctx.clearColor(0, 0, 0, 0)
  ctx.clearStencil(0)
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT)

  return wrapContext(ctx)
}

module.exports = createContext

},{"./webgl-context-attributes":44,"./webgl-rendering-context":49,"./webgl-texture-unit":52,"./webgl-vertex-attribute":55,"bit-twiddle":27}],41:[function(require,module,exports){
(function (Buffer){
const { gl } = require('./native-gl')

const { WebGLUniformLocation } = require('./webgl-uniform-location')

function bindPublics (props, wrapper, privateInstance, privateMethods) {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const value = privateInstance[prop]
    if (typeof value === 'function') {
      if (privateMethods.indexOf(prop) === -1) {
        wrapper[prop] = value.bind(privateInstance)
      }
    } else {
      if (prop[0] === '_' ||
        prop[0] === '0' ||
        prop[0] === '1') {
        continue
      }
      wrapper[prop] = value
    }
  }
}

function checkObject (object) {
  return typeof object === 'object' ||
    (object === void 0)
}

function checkUniform (program, location) {
  return location instanceof WebGLUniformLocation &&
    location._program === program &&
    location._linkCount === program._linkCount
}

function isTypedArray (data) {
  return data instanceof Uint8Array ||
    data instanceof Uint8ClampedArray ||
    data instanceof Int8Array ||
    data instanceof Uint16Array ||
    data instanceof Int16Array ||
    data instanceof Uint32Array ||
    data instanceof Int32Array ||
    data instanceof Float32Array ||
    data instanceof Float64Array
}

// Don't allow: ", $, `, @, \, ', \0
function isValidString (str) {
  // Remove comments first
  const c = str.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '')
  return !(/["$`@\\'\0]/.test(c))
}

function vertexCount (primitive, count) {
  switch (primitive) {
    case gl.TRIANGLES:
      return count - (count % 3)
    case gl.LINES:
      return count - (count % 2)
    case gl.LINE_LOOP:
    case gl.POINTS:
      return count
    case gl.TRIANGLE_FAN:
    case gl.LINE_STRIP:
      if (count < 2) {
        return 0
      }
      return count
    case gl.TRIANGLE_STRIP:
      if (count < 3) {
        return 0
      }
      return count
    default:
      return -1
  }
}

function typeSize (type) {
  switch (type) {
    case gl.UNSIGNED_BYTE:
    case gl.BYTE:
      return 1
    case gl.UNSIGNED_SHORT:
    case gl.SHORT:
      return 2
    case gl.UNSIGNED_INT:
    case gl.INT:
    case gl.FLOAT:
      return 4
  }
  return 0
}

function uniformTypeSize (type) {
  switch (type) {
    case gl.BOOL_VEC4:
    case gl.INT_VEC4:
    case gl.FLOAT_VEC4:
      return 4

    case gl.BOOL_VEC3:
    case gl.INT_VEC3:
    case gl.FLOAT_VEC3:
      return 3

    case gl.BOOL_VEC2:
    case gl.INT_VEC2:
    case gl.FLOAT_VEC2:
      return 2

    case gl.BOOL:
    case gl.INT:
    case gl.FLOAT:
    case gl.SAMPLER_2D:
    case gl.SAMPLER_CUBE:
      return 1

    default:
      return 0
  }
}

function unpackTypedArray (array) {
  return (new Uint8Array(array.buffer)).subarray(
    array.byteOffset,
    array.byteLength + array.byteOffset)
}

function extractImageData (pixels) {
  if (typeof pixels === 'object' && typeof pixels.width !== 'undefined' && typeof pixels.height !== 'undefined') {
    if (typeof pixels.data !== 'undefined') {
      return pixels
    }

    let context = null

    if (typeof pixels.getContext === 'function') {
      context = pixels.getContext('2d')
    } else if (typeof pixels.src !== 'undefined' && typeof document === 'object' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas')

      if (typeof canvas === 'object' && typeof canvas.getContext === 'function') {
        context = canvas.getContext('2d')

        if (context !== null) {
          context.drawImage(pixels, 0, 0)
        }
      }
    }

    if (context !== null) {
      return context.getImageData(0, 0, pixels.width, pixels.height)
    }
  }

  return null
}

function formatSize (internalFormat) {
  switch (internalFormat) {
    case gl.ALPHA:
    case gl.LUMINANCE:
      return 1
    case gl.LUMINANCE_ALPHA:
      return 2
    case gl.RGB:
      return 3
    case gl.RGBA:
      return 4
  }
  return 0
}

function convertPixels (pixels) {
  if (typeof pixels === 'object' && pixels !== null) {
    if (pixels instanceof ArrayBuffer) {
      return new Uint8Array(pixels)
    } else if (pixels instanceof Uint8Array ||
      pixels instanceof Uint16Array ||
      pixels instanceof Uint8ClampedArray ||
      pixels instanceof Float32Array) {
      return unpackTypedArray(pixels)
    } else if (pixels instanceof Buffer) {
      return new Uint8Array(pixels)
    }
  }
  return null
}

function checkFormat (format) {
  return (
    format === gl.ALPHA ||
    format === gl.LUMINANCE_ALPHA ||
    format === gl.LUMINANCE ||
    format === gl.RGB ||
    format === gl.RGBA)
}

function validCubeTarget (target) {
  return target === gl.TEXTURE_CUBE_MAP_POSITIVE_X ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
    target === gl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
    target === gl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
    target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
}

module.exports = {
  bindPublics,
  checkObject,
  isTypedArray,
  isValidString,
  vertexCount,
  typeSize,
  uniformTypeSize,
  unpackTypedArray,
  extractImageData,
  formatSize,
  checkFormat,
  checkUniform,
  convertPixels,
  validCubeTarget
}

}).call(this,require("buffer").Buffer)
},{"./native-gl":39,"./webgl-uniform-location":54,"buffer":8}],42:[function(require,module,exports){
class WebGLActiveInfo {
  constructor (_) {
    this.size = _.size
    this.type = _.type
    this.name = _.name
  }
}
module.exports = { WebGLActiveInfo }

},{}],43:[function(require,module,exports){
const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLBuffer extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._size = 0
    this._elements = new Uint8Array(0)
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._buffers[this._ | 0]
    gl.deleteBuffer.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLBuffer }

},{"./linkable":38,"./native-gl":39}],44:[function(require,module,exports){
class WebGLContextAttributes {
  constructor (
    alpha,
    depth,
    stencil,
    antialias,
    premultipliedAlpha,
    preserveDrawingBuffer,
    preferLowPowerToHighPerformance,
    failIfMajorPerformanceCaveat) {
    this.alpha = alpha
    this.depth = depth
    this.stencil = stencil
    this.antialias = antialias
    this.premultipliedAlpha = premultipliedAlpha
    this.preserveDrawingBuffer = preserveDrawingBuffer
    this.preferLowPowerToHighPerformance = preferLowPowerToHighPerformance
    this.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat
  }
}

module.exports = { WebGLContextAttributes }

},{}],45:[function(require,module,exports){
class WebGLDrawingBufferWrapper {
  constructor (framebuffer, color, depthStencil) {
    this._framebuffer = framebuffer
    this._color = color
    this._depthStencil = depthStencil
  }
}

module.exports = { WebGLDrawingBufferWrapper }

},{}],46:[function(require,module,exports){
const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLFramebuffer extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._binding = 0

    this._width = 0
    this._height = 0
    this._status = null

    this._attachments = {}
    this._attachments[gl.COLOR_ATTACHMENT0] = null
    this._attachments[gl.DEPTH_ATTACHMENT] = null
    this._attachments[gl.STENCIL_ATTACHMENT] = null
    this._attachments[gl.DEPTH_STENCIL_ATTACHMENT] = null

    this._attachmentLevel = {}
    this._attachmentLevel[gl.COLOR_ATTACHMENT0] = 0
    this._attachmentLevel[gl.DEPTH_ATTACHMENT] = 0
    this._attachmentLevel[gl.STENCIL_ATTACHMENT] = 0
    this._attachmentLevel[gl.DEPTH_STENCIL_ATTACHMENT] = 0

    this._attachmentFace = {}
    this._attachmentFace[gl.COLOR_ATTACHMENT0] = 0
    this._attachmentFace[gl.DEPTH_ATTACHMENT] = 0
    this._attachmentFace[gl.STENCIL_ATTACHMENT] = 0
    this._attachmentFace[gl.DEPTH_STENCIL_ATTACHMENT] = 0

    if (ctx._extensions.webgl_draw_buffers) {
      const { webgl_draw_buffers } = ctx._extensions // eslint-disable-line
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT1_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT2_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT3_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT4_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT5_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT6_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT7_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT8_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT9_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT10_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT11_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT12_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT13_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT14_WEBGL] = null
      this._attachments[webgl_draw_buffers.COLOR_ATTACHMENT15_WEBGL] = null
      this._attachments[gl.NONE] = null
      this._attachments[gl.BACK] = null

      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT1_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT2_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT3_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT4_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT5_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT6_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT7_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT8_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT9_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT10_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT11_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT12_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT13_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT14_WEBGL] = 0
      this._attachmentLevel[webgl_draw_buffers.COLOR_ATTACHMENT15_WEBGL] = 0
      this._attachmentLevel[gl.NONE] = null
      this._attachmentLevel[gl.BACK] = null

      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT1_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT2_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT3_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT4_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT5_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT6_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT7_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT8_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT9_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT10_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT11_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT12_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT13_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT14_WEBGL] = 0
      this._attachmentFace[webgl_draw_buffers.COLOR_ATTACHMENT15_WEBGL] = 0
      this._attachmentFace[gl.NONE] = null
      this._attachmentFace[gl.BACK] = null
    }
  }

  _clearAttachment (attachment) {
    const object = this._attachments[attachment]
    if (!object) {
      return
    }
    this._attachments[attachment] = null
    this._unlink(object)
  }

  _setAttachment (object, attachment) {
    const prevObject = this._attachments[attachment]
    if (prevObject === object) {
      return
    }

    this._clearAttachment(attachment)
    if (!object) {
      return
    }

    this._attachments[attachment] = object

    this._link(object)
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._framebuffers[this._ | 0]
    gl.deleteFramebuffer.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLFramebuffer }

},{"./linkable":38,"./native-gl":39}],47:[function(require,module,exports){
const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLProgram extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._linkCount = 0
    this._linkStatus = false
    this._linkInfoLog = 'not linked'
    this._attributes = []
    this._uniforms = []
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._programs[this._ | 0]
    gl.deleteProgram.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLProgram }

},{"./linkable":38,"./native-gl":39}],48:[function(require,module,exports){
const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLRenderbuffer extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._binding = 0
    this._width = 0
    this._height = 0
    this._format = 0
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._renderbuffers[this._ | 0]
    gl.deleteRenderbuffer.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLRenderbuffer }

},{"./linkable":38,"./native-gl":39}],49:[function(require,module,exports){
const bits = require('bit-twiddle')
const tokenize = require('glsl-tokenizer/string')
const HEADLESS_VERSION = require('../../package.json').version
const { gl, NativeWebGLRenderingContext, NativeWebGL } = require('./native-gl')
const { getANGLEInstancedArrays } = require('./extensions/angle-instanced-arrays')
const { getOESElementIndexUint } = require('./extensions/oes-element-index-unit')
const { getOESTextureFloat } = require('./extensions/oes-texture-float')
const { getSTACKGLDestroyContext } = require('./extensions/stackgl-destroy-context')
const { getSTACKGLResizeDrawingBuffer } = require('./extensions/stackgl-resize-drawing-buffer')
const { getWebGLDrawBuffers } = require('./extensions/webgl-draw-buffers')
const {
  bindPublics,
  checkObject,
  checkUniform,
  formatSize,
  isValidString,
  typeSize,
  uniformTypeSize,
  extractImageData,
  vertexCount,
  isTypedArray,
  unpackTypedArray,
  convertPixels,
  checkFormat,
  validCubeTarget } = require('./utils')

const { WebGLActiveInfo } = require('./webgl-active-info')
const { WebGLFramebuffer } = require('./webgl-framebuffer')
const { WebGLBuffer } = require('./webgl-buffer')
const { WebGLDrawingBufferWrapper } = require('./webgl-drawing-buffer-wrapper')
const { WebGLProgram } = require('./webgl-program')
const { WebGLRenderbuffer } = require('./webgl-renderbuffer')
const { WebGLShader } = require('./webgl-shader')
const { WebGLShaderPrecisionFormat } = require('./webgl-shader-precision-format')
const { WebGLTexture } = require('./webgl-texture')
const { WebGLUniformLocation } = require('./webgl-uniform-location')

// These are defined by the WebGL spec
const MAX_UNIFORM_LENGTH = 256
const MAX_ATTRIBUTE_LENGTH = 256

const DEFAULT_ATTACHMENTS = [
  gl.COLOR_ATTACHMENT0,
  gl.DEPTH_ATTACHMENT,
  gl.STENCIL_ATTACHMENT,
  gl.DEPTH_STENCIL_ATTACHMENT
]

const DEFAULT_COLOR_ATTACHMENTS = [gl.COLOR_ATTACHMENT0]

const availableExtensions = {
  angle_instanced_arrays: getANGLEInstancedArrays,
  oes_element_index_uint: getOESElementIndexUint,
  oes_texture_float: getOESTextureFloat,
  stackgl_destroy_context: getSTACKGLDestroyContext,
  stackgl_resize_drawingbuffer: getSTACKGLResizeDrawingBuffer,
  webgl_draw_buffers: getWebGLDrawBuffers
}

const privateMethods = [
  'resize',
  'destroy'
]

function wrapContext (ctx) {
  const wrapper = new WebGLRenderingContext()
  bindPublics(Object.keys(ctx), wrapper, ctx, privateMethods)
  bindPublics(Object.keys(ctx.constructor.prototype), wrapper, ctx, privateMethods)
  bindPublics(Object.getOwnPropertyNames(ctx), wrapper, ctx, privateMethods)
  bindPublics(Object.getOwnPropertyNames(ctx.constructor.prototype), wrapper, ctx, privateMethods)

  Object.defineProperties(wrapper, {
    drawingBufferWidth: {
      get () { return ctx.drawingBufferWidth },
      set (value) { ctx.drawingBufferWidth = value }
    },
    drawingBufferHeight: {
      get () { return ctx.drawingBufferHeight },
      set (value) { ctx.drawingBufferHeight = value }
    }
  })

  return wrapper
}

// We need to wrap some of the native WebGL functions to handle certain error codes and check input values
class WebGLRenderingContext extends NativeWebGLRenderingContext {
  _checkDimensions (
    target,
    width,
    height,
    level) {
    if (level < 0 ||
      width < 0 ||
      height < 0) {
      this.setError(gl.INVALID_VALUE)
      return false
    }
    if (target === gl.TEXTURE_2D) {
      if (width > this._maxTextureSize ||
        height > this._maxTextureSize ||
        level > this._maxTextureLevel) {
        this.setError(gl.INVALID_VALUE)
        return false
      }
    } else if (this._validCubeTarget(target)) {
      if (width > this._maxCubeMapSize ||
        height > this._maxCubeMapSize ||
        level > this._maxCubeMapLevel) {
        this.setError(gl.INVALID_VALUE)
        return false
      }
    } else {
      this.setError(gl.INVALID_ENUM)
      return false
    }
    return true
  }

  _checkLocation (location) {
    if (!(location instanceof WebGLUniformLocation)) {
      this.setError(gl.INVALID_VALUE)
      return false
    } else if (location._program._ctx !== this ||
      location._linkCount !== location._program._linkCount) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    return true
  }

  _checkLocationActive (location) {
    if (!location) {
      return false
    } else if (!this._checkLocation(location)) {
      return false
    } else if (location._program !== this._activeProgram) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    return true
  }

  _checkOwns (object) {
    return typeof object === 'object' &&
      object._ctx === this
  }

  _checkShaderSource (shader) {
    const source = shader._source
    const tokens = tokenize(source)

    let errorStatus = false
    const errorLog = []

    for (let i = 0; i < tokens.length; ++i) {
      const tok = tokens[i]
      switch (tok.type) {
        case 'ident':
          if (!this._validGLSLIdentifier(tok.data)) {
            errorStatus = true
            errorLog.push(tok.line + ':' + tok.column +
              ' invalid identifier - ' + tok.data)
          }
          break
        case 'preprocessor':
          const bodyToks = tokenize(tok.data.match(/^\s*#\s*(.*)$/)[1])
          for (let j = 0; j < bodyToks.length; ++j) {
            const btok = bodyToks[j]
            if (btok.type === 'ident' || btok.type === void 0) {
              if (!this._validGLSLIdentifier(btok.data)) {
                errorStatus = true
                errorLog.push(tok.line + ':' + btok.column +
                  ' invalid identifier - ' + btok.data)
              }
            }
          }
          break
        case 'keyword':
          switch (tok.data) {
            case 'do':
              errorStatus = true
              errorLog.push(tok.line + ':' + tok.column + ' do not supported')
              break
          }
          break
      }
    }

    if (errorStatus) {
      shader._compileInfo = errorLog.join('\n')
    }
    return !errorStatus
  }

  _checkStencilState () {
    if (this.getParameter(gl.STENCIL_WRITEMASK) !==
      this.getParameter(gl.STENCIL_BACK_WRITEMASK) ||
      this.getParameter(gl.STENCIL_VALUE_MASK) !==
      this.getParameter(gl.STENCIL_BACK_VALUE_MASK) ||
      this.getParameter(gl.STENCIL_REF) !==
      this.getParameter(gl.STENCIL_BACK_REF)) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    return true
  }

  _checkTextureTarget (target) {
    const unit = this._getActiveTextureUnit()
    let tex = null
    if (target === gl.TEXTURE_2D) {
      tex = unit._bind2D
    } else if (target === gl.TEXTURE_CUBE_MAP) {
      tex = unit._bindCube
    } else {
      this.setError(gl.INVALID_ENUM)
      return false
    }
    if (!tex) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    return true
  }

  _checkWrapper (object, Wrapper) {
    if (!this._checkValid(object, Wrapper)) {
      this.setError(gl.INVALID_VALUE)
      return false
    } else if (!this._checkOwns(object)) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    return true
  }

  _checkValid (object, Type) {
    return object instanceof Type && object._ !== 0
  }

  _checkVertexAttribState (maxIndex) {
    const program = this._activeProgram
    if (!program) {
      this.setError(gl.INVALID_OPERATION)
      return false
    }
    const attribs = this._vertexAttribs
    for (let i = 0; i < attribs.length; ++i) {
      const attrib = attribs[i]
      if (attrib._isPointer) {
        const buffer = attrib._pointerBuffer
        if (!buffer) {
          this.setError(gl.INVALID_OPERATION)
          return false
        }
        if (program._attributes.indexOf(i) >= 0) {
          let maxByte = 0
          if (attrib._divisor) {
            maxByte = attrib._pointerSize +
              attrib._pointerOffset
          } else {
            maxByte = attrib._pointerStride * maxIndex +
              attrib._pointerSize +
              attrib._pointerOffset
          }
          if (maxByte > buffer._size) {
            this.setError(gl.INVALID_OPERATION)
            return false
          }
        }
      }
    }
    return true
  }

  _checkVertexIndex (index) {
    if (index < 0 || index >= this._vertexAttribs.length) {
      this.setError(gl.INVALID_VALUE)
      return false
    }
    return true
  }

  _computePixelSize (type, internalFormat) {
    const pixelSize = formatSize(internalFormat)
    if (pixelSize === 0) {
      this.setError(gl.INVALID_ENUM)
      return 0
    }
    switch (type) {
      case gl.UNSIGNED_BYTE:
        return pixelSize
      case gl.UNSIGNED_SHORT_5_6_5:
        if (internalFormat !== gl.RGB) {
          this.setError(gl.INVALID_OPERATION)
          break
        }
        return 2
      case gl.UNSIGNED_SHORT_4_4_4_4:
      case gl.UNSIGNED_SHORT_5_5_5_1:
        if (internalFormat !== gl.RGBA) {
          this.setError(gl.INVALID_OPERATION)
          break
        }
        return 2
      case gl.FLOAT:
        return 1
    }
    this.setError(gl.INVALID_ENUM)
    return 0
  }

  _computeRowStride (width, pixelSize) {
    let rowStride = width * pixelSize
    if (rowStride % this._unpackAlignment) {
      rowStride += this._unpackAlignment - (rowStride % this._unpackAlignment)
    }
    return rowStride
  }

  _fixupLink (program) {
    if (!super.getProgramParameter(program._, gl.LINK_STATUS)) {
      program._linkInfoLog = super.getProgramInfoLog(program)
      return false
    }

    // Record attribute attributeLocations
    const numAttribs = this.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    const names = new Array(numAttribs)
    program._attributes.length = numAttribs
    for (let i = 0; i < numAttribs; ++i) {
      names[i] = this.getActiveAttrib(program, i).name
      program._attributes[i] = this.getAttribLocation(program, names[i]) | 0
    }

    // Check attribute names
    for (let i = 0; i < names.length; ++i) {
      if (names[i].length > MAX_ATTRIBUTE_LENGTH) {
        program._linkInfoLog = 'attribute ' + names[i] + ' is too long'
        return false
      }
    }

    for (let i = 0; i < numAttribs; ++i) {
      super.bindAttribLocation(
        program._ | 0,
        program._attributes[i],
        names[i])
    }

    super.linkProgram(program._ | 0)

    const numUniforms = this.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    program._uniforms.length = numUniforms
    for (let i = 0; i < numUniforms; ++i) {
      program._uniforms[i] = this.getActiveUniform(program, i)
    }

    // Check attribute and uniform name lengths
    for (let i = 0; i < program._uniforms.length; ++i) {
      if (program._uniforms[i].name.length > MAX_UNIFORM_LENGTH) {
        program._linkInfoLog = 'uniform ' + program._uniforms[i].name + ' is too long'
        return false
      }
    }

    program._linkInfoLog = ''
    return true
  }

  _framebufferOk () {
    const framebuffer = this._activeFramebuffer
    if (framebuffer &&
      this._preCheckFramebufferStatus(framebuffer) !== gl.FRAMEBUFFER_COMPLETE) {
      this.setError(gl.INVALID_FRAMEBUFFER_OPERATION)
      return false
    }
    return true
  }

  _getActiveBuffer (target) {
    if (target === gl.ARRAY_BUFFER) {
      return this._activeArrayBuffer
    } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
      return this._activeElementArrayBuffer
    }
    return null
  }

  _getActiveTextureUnit () {
    return this._textureUnits[this._activeTextureUnit]
  }

  _getActiveTexture (target) {
    const activeUnit = this._getActiveTextureUnit()
    if (target === gl.TEXTURE_2D) {
      return activeUnit._bind2D
    } else if (target === gl.TEXTURE_CUBE_MAP) {
      return activeUnit._bindCube
    }
    return null
  }

  _getAttachments () {
    return this._extensions.webgl_draw_buffers ? this._extensions.webgl_draw_buffers._ALL_ATTACHMENTS : DEFAULT_ATTACHMENTS
  }

  _getColorAttachments () {
    return this._extensions.webgl_draw_buffers ? this._extensions.webgl_draw_buffers._ALL_COLOR_ATTACHMENTS : DEFAULT_COLOR_ATTACHMENTS
  }

  _getParameterDirect (pname) {
    return super.getParameter(pname)
  }

  _getTexImage (target) {
    const unit = this._getActiveTextureUnit()
    if (target === gl.TEXTURE_2D) {
      return unit._bind2D
    } else if (validCubeTarget(target)) {
      return unit._bindCube
    }
    this.setError(gl.INVALID_ENUM)
    return null
  }

  _preCheckFramebufferStatus (framebuffer) {
    const attachments = framebuffer._attachments
    const width = []
    const height = []
    const depthAttachment = attachments[gl.DEPTH_ATTACHMENT]
    const depthStencilAttachment = attachments[gl.DEPTH_STENCIL_ATTACHMENT]
    const stencilAttachment = attachments[gl.STENCIL_ATTACHMENT]

    if ((depthStencilAttachment && (stencilAttachment || depthAttachment)) ||
      (stencilAttachment && depthAttachment)) {
      return gl.FRAMEBUFFER_UNSUPPORTED
    }

    const colorAttachments = this._getColorAttachments()
    let colorAttachmentCount = 0
    for (const attachmentEnum in attachments) {
      if (attachments[attachmentEnum] && colorAttachments.indexOf(attachmentEnum * 1) !== -1) {
        colorAttachmentCount++
      }
    }
    if (colorAttachmentCount === 0) {
      return gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
    }

    if (depthStencilAttachment instanceof WebGLTexture) {
      return gl.FRAMEBUFFER_UNSUPPORTED
    } else if (depthStencilAttachment instanceof WebGLRenderbuffer) {
      if (depthStencilAttachment._format !== gl.DEPTH_STENCIL) {
        return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
      }
      width.push(depthStencilAttachment._width)
      height.push(depthStencilAttachment._height)
    }

    if (depthAttachment instanceof WebGLTexture) {
      return gl.FRAMEBUFFER_UNSUPPORTED
    } else if (depthAttachment instanceof WebGLRenderbuffer) {
      if (depthAttachment._format !== gl.DEPTH_COMPONENT16) {
        return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
      }
      width.push(depthAttachment._width)
      height.push(depthAttachment._height)
    }

    if (stencilAttachment instanceof WebGLTexture) {
      return gl.FRAMEBUFFER_UNSUPPORTED
    } else if (stencilAttachment instanceof WebGLRenderbuffer) {
      if (stencilAttachment._format !== gl.STENCIL_INDEX8) {
        return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
      }
      width.push(stencilAttachment._width)
      height.push(stencilAttachment._height)
    }

    let colorAttached = false
    for (let i = 0; i < colorAttachments.length; ++i) {
      const colorAttachment = attachments[colorAttachments[i]]
      if (colorAttachment instanceof WebGLTexture) {
        if (colorAttachment._format !== gl.RGBA ||
          !(colorAttachment._type === gl.UNSIGNED_BYTE || colorAttachment._type === gl.FLOAT)) {
          return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        }
        colorAttached = true
        const level = framebuffer._attachmentLevel[gl.COLOR_ATTACHMENT0]
        width.push(colorAttachment._levelWidth[level])
        height.push(colorAttachment._levelHeight[level])
      } else if (colorAttachment instanceof WebGLRenderbuffer) {
        const format = colorAttachment._format
        if (format !== gl.RGBA4 &&
          format !== gl.RGB565 &&
          format !== gl.RGB5_A1) {
          return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        }
        colorAttached = true
        width.push(colorAttachment._width)
        height.push(colorAttachment._height)
      }
    }

    if (!colorAttached &&
      !stencilAttachment &&
      !depthAttachment &&
      !depthStencilAttachment) {
      return gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
    }

    if (width.length <= 0 || height.length <= 0) {
      return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
    }

    for (let i = 1; i < width.length; ++i) {
      if (width[i - 1] !== width[i] ||
        height[i - 1] !== height[i]) {
        return gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS
      }
    }

    if (width[0] === 0 || height[0] === 0) {
      return gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
    }

    framebuffer._width = width[0]
    framebuffer._height = height[0]

    return gl.FRAMEBUFFER_COMPLETE
  }

  _isConstantBlendFunc (factor) {
    return (
      factor === gl.CONSTANT_COLOR ||
      factor === gl.ONE_MINUS_CONSTANT_COLOR ||
      factor === gl.CONSTANT_ALPHA ||
      factor === gl.ONE_MINUS_CONSTANT_ALPHA)
  }

  _isObject (object, method, Wrapper) {
    if (!(object === null || object === void 0) &&
      !(object instanceof Wrapper)) {
      throw new TypeError(method + '(' + Wrapper.name + ')')
    }
    if (this._checkValid(object, Wrapper) && this._checkOwns(object)) {
      return true
    }
    return false
  }

  _resizeDrawingBuffer (width, height) {
    const prevFramebuffer = this._activeFramebuffer
    const prevTexture = this._getActiveTexture(gl.TEXTURE_2D)
    const prevRenderbuffer = this._activeRenderbuffer

    const contextAttributes = this._contextAttributes

    const drawingBuffer = this._drawingBuffer
    super.bindFramebuffer(gl.FRAMEBUFFER, drawingBuffer._framebuffer)
    const attachments = this._getAttachments()
    // Clear all attachments
    for (let i = 0; i < attachments.length; ++i) {
      super.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachments[i],
        gl.TEXTURE_2D,
        0,
        0)
    }

    // Update color attachment
    super.bindTexture(gl.TEXTURE_2D, drawingBuffer._color)
    const colorFormat = contextAttributes.alpha ? gl.RGBA : gl.RGB
    super.texImage2D(
      gl.TEXTURE_2D,
      0,
      colorFormat,
      width,
      height,
      0,
      colorFormat,
      gl.UNSIGNED_BYTE,
      null)
    super.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    super.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    super.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      drawingBuffer._color,
      0)

    // Update depth-stencil attachments if needed
    let storage = 0
    let attachment = 0
    if (contextAttributes.depth && contextAttributes.stencil) {
      storage = gl.DEPTH_STENCIL
      attachment = gl.DEPTH_STENCIL_ATTACHMENT
    } else if (contextAttributes.depth) {
      storage = 0x81A7
      attachment = gl.DEPTH_ATTACHMENT
    } else if (contextAttributes.stencil) {
      storage = gl.STENCIL_INDEX8
      attachment = gl.STENCIL_ATTACHMENT
    }

    if (storage) {
      super.bindRenderbuffer(
        gl.RENDERBUFFER,
        drawingBuffer._depthStencil)
      super.renderbufferStorage(
        gl.RENDERBUFFER,
        storage,
        width,
        height)
      super.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        attachment,
        gl.RENDERBUFFER,
        drawingBuffer._depthStencil)
    }

    // Restore previous binding state
    this.bindFramebuffer(gl.FRAMEBUFFER, prevFramebuffer)
    this.bindTexture(gl.TEXTURE_2D, prevTexture)
    this.bindRenderbuffer(gl.RENDERBUFFER, prevRenderbuffer)
  }

  _restoreError (lastError) {
    const topError = this._errorStack.pop()
    if (topError === gl.NO_ERROR) {
      this.setError(lastError)
    } else {
      this.setError(topError)
    }
  }

  _saveError () {
    this._errorStack.push(this.getError())
  }

  _switchActiveBuffer (active, buffer) {
    if (active !== buffer) {
      if (active) {
        active._refCount -= 1
        active._checkDelete()
      }
      if (buffer) {
        buffer._refCount += 1
      }
    }
  }

  _switchActiveProgram (active) {
    if (active) {
      active._refCount -= 1
      active._checkDelete()
    }
  }

  _tryDetachFramebuffer (framebuffer, renderbuffer) {
    // FIXME: Does the texture get unbound from *all* framebuffers, or just the
    // active FBO?
    if (framebuffer && framebuffer._linked(renderbuffer)) {
      const attachments = this._getAttachments()
      const framebufferAttachments = Object.keys(framebuffer._attachments)
      for (let i = 0; i < framebufferAttachments.length; ++i) {
        if (framebuffer._attachments[attachments[i]] === renderbuffer) {
          this.framebufferTexture2D(
            gl.FRAMEBUFFER,
            attachments[i] | 0,
            gl.TEXTURE_2D,
            null)
        }
      }
    }
  }

  _updateFramebufferAttachments (framebuffer) {
    const prevStatus = framebuffer._status
    const attachments = this._getAttachments()
    framebuffer._status = this._preCheckFramebufferStatus(framebuffer)
    if (framebuffer._status !== gl.FRAMEBUFFER_COMPLETE) {
      if (prevStatus === gl.FRAMEBUFFER_COMPLETE) {
        for (let i = 0; i < attachments.length; ++i) {
          const attachmentEnum = attachments[i]
          super.framebufferTexture2D(
            gl.FRAMEBUFFER,
            attachmentEnum,
            framebuffer._attachmentFace[attachmentEnum],
            0,
            framebuffer._attachmentLevel[attachmentEnum])
        }
      }
      return
    }

    for (let i = 0; i < attachments.length; ++i) {
      const attachmentEnum = attachments[i]
      super.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachmentEnum,
        framebuffer._attachmentFace[attachmentEnum],
        0,
        framebuffer._attachmentLevel[attachmentEnum])
    }

    for (let i = 0; i < attachments.length; ++i) {
      const attachmentEnum = attachments[i]
      const attachment = framebuffer._attachments[attachmentEnum]
      if (attachment instanceof WebGLTexture) {
        super.framebufferTexture2D(
          gl.FRAMEBUFFER,
          attachmentEnum,
          framebuffer._attachmentFace[attachmentEnum],
          attachment._ | 0,
          framebuffer._attachmentLevel[attachmentEnum])
      } else if (attachment instanceof WebGLRenderbuffer) {
        super.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          attachmentEnum,
          gl.RENDERBUFFER,
          attachment._ | 0)
      }
    }
  }

  _validBlendFunc (factor) {
    return factor === gl.ZERO ||
      factor === gl.ONE ||
      factor === gl.SRC_COLOR ||
      factor === gl.ONE_MINUS_SRC_COLOR ||
      factor === gl.DST_COLOR ||
      factor === gl.ONE_MINUS_DST_COLOR ||
      factor === gl.SRC_ALPHA ||
      factor === gl.ONE_MINUS_SRC_ALPHA ||
      factor === gl.DST_ALPHA ||
      factor === gl.ONE_MINUS_DST_ALPHA ||
      factor === gl.SRC_ALPHA_SATURATE ||
      factor === gl.CONSTANT_COLOR ||
      factor === gl.ONE_MINUS_CONSTANT_COLOR ||
      factor === gl.CONSTANT_ALPHA ||
      factor === gl.ONE_MINUS_CONSTANT_ALPHA
  }

  _validBlendMode (mode) {
    return mode === gl.FUNC_ADD ||
      mode === gl.FUNC_SUBTRACT ||
      mode === gl.FUNC_REVERSE_SUBTRACT
  }

  _validCubeTarget (target) {
    return target === gl.TEXTURE_CUBE_MAP_POSITIVE_X ||
      target === gl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
      target === gl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
      target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
      target === gl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
      target === gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
  }

  _validFramebufferAttachment (attachment) {
    switch (attachment) {
      case gl.DEPTH_ATTACHMENT:
      case gl.STENCIL_ATTACHMENT:
      case gl.DEPTH_STENCIL_ATTACHMENT:
      case gl.COLOR_ATTACHMENT0:
        return true
    }

    if (this._extensions.webgl_draw_buffers) { // eslint-disable-line
      const { webgl_draw_buffers } = this._extensions; // eslint-disable-line
      return attachment < (webgl_draw_buffers.COLOR_ATTACHMENT0_WEBGL + webgl_draw_buffers._maxDrawBuffers) // eslint-disable-line
    }

    return false
  }

  _validGLSLIdentifier (str) {
    return !(str.indexOf('webgl_') === 0 ||
      str.indexOf('_webgl_') === 0 ||
      str.length > 256)
  }

  _validTextureTarget (target) {
    return target === gl.TEXTURE_2D ||
      target === gl.TEXTURE_CUBE_MAP
  }

  _verifyTextureCompleteness (target, pname, param) {
    const unit = this._getActiveTextureUnit()
    let texture = null
    if (target === gl.TEXTURE_2D) {
      texture = unit._bind2D
    } else if (this._validCubeTarget(target)) {
      texture = unit._bindCube
    }

    // oes_texture_float
    if (this._extensions.oes_texture_float && texture && texture._type === gl.FLOAT && (pname === gl.TEXTURE_MAG_FILTER || pname === gl.TEXTURE_MIN_FILTER) && (param === gl.LINEAR || param === gl.LINEAR_MIPMAP_NEAREST || param === gl.NEAREST_MIPMAP_LINEAR || param === gl.LINEAR_MIPMAP_LINEAR)) {
      texture._complete = false
      this.bindTexture(target, texture)
      return
    }

    if (texture && texture._complete === false) {
      texture._complete = true
      this.bindTexture(target, texture)
    }
  }

  _wrapShader (type, source) { // eslint-disable-line
    if (this._extensions.webgl_draw_buffers) { // eslint-disable-line
      return source
    }
    return this._extensions.webgl_draw_buffers ? source : '#define gl_MaxDrawBuffers 1\n' + source // eslint-disable-line
  }

  _beginAttrib0Hack () {
    super.bindBuffer(gl.ARRAY_BUFFER, this._attrib0Buffer._)
    super.bufferData(
      gl.ARRAY_BUFFER,
      this._vertexAttribs[0]._data,
      gl.STREAM_DRAW)
    super.enableVertexAttribArray(0)
    super.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
    super._vertexAttribDivisor(0, 1)
  }

  _endAttrib0Hack () {
    const attrib = this._vertexAttribs[0]
    if (attrib._pointerBuffer) {
      super.bindBuffer(gl.ARRAY_BUFFER, attrib._pointerBuffer._)
    } else {
      super.bindBuffer(gl.ARRAY_BUFFER, 0)
    }
    super.vertexAttribPointer(
      0,
      attrib._inputSize,
      attrib._pointerType,
      attrib._pointerNormal,
      attrib._inputStride,
      attrib._pointerOffset)
    super._vertexAttribDivisor(0, attrib._divisor)
    super.disableVertexAttribArray(0)
    if (this._activeArrayBuffer) {
      super.bindBuffer(gl.ARRAY_BUFFER, this._activeArrayBuffer._)
    } else {
      super.bindBuffer(gl.ARRAY_BUFFER, 0)
    }
  }

  activeTexture (texture) {
    texture |= 0
    const texNum = texture - gl.TEXTURE0
    if (texNum >= 0 && texNum < this._textureUnits.length) {
      this._activeTextureUnit = texNum
      return super.activeTexture(texture)
    }

    this.setError(gl.INVALID_ENUM)
  }

  attachShader (program, shader) {
    if (!checkObject(program) ||
      !checkObject(shader)) {
      throw new TypeError('attachShader(WebGLProgram, WebGLShader)')
    }
    if (!program || !shader) {
      this.setError(gl.INVALID_VALUE)
      return
    } else if (program instanceof WebGLProgram &&
      shader instanceof WebGLShader &&
      this._checkOwns(program) &&
      this._checkOwns(shader)) {
      if (!program._linked(shader)) {
        this._saveError()
        super.attachShader(
          program._ | 0,
          shader._ | 0)
        const error = this.getError()
        this._restoreError(error)
        if (error === gl.NO_ERROR) {
          program._link(shader)
        }
        return
      }
    }
    this.setError(gl.INVALID_OPERATION)
  }

  bindAttribLocation (program, index, name) {
    if (!checkObject(program) ||
      typeof name !== 'string') {
      throw new TypeError('bindAttribLocation(WebGLProgram, GLint, String)')
    }
    name += ''
    if (!isValidString(name) || name.length > MAX_ATTRIBUTE_LENGTH) {
      this.setError(gl.INVALID_VALUE)
    } else if (/^_?webgl_a/.test(name)) {
      this.setError(gl.INVALID_OPERATION)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      return super.bindAttribLocation(
        program._ | 0,
        index | 0,
        name)
    }
  }

  bindFramebuffer (target, framebuffer) {
    if (!checkObject(framebuffer)) {
      throw new TypeError('bindFramebuffer(GLenum, WebGLFramebuffer)')
    }
    if (target !== gl.FRAMEBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }
    if (!framebuffer) {
      super.bindFramebuffer(
        gl.FRAMEBUFFER,
        this._drawingBuffer._framebuffer)
    } else if (framebuffer._pendingDelete) {
      return
    } else if (this._checkWrapper(framebuffer, WebGLFramebuffer)) {
      super.bindFramebuffer(
        gl.FRAMEBUFFER,
        framebuffer._ | 0)
    } else {
      return
    }
    const activeFramebuffer = this._activeFramebuffer
    if (activeFramebuffer !== framebuffer) {
      if (activeFramebuffer) {
        activeFramebuffer._refCount -= 1
        activeFramebuffer._checkDelete()
      }
      if (framebuffer) {
        framebuffer._refCount += 1
      }
    }
    this._activeFramebuffer = framebuffer
    if (framebuffer) {
      this._updateFramebufferAttachments(framebuffer)
    }
  }

  bindBuffer (target, buffer) {
    target |= 0
    if (!checkObject(buffer)) {
      throw new TypeError('bindBuffer(GLenum, WebGLBuffer)')
    }
    if (target !== gl.ARRAY_BUFFER &&
      target !== gl.ELEMENT_ARRAY_BUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (!buffer) {
      super.bindBuffer(target, 0)
    } else if (buffer._pendingDelete) {
      return
    } else if (this._checkWrapper(buffer, WebGLBuffer)) {
      if (buffer._binding && buffer._binding !== target) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
      buffer._binding = target | 0

      super.bindBuffer(target, buffer._ | 0)
    } else {
      return
    }

    if (target === gl.ARRAY_BUFFER) {
      this._switchActiveBuffer(this._activeArrayBuffer, buffer)
      this._activeArrayBuffer = buffer
    } else {
      this._switchActiveBuffer(this._activeElementArrayBuffer, buffer)
      this._activeElementArrayBuffer = buffer
    }
  }

  bindRenderbuffer (target, object) {
    if (!checkObject(object)) {
      throw new TypeError('bindRenderbuffer(GLenum, WebGLRenderbuffer)')
    }

    if (target !== gl.RENDERBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (!object) {
      super.bindRenderbuffer(
        target | 0,
        0)
    } else if (object._pendingDelete) {
      return
    } else if (this._checkWrapper(object, WebGLRenderbuffer)) {
      super.bindRenderbuffer(
        target | 0,
        object._ | 0)
    } else {
      return
    }
    const active = this._activeRenderbuffer
    if (active !== object) {
      if (active) {
        active._refCount -= 1
        active._checkDelete()
      }
      if (object) {
        object._refCount += 1
      }
    }
    this._activeRenderbuffer = object
  }

  bindTexture (target, texture) {
    target |= 0

    if (!checkObject(texture)) {
      throw new TypeError('bindTexture(GLenum, WebGLTexture)')
    }

    if (!this._validTextureTarget(target)) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    // Get texture id
    let textureId = 0
    if (!texture) {
      texture = null
    } else if (texture instanceof WebGLTexture &&
      texture._pendingDelete) {
      // Special case: error codes for deleted textures don't get set for some dumb reason
      return
    } else if (this._checkWrapper(texture, WebGLTexture)) {
      // Check binding mode of texture
      if (texture._binding && texture._binding !== target) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
      texture._binding = target

      if (texture._complete) {
        textureId = texture._ | 0
      }
    } else {
      return
    }

    this._saveError()
    super.bindTexture(
      target,
      textureId)
    const error = this.getError()
    this._restoreError(error)

    if (error !== gl.NO_ERROR) {
      return
    }

    const activeUnit = this._getActiveTextureUnit()
    const activeTex = this._getActiveTexture(target)

    // Update references
    if (activeTex !== texture) {
      if (activeTex) {
        activeTex._refCount -= 1
        activeTex._checkDelete()
      }
      if (texture) {
        texture._refCount += 1
      }
    }

    if (target === gl.TEXTURE_2D) {
      activeUnit._bind2D = texture
    } else if (target === gl.TEXTURE_CUBE_MAP) {
      activeUnit._bindCube = texture
    }
  }

  blendColor (red, green, blue, alpha) {
    return super.blendColor(+red, +green, +blue, +alpha)
  }

  blendEquation (mode) {
    mode |= 0
    if (this._validBlendMode(mode)) {
      return super.blendEquation(mode)
    }
    this.setError(gl.INVALID_ENUM)
  }

  blendEquationSeparate (modeRGB, modeAlpha) {
    modeRGB |= 0
    modeAlpha |= 0
    if (this._validBlendMode(modeRGB) && this._validBlendMode(modeAlpha)) {
      return super.blendEquationSeparate(modeRGB, modeAlpha)
    }
    this.setError(gl.INVALID_ENUM)
  }

  createBuffer () {
    const id = super.createBuffer()
    if (id <= 0) return null
    const webGLBuffer = new WebGLBuffer(id, this)
    this._buffers[id] = webGLBuffer
    return webGLBuffer
  }

  createFramebuffer () {
    const id = super.createFramebuffer()
    if (id <= 0) return null
    const webGLFramebuffer = new WebGLFramebuffer(id, this)
    this._framebuffers[id] = webGLFramebuffer
    return webGLFramebuffer
  }

  createProgram () {
    const id = super.createProgram()
    if (id <= 0) return null
    const webGLProgram = new WebGLProgram(id, this)
    this._programs[id] = webGLProgram
    return webGLProgram
  }

  createRenderbuffer () {
    const id = super.createRenderbuffer()
    if (id <= 0) return null
    const webGLRenderbuffer = new WebGLRenderbuffer(id, this)
    this._renderbuffers[id] = webGLRenderbuffer
    return webGLRenderbuffer
  }

  createTexture () {
    const id = super.createTexture()
    if (id <= 0) return null
    const webGlTexture = new WebGLTexture(id, this)
    this._textures[id] = webGlTexture
    return webGlTexture
  }

  getContextAttributes () {
    return this._contextAttributes
  }

  getExtension (name) {
    const str = name.toLowerCase()
    if (str in this._extensions) {
      return this._extensions[str]
    }
    let ext = availableExtensions[str] ? availableExtensions[str](this) : null
    if (ext) {
      this._extensions[str] = ext
    }
    return ext
  }

  getSupportedExtensions () {
    const exts = [
      'ANGLE_instanced_arrays',
      'STACKGL_resize_drawingbuffer',
      'STACKGL_destroy_context'
    ]

    const supportedExts = super.getSupportedExtensions()

    if (supportedExts.indexOf('GL_OES_element_index_uint') >= 0) {
      exts.push('OES_element_index_uint')
    }

    if (supportedExts.indexOf('GL_OES_texture_float') >= 0) {
      exts.push('OES_texture_float')
    }

    if (supportedExts.indexOf('EXT_draw_buffers') >= 0) {
      exts.push('WEBGL_draw_buffers')
    }

    return exts
  }

  setError (error) {
    NativeWebGL.setError.call(this, error | 0)
  }

  blendFunc (sfactor, dfactor) {
    sfactor |= 0
    dfactor |= 0
    if (!this._validBlendFunc(sfactor) ||
      !this._validBlendFunc(dfactor)) {
      this.setError(gl.INVALID_ENUM)
      return
    }
    if (this._isConstantBlendFunc(sfactor) && this._isConstantBlendFunc(dfactor)) {
      this.setError(gl.INVALID_OPERATION)
      return
    }
    super.blendFunc(sfactor, dfactor)
  }

  blendFuncSeparate (
    srcRGB,
    dstRGB,
    srcAlpha,
    dstAlpha) {
    srcRGB |= 0
    dstRGB |= 0
    srcAlpha |= 0
    dstAlpha |= 0

    if (!(this._validBlendFunc(srcRGB) &&
      this._validBlendFunc(dstRGB) &&
      this._validBlendFunc(srcAlpha) &&
      this._validBlendFunc(dstAlpha))) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if ((this._isConstantBlendFunc(srcRGB) && this._isConstantBlendFunc(dstRGB)) ||
      (this._isConstantBlendFunc(srcAlpha) && this._isConstantBlendFunc(dstAlpha))) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    super.blendFuncSeparate(
      srcRGB,
      dstRGB,
      srcAlpha,
      dstAlpha)
  }

  bufferData (target, data, usage) {
    target |= 0
    usage |= 0
    if (usage !== gl.STREAM_DRAW &&
      usage !== gl.STATIC_DRAW &&
      usage !== gl.DYNAMIC_DRAW) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (target !== gl.ARRAY_BUFFER &&
      target !== gl.ELEMENT_ARRAY_BUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const active = this._getActiveBuffer(target)
    if (!active) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (typeof data === 'object') {
      let u8Data = null
      if (isTypedArray(data)) {
        u8Data = unpackTypedArray(data)
      } else if (data instanceof ArrayBuffer) {
        u8Data = new Uint8Array(data)
      } else {
        this.setError(gl.INVALID_VALUE)
        return
      }

      this._saveError()
      super.bufferData(
        target,
        u8Data,
        usage)
      const error = this.getError()
      this._restoreError(error)
      if (error !== gl.NO_ERROR) {
        return
      }

      active._size = u8Data.length
      if (target === gl.ELEMENT_ARRAY_BUFFER) {
        active._elements = new Uint8Array(u8Data)
      }
    } else if (typeof data === 'number') {
      const size = data | 0
      if (size < 0) {
        this.setError(gl.INVALID_VALUE)
        return
      }

      this._saveError()
      super.bufferData(
        target,
        size,
        usage)
      const error = this.getError()
      this._restoreError(error)
      if (error !== gl.NO_ERROR) {
        return
      }

      active._size = size
      if (target === gl.ELEMENT_ARRAY_BUFFER) {
        active._elements = new Uint8Array(size)
      }
    } else {
      this.setError(gl.INVALID_VALUE)
    }
  }

  bufferSubData (target, offset, data) {
    target |= 0
    offset |= 0

    if (target !== gl.ARRAY_BUFFER &&
      target !== gl.ELEMENT_ARRAY_BUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (data === null) {
      return
    }

    if (!data || typeof data !== 'object') {
      this.setError(gl.INVALID_VALUE)
      return
    }

    const active = this._getActiveBuffer(target)
    if (!active) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (offset < 0 || offset >= active._size) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    let u8Data = null
    if (isTypedArray(data)) {
      u8Data = unpackTypedArray(data)
    } else if (data instanceof ArrayBuffer) {
      u8Data = new Uint8Array(data)
    } else {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (offset + u8Data.length > active._size) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (target === gl.ELEMENT_ARRAY_BUFFER) {
      active._elements.set(u8Data, offset)
    }

    super.bufferSubData(
      target,
      offset,
      u8Data)
  }

  checkFramebufferStatus (target) {
    if (target !== gl.FRAMEBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return 0
    }

    const framebuffer = this._activeFramebuffer
    if (!framebuffer) {
      return gl.FRAMEBUFFER_COMPLETE
    }

    return this._preCheckFramebufferStatus(framebuffer)
  }

  clear (mask) {
    if (!this._framebufferOk()) {
      return
    }
    return super.clear(mask | 0)
  }

  clearColor (red, green, blue, alpha) {
    return super.clearColor(+red, +green, +blue, +alpha)
  }

  clearDepth (depth) {
    return super.clearDepth(+depth)
  }

  clearStencil (s) {
    return super.clearStencil(s | 0)
  }

  colorMask (red, green, blue, alpha) {
    return super.colorMask(!!red, !!green, !!blue, !!alpha)
  }

  compileShader (shader) {
    if (!checkObject(shader)) {
      throw new TypeError('compileShader(WebGLShader)')
    }
    if (this._checkWrapper(shader, WebGLShader) &&
      this._checkShaderSource(shader)) {
      const prevError = this.getError()
      super.compileShader(shader._ | 0)
      const error = this.getError()
      shader._compileStatus = !!super.getShaderParameter(
        shader._ | 0,
        gl.COMPILE_STATUS)
      shader._compileInfo = super.getShaderInfoLog(shader._ | 0)
      this.getError()
      this.setError(prevError || error)
    }
  }

  copyTexImage2D (
    target,
    level,
    internalFormat,
    x, y, width, height,
    border) {
    target |= 0
    level |= 0
    internalFormat |= 0
    x |= 0
    y |= 0
    width |= 0
    height |= 0
    border |= 0

    const texture = this._getTexImage(target)
    if (!texture) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (internalFormat !== gl.RGBA &&
      internalFormat !== gl.RGB &&
      internalFormat !== gl.ALPHA &&
      internalFormat !== gl.LUMINANCE &&
      internalFormat !== gl.LUMINANCE_ALPHA) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (level < 0 || width < 0 || height < 0 || border !== 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (level > 0 && !(bits.isPow2(width) && bits.isPow2(height))) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    this._saveError()
    super.copyTexImage2D(
      target,
      level,
      internalFormat,
      x,
      y,
      width,
      height,
      border)
    const error = this.getError()
    this._restoreError(error)

    if (error === gl.NO_ERROR) {
      texture._levelWidth[level] = width
      texture._levelHeight[level] = height
      texture._format = gl.RGBA
      texture._type = gl.UNSIGNED_BYTE
    }
  }

  copyTexSubImage2D (
    target,
    level,
    xoffset, yoffset,
    x, y, width, height) {
    target |= 0
    level |= 0
    xoffset |= 0
    yoffset |= 0
    x |= 0
    y |= 0
    width |= 0
    height |= 0

    const texture = this._getTexImage(target)
    if (!texture) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (width < 0 || height < 0 || xoffset < 0 || yoffset < 0 || level < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    super.copyTexSubImage2D(
      target,
      level,
      xoffset,
      yoffset,
      x,
      y,
      width,
      height)
  }

  cullFace (mode) {
    return super.cullFace(mode | 0)
  }

  createShader (type) {
    type |= 0
    if (type !== gl.FRAGMENT_SHADER &&
      type !== gl.VERTEX_SHADER) {
      this.setError(gl.INVALID_ENUM)
      return null
    }
    const id = super.createShader(type)
    if (id < 0) {
      return null
    }
    const result = new WebGLShader(id, this, type)
    this._shaders[id] = result
    return result
  }

  deleteProgram (object) {
    return this._deleteLinkable('deleteProgram', object, WebGLProgram)
  }

  deleteShader (object) {
    return this._deleteLinkable('deleteShader', object, WebGLShader)
  }

  _deleteLinkable (name, object, Type) {
    if (!checkObject(object)) {
      throw new TypeError(name + '(' + Type.name + ')')
    }
    if (object instanceof Type &&
      this._checkOwns(object)) {
      object._pendingDelete = true
      object._checkDelete()
      return
    }
    this.setError(gl.INVALID_OPERATION)
  }

  deleteBuffer (buffer) {
    if (!checkObject(buffer) ||
      (buffer !== null && !(buffer instanceof WebGLBuffer))) {
      throw new TypeError('deleteBuffer(WebGLBuffer)')
    }

    if (!(buffer instanceof WebGLBuffer &&
      this._checkOwns(buffer))) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (this._activeArrayBuffer === buffer) {
      this.bindBuffer(gl.ARRAY_BUFFER, null)
    }
    if (this._activeElementArrayBuffer === buffer) {
      this.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }

    for (let i = 0; i < this._vertexAttribs.length; ++i) {
      const attrib = this._vertexAttribs[i]
      if (attrib._pointerBuffer === buffer) {
        attrib._pointerBuffer = null
        attrib._pointerStride = 0
        attrib._pointerOffset = 0
        attrib._pointerSize = 4
        buffer._refCount -= 1
      }
    }

    buffer._pendingDelete = true
    buffer._checkDelete()
  }

  deleteFramebuffer (framebuffer) {
    if (!checkObject(framebuffer)) {
      throw new TypeError('deleteFramebuffer(WebGLFramebuffer)')
    }

    if (!(framebuffer instanceof WebGLFramebuffer &&
      this._checkOwns(framebuffer))) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (this._activeFramebuffer === framebuffer) {
      this.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    framebuffer._pendingDelete = true
    framebuffer._checkDelete()
  }

  // Need to handle textures and render buffers as a special case:
  // When a texture gets deleted, we need to do the following extra steps:
  //  1. Is it bound to the current texture unit?
  //     If so, then unbind it
  //  2. Is it attached to the active fbo?
  //     If so, then detach it
  //
  // For renderbuffers only need to do second step
  //
  // After this, proceed with the usual deletion algorithm
  //
  deleteRenderbuffer (renderbuffer) {
    if (!checkObject(renderbuffer)) {
      throw new TypeError('deleteRenderbuffer(WebGLRenderbuffer)')
    }

    if (!(renderbuffer instanceof WebGLRenderbuffer &&
      this._checkOwns(renderbuffer))) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (this._activeRenderbuffer === renderbuffer) {
      this.bindRenderbuffer(gl.RENDERBUFFER, null)
    }

    const activeFramebuffer = this._activeFramebuffer

    this._tryDetachFramebuffer(activeFramebuffer, renderbuffer)

    renderbuffer._pendingDelete = true
    renderbuffer._checkDelete()
  }

  deleteTexture (texture) {
    if (!checkObject(texture)) {
      throw new TypeError('deleteTexture(WebGLTexture)')
    }

    if (texture instanceof WebGLTexture) {
      if (!this._checkOwns(texture)) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
    } else {
      return
    }

    // Unbind from all texture units
    const curActive = this._activeTextureUnit

    for (let i = 0; i < this._textureUnits.length; ++i) {
      const unit = this._textureUnits[i]
      if (unit._bind2D === texture) {
        this.activeTexture(gl.TEXTURE0 + i)
        this.bindTexture(gl.TEXTURE_2D, null)
      } else if (unit._bindCube === texture) {
        this.activeTexture(gl.TEXTURE0 + i)
        this.bindTexture(gl.TEXTURE_CUBE_MAP, null)
      }
    }
    this.activeTexture(gl.TEXTURE0 + curActive)

    // FIXME: Does the texture get unbound from *all* framebuffers, or just the
    // active FBO?
    const ctx = this
    const activeFramebuffer = this._activeFramebuffer
    function tryDetach (framebuffer) {
      if (framebuffer && framebuffer._linked(texture)) {
        const attachments = ctx._getAttachments()
        for (let i = 0; i < attachments.length; ++i) {
          const attachment = attachments[i]
          if (framebuffer._attachments[attachment] === texture) {
            ctx.framebufferTexture2D(
              gl.FRAMEBUFFER,
              attachment,
              gl.TEXTURE_2D,
              null)
          }
        }
      }
    }

    tryDetach(activeFramebuffer)

    // Mark texture for deletion
    texture._pendingDelete = true
    texture._checkDelete()
  }

  depthFunc (func) {
    func |= 0
    switch (func) {
      case gl.NEVER:
      case gl.LESS:
      case gl.EQUAL:
      case gl.LEQUAL:
      case gl.GREATER:
      case gl.NOTEQUAL:
      case gl.GEQUAL:
      case gl.ALWAYS:
        return super.depthFunc(func)
      default:
        this.setError(gl.INVALID_ENUM)
    }
  }

  depthMask (flag) {
    return super.depthMask(!!flag)
  }

  depthRange (zNear, zFar) {
    zNear = +zNear
    zFar = +zFar
    if (zNear <= zFar) {
      return super.depthRange(zNear, zFar)
    }
    this.setError(gl.INVALID_OPERATION)
  }

  destroy () {
    super.destroy()
  }

  detachShader (program, shader) {
    if (!checkObject(program) ||
      !checkObject(shader)) {
      throw new TypeError('detachShader(WebGLProgram, WebGLShader)')
    }
    if (this._checkWrapper(program, WebGLProgram) &&
      this._checkWrapper(shader, WebGLShader)) {
      if (program._linked(shader)) {
        super.detachShader(program._, shader._)
        program._unlink(shader)
      } else {
        this.setError(gl.INVALID_OPERATION)
      }
    }
  }

  disable (cap) {
    cap |= 0
    super.disable(cap)
    if (cap === gl.TEXTURE_2D ||
      cap === gl.TEXTURE_CUBE_MAP) {
      const active = this._getActiveTextureUnit()
      if (active._mode === cap) {
        active._mode = 0
      }
    }
  }

  disableVertexAttribArray (index) {
    index |= 0
    if (index < 0 || index >= this._vertexAttribs.length) {
      this.setError(gl.INVALID_VALUE)
      return
    }
    super.disableVertexAttribArray(index)
    this._vertexAttribs[index]._isPointer = false
  }

  drawArrays (mode, first, count) {
    mode |= 0
    first |= 0
    count |= 0

    if (first < 0 || count < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (!this._checkStencilState()) {
      return
    }

    const reducedCount = vertexCount(mode, count)
    if (reducedCount < 0) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (!this._framebufferOk()) {
      return
    }

    if (count === 0) {
      return
    }

    let maxIndex = first
    if (count > 0) {
      maxIndex = (count + first - 1) >>> 0
    }
    if (this._checkVertexAttribState(maxIndex)) {
      if (
        this._vertexAttribs[0]._isPointer || (
          this._extensions.webgl_draw_buffers &&
          this._extensions.webgl_draw_buffers._buffersState &&
          this._extensions.webgl_draw_buffers._buffersState.length > 0
        )
      ) {
        return super.drawArrays(mode, first, reducedCount)
      } else {
        this._beginAttrib0Hack()
        super._drawArraysInstanced(mode, first, reducedCount, 1)
        this._endAttrib0Hack()
      }
    }
  }

  drawElements (mode, count, type, ioffset) {
    mode |= 0
    count |= 0
    type |= 0
    ioffset |= 0

    if (count < 0 || ioffset < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (!this._checkStencilState()) {
      return
    }

    const elementBuffer = this._activeElementArrayBuffer
    if (!elementBuffer) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    // Unpack element data
    let elementData = null
    let offset = ioffset
    if (type === gl.UNSIGNED_SHORT) {
      if (offset % 2) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
      offset >>= 1
      elementData = new Uint16Array(elementBuffer._elements.buffer)
    } else if (this._extensions.oes_element_index_uint && type === gl.UNSIGNED_INT) {
      if (offset % 4) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
      offset >>= 2
      elementData = new Uint32Array(elementBuffer._elements.buffer)
    } else if (type === gl.UNSIGNED_BYTE) {
      elementData = elementBuffer._elements
    } else {
      this.setError(gl.INVALID_ENUM)
      return
    }

    let reducedCount = count
    switch (mode) {
      case gl.TRIANGLES:
        if (count % 3) {
          reducedCount -= (count % 3)
        }
        break
      case gl.LINES:
        if (count % 2) {
          reducedCount -= (count % 2)
        }
        break
      case gl.POINTS:
        break
      case gl.LINE_LOOP:
      case gl.LINE_STRIP:
        if (count < 2) {
          this.setError(gl.INVALID_OPERATION)
          return
        }
        break
      case gl.TRIANGLE_FAN:
      case gl.TRIANGLE_STRIP:
        if (count < 3) {
          this.setError(gl.INVALID_OPERATION)
          return
        }
        break
      default:
        this.setError(gl.INVALID_ENUM)
        return
    }

    if (!this._framebufferOk()) {
      return
    }

    if (count === 0) {
      this._checkVertexAttribState(0)
      return
    }

    if ((count + offset) >>> 0 > elementData.length) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    // Compute max index
    let maxIndex = -1
    for (let i = offset; i < offset + count; ++i) {
      maxIndex = Math.max(maxIndex, elementData[i])
    }

    if (maxIndex < 0) {
      this._checkVertexAttribState(0)
      return
    }

    if (this._checkVertexAttribState(maxIndex)) {
      if (reducedCount > 0) {
        if (this._vertexAttribs[0]._isPointer) {
          return super.drawElements(mode, reducedCount, type, ioffset)
        } else {
          this._beginAttrib0Hack()
          super._drawElementsInstanced(mode, reducedCount, type, ioffset, 1)
          this._endAttrib0Hack()
        }
      }
    }
  }

  enable (cap) {
    cap |= 0
    super.enable(cap)
  }

  enableVertexAttribArray (index) {
    index |= 0
    if (index < 0 || index >= this._vertexAttribs.length) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    super.enableVertexAttribArray(index)

    this._vertexAttribs[index]._isPointer = true
  }

  finish () {
    return super.finish()
  }

  flush () {
    return super.flush()
  }

  framebufferRenderbuffer (
    target,
    attachment,
    renderbufferTarget,
    renderbuffer) {
    target = target | 0
    attachment = attachment | 0
    renderbufferTarget = renderbufferTarget | 0

    if (!checkObject(renderbuffer)) {
      throw new TypeError('framebufferRenderbuffer(GLenum, GLenum, GLenum, WebGLRenderbuffer)')
    }

    if (target !== gl.FRAMEBUFFER ||
      !this._validFramebufferAttachment(attachment) ||
      renderbufferTarget !== gl.RENDERBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const framebuffer = this._activeFramebuffer
    if (!framebuffer) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (renderbuffer && !this._checkWrapper(renderbuffer, WebGLRenderbuffer)) {
      return
    }

    framebuffer._setAttachment(renderbuffer, attachment)
    this._updateFramebufferAttachments(framebuffer)
  }

  framebufferTexture2D (
    target,
    attachment,
    textarget,
    texture,
    level) {
    target |= 0
    attachment |= 0
    textarget |= 0
    level |= 0
    if (!checkObject(texture)) {
      throw new TypeError('framebufferTexture2D(GLenum, GLenum, GLenum, WebGLTexture, GLint)')
    }

    // Check parameters are ok
    if (target !== gl.FRAMEBUFFER ||
      !this._validFramebufferAttachment(attachment)) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (level !== 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    // Check object ownership
    if (texture && !this._checkWrapper(texture, WebGLTexture)) {
      return
    }

    // Check texture target is ok
    if (textarget === gl.TEXTURE_2D) {
      if (texture && texture._binding !== gl.TEXTURE_2D) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
    } else if (this._validCubeTarget(textarget)) {
      if (texture && texture._binding !== gl.TEXTURE_CUBE_MAP) {
        this.setError(gl.INVALID_OPERATION)
        return
      }
    } else {
      this.setError(gl.INVALID_ENUM)
      return
    }

    // Check a framebuffer is actually bound
    const framebuffer = this._activeFramebuffer
    if (!framebuffer) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    framebuffer._attachmentLevel[attachment] = level
    framebuffer._attachmentFace[attachment] = textarget
    framebuffer._setAttachment(texture, attachment)
    this._updateFramebufferAttachments(framebuffer)
  }

  frontFace (mode) {
    return super.frontFace(mode | 0)
  }

  generateMipmap (target) {
    return super.generateMipmap(target | 0) | 0
  }

  getActiveAttrib (program, index) {
    if (!checkObject(program)) {
      throw new TypeError('getActiveAttrib(WebGLProgram)')
    } else if (!program) {
      this.setError(gl.INVALID_VALUE)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      const info = super.getActiveAttrib(program._ | 0, index | 0)
      if (info) {
        return new WebGLActiveInfo(info)
      }
    }
    return null
  }

  getActiveUniform (program, index) {
    if (!checkObject(program)) {
      throw new TypeError('getActiveUniform(WebGLProgram, GLint)')
    } else if (!program) {
      this.setError(gl.INVALID_VALUE)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      const info = super.getActiveUniform(program._ | 0, index | 0)
      if (info) {
        return new WebGLActiveInfo(info)
      }
    }
    return null
  }

  getAttachedShaders (program) {
    if (!checkObject(program) ||
      (typeof program === 'object' &&
        program !== null &&
        !(program instanceof WebGLProgram))) {
      throw new TypeError('getAttachedShaders(WebGLProgram)')
    }
    if (!program) {
      this.setError(gl.INVALID_VALUE)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      const shaderArray = super.getAttachedShaders(program._ | 0)
      if (!shaderArray) {
        return null
      }
      const unboxedShaders = new Array(shaderArray.length)
      for (let i = 0; i < shaderArray.length; ++i) {
        unboxedShaders[i] = this._shaders[shaderArray[i]]
      }
      return unboxedShaders
    }
    return null
  }

  getAttribLocation (program, name) {
    if (!checkObject(program)) {
      throw new TypeError('getAttribLocation(WebGLProgram, String)')
    }
    name += ''
    if (!isValidString(name) || name.length > MAX_ATTRIBUTE_LENGTH) {
      this.setError(gl.INVALID_VALUE)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      return super.getAttribLocation(program._ | 0, name + '')
    }
    return -1
  }

  getParameter (pname) {
    pname |= 0
    switch (pname) {
      case gl.ARRAY_BUFFER_BINDING:
        return this._activeArrayBuffer
      case gl.ELEMENT_ARRAY_BUFFER_BINDING:
        return this._activeElementArrayBuffer
      case gl.CURRENT_PROGRAM:
        return this._activeProgram
      case gl.FRAMEBUFFER_BINDING:
        return this._activeFramebuffer
      case gl.RENDERBUFFER_BINDING:
        return this._activeRenderbuffer
      case gl.TEXTURE_BINDING_2D:
        return this._getActiveTextureUnit()._bind2D
      case gl.TEXTURE_BINDING_CUBE_MAP:
        return this._getActiveTextureUnit()._bindCube
      case gl.VERSION:
        return 'WebGL 1.0 stack-gl ' + HEADLESS_VERSION
      case gl.VENDOR:
        return 'stack-gl'
      case gl.RENDERER:
        return 'ANGLE'
      case gl.SHADING_LANGUAGE_VERSION:
        return 'WebGL GLSL ES 1.0 stack-gl'

      case gl.COMPRESSED_TEXTURE_FORMATS:
        return new Uint32Array(0)

      // Int arrays
      case gl.MAX_VIEWPORT_DIMS:
      case gl.SCISSOR_BOX:
      case gl.VIEWPORT:
        return new Int32Array(super.getParameter(pname))

      // Float arrays
      case gl.ALIASED_LINE_WIDTH_RANGE:
      case gl.ALIASED_POINT_SIZE_RANGE:
      case gl.DEPTH_RANGE:
      case gl.BLEND_COLOR:
      case gl.COLOR_CLEAR_VALUE:
        return new Float32Array(super.getParameter(pname))

      case gl.COLOR_WRITEMASK:
        return super.getParameter(pname)

      case gl.DEPTH_CLEAR_VALUE:
      case gl.LINE_WIDTH:
      case gl.POLYGON_OFFSET_FACTOR:
      case gl.POLYGON_OFFSET_UNITS:
      case gl.SAMPLE_COVERAGE_VALUE:
        return +super.getParameter(pname)

      case gl.BLEND:
      case gl.CULL_FACE:
      case gl.DEPTH_TEST:
      case gl.DEPTH_WRITEMASK:
      case gl.DITHER:
      case gl.POLYGON_OFFSET_FILL:
      case gl.SAMPLE_COVERAGE_INVERT:
      case gl.SCISSOR_TEST:
      case gl.STENCIL_TEST:
      case gl.UNPACK_FLIP_Y_WEBGL:
      case gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL:
        return !!super.getParameter(pname)

      case gl.ACTIVE_TEXTURE:
      case gl.ALPHA_BITS:
      case gl.BLEND_DST_ALPHA:
      case gl.BLEND_DST_RGB:
      case gl.BLEND_EQUATION_ALPHA:
      case gl.BLEND_EQUATION_RGB:
      case gl.BLEND_SRC_ALPHA:
      case gl.BLEND_SRC_RGB:
      case gl.BLUE_BITS:
      case gl.CULL_FACE_MODE:
      case gl.DEPTH_BITS:
      case gl.DEPTH_FUNC:
      case gl.FRONT_FACE:
      case gl.GENERATE_MIPMAP_HINT:
      case gl.GREEN_BITS:
      case gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
      case gl.MAX_CUBE_MAP_TEXTURE_SIZE:
      case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
      case gl.MAX_RENDERBUFFER_SIZE:
      case gl.MAX_TEXTURE_IMAGE_UNITS:
      case gl.MAX_TEXTURE_SIZE:
      case gl.MAX_VARYING_VECTORS:
      case gl.MAX_VERTEX_ATTRIBS:
      case gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
      case gl.MAX_VERTEX_UNIFORM_VECTORS:
      case gl.PACK_ALIGNMENT:
      case gl.RED_BITS:
      case gl.SAMPLE_BUFFERS:
      case gl.SAMPLES:
      case gl.STENCIL_BACK_FAIL:
      case gl.STENCIL_BACK_FUNC:
      case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
      case gl.STENCIL_BACK_PASS_DEPTH_PASS:
      case gl.STENCIL_BACK_REF:
      case gl.STENCIL_BACK_VALUE_MASK:
      case gl.STENCIL_BACK_WRITEMASK:
      case gl.STENCIL_BITS:
      case gl.STENCIL_CLEAR_VALUE:
      case gl.STENCIL_FAIL:
      case gl.STENCIL_FUNC:
      case gl.STENCIL_PASS_DEPTH_FAIL:
      case gl.STENCIL_PASS_DEPTH_PASS:
      case gl.STENCIL_REF:
      case gl.STENCIL_VALUE_MASK:
      case gl.STENCIL_WRITEMASK:
      case gl.SUBPIXEL_BITS:
      case gl.UNPACK_ALIGNMENT:
      case gl.UNPACK_COLORSPACE_CONVERSION_WEBGL:
        return super.getParameter(pname) | 0

      case gl.IMPLEMENTATION_COLOR_READ_FORMAT:
      case gl.IMPLEMENTATION_COLOR_READ_TYPE:
        return super.getParameter(pname)

      default:
        if (this._extensions.webgl_draw_buffers) {
          const ext = this._extensions.webgl_draw_buffers
          switch (pname) {
            case ext.DRAW_BUFFER0_WEBGL:
            case ext.DRAW_BUFFER1_WEBGL:
            case ext.DRAW_BUFFER2_WEBGL:
            case ext.DRAW_BUFFER3_WEBGL:
            case ext.DRAW_BUFFER4_WEBGL:
            case ext.DRAW_BUFFER5_WEBGL:
            case ext.DRAW_BUFFER6_WEBGL:
            case ext.DRAW_BUFFER7_WEBGL:
            case ext.DRAW_BUFFER8_WEBGL:
            case ext.DRAW_BUFFER9_WEBGL:
            case ext.DRAW_BUFFER10_WEBGL:
            case ext.DRAW_BUFFER11_WEBGL:
            case ext.DRAW_BUFFER12_WEBGL:
            case ext.DRAW_BUFFER13_WEBGL:
            case ext.DRAW_BUFFER14_WEBGL:
            case ext.DRAW_BUFFER15_WEBGL:
              if (ext._buffersState.length === 1 && ext._buffersState[0] === gl.BACK) {
                return gl.BACK
              }
              return super.getParameter(pname)
            case ext.MAX_DRAW_BUFFERS_WEBGL:
            case ext.MAX_COLOR_ATTACHMENTS_WEBGL:
              return super.getParameter(pname)
          }
        }
        this.setError(gl.INVALID_ENUM)
        return null
    }
  }

  getShaderPrecisionFormat (
    shaderType,
    precisionType) {
    shaderType |= 0
    precisionType |= 0

    if (!(shaderType === gl.FRAGMENT_SHADER ||
      shaderType === gl.VERTEX_SHADER) ||
      !(precisionType === gl.LOW_FLOAT ||
        precisionType === gl.MEDIUM_FLOAT ||
        precisionType === gl.HIGH_FLOAT ||
        precisionType === gl.LOW_INT ||
        precisionType === gl.MEDIUM_INT ||
        precisionType === gl.HIGH_INT)) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const format = super.getShaderPrecisionFormat(shaderType, precisionType)
    if (!format) {
      return null
    }

    return new WebGLShaderPrecisionFormat(format)
  }

  getBufferParameter (target, pname) {
    target |= 0
    pname |= 0
    if (target !== gl.ARRAY_BUFFER &&
      target !== gl.ELEMENT_ARRAY_BUFFER) {
      this.setError(gl.INVALID_ENUM)
      return null
    }

    switch (pname) {
      case gl.BUFFER_SIZE:
      case gl.BUFFER_USAGE:
        return super.getBufferParameter(target | 0, pname | 0)
      default:
        this.setError(gl.INVALID_ENUM)
        return null
    }
  }

  getError () {
    return super.getError()
  }

  getFramebufferAttachmentParameter (target, attachment, pname) {
    target |= 0
    attachment |= 0
    pname |= 0

    if (target !== gl.FRAMEBUFFER ||
      !this._validFramebufferAttachment(attachment)) {
      this.setError(gl.INVALID_ENUM)
      return null
    }

    const framebuffer = this._activeFramebuffer
    if (!framebuffer) {
      this.setError(gl.INVALID_OPERATION)
      return null
    }

    const object = framebuffer._attachments[attachment]
    if (object === null) {
      if (pname === gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE) {
        return gl.NONE
      }
    } else if (object instanceof WebGLTexture) {
      switch (pname) {
        case gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
          return object
        case gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
          return gl.TEXTURE
        case gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL:
          return framebuffer._attachmentLevel[attachment]
        case gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE:
          const face = framebuffer._attachmentFace[attachment]
          if (face === gl.TEXTURE_2D) {
            return 0
          }
          return face
      }
    } else if (object instanceof WebGLRenderbuffer) {
      switch (pname) {
        case gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
          return object
        case gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
          return gl.RENDERBUFFER
      }
    }

    this.setError(gl.INVALID_ENUM)
    return null
  }

  getProgramParameter (program, pname) {
    pname |= 0
    if (!checkObject(program)) {
      throw new TypeError('getProgramParameter(WebGLProgram, GLenum)')
    } else if (this._checkWrapper(program, WebGLProgram)) {
      switch (pname) {
        case gl.DELETE_STATUS:
          return program._pendingDelete

        case gl.LINK_STATUS:
          return program._linkStatus

        case gl.VALIDATE_STATUS:
          return !!super.getProgramParameter(program._, pname)

        case gl.ATTACHED_SHADERS:
        case gl.ACTIVE_ATTRIBUTES:
        case gl.ACTIVE_UNIFORMS:
          return super.getProgramParameter(program._, pname)
      }
      this.setError(gl.INVALID_ENUM)
    }
    return null
  }

  getProgramInfoLog (program) {
    if (!checkObject(program)) {
      throw new TypeError('getProgramInfoLog(WebGLProgram)')
    } else if (this._checkWrapper(program, WebGLProgram)) {
      return program._linkInfoLog
    }
    return null
  }

  getRenderbufferParameter (target, pname) {
    target |= 0
    pname |= 0
    if (target !== gl.RENDERBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return null
    }
    const renderbuffer = this._activeRenderbuffer
    if (!renderbuffer) {
      this.setError(gl.INVALID_OPERATION)
      return null
    }
    switch (pname) {
      case gl.RENDERBUFFER_INTERNAL_FORMAT:
        return renderbuffer._format
      case gl.RENDERBUFFER_WIDTH:
        return renderbuffer._width
      case gl.RENDERBUFFER_HEIGHT:
        return renderbuffer._height
      case gl.RENDERBUFFER_SIZE:
      case gl.RENDERBUFFER_RED_SIZE:
      case gl.RENDERBUFFER_GREEN_SIZE:
      case gl.RENDERBUFFER_BLUE_SIZE:
      case gl.RENDERBUFFER_ALPHA_SIZE:
      case gl.RENDERBUFFER_DEPTH_SIZE:
      case gl.RENDERBUFFER_STENCIL_SIZE:
        return super.getRenderbufferParameter(target, pname)
    }
    this.setError(gl.INVALID_ENUM)
    return null
  }

  getShaderParameter (shader, pname) {
    pname |= 0
    if (!checkObject(shader)) {
      throw new TypeError('getShaderParameter(WebGLShader, GLenum)')
    } else if (this._checkWrapper(shader, WebGLShader)) {
      switch (pname) {
        case gl.DELETE_STATUS:
          return shader._pendingDelete
        case gl.COMPILE_STATUS:
          return shader._compileStatus
        case gl.SHADER_TYPE:
          return shader._type
      }
      this.setError(gl.INVALID_ENUM)
    }
    return null
  }

  getShaderInfoLog (shader) {
    if (!checkObject(shader)) {
      throw new TypeError('getShaderInfoLog(WebGLShader)')
    } else if (this._checkWrapper(shader, WebGLShader)) {
      return shader._compileInfo
    }
    return null
  }

  getShaderSource (shader) {
    if (!checkObject(shader)) {
      throw new TypeError('Input to getShaderSource must be an object')
    } else if (this._checkWrapper(shader, WebGLShader)) {
      return shader._source
    }
    return null
  }

  getTexParameter (target, pname) {
    target |= 0
    pname |= 0

    if (!this._checkTextureTarget(target)) {
      return null
    }

    const unit = this._getActiveTextureUnit()
    if ((target === gl.TEXTURE_2D && !unit._bind2D) ||
      (target === gl.TEXTURE_CUBE_MAP && !unit._bindCube)) {
      this.setError(gl.INVALID_OPERATION)
      return null
    }

    switch (pname) {
      case gl.TEXTURE_MAG_FILTER:
      case gl.TEXTURE_MIN_FILTER:
      case gl.TEXTURE_WRAP_S:
      case gl.TEXTURE_WRAP_T:
        return super.getTexParameter(target, pname)
    }

    this.setError(gl.INVALID_ENUM)
    return null
  }

  getUniform (program, location) {
    if (!checkObject(program) ||
      !checkObject(location)) {
      throw new TypeError('getUniform(WebGLProgram, WebGLUniformLocation)')
    } else if (!program) {
      this.setError(gl.INVALID_VALUE)
      return null
    } else if (!location) {
      return null
    } else if (this._checkWrapper(program, WebGLProgram)) {
      if (!checkUniform(program, location)) {
        this.setError(gl.INVALID_OPERATION)
        return null
      }
      const data = super.getUniform(program._ | 0, location._ | 0)
      if (!data) {
        return null
      }
      switch (location._activeInfo.type) {
        case gl.FLOAT:
          return data[0]
        case gl.FLOAT_VEC2:
          return new Float32Array(data.slice(0, 2))
        case gl.FLOAT_VEC3:
          return new Float32Array(data.slice(0, 3))
        case gl.FLOAT_VEC4:
          return new Float32Array(data.slice(0, 4))
        case gl.INT:
          return data[0] | 0
        case gl.INT_VEC2:
          return new Int32Array(data.slice(0, 2))
        case gl.INT_VEC3:
          return new Int32Array(data.slice(0, 3))
        case gl.INT_VEC4:
          return new Int32Array(data.slice(0, 4))
        case gl.BOOL:
          return !!data[0]
        case gl.BOOL_VEC2:
          return [!!data[0], !!data[1]]
        case gl.BOOL_VEC3:
          return [!!data[0], !!data[1], !!data[2]]
        case gl.BOOL_VEC4:
          return [!!data[0], !!data[1], !!data[2], !!data[3]]
        case gl.FLOAT_MAT2:
          return new Float32Array(data.slice(0, 4))
        case gl.FLOAT_MAT3:
          return new Float32Array(data.slice(0, 9))
        case gl.FLOAT_MAT4:
          return new Float32Array(data.slice(0, 16))
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
          return data[0] | 0
        default:
          return null
      }
    }
    return null
  }

  getUniformLocation (program, name) {
    if (!checkObject(program)) {
      throw new TypeError('getUniformLocation(WebGLProgram, String)')
    }

    name += ''
    if (!isValidString(name)) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (this._checkWrapper(program, WebGLProgram)) {
      const loc = super.getUniformLocation(program._ | 0, name)
      if (loc >= 0) {
        let searchName = name
        if (/\[\d+\]$/.test(name)) {
          searchName = name.replace(/\[\d+\]$/, '[0]')
        }

        let info = null
        for (let i = 0; i < program._uniforms.length; ++i) {
          const infoItem = program._uniforms[i]
          if (infoItem.name === searchName) {
            info = {
              size: infoItem.size,
              type: infoItem.type,
              name: infoItem.name
            }
          }
        }
        if (!info) {
          return null
        }

        const result = new WebGLUniformLocation(
          loc,
          program,
          info)

        // handle array case
        if (/\[0\]$/.test(name)) {
          const baseName = name.replace(/\[0\]$/, '')
          const arrayLocs = []

          // if (offset < 0 || offset >= info.size) {
          //   return null
          // }

          this._saveError()
          for (let i = 0; this.getError() === gl.NO_ERROR; ++i) {
            const xloc = super.getUniformLocation(
              program._ | 0,
              baseName + '[' + i + ']')
            if (this.getError() !== gl.NO_ERROR || xloc < 0) {
              break
            }
            arrayLocs.push(xloc)
          }
          this._restoreError(gl.NO_ERROR)

          result._array = arrayLocs
        } else if (/\[(\d+)\]$/.test(name)) {
          const offset = +(/\[(\d+)\]$/.exec(name))[1]
          if (offset < 0 || offset >= info.size) {
            return null
          }
        }
        return result
      }
    }
    return null
  }

  getVertexAttrib (index, pname) {
    index |= 0
    pname |= 0
    if (index < 0 || index >= this._vertexAttribs.length) {
      this.setError(gl.INVALID_VALUE)
      return null
    }
    const attrib = this._vertexAttribs[index]

    const extInstancing = this._extensions.angle_instanced_arrays
    if (extInstancing) {
      if (pname === extInstancing.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE) {
        return attrib._divisor
      }
    }

    switch (pname) {
      case gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING:
        return attrib._pointerBuffer
      case gl.VERTEX_ATTRIB_ARRAY_ENABLED:
        return attrib._isPointer
      case gl.VERTEX_ATTRIB_ARRAY_SIZE:
        return attrib._inputSize
      case gl.VERTEX_ATTRIB_ARRAY_STRIDE:
        return attrib._inputStride
      case gl.VERTEX_ATTRIB_ARRAY_TYPE:
        return attrib._pointerType
      case gl.VERTEX_ATTRIB_ARRAY_NORMALIZED:
        return attrib._pointerNormal
      case gl.CURRENT_VERTEX_ATTRIB:
        return new Float32Array(attrib._data)
      default:
        this.setError(gl.INVALID_ENUM)
        return null
    }
  }

  getVertexAttribOffset (index, pname) {
    index |= 0
    pname |= 0
    if (index < 0 || index >= this._vertexAttribs.length) {
      this.setError(gl.INVALID_VALUE)
      return null
    }
    if (pname === gl.VERTEX_ATTRIB_ARRAY_POINTER) {
      return this._vertexAttribs[index]._pointerOffset
    } else {
      this.setError(gl.INVALID_ENUM)
      return null
    }
  }

  hint (target, mode) {
    target |= 0
    mode |= 0

    if (target !== gl.GENERATE_MIPMAP_HINT) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (mode !== gl.FASTEST &&
      mode !== gl.NICEST &&
      mode !== gl.DONT_CARE) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    return super.hint(target, mode)
  }

  isBuffer (object) {
    if (!this._isObject(object, 'isBuffer', WebGLBuffer)) return false
    return super.isBuffer(object._ | 0)
  }

  isFramebuffer (object) {
    if (!this._isObject(object, 'isFramebuffer', WebGLFramebuffer)) return false
    return super.isFramebuffer(object._ | 0)
  }

  isProgram (object) {
    if (!this._isObject(object, 'isProgram', WebGLProgram)) return false
    return super.isProgram(object._ | 0)
  }

  isRenderbuffer (object) {
    if (!this._isObject(object, 'isRenderbuffer', WebGLRenderbuffer)) return false
    return super.isRenderbuffer(object._ | 0)
  }

  isShader (object) {
    if (!this._isObject(object, 'isShader', WebGLShader)) return false
    return super.isShader(object._ | 0)
  }

  isTexture (object) {
    if (!this._isObject(object, 'isTexture', WebGLTexture)) return false
    return super.isTexture(object._ | 0)
  }

  isEnabled (cap) {
    return super.isEnabled(cap | 0)
  }

  lineWidth (width) {
    if (isNaN(width)) {
      this.setError(gl.INVALID_VALUE)
      return
    }
    return super.lineWidth(+width)
  }

  linkProgram (program) {
    if (!checkObject(program)) {
      throw new TypeError('linkProgram(WebGLProgram)')
    }
    if (this._checkWrapper(program, WebGLProgram)) {
      program._linkCount += 1
      program._attributes = []
      const prevError = this.getError()
      super.linkProgram(program._ | 0)
      const error = this.getError()
      if (error === gl.NO_ERROR) {
        program._linkStatus = this._fixupLink(program)
      }
      this.getError()
      this.setError(prevError || error)
    }
  }

  pixelStorei (pname, param) {
    pname |= 0
    param |= 0
    if (pname === gl.UNPACK_ALIGNMENT) {
      if (param === 1 ||
        param === 2 ||
        param === 4 ||
        param === 8) {
        this._unpackAlignment = param
      } else {
        this.setError(gl.INVALID_VALUE)
        return
      }
    } else if (pname === gl.PACK_ALIGNMENT) {
      if (param === 1 ||
        param === 2 ||
        param === 4 ||
        param === 8) {
        this._packAlignment = param
      } else {
        this.setError(gl.INVALID_VALUE)
        return
      }
    } else if (pname === gl.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
      if (!(param === gl.NONE || param === gl.BROWSER_DEFAULT_WEBGL)) {
        this.setError(gl.INVALID_VALUE)
        return
      }
    }
    return super.pixelStorei(pname, param)
  }

  polygonOffset (factor, units) {
    return super.polygonOffset(+factor, +units)
  }

  readPixels (x, y, width, height, format, type, pixels) {
    x |= 0
    y |= 0
    width |= 0
    height |= 0

    if (this._extensions.oes_texture_float && type === gl.FLOAT && format === gl.RGBA) {
    } else if (format === gl.RGB ||
      format === gl.ALPHA ||
      type !== gl.UNSIGNED_BYTE) {
      this.setError(gl.INVALID_OPERATION)
      return
    } else if (format !== gl.RGBA) {
      this.setError(gl.INVALID_ENUM)
      return
    } else if (
      width < 0 ||
      height < 0 ||
      !(pixels instanceof Uint8Array)) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (!this._framebufferOk()) {
      return
    }

    let rowStride = width * 4
    if (rowStride % this._packAlignment !== 0) {
      rowStride += this._packAlignment - (rowStride % this._packAlignment)
    }

    const imageSize = rowStride * (height - 1) + width * 4
    if (imageSize <= 0) {
      return
    }
    if (pixels.length < imageSize) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    // Handle reading outside the window
    let viewWidth = this.drawingBufferWidth
    let viewHeight = this.drawingBufferHeight

    if (this._activeFramebuffer) {
      viewWidth = this._activeFramebuffer._width
      viewHeight = this._activeFramebuffer._height
    }

    const pixelData = unpackTypedArray(pixels)

    if (x >= viewWidth || x + width <= 0 ||
      y >= viewHeight || y + height <= 0) {
      for (let i = 0; i < pixelData.length; ++i) {
        pixelData[i] = 0
      }
    } else if (x < 0 || x + width > viewWidth ||
      y < 0 || y + height > viewHeight) {
      for (let i = 0; i < pixelData.length; ++i) {
        pixelData[i] = 0
      }

      let nx = x
      let nWidth = width
      if (x < 0) {
        nWidth += x
        nx = 0
      }
      if (nx + width > viewWidth) {
        nWidth = viewWidth - nx
      }
      let ny = y
      let nHeight = height
      if (y < 0) {
        nHeight += y
        ny = 0
      }
      if (ny + height > viewHeight) {
        nHeight = viewHeight - ny
      }

      let nRowStride = nWidth * 4
      if (nRowStride % this._packAlignment !== 0) {
        nRowStride += this._packAlignment - (nRowStride % this._packAlignment)
      }

      if (nWidth > 0 && nHeight > 0) {
        const subPixels = new Uint8Array(nRowStride * nHeight)
        super.readPixels(
          nx,
          ny,
          nWidth,
          nHeight,
          format,
          type,
          subPixels)

        const offset = 4 * (nx - x) + (ny - y) * rowStride
        for (let j = 0; j < nHeight; ++j) {
          for (let i = 0; i < nWidth; ++i) {
            for (let k = 0; k < 4; ++k) {
              pixelData[offset + j * rowStride + 4 * i + k] =
                subPixels[j * nRowStride + 4 * i + k]
            }
          }
        }
      }
    } else {
      super.readPixels(
        x,
        y,
        width,
        height,
        format,
        type,
        pixelData)
    }
  }

  renderbufferStorage (
    target,
    internalFormat,
    width,
    height) {
    target |= 0
    internalFormat |= 0
    width |= 0
    height |= 0

    if (target !== gl.RENDERBUFFER) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const renderbuffer = this._activeRenderbuffer
    if (!renderbuffer) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (internalFormat !== gl.RGBA4 &&
      internalFormat !== gl.RGB565 &&
      internalFormat !== gl.RGB5_A1 &&
      internalFormat !== gl.DEPTH_COMPONENT16 &&
      internalFormat !== gl.STENCIL_INDEX &&
      internalFormat !== gl.STENCIL_INDEX8 &&
      internalFormat !== gl.DEPTH_STENCIL) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    this._saveError()
    super.renderbufferStorage(
      target,
      internalFormat,
      width,
      height)
    const error = this.getError()
    this._restoreError(error)
    if (error !== gl.NO_ERROR) {
      return
    }

    renderbuffer._width = width
    renderbuffer._height = height
    renderbuffer._format = internalFormat

    const activeFramebuffer = this._activeFramebuffer
    if (activeFramebuffer) {
      let needsUpdate = false
      const attachments = this._getAttachments()
      for (let i = 0; i < attachments.length; ++i) {
        if (activeFramebuffer._attachments[attachments[i]] === renderbuffer) {
          needsUpdate = true
          break
        }
      }
      if (needsUpdate) {
        this._updateFramebufferAttachments(this._activeFramebuffer)
      }
    }
  }

  resize (width, height) {
    width = width | 0
    height = height | 0
    if (!(width > 0 && height > 0)) {
      throw new Error('Invalid surface dimensions')
    } else if (width !== this.drawingBufferWidth ||
      height !== this.drawingBufferHeight) {
      this._resizeDrawingBuffer(width, height)
      this.drawingBufferWidth = width
      this.drawingBufferHeight = height
    }
  }

  sampleCoverage (value, invert) {
    return super.sampleCoverage(+value, !!invert)
  }

  scissor (x, y, width, height) {
    return super.scissor(x | 0, y | 0, width | 0, height | 0)
  }

  shaderSource (shader, source) {
    if (!checkObject(shader)) {
      throw new TypeError('shaderSource(WebGLShader, String)')
    }
    if (!shader || (!source && typeof source !== 'string')) {
      this.setError(gl.INVALID_VALUE)
      return
    }
    source += ''
    if (!isValidString(source)) {
      this.setError(gl.INVALID_VALUE)
    } else if (this._checkWrapper(shader, WebGLShader)) {
      super.shaderSource(shader._ | 0, this._wrapShader(shader._type, source)) // eslint-disable-line
      shader._source = source
    }
  }

  stencilFunc (func, ref, mask) {
    return super.stencilFunc(func | 0, ref | 0, mask | 0)
  }

  stencilFuncSeparate (face, func, ref, mask) {
    return super.stencilFuncSeparate(face | 0, func | 0, ref | 0, mask | 0)
  }

  stencilMask (mask) {
    return super.stencilMask(mask | 0)
  }

  stencilMaskSeparate (face, mask) {
    return super.stencilMaskSeparate(face | 0, mask | 0)
  }

  stencilOp (fail, zfail, zpass) {
    return super.stencilOp(fail | 0, zfail | 0, zpass | 0)
  }

  stencilOpSeparate (face, fail, zfail, zpass) {
    return super.stencilOpSeparate(face | 0, fail | 0, zfail | 0, zpass | 0)
  }

  texImage2D (
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    pixels) {
    if (arguments.length === 6) {
      pixels = border
      type = height
      format = width

      pixels = extractImageData(pixels)

      if (pixels == null) {
        throw new TypeError('texImage2D(GLenum, GLint, GLenum, GLint, GLenum, GLenum, ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement)')
      }

      width = pixels.width
      height = pixels.height
      pixels = pixels.data
    }

    target |= 0
    level |= 0
    internalFormat |= 0
    width |= 0
    height |= 0
    border |= 0
    format |= 0
    type |= 0

    if (typeof pixels !== 'object' && pixels !== void 0) {
      throw new TypeError('texImage2D(GLenum, GLint, GLenum, GLint, GLint, GLint, GLenum, GLenum, Uint8Array)')
    }

    if (!checkFormat(format) || !checkFormat(internalFormat)) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (type === gl.FLOAT && !this._extensions.oes_texture_float) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const texture = this._getTexImage(target)
    if (!texture || format !== internalFormat) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    const pixelSize = this._computePixelSize(type, format)
    if (pixelSize === 0) {
      return
    }

    if (!this._checkDimensions(
      target,
      width,
      height,
      level)) {
      return
    }

    const data = convertPixels(pixels)
    const rowStride = this._computeRowStride(width, pixelSize)
    const imageSize = rowStride * height

    if (data && data.length < imageSize) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (border !== 0 ||
      (validCubeTarget(target) && width !== height)) {
      this.setError(gl.INVALID_VALUE)
      return
    }
    // Need to check for out of memory error
    this._saveError()
    super.texImage2D(
      target,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      type,
      data)
    const error = this.getError()
    this._restoreError(error)
    if (error !== gl.NO_ERROR) {
      return
    }

    // Save width and height at level
    texture._levelWidth[level] = width
    texture._levelHeight[level] = height
    texture._format = format
    texture._type = type

    const activeFramebuffer = this._activeFramebuffer
    if (activeFramebuffer) {
      let needsUpdate = false
      const attachments = this._getAttachments()
      for (let i = 0; i < attachments.length; ++i) {
        if (activeFramebuffer._attachments[attachments[i]] === texture) {
          needsUpdate = true
          break
        }
      }
      if (needsUpdate) {
        this._updateFramebufferAttachments(this._activeFramebuffer)
      }
    }
  }

  texSubImage2D (
    target,
    level,
    xoffset,
    yoffset,
    width,
    height,
    format,
    type,
    pixels) {
    if (arguments.length === 7) {
      pixels = format
      type = height
      format = width

      pixels = extractImageData(pixels)

      if (pixels == null) {
        throw new TypeError('texSubImage2D(GLenum, GLint, GLint, GLint, GLenum, GLenum, ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement)')
      }

      width = pixels.width
      height = pixels.height
      pixels = pixels.data
    }

    if (typeof pixels !== 'object') {
      throw new TypeError('texSubImage2D(GLenum, GLint, GLint, GLint, GLint, GLint, GLenum, GLenum, Uint8Array)')
    }

    target |= 0
    level |= 0
    xoffset |= 0
    yoffset |= 0
    width |= 0
    height |= 0
    format |= 0
    type |= 0

    const texture = this._getTexImage(target)
    if (!texture) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    if (type === gl.FLOAT && !this._extensions.oes_texture_float) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    const pixelSize = this._computePixelSize(type, format)
    if (pixelSize === 0) {
      return
    }

    if (!this._checkDimensions(
      target,
      width,
      height,
      level)) {
      return
    }

    if (xoffset < 0 || yoffset < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    const data = convertPixels(pixels)
    const rowStride = this._computeRowStride(width, pixelSize)
    const imageSize = rowStride * height

    if (!data || data.length < imageSize) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    super.texSubImage2D(
      target,
      level,
      xoffset,
      yoffset,
      width,
      height,
      format,
      type,
      data)
  }

  texParameterf (target, pname, param) {
    target |= 0
    pname |= 0
    param = +param
    if (this._checkTextureTarget(target)) {
      this._verifyTextureCompleteness(target, pname, param)
      switch (pname) {
        case gl.TEXTURE_MIN_FILTER:
        case gl.TEXTURE_MAG_FILTER:
        case gl.TEXTURE_WRAP_S:
        case gl.TEXTURE_WRAP_T:
          return super.texParameterf(target, pname, param)
      }

      this.setError(gl.INVALID_ENUM)
    }
  }

  texParameteri (target, pname, param) {
    target |= 0
    pname |= 0
    param |= 0

    if (this._checkTextureTarget(target)) {
      this._verifyTextureCompleteness(target, pname, param)
      switch (pname) {
        case gl.TEXTURE_MIN_FILTER:
        case gl.TEXTURE_MAG_FILTER:
        case gl.TEXTURE_WRAP_S:
        case gl.TEXTURE_WRAP_T:
          return super.texParameteri(target, pname, param)
      }

      this.setError(gl.INVALID_ENUM)
    }
  }

  useProgram (program) {
    if (!checkObject(program)) {
      throw new TypeError('useProgram(WebGLProgram)')
    } else if (!program) {
      this._switchActiveProgram(this._activeProgram)
      this._activeProgram = null
      return super.useProgram(0)
    } else if (this._checkWrapper(program, WebGLProgram)) {
      if (this._activeProgram !== program) {
        this._switchActiveProgram(this._activeProgram)
        this._activeProgram = program
        program._refCount += 1
      }
      return super.useProgram(program._ | 0)
    }
  }

  validateProgram (program) {
    if (this._checkWrapper(program, WebGLProgram)) {
      super.validateProgram(program._ | 0)
      const error = this.getError()
      if (error === gl.NO_ERROR) {
        program._linkInfoLog = super.getProgramInfoLog(program._ | 0)
      }
      this.getError()
      this.setError(error)
    }
  }

  vertexAttribPointer (
    index,
    size,
    type,
    normalized,
    stride,
    offset) {
    if (stride < 0 || offset < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    index |= 0
    size |= 0
    type |= 0
    normalized = !!normalized
    stride |= 0
    offset |= 0

    if (stride < 0 ||
      offset < 0 ||
      index < 0 || index >= this._vertexAttribs.length ||
      !(size === 1 || size === 2 || size === 3 || size === 4)) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    if (this._activeArrayBuffer === null) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    // fixed, int and unsigned int aren't allowed in WebGL
    const byteSize = typeSize(type)
    if (byteSize === 0 ||
      type === gl.INT ||
      type === gl.UNSIGNED_INT) {
      this.setError(gl.INVALID_ENUM)
      return
    }

    if (stride > 255 || stride < 0) {
      this.setError(gl.INVALID_VALUE)
      return
    }

    // stride and offset must be multiples of size
    if ((stride % byteSize) !== 0 ||
      (offset % byteSize) !== 0) {
      this.setError(gl.INVALID_OPERATION)
      return
    }

    // Call vertex attrib pointer
    super.vertexAttribPointer(index, size, type, normalized, stride, offset)

    // Save attribute pointer state
    const attrib = this._vertexAttribs[index]

    if (attrib._pointerBuffer &&
      attrib._pointerBuffer !== this._activeArrayBuffer) {
      attrib._pointerBuffer._refCount -= 1
      attrib._pointerBuffer._checkDelete()
    }

    this._activeArrayBuffer._refCount += 1
    attrib._pointerBuffer = this._activeArrayBuffer
    attrib._pointerSize = size * byteSize
    attrib._pointerOffset = offset
    attrib._pointerStride = stride || (size * byteSize)
    attrib._pointerType = type
    attrib._pointerNormal = normalized
    attrib._inputStride = stride
    attrib._inputSize = size
  }

  viewport (x, y, width, height) {
    return super.viewport(x | 0, y | 0, width | 0, height | 0)
  }

  _allocateDrawingBuffer (width, height) {
    this._drawingBuffer = new WebGLDrawingBufferWrapper(
      super.createFramebuffer(),
      super.createTexture(),
      super.createRenderbuffer())

    this._resizeDrawingBuffer(width, height)
  }

  isContextLost () {
    return false
  }

  compressedTexImage2D () {
    // TODO not yet implemented
  }

  compressedTexSubImage2D () {
    // TODO not yet implemented
  }

  _checkUniformValid (location, v0, name, count, type) {
    if (!checkObject(location)) {
      throw new TypeError(`${name}(WebGLUniformLocation, ...)`)
    } else if (!location) {
      return false
    } else if (this._checkLocationActive(location)) {
      const utype = location._activeInfo.type
      if (utype === gl.SAMPLER_2D || utype === gl.SAMPLER_CUBE) {
        if (count !== 1) {
          this.setError(gl.INVALID_VALUE)
          return
        }
        if (type !== 'i') {
          this.setError(gl.INVALID_OPERATION)
          return
        }
        if (v0 < 0 || v0 >= this._textureUnits.length) {
          this.setError(gl.INVALID_VALUE)
          return false
        }
      }
      if (uniformTypeSize(utype) > count) {
        this.setError(gl.INVALID_OPERATION)
        return false
      }
      return true
    }
    return false
  }

  _checkUniformValueValid (location, value, name, count, type) {
    if (!checkObject(location) ||
      !checkObject(value)) {
      throw new TypeError(`${name}v(WebGLUniformLocation, Array)`)
    } else if (!location) {
      return false
    } else if (!this._checkLocationActive(location)) {
      return false
    } else if (typeof value !== 'object' || !value || typeof value.length !== 'number') {
      throw new TypeError(`Second argument to ${name} must be array`)
    } else if (uniformTypeSize(location._activeInfo.type) > count) {
      this.setError(gl.INVALID_OPERATION)
      return false
    } else if (value.length >= count && value.length % count === 0) {
      if (location._array) {
        return true
      } else if (value.length === count) {
        return true
      } else {
        this.setError(gl.INVALID_OPERATION)
        return false
      }
    }
    this.setError(gl.INVALID_VALUE)
    return false
  }

  uniform1f (location, v0) {
    if (!this._checkUniformValid(location, v0, 'uniform1f', 1, 'f')) return
    super.uniform1f(location._ | 0, v0)
  }
  uniform1fv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform1fv', 1, 'f')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && i < value.length; ++i) {
        const loc = locs[i]
        super.uniform1f(loc, value[i])
      }
      return
    }
    super.uniform1f(location._ | 0, value[0])
  }
  uniform1i (location, v0) {
    if (!this._checkUniformValid(location, v0, 'uniform1i', 1, 'i')) return
    super.uniform1i(location._ | 0, v0)
  }
  uniform1iv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform1iv', 1, 'i')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && i < value.length; ++i) {
        const loc = locs[i]
        super.uniform1i(loc, value[i])
      }
      return
    }
    this.uniform1i(location, value[0])
  }

  uniform2f (location, v0, v1) {
    if (!this._checkUniformValid(location, v0, 'uniform2f', 2, 'f')) return
    super.uniform2f(location._ | 0, v0, v1)
  }
  uniform2fv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform2fv', 2, 'f')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 2 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform2f(loc, value[2 * i], value[(2 * i) + 1])
      }
      return
    }
    super.uniform2f(location._ | 0, value[0], value[1])
  }
  uniform2i (location, v0, v1) {
    if (!this._checkUniformValid(location, v0, 'uniform2i', 2, 'i')) return
    super.uniform2i(location._ | 0, v0, v1)
  }
  uniform2iv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform2iv', 2, 'i')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 2 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform2i(loc, value[2 * i], value[2 * i + 1])
      }
      return
    }
    this.uniform2i(location, value[0], value[1])
  }

  uniform3f (location, v0, v1, v2) {
    if (!this._checkUniformValid(location, v0, 'uniform3f', 3, 'f')) return
    super.uniform3f(location._ | 0, v0, v1, v2)
  }
  uniform3fv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform3fv', 3, 'f')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 3 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform3f(loc, value[3 * i], value[3 * i + 1], value[3 * i + 2])
      }
      return
    }
    super.uniform3f(location._ | 0, value[0], value[1], value[2])
  }
  uniform3i (location, v0, v1, v2) {
    if (!this._checkUniformValid(location, v0, 'uniform3i', 3, 'i')) return
    super.uniform3i(location._ | 0, v0, v1, v2)
  }
  uniform3iv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform3iv', 3, 'i')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 3 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform3i(loc, value[3 * i], value[3 * i + 1], value[3 * i + 2])
      }
      return
    }
    this.uniform3i(location, value[0], value[1], value[2])
  }

  uniform4f (location, v0, v1, v2, v3) {
    if (!this._checkUniformValid(location, v0, 'uniform4f', 4, 'f')) return
    super.uniform4f(location._ | 0, v0, v1, v2, v3)
  }
  uniform4fv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform4fv', 4, 'f')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 4 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform4f(loc, value[4 * i], value[4 * i + 1], value[4 * i + 2], value[4 * i + 3])
      }
      return
    }
    super.uniform4f(location._ | 0, value[0], value[1], value[2], value[3])
  }
  uniform4i (location, v0, v1, v2, v3) {
    if (!this._checkUniformValid(location, v0, 'uniform4i', 4, 'i')) return
    super.uniform4i(location._ | 0, v0, v1, v2, v3)
  }
  uniform4iv (location, value) {
    if (!this._checkUniformValueValid(location, value, 'uniform4iv', 4, 'i')) return
    if (location._array) {
      const locs = location._array
      for (let i = 0; i < locs.length && 4 * i < value.length; ++i) {
        const loc = locs[i]
        super.uniform4i(loc, value[4 * i], value[4 * i + 1], value[4 * i + 2], value[4 * i + 3])
      }
      return
    }
    this.uniform4i(location, value[0], value[1], value[2], value[3])
  }

  _checkUniformMatrix (location, transpose, value, name, count) {
    if (!checkObject(location) ||
      typeof value !== 'object') {
      throw new TypeError(name + '(WebGLUniformLocation, Boolean, Array)')
    } else if (!!transpose ||
      typeof value !== 'object' ||
      value === null ||
      !value.length ||
      value.length % count * count !== 0) {
      this.setError(gl.INVALID_VALUE)
      return false
    }
    if (!location) {
      return false
    }
    if (!this._checkLocationActive(location)) {
      return false
    }

    if (value.length === count * count) {
      return true
    } else if (location._array) {
      return true
    }
    this.setError(gl.INVALID_VALUE)
    return false
  }
  uniformMatrix2fv (location, transpose, value) {
    if (!this._checkUniformMatrix(location, transpose, value, 'uniformMatrix2fv', 2)) return
    const data = new Float32Array(value)
    super.uniformMatrix2fv(
      location._ | 0,
      !!transpose,
      data)
  }
  uniformMatrix3fv (location, transpose, value) {
    if (!this._checkUniformMatrix(location, transpose, value, 'uniformMatrix3fv', 3)) return
    const data = new Float32Array(value)
    super.uniformMatrix3fv(
      location._ | 0,
      !!transpose,
      data)
  }
  uniformMatrix4fv (location, transpose, value) {
    if (!this._checkUniformMatrix(location, transpose, value, 'uniformMatrix4fv', 4)) return
    const data = new Float32Array(value)
    super.uniformMatrix4fv(
      location._ | 0,
      !!transpose,
      data)
  }

  vertexAttrib1f (index, v0) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[1] = data[2] = 0
    data[0] = v0
    return super.vertexAttrib1f(index | 0, +v0)
  }
  vertexAttrib2f (index, v0, v1) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[2] = 0
    data[1] = v1
    data[0] = v0
    return super.vertexAttrib2f(index | 0, +v0, +v1)
  }
  vertexAttrib3f (index, v0, v1, v2) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[2] = v2
    data[1] = v1
    data[0] = v0
    return super.vertexAttrib3f(index | 0, +v0, +v1, +v2)
  }
  vertexAttrib4f (index, v0, v1, v2, v3) {
    index |= 0
    if (!this._checkVertexIndex(index)) return
    const data = this._vertexAttribs[index]._data
    data[3] = v3
    data[2] = v2
    data[1] = v1
    data[0] = v0
    return super.vertexAttrib4f(index | 0, +v0, +v1, +v2, +v3)
  }

  vertexAttrib1fv (index, value) {
    if (typeof value !== 'object' || value === null || value.length < 1) {
      this.setError(gl.INVALID_OPERATION)
      return
    }
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[2] = 0
    data[1] = 0
    data[0] = value[0]
    return super.vertexAttrib1f(index | 0, +value[0])
  }
  vertexAttrib2fv (index, value) {
    if (typeof value !== 'object' || value === null || value.length < 2) {
      this.setError(gl.INVALID_OPERATION)
      return
    }
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[2] = 0
    data[1] = value[1]
    data[0] = value[0]
    return super.vertexAttrib2f(index | 0, +value[0], +value[1])
  }
  vertexAttrib3fv (index, value) {
    if (typeof value !== 'object' || value === null || value.length < 3) {
      this.setError(gl.INVALID_OPERATION)
      return
    }
    const data = this._vertexAttribs[index]._data
    data[3] = 1
    data[2] = value[2]
    data[1] = value[1]
    data[0] = value[0]
    return super.vertexAttrib3f(index | 0, +value[0], +value[1], +value[2])
  }
  vertexAttrib4fv (index, value) {
    if (typeof value !== 'object' || value === null || value.length < 4) {
      this.setError(gl.INVALID_OPERATION)
      return
    }
    const data = this._vertexAttribs[index]._data
    data[3] = value[3]
    data[2] = value[2]
    data[1] = value[1]
    data[0] = value[0]
    return super.vertexAttrib4f(index | 0, +value[0], +value[1], +value[2], +value[3])
  }
}

module.exports = { WebGLRenderingContext, wrapContext }

},{"../../package.json":30,"./extensions/angle-instanced-arrays":32,"./extensions/oes-element-index-unit":33,"./extensions/oes-texture-float":34,"./extensions/stackgl-destroy-context":35,"./extensions/stackgl-resize-drawing-buffer":36,"./extensions/webgl-draw-buffers":37,"./native-gl":39,"./utils":41,"./webgl-active-info":42,"./webgl-buffer":43,"./webgl-drawing-buffer-wrapper":45,"./webgl-framebuffer":46,"./webgl-program":47,"./webgl-renderbuffer":48,"./webgl-shader":51,"./webgl-shader-precision-format":50,"./webgl-texture":53,"./webgl-uniform-location":54,"bit-twiddle":27,"glsl-tokenizer/string":62}],50:[function(require,module,exports){
class WebGLShaderPrecisionFormat {
  constructor (_) {
    this.rangeMin = _.rangeMin
    this.rangeMax = _.rangeMax
    this.precision = _.precision
  }
}

module.exports = { WebGLShaderPrecisionFormat }

},{}],51:[function(require,module,exports){
const { gl } = require('./native-gl')
const { Linkable } = require('./linkable')

class WebGLShader extends Linkable {
  constructor (_, ctx, type) {
    super(_)
    this._type = type
    this._ctx = ctx
    this._source = ''
    this._compileStatus = false
    this._compileInfo = ''
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._shaders[this._ | 0]
    gl.deleteShader.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLShader }

},{"./linkable":38,"./native-gl":39}],52:[function(require,module,exports){
class WebGLTextureUnit {
  constructor (ctx, idx) {
    this._ctx = ctx
    this._idx = idx
    this._mode = 0
    this._bind2D = null
    this._bindCube = null
  }
}

module.exports = { WebGLTextureUnit }

},{}],53:[function(require,module,exports){
const { Linkable } = require('./linkable')
const { gl } = require('./native-gl')

class WebGLTexture extends Linkable {
  constructor (_, ctx) {
    super(_)
    this._ctx = ctx
    this._binding = 0
    this._levelWidth = new Int32Array(32)
    this._levelHeight = new Int32Array(32)
    this._format = 0
    this._type = 0
    this._complete = true
  }

  _performDelete () {
    const ctx = this._ctx
    delete ctx._textures[this._ | 0]
    gl.deleteTexture.call(ctx, this._ | 0)
  }
}

module.exports = { WebGLTexture }

},{"./linkable":38,"./native-gl":39}],54:[function(require,module,exports){
class WebGLUniformLocation {
  constructor (_, program, info) {
    this._ = _
    this._program = program
    this._linkCount = program._linkCount
    this._activeInfo = info
    this._array = null
  }
}

module.exports = { WebGLUniformLocation }

},{}],55:[function(require,module,exports){
const { gl } = require('./native-gl')

class WebGLVertexAttribute {
  constructor (ctx, idx) {
    this._ctx = ctx
    this._idx = idx
    this._isPointer = false
    this._pointerBuffer = null
    this._pointerOffset = 0
    this._pointerSize = 0
    this._pointerStride = 0
    this._pointerType = gl.FLOAT
    this._pointerNormal = false
    this._divisor = 0
    this._inputSize = 4
    this._inputStride = 0
    this._data = new Float32Array([0, 0, 0, 1])
  }
}

module.exports = { WebGLVertexAttribute }

},{"./native-gl":39}],56:[function(require,module,exports){
module.exports = tokenize

var literals100 = require('./lib/literals')
  , operators = require('./lib/operators')
  , builtins100 = require('./lib/builtins')
  , literals300es = require('./lib/literals-300es')
  , builtins300es = require('./lib/builtins-300es')

var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted
  , BLOCK_COMMENT = 0
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10
  , HEX = 11

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
  , 'integer'
]

function tokenize(opt) {
  var i = 0
    , total = 0
    , mode = NORMAL
    , c
    , last
    , content = []
    , tokens = []
    , token_idx = 0
    , token_offs = 0
    , line = 1
    , col = 0
    , start = 0
    , isnum = false
    , isoperator = false
    , input = ''
    , len

  opt = opt || {}
  var allBuiltins = builtins100
  var allLiterals = literals100
  if (opt.version === '300 es') {
    allBuiltins = builtins300es
    allLiterals = literals300es
  }

  // cache by name
  var builtinsDict = {}, literalsDict = {}
  for (var i = 0; i < allBuiltins.length; i++) {
    builtinsDict[allBuiltins[i]] = true
  }
  for (var i = 0; i < allLiterals.length; i++) {
    literalsDict[allLiterals[i]] = true
  }

  return function(data) {
    tokens = []
    if (data !== null) return write(data)
    return end()
  }

  function token(data) {
    if (data.length) {
      tokens.push({
        type: map[mode]
      , data: data
      , position: start
      , line: line
      , column: col
      })
    }
  }

  function write(chunk) {
    i = 0

    if (chunk.toString) chunk = chunk.toString()

    input += chunk.replace(/\r\n/g, '\n')
    len = input.length


    var last

    while(c = input[i], i < len) {
      last = i

      switch(mode) {
        case BLOCK_COMMENT: i = block_comment(); break
        case LINE_COMMENT: i = line_comment(); break
        case PREPROCESSOR: i = preprocessor(); break
        case OPERATOR: i = operator(); break
        case INTEGER: i = integer(); break
        case HEX: i = hex(); break
        case FLOAT: i = decimal(); break
        case TOKEN: i = readtoken(); break
        case WHITESPACE: i = whitespace(); break
        case NORMAL: i = normal(); break
      }

      if(last !== i) {
        switch(input[last]) {
          case '\n': col = 0; ++line; break
          default: ++col; break
        }
      }
    }

    total += i
    input = input.slice(i)
    return tokens
  }

  function end(chunk) {
    if(content.length) {
      token(content.join(''))
    }

    mode = EOF
    token('(eof)')
    return tokens
  }

  function normal() {
    content = content.length ? [] : content

    if(last === '/' && c === '*') {
      start = total + i - 1
      mode = BLOCK_COMMENT
      last = c
      return i + 1
    }

    if(last === '/' && c === '/') {
      start = total + i - 1
      mode = LINE_COMMENT
      last = c
      return i + 1
    }

    if(c === '#') {
      mode = PREPROCESSOR
      start = total + i
      return i
    }

    if(/\s/.test(c)) {
      mode = WHITESPACE
      start = total + i
      return i
    }

    isnum = /\d/.test(c)
    isoperator = /[^\w_]/.test(c)

    start = total + i
    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
    return i
  }

  function whitespace() {
    if(/[^\s]/g.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function preprocessor() {
    if((c === '\r' || c === '\n') && last !== '\\') {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function line_comment() {
    return preprocessor()
  }

  function block_comment() {
    if(c === '/' && last === '*') {
      content.push(c)
      token(content.join(''))
      mode = NORMAL
      return i + 1
    }

    content.push(c)
    last = c
    return i + 1
  }

  function operator() {
    if(last === '.' && /\d/.test(c)) {
      mode = FLOAT
      return i
    }

    if(last === '/' && c === '*') {
      mode = BLOCK_COMMENT
      return i
    }

    if(last === '/' && c === '/') {
      mode = LINE_COMMENT
      return i
    }

    if(c === '.' && content.length) {
      while(determine_operator(content));

      mode = FLOAT
      return i
    }

    if(c === ';' || c === ')' || c === '(') {
      if(content.length) while(determine_operator(content));
      token(c)
      mode = NORMAL
      return i + 1
    }

    var is_composite_operator = content.length === 2 && c !== '='
    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
      while(determine_operator(content));
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function determine_operator(buf) {
    var j = 0
      , idx
      , res

    do {
      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
      res = operators[idx]

      if(idx === -1) {
        if(j-- + buf.length > 0) continue
        res = buf.slice(0, 1).join('')
      }

      token(res)

      start += res.length
      content = content.slice(res.length)
      return content.length
    } while(1)
  }

  function hex() {
    if(/[^a-fA-F0-9]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function integer() {
    if(c === '.') {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(c === 'x' && content.length === 1 && content[0] === '0') {
      mode = HEX
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function decimal() {
    if(c === 'f') {
      content.push(c)
      last = c
      i += 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      last = c
      return i + 1
    }

    if ((c === '-' || c === '+') && /[eE]/.test(last)) {
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function readtoken() {
    if(/[^\d\w_]/.test(c)) {
      var contentstr = content.join('')
      if(literalsDict[contentstr]) {
        mode = KEYWORD
      } else if(builtinsDict[contentstr]) {
        mode = BUILTIN
      } else {
        mode = IDENT
      }
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }
}

},{"./lib/builtins":58,"./lib/builtins-300es":57,"./lib/literals":60,"./lib/literals-300es":59,"./lib/operators":61}],57:[function(require,module,exports){
// 300es builtins/reserved words that were previously valid in v100
var v100 = require('./builtins')

// The texture2D|Cube functions have been removed
// And the gl_ features are updated
v100 = v100.slice().filter(function (b) {
  return !/^(gl\_|texture)/.test(b)
})

module.exports = v100.concat([
  // the updated gl_ constants
    'gl_VertexID'
  , 'gl_InstanceID'
  , 'gl_Position'
  , 'gl_PointSize'
  , 'gl_FragCoord'
  , 'gl_FrontFacing'
  , 'gl_FragDepth'
  , 'gl_PointCoord'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexUniformVectors'
  , 'gl_MaxVertexOutputVectors'
  , 'gl_MaxFragmentInputVectors'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxFragmentUniformVectors'
  , 'gl_MaxDrawBuffers'
  , 'gl_MinProgramTexelOffset'
  , 'gl_MaxProgramTexelOffset'
  , 'gl_DepthRangeParameters'
  , 'gl_DepthRange'

  // other builtins
  , 'trunc'
  , 'round'
  , 'roundEven'
  , 'isnan'
  , 'isinf'
  , 'floatBitsToInt'
  , 'floatBitsToUint'
  , 'intBitsToFloat'
  , 'uintBitsToFloat'
  , 'packSnorm2x16'
  , 'unpackSnorm2x16'
  , 'packUnorm2x16'
  , 'unpackUnorm2x16'
  , 'packHalf2x16'
  , 'unpackHalf2x16'
  , 'outerProduct'
  , 'transpose'
  , 'determinant'
  , 'inverse'
  , 'texture'
  , 'textureSize'
  , 'textureProj'
  , 'textureLod'
  , 'textureOffset'
  , 'texelFetch'
  , 'texelFetchOffset'
  , 'textureProjOffset'
  , 'textureLodOffset'
  , 'textureProjLod'
  , 'textureProjLodOffset'
  , 'textureGrad'
  , 'textureGradOffset'
  , 'textureProjGrad'
  , 'textureProjGradOffset'
])

},{"./builtins":58}],58:[function(require,module,exports){
module.exports = [
  // Keep this list sorted
  'abs'
  , 'acos'
  , 'all'
  , 'any'
  , 'asin'
  , 'atan'
  , 'ceil'
  , 'clamp'
  , 'cos'
  , 'cross'
  , 'dFdx'
  , 'dFdy'
  , 'degrees'
  , 'distance'
  , 'dot'
  , 'equal'
  , 'exp'
  , 'exp2'
  , 'faceforward'
  , 'floor'
  , 'fract'
  , 'gl_BackColor'
  , 'gl_BackLightModelProduct'
  , 'gl_BackLightProduct'
  , 'gl_BackMaterial'
  , 'gl_BackSecondaryColor'
  , 'gl_ClipPlane'
  , 'gl_ClipVertex'
  , 'gl_Color'
  , 'gl_DepthRange'
  , 'gl_DepthRangeParameters'
  , 'gl_EyePlaneQ'
  , 'gl_EyePlaneR'
  , 'gl_EyePlaneS'
  , 'gl_EyePlaneT'
  , 'gl_Fog'
  , 'gl_FogCoord'
  , 'gl_FogFragCoord'
  , 'gl_FogParameters'
  , 'gl_FragColor'
  , 'gl_FragCoord'
  , 'gl_FragData'
  , 'gl_FragDepth'
  , 'gl_FragDepthEXT'
  , 'gl_FrontColor'
  , 'gl_FrontFacing'
  , 'gl_FrontLightModelProduct'
  , 'gl_FrontLightProduct'
  , 'gl_FrontMaterial'
  , 'gl_FrontSecondaryColor'
  , 'gl_LightModel'
  , 'gl_LightModelParameters'
  , 'gl_LightModelProducts'
  , 'gl_LightProducts'
  , 'gl_LightSource'
  , 'gl_LightSourceParameters'
  , 'gl_MaterialParameters'
  , 'gl_MaxClipPlanes'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxDrawBuffers'
  , 'gl_MaxFragmentUniformComponents'
  , 'gl_MaxLights'
  , 'gl_MaxTextureCoords'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxTextureUnits'
  , 'gl_MaxVaryingFloats'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxVertexUniformComponents'
  , 'gl_ModelViewMatrix'
  , 'gl_ModelViewMatrixInverse'
  , 'gl_ModelViewMatrixInverseTranspose'
  , 'gl_ModelViewMatrixTranspose'
  , 'gl_ModelViewProjectionMatrix'
  , 'gl_ModelViewProjectionMatrixInverse'
  , 'gl_ModelViewProjectionMatrixInverseTranspose'
  , 'gl_ModelViewProjectionMatrixTranspose'
  , 'gl_MultiTexCoord0'
  , 'gl_MultiTexCoord1'
  , 'gl_MultiTexCoord2'
  , 'gl_MultiTexCoord3'
  , 'gl_MultiTexCoord4'
  , 'gl_MultiTexCoord5'
  , 'gl_MultiTexCoord6'
  , 'gl_MultiTexCoord7'
  , 'gl_Normal'
  , 'gl_NormalMatrix'
  , 'gl_NormalScale'
  , 'gl_ObjectPlaneQ'
  , 'gl_ObjectPlaneR'
  , 'gl_ObjectPlaneS'
  , 'gl_ObjectPlaneT'
  , 'gl_Point'
  , 'gl_PointCoord'
  , 'gl_PointParameters'
  , 'gl_PointSize'
  , 'gl_Position'
  , 'gl_ProjectionMatrix'
  , 'gl_ProjectionMatrixInverse'
  , 'gl_ProjectionMatrixInverseTranspose'
  , 'gl_ProjectionMatrixTranspose'
  , 'gl_SecondaryColor'
  , 'gl_TexCoord'
  , 'gl_TextureEnvColor'
  , 'gl_TextureMatrix'
  , 'gl_TextureMatrixInverse'
  , 'gl_TextureMatrixInverseTranspose'
  , 'gl_TextureMatrixTranspose'
  , 'gl_Vertex'
  , 'greaterThan'
  , 'greaterThanEqual'
  , 'inversesqrt'
  , 'length'
  , 'lessThan'
  , 'lessThanEqual'
  , 'log'
  , 'log2'
  , 'matrixCompMult'
  , 'max'
  , 'min'
  , 'mix'
  , 'mod'
  , 'normalize'
  , 'not'
  , 'notEqual'
  , 'pow'
  , 'radians'
  , 'reflect'
  , 'refract'
  , 'sign'
  , 'sin'
  , 'smoothstep'
  , 'sqrt'
  , 'step'
  , 'tan'
  , 'texture2D'
  , 'texture2DLod'
  , 'texture2DProj'
  , 'texture2DProjLod'
  , 'textureCube'
  , 'textureCubeLod'
  , 'texture2DLodEXT'
  , 'texture2DProjLodEXT'
  , 'textureCubeLodEXT'
  , 'texture2DGradEXT'
  , 'texture2DProjGradEXT'
  , 'textureCubeGradEXT'
]

},{}],59:[function(require,module,exports){
var v100 = require('./literals')

module.exports = v100.slice().concat([
   'layout'
  , 'centroid'
  , 'smooth'
  , 'case'
  , 'mat2x2'
  , 'mat2x3'
  , 'mat2x4'
  , 'mat3x2'
  , 'mat3x3'
  , 'mat3x4'
  , 'mat4x2'
  , 'mat4x3'
  , 'mat4x4'
  , 'uvec2'
  , 'uvec3'
  , 'uvec4'
  , 'samplerCubeShadow'
  , 'sampler2DArray'
  , 'sampler2DArrayShadow'
  , 'isampler2D'
  , 'isampler3D'
  , 'isamplerCube'
  , 'isampler2DArray'
  , 'usampler2D'
  , 'usampler3D'
  , 'usamplerCube'
  , 'usampler2DArray'
  , 'coherent'
  , 'restrict'
  , 'readonly'
  , 'writeonly'
  , 'resource'
  , 'atomic_uint'
  , 'noperspective'
  , 'patch'
  , 'sample'
  , 'subroutine'
  , 'common'
  , 'partition'
  , 'active'
  , 'filter'
  , 'image1D'
  , 'image2D'
  , 'image3D'
  , 'imageCube'
  , 'iimage1D'
  , 'iimage2D'
  , 'iimage3D'
  , 'iimageCube'
  , 'uimage1D'
  , 'uimage2D'
  , 'uimage3D'
  , 'uimageCube'
  , 'image1DArray'
  , 'image2DArray'
  , 'iimage1DArray'
  , 'iimage2DArray'
  , 'uimage1DArray'
  , 'uimage2DArray'
  , 'image1DShadow'
  , 'image2DShadow'
  , 'image1DArrayShadow'
  , 'image2DArrayShadow'
  , 'imageBuffer'
  , 'iimageBuffer'
  , 'uimageBuffer'
  , 'sampler1DArray'
  , 'sampler1DArrayShadow'
  , 'isampler1D'
  , 'isampler1DArray'
  , 'usampler1D'
  , 'usampler1DArray'
  , 'isampler2DRect'
  , 'usampler2DRect'
  , 'samplerBuffer'
  , 'isamplerBuffer'
  , 'usamplerBuffer'
  , 'sampler2DMS'
  , 'isampler2DMS'
  , 'usampler2DMS'
  , 'sampler2DMSArray'
  , 'isampler2DMSArray'
  , 'usampler2DMSArray'
])

},{"./literals":60}],60:[function(require,module,exports){
module.exports = [
  // current
    'precision'
  , 'highp'
  , 'mediump'
  , 'lowp'
  , 'attribute'
  , 'const'
  , 'uniform'
  , 'varying'
  , 'break'
  , 'continue'
  , 'do'
  , 'for'
  , 'while'
  , 'if'
  , 'else'
  , 'in'
  , 'out'
  , 'inout'
  , 'float'
  , 'int'
  , 'uint'
  , 'void'
  , 'bool'
  , 'true'
  , 'false'
  , 'discard'
  , 'return'
  , 'mat2'
  , 'mat3'
  , 'mat4'
  , 'vec2'
  , 'vec3'
  , 'vec4'
  , 'ivec2'
  , 'ivec3'
  , 'ivec4'
  , 'bvec2'
  , 'bvec3'
  , 'bvec4'
  , 'sampler1D'
  , 'sampler2D'
  , 'sampler3D'
  , 'samplerCube'
  , 'sampler1DShadow'
  , 'sampler2DShadow'
  , 'struct'

  // future
  , 'asm'
  , 'class'
  , 'union'
  , 'enum'
  , 'typedef'
  , 'template'
  , 'this'
  , 'packed'
  , 'goto'
  , 'switch'
  , 'default'
  , 'inline'
  , 'noinline'
  , 'volatile'
  , 'public'
  , 'static'
  , 'extern'
  , 'external'
  , 'interface'
  , 'long'
  , 'short'
  , 'double'
  , 'half'
  , 'fixed'
  , 'unsigned'
  , 'input'
  , 'output'
  , 'hvec2'
  , 'hvec3'
  , 'hvec4'
  , 'dvec2'
  , 'dvec3'
  , 'dvec4'
  , 'fvec2'
  , 'fvec3'
  , 'fvec4'
  , 'sampler2DRect'
  , 'sampler3DRect'
  , 'sampler2DRectShadow'
  , 'sizeof'
  , 'cast'
  , 'namespace'
  , 'using'
]

},{}],61:[function(require,module,exports){
module.exports = [
    '<<='
  , '>>='
  , '++'
  , '--'
  , '<<'
  , '>>'
  , '<='
  , '>='
  , '=='
  , '!='
  , '&&'
  , '||'
  , '+='
  , '-='
  , '*='
  , '/='
  , '%='
  , '&='
  , '^^'
  , '^='
  , '|='
  , '('
  , ')'
  , '['
  , ']'
  , '.'
  , '!'
  , '~'
  , '*'
  , '/'
  , '%'
  , '+'
  , '-'
  , '<'
  , '>'
  , '&'
  , '^'
  , '|'
  , '?'
  , ':'
  , '='
  , ','
  , ';'
  , '{'
  , '}'
]

},{}],62:[function(require,module,exports){
var tokenize = require('./index')

module.exports = tokenizeString

function tokenizeString(str, opt) {
  var generator = tokenize(opt)
  var tokens = []

  tokens = tokens.concat(generator(str))
  tokens = tokens.concat(generator(null))

  return tokens
}

},{"./index":56}],63:[function(require,module,exports){
/*jshint node:true */
/* globals define */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

*/

'use strict';

/**
The following batches are equivalent:

var beautify_js = require('js-beautify');
var beautify_js = require('js-beautify').js;
var beautify_js = require('js-beautify').js_beautify;

var beautify_css = require('js-beautify').css;
var beautify_css = require('js-beautify').css_beautify;

var beautify_html = require('js-beautify').html;
var beautify_html = require('js-beautify').html_beautify;

All methods returned accept two arguments, the source string and an options object.
**/

function get_beautify(js_beautify, css_beautify, html_beautify) {
  // the default is js
  var beautify = function(src, config) {
    return js_beautify.js_beautify(src, config);
  };

  // short aliases
  beautify.js = js_beautify.js_beautify;
  beautify.css = css_beautify.css_beautify;
  beautify.html = html_beautify.html_beautify;

  // legacy aliases
  beautify.js_beautify = js_beautify.js_beautify;
  beautify.css_beautify = css_beautify.css_beautify;
  beautify.html_beautify = html_beautify.html_beautify;

  return beautify;
}

if (typeof define === "function" && define.amd) {
  // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
  define([
    "./lib/beautify",
    "./lib/beautify-css",
    "./lib/beautify-html"
  ], function(js_beautify, css_beautify, html_beautify) {
    return get_beautify(js_beautify, css_beautify, html_beautify);
  });
} else {
  (function(mod) {
    var beautifier = require('./src/index');
    beautifier.js_beautify = beautifier.js;
    beautifier.css_beautify = beautifier.css;
    beautifier.html_beautify = beautifier.html;

    mod.exports = get_beautify(beautifier, beautifier, beautifier);

  })(module);
}
},{"./src/index":81}],64:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Directives(start_block_pattern, end_block_pattern) {
  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
  this.__directive_pattern = / (\w+)[:](\w+)/g;

  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
}

Directives.prototype.get_directives = function(text) {
  if (!text.match(this.__directives_block_pattern)) {
    return null;
  }

  var directives = {};
  this.__directive_pattern.lastIndex = 0;
  var directive_match = this.__directive_pattern.exec(text);

  while (directive_match) {
    directives[directive_match[1]] = directive_match[2];
    directive_match = this.__directive_pattern.exec(text);
  }

  return directives;
};

Directives.prototype.readIgnored = function(input) {
  return input.readUntilAfter(this.__directives_end_ignore_pattern);
};


module.exports.Directives = Directives;

},{}],65:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

function InputScanner(input_string) {
  this.__input = input_string || '';
  this.__input_length = this.__input.length;
  this.__position = 0;
}

InputScanner.prototype.restart = function() {
  this.__position = 0;
};

InputScanner.prototype.back = function() {
  if (this.__position > 0) {
    this.__position -= 1;
  }
};

InputScanner.prototype.hasNext = function() {
  return this.__position < this.__input_length;
};

InputScanner.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__input.charAt(this.__position);
    this.__position += 1;
  }
  return val;
};

InputScanner.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__input_length) {
    val = this.__input.charAt(index);
  }
  return val;
};

// This is a JavaScript only helper function (not in python)
// Javascript doesn't have a match method
// and not all implementation support "sticky" flag.
// If they do not support sticky then both this.match() and this.test() method
// must get the match and check the index of the match.
// If sticky is supported and set, this method will use it.
// Otherwise it will check that global is set, and fall back to the slower method.
InputScanner.prototype.__match = function(pattern, index) {
  pattern.lastIndex = index;
  var pattern_match = pattern.exec(this.__input);

  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
    if (pattern_match.index !== index) {
      pattern_match = null;
    }
  }

  return pattern_match;
};

InputScanner.prototype.test = function(pattern, index) {
  index = index || 0;
  index += this.__position;

  if (index >= 0 && index < this.__input_length) {
    return !!this.__match(pattern, index);
  } else {
    return false;
  }
};

InputScanner.prototype.testChar = function(pattern, index) {
  // test one character regex match
  var val = this.peek(index);
  pattern.lastIndex = 0;
  return val !== null && pattern.test(val);
};

InputScanner.prototype.match = function(pattern) {
  var pattern_match = this.__match(pattern, this.__position);
  if (pattern_match) {
    this.__position += pattern_match[0].length;
  } else {
    pattern_match = null;
  }
  return pattern_match;
};

InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
  var val = '';
  var match;
  if (starting_pattern) {
    match = this.match(starting_pattern);
    if (match) {
      val += match[0];
    }
  }
  if (until_pattern && (match || !starting_pattern)) {
    val += this.readUntil(until_pattern, until_after);
  }
  return val;
};

InputScanner.prototype.readUntil = function(pattern, until_after) {
  var val = '';
  var match_index = this.__position;
  pattern.lastIndex = this.__position;
  var pattern_match = pattern.exec(this.__input);
  if (pattern_match) {
    match_index = pattern_match.index;
    if (until_after) {
      match_index += pattern_match[0].length;
    }
  } else {
    match_index = this.__input_length;
  }

  val = this.__input.substring(this.__position, match_index);
  this.__position = match_index;
  return val;
};

InputScanner.prototype.readUntilAfter = function(pattern) {
  return this.readUntil(pattern, true);
};

InputScanner.prototype.get_regexp = function(pattern, match_from) {
  var result = null;
  var flags = 'g';
  if (match_from && regexp_has_sticky) {
    flags = 'y';
  }
  // strings are converted to regexp
  if (typeof pattern === "string" && pattern !== '') {
    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    result = new RegExp(pattern, flags);
  } else if (pattern) {
    result = new RegExp(pattern.source, flags);
  }
  return result;
};

InputScanner.prototype.get_literal_regexp = function(literal_string) {
  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
};

/* css beautifier legacy helpers */
InputScanner.prototype.peekUntilAfter = function(pattern) {
  var start = this.__position;
  var val = this.readUntilAfter(pattern);
  this.__position = start;
  return val;
};

InputScanner.prototype.lookBack = function(testVal) {
  var start = this.__position - 1;
  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
    .toLowerCase() === testVal;
};

module.exports.InputScanner = InputScanner;

},{}],66:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Options(options, merge_child_field) {
  this.raw_options = _mergeOpts(options, merge_child_field);

  // Support passing the source text back with no change
  this.disabled = this._get_boolean('disabled');

  this.eol = this._get_characters('eol', 'auto');
  this.end_with_newline = this._get_boolean('end_with_newline');
  this.indent_size = this._get_number('indent_size', 4);
  this.indent_char = this._get_characters('indent_char', ' ');
  this.indent_level = this._get_number('indent_level');

  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
  if (!this.preserve_newlines) {
    this.max_preserve_newlines = 0;
  }

  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
  if (this.indent_with_tabs) {
    this.indent_char = '\t';

    // indent_size behavior changed after 1.8.6
    // It used to be that indent_size would be
    // set to 1 for indent_with_tabs. That is no longer needed and
    // actually doesn't make sense - why not use spaces? Further,
    // that might produce unexpected behavior - tabs being used
    // for single-column alignment. So, when indent_with_tabs is true
    // and indent_size is 1, reset indent_size to 4.
    if (this.indent_size === 1) {
      this.indent_size = 4;
    }
  }

  // Backwards compat with 1.3.x
  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

  this.indent_empty_lines = this._get_boolean('indent_empty_lines');

  // valid templating languages ['django', 'erb', 'handlebars', 'php']
  // For now, 'auto' = all off for javascript, all on for html (and inline javascript).
  // other values ignored
  this.templating = this._get_selection_list('templating', ['auto', 'none', 'django', 'erb', 'handlebars', 'php'], ['auto']);
}

Options.prototype._get_array = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || [];
  if (typeof option_value === 'object') {
    if (option_value !== null && typeof option_value.concat === 'function') {
      result = option_value.concat();
    }
  } else if (typeof option_value === 'string') {
    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
  }
  return result;
};

Options.prototype._get_boolean = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = option_value === undefined ? !!default_value : !!option_value;
  return result;
};

Options.prototype._get_characters = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || '';
  if (typeof option_value === 'string') {
    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
  }
  return result;
};

Options.prototype._get_number = function(name, default_value) {
  var option_value = this.raw_options[name];
  default_value = parseInt(default_value, 10);
  if (isNaN(default_value)) {
    default_value = 0;
  }
  var result = parseInt(option_value, 10);
  if (isNaN(result)) {
    result = default_value;
  }
  return result;
};

Options.prototype._get_selection = function(name, selection_list, default_value) {
  var result = this._get_selection_list(name, selection_list, default_value);
  if (result.length !== 1) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result[0];
};


Options.prototype._get_selection_list = function(name, selection_list, default_value) {
  if (!selection_list || selection_list.length === 0) {
    throw new Error("Selection list cannot be empty.");
  }

  default_value = default_value || [selection_list[0]];
  if (!this._is_valid_selection(default_value, selection_list)) {
    throw new Error("Invalid Default Value!");
  }

  var result = this._get_array(name, default_value);
  if (!this._is_valid_selection(result, selection_list)) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result;
};

Options.prototype._is_valid_selection = function(result, selection_list) {
  return result.length && selection_list.length &&
    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
};


// merges child options up with the parent options object
// Example: obj = {a: 1, b: {a: 2}}
//          mergeOpts(obj, 'b')
//
//          Returns: {a: 2}
function _mergeOpts(allOptions, childFieldName) {
  var finalOpts = {};
  allOptions = _normalizeOpts(allOptions);
  var name;

  for (name in allOptions) {
    if (name !== childFieldName) {
      finalOpts[name] = allOptions[name];
    }
  }

  //merge in the per type settings for the childFieldName
  if (childFieldName && allOptions[childFieldName]) {
    for (name in allOptions[childFieldName]) {
      finalOpts[name] = allOptions[childFieldName][name];
    }
  }
  return finalOpts;
}

function _normalizeOpts(options) {
  var convertedOpts = {};
  var key;

  for (key in options) {
    var newKey = key.replace(/-/g, "_");
    convertedOpts[newKey] = options[key];
  }
  return convertedOpts;
}

module.exports.Options = Options;
module.exports.normalizeOpts = _normalizeOpts;
module.exports.mergeOpts = _mergeOpts;

},{}],67:[function(require,module,exports){
/*jshint node:true */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function OutputLine(parent) {
  this.__parent = parent;
  this.__character_count = 0;
  // use indent_count as a marker for this.__lines that have preserved indentation
  this.__indent_count = -1;
  this.__alignment_count = 0;
  this.__wrap_point_index = 0;
  this.__wrap_point_character_count = 0;
  this.__wrap_point_indent_count = -1;
  this.__wrap_point_alignment_count = 0;

  this.__items = [];
}

OutputLine.prototype.clone_empty = function() {
  var line = new OutputLine(this.__parent);
  line.set_indent(this.__indent_count, this.__alignment_count);
  return line;
};

OutputLine.prototype.item = function(index) {
  if (index < 0) {
    return this.__items[this.__items.length + index];
  } else {
    return this.__items[index];
  }
};

OutputLine.prototype.has_match = function(pattern) {
  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
    if (this.__items[lastCheckedOutput].match(pattern)) {
      return true;
    }
  }
  return false;
};

OutputLine.prototype.set_indent = function(indent, alignment) {
  if (this.is_empty()) {
    this.__indent_count = indent || 0;
    this.__alignment_count = alignment || 0;
    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
  }
};

OutputLine.prototype._set_wrap_point = function() {
  if (this.__parent.wrap_line_length) {
    this.__wrap_point_index = this.__items.length;
    this.__wrap_point_character_count = this.__character_count;
    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
  }
};

OutputLine.prototype._should_wrap = function() {
  return this.__wrap_point_index &&
    this.__character_count > this.__parent.wrap_line_length &&
    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
};

OutputLine.prototype._allow_wrap = function() {
  if (this._should_wrap()) {
    this.__parent.add_new_line();
    var next = this.__parent.current_line;
    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
    next.__items = this.__items.slice(this.__wrap_point_index);
    this.__items = this.__items.slice(0, this.__wrap_point_index);

    next.__character_count += this.__character_count - this.__wrap_point_character_count;
    this.__character_count = this.__wrap_point_character_count;

    if (next.__items[0] === " ") {
      next.__items.splice(0, 1);
      next.__character_count -= 1;
    }
    return true;
  }
  return false;
};

OutputLine.prototype.is_empty = function() {
  return this.__items.length === 0;
};

OutputLine.prototype.last = function() {
  if (!this.is_empty()) {
    return this.__items[this.__items.length - 1];
  } else {
    return null;
  }
};

OutputLine.prototype.push = function(item) {
  this.__items.push(item);
  var last_newline_index = item.lastIndexOf('\n');
  if (last_newline_index !== -1) {
    this.__character_count = item.length - last_newline_index;
  } else {
    this.__character_count += item.length;
  }
};

OutputLine.prototype.pop = function() {
  var item = null;
  if (!this.is_empty()) {
    item = this.__items.pop();
    this.__character_count -= item.length;
  }
  return item;
};


OutputLine.prototype._remove_indent = function() {
  if (this.__indent_count > 0) {
    this.__indent_count -= 1;
    this.__character_count -= this.__parent.indent_size;
  }
};

OutputLine.prototype._remove_wrap_indent = function() {
  if (this.__wrap_point_indent_count > 0) {
    this.__wrap_point_indent_count -= 1;
  }
};
OutputLine.prototype.trim = function() {
  while (this.last() === ' ') {
    this.__items.pop();
    this.__character_count -= 1;
  }
};

OutputLine.prototype.toString = function() {
  var result = '';
  if (this.is_empty()) {
    if (this.__parent.indent_empty_lines) {
      result = this.__parent.get_indent_string(this.__indent_count);
    }
  } else {
    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
    result += this.__items.join('');
  }
  return result;
};

function IndentStringCache(options, baseIndentString) {
  this.__cache = [''];
  this.__indent_size = options.indent_size;
  this.__indent_string = options.indent_char;
  if (!options.indent_with_tabs) {
    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
  }

  // Set to null to continue support for auto detection of base indent
  baseIndentString = baseIndentString || '';
  if (options.indent_level > 0) {
    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
  }

  this.__base_string = baseIndentString;
  this.__base_string_length = baseIndentString.length;
}

IndentStringCache.prototype.get_indent_size = function(indent, column) {
  var result = this.__base_string_length;
  column = column || 0;
  if (indent < 0) {
    result = 0;
  }
  result += indent * this.__indent_size;
  result += column;
  return result;
};

IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
  var result = this.__base_string;
  column = column || 0;
  if (indent_level < 0) {
    indent_level = 0;
    result = '';
  }
  column += indent_level * this.__indent_size;
  this.__ensure_cache(column);
  result += this.__cache[column];
  return result;
};

IndentStringCache.prototype.__ensure_cache = function(column) {
  while (column >= this.__cache.length) {
    this.__add_column();
  }
};

IndentStringCache.prototype.__add_column = function() {
  var column = this.__cache.length;
  var indent = 0;
  var result = '';
  if (this.__indent_size && column >= this.__indent_size) {
    indent = Math.floor(column / this.__indent_size);
    column -= indent * this.__indent_size;
    result = new Array(indent + 1).join(this.__indent_string);
  }
  if (column) {
    result += new Array(column + 1).join(' ');
  }

  this.__cache.push(result);
};

function Output(options, baseIndentString) {
  this.__indent_cache = new IndentStringCache(options, baseIndentString);
  this.raw = false;
  this._end_with_newline = options.end_with_newline;
  this.indent_size = options.indent_size;
  this.wrap_line_length = options.wrap_line_length;
  this.indent_empty_lines = options.indent_empty_lines;
  this.__lines = [];
  this.previous_line = null;
  this.current_line = null;
  this.next_line = new OutputLine(this);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
  // initialize
  this.__add_outputline();
}

Output.prototype.__add_outputline = function() {
  this.previous_line = this.current_line;
  this.current_line = this.next_line.clone_empty();
  this.__lines.push(this.current_line);
};

Output.prototype.get_line_number = function() {
  return this.__lines.length;
};

Output.prototype.get_indent_string = function(indent, column) {
  return this.__indent_cache.get_indent_string(indent, column);
};

Output.prototype.get_indent_size = function(indent, column) {
  return this.__indent_cache.get_indent_size(indent, column);
};

Output.prototype.is_empty = function() {
  return !this.previous_line && this.current_line.is_empty();
};

Output.prototype.add_new_line = function(force_newline) {
  // never newline at the start of file
  // otherwise, newline only if we didn't just add one or we're forced
  if (this.is_empty() ||
    (!force_newline && this.just_added_newline())) {
    return false;
  }

  // if raw output is enabled, don't print additional newlines,
  // but still return True as though you had
  if (!this.raw) {
    this.__add_outputline();
  }
  return true;
};

Output.prototype.get_code = function(eol) {
  this.trim(true);

  // handle some edge cases where the last tokens
  // has text that ends with newline(s)
  var last_item = this.current_line.pop();
  if (last_item) {
    if (last_item[last_item.length - 1] === '\n') {
      last_item = last_item.replace(/\n+$/g, '');
    }
    this.current_line.push(last_item);
  }

  if (this._end_with_newline) {
    this.__add_outputline();
  }

  var sweet_code = this.__lines.join('\n');

  if (eol !== '\n') {
    sweet_code = sweet_code.replace(/[\n]/g, eol);
  }
  return sweet_code;
};

Output.prototype.set_wrap_point = function() {
  this.current_line._set_wrap_point();
};

Output.prototype.set_indent = function(indent, alignment) {
  indent = indent || 0;
  alignment = alignment || 0;

  // Next line stores alignment values
  this.next_line.set_indent(indent, alignment);

  // Never indent your first output indent at the start of the file
  if (this.__lines.length > 1) {
    this.current_line.set_indent(indent, alignment);
    return true;
  }

  this.current_line.set_indent();
  return false;
};

Output.prototype.add_raw_token = function(token) {
  for (var x = 0; x < token.newlines; x++) {
    this.__add_outputline();
  }
  this.current_line.set_indent(-1);
  this.current_line.push(token.whitespace_before);
  this.current_line.push(token.text);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
};

Output.prototype.add_token = function(printable_token) {
  this.__add_space_before_token();
  this.current_line.push(printable_token);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = this.current_line._allow_wrap();
};

Output.prototype.__add_space_before_token = function() {
  if (this.space_before_token && !this.just_added_newline()) {
    if (!this.non_breaking_space) {
      this.set_wrap_point();
    }
    this.current_line.push(' ');
  }
};

Output.prototype.remove_indent = function(index) {
  var output_length = this.__lines.length;
  while (index < output_length) {
    this.__lines[index]._remove_indent();
    index++;
  }
  this.current_line._remove_wrap_indent();
};

Output.prototype.trim = function(eat_newlines) {
  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

  this.current_line.trim();

  while (eat_newlines && this.__lines.length > 1 &&
    this.current_line.is_empty()) {
    this.__lines.pop();
    this.current_line = this.__lines[this.__lines.length - 1];
    this.current_line.trim();
  }

  this.previous_line = this.__lines.length > 1 ?
    this.__lines[this.__lines.length - 2] : null;
};

Output.prototype.just_added_newline = function() {
  return this.current_line.is_empty();
};

Output.prototype.just_added_blankline = function() {
  return this.is_empty() ||
    (this.current_line.is_empty() && this.previous_line.is_empty());
};

Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
  var index = this.__lines.length - 2;
  while (index >= 0) {
    var potentialEmptyLine = this.__lines[index];
    if (potentialEmptyLine.is_empty()) {
      break;
    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
      potentialEmptyLine.item(-1) !== ends_with) {
      this.__lines.splice(index + 1, 0, new OutputLine(this));
      this.previous_line = this.__lines[this.__lines.length - 2];
      break;
    }
    index--;
  }
};

module.exports.Output = Output;

},{}],68:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Pattern(input_scanner, parent) {
  this._input = input_scanner;
  this._starting_pattern = null;
  this._match_pattern = null;
  this._until_pattern = null;
  this._until_after = false;

  if (parent) {
    this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
    this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
    this._until_pattern = this._input.get_regexp(parent._until_pattern);
    this._until_after = parent._until_after;
  }
}

Pattern.prototype.read = function() {
  var result = this._input.read(this._starting_pattern);
  if (!this._starting_pattern || result) {
    result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
  }
  return result;
};

Pattern.prototype.read_match = function() {
  return this._input.match(this._match_pattern);
};

Pattern.prototype.until_after = function(pattern) {
  var result = this._create();
  result._until_after = true;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.until = function(pattern) {
  var result = this._create();
  result._until_after = false;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.starting_with = function(pattern) {
  var result = this._create();
  result._starting_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype.matching = function(pattern) {
  var result = this._create();
  result._match_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype._create = function() {
  return new Pattern(this._input, this);
};

Pattern.prototype._update = function() {};

module.exports.Pattern = Pattern;

},{}],69:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Pattern = require('./pattern').Pattern;


var template_names = {
  django: false,
  erb: false,
  handlebars: false,
  php: false
};

// This lets templates appear anywhere we would do a readUntil
// The cost is higher but it is pay to play.
function TemplatablePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  this.__template_pattern = null;
  this._disabled = Object.assign({}, template_names);
  this._excluded = Object.assign({}, template_names);

  if (parent) {
    this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
    this._excluded = Object.assign(this._excluded, parent._excluded);
    this._disabled = Object.assign(this._disabled, parent._disabled);
  }
  var pattern = new Pattern(input_scanner);
  this.__patterns = {
    handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
    handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
    handlebars: pattern.starting_with(/{{/).until_after(/}}/),
    php: pattern.starting_with(/<\?(?:[=]|php)/).until_after(/\?>/),
    erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
    // django coflicts with handlebars a bit.
    django: pattern.starting_with(/{%/).until_after(/%}/),
    django_value: pattern.starting_with(/{{/).until_after(/}}/),
    django_comment: pattern.starting_with(/{#/).until_after(/#}/)
  };
}
TemplatablePattern.prototype = new Pattern();

TemplatablePattern.prototype._create = function() {
  return new TemplatablePattern(this._input, this);
};

TemplatablePattern.prototype._update = function() {
  this.__set_templated_pattern();
};

TemplatablePattern.prototype.disable = function(language) {
  var result = this._create();
  result._disabled[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.read_options = function(options) {
  var result = this._create();
  for (var language in template_names) {
    result._disabled[language] = options.templating.indexOf(language) === -1;
  }
  result._update();
  return result;
};

TemplatablePattern.prototype.exclude = function(language) {
  var result = this._create();
  result._excluded[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.read = function() {
  var result = '';
  if (this._match_pattern) {
    result = this._input.read(this._starting_pattern);
  } else {
    result = this._input.read(this._starting_pattern, this.__template_pattern);
  }
  var next = this._read_template();
  while (next) {
    if (this._match_pattern) {
      next += this._input.read(this._match_pattern);
    } else {
      next += this._input.readUntil(this.__template_pattern);
    }
    result += next;
    next = this._read_template();
  }

  if (this._until_after) {
    result += this._input.readUntilAfter(this._until_pattern);
  }
  return result;
};

TemplatablePattern.prototype.__set_templated_pattern = function() {
  var items = [];

  if (!this._disabled.php) {
    items.push(this.__patterns.php._starting_pattern.source);
  }
  if (!this._disabled.handlebars) {
    items.push(this.__patterns.handlebars._starting_pattern.source);
  }
  if (!this._disabled.erb) {
    items.push(this.__patterns.erb._starting_pattern.source);
  }
  if (!this._disabled.django) {
    items.push(this.__patterns.django._starting_pattern.source);
    items.push(this.__patterns.django_value._starting_pattern.source);
    items.push(this.__patterns.django_comment._starting_pattern.source);
  }

  if (this._until_pattern) {
    items.push(this._until_pattern.source);
  }
  this.__template_pattern = this._input.get_regexp('(?:' + items.join('|') + ')');
};

TemplatablePattern.prototype._read_template = function() {
  var resulting_string = '';
  var c = this._input.peek();
  if (c === '<') {
    var peek1 = this._input.peek(1);
    //if we're in a comment, do something special
    // We treat all comments as literals, even more than preformatted tags
    // we just look for the appropriate close tag
    if (!this._disabled.php && !this._excluded.php && peek1 === '?') {
      resulting_string = resulting_string ||
        this.__patterns.php.read();
    }
    if (!this._disabled.erb && !this._excluded.erb && peek1 === '%') {
      resulting_string = resulting_string ||
        this.__patterns.erb.read();
    }
  } else if (c === '{') {
    if (!this._disabled.handlebars && !this._excluded.handlebars) {
      resulting_string = resulting_string ||
        this.__patterns.handlebars_comment.read();
      resulting_string = resulting_string ||
        this.__patterns.handlebars_unescaped.read();
      resulting_string = resulting_string ||
        this.__patterns.handlebars.read();
    }
    if (!this._disabled.django) {
      // django coflicts with handlebars a bit.
      if (!this._excluded.django && !this._excluded.handlebars) {
        resulting_string = resulting_string ||
          this.__patterns.django_value.read();
      }
      if (!this._excluded.django) {
        resulting_string = resulting_string ||
          this.__patterns.django_comment.read();
        resulting_string = resulting_string ||
          this.__patterns.django.read();
      }
    }
  }
  return resulting_string;
};


module.exports.TemplatablePattern = TemplatablePattern;

},{"./pattern":68}],70:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Token(type, text, newlines, whitespace_before) {
  this.type = type;
  this.text = text;

  // comments_before are
  // comments that have a new line before them
  // and may or may not have a newline after
  // this is a set of comments before
  this.comments_before = null; /* inline comment*/


  // this.comments_after =  new TokenStream(); // no new line before and newline after
  this.newlines = newlines || 0;
  this.whitespace_before = whitespace_before || '';
  this.parent = null;
  this.next = null;
  this.previous = null;
  this.opened = null;
  this.closed = null;
  this.directives = null;
}


module.exports.Token = Token;

},{}],71:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var InputScanner = require('../core/inputscanner').InputScanner;
var Token = require('../core/token').Token;
var TokenStream = require('../core/tokenstream').TokenStream;
var WhitespacePattern = require('./whitespacepattern').WhitespacePattern;

var TOKEN = {
  START: 'TK_START',
  RAW: 'TK_RAW',
  EOF: 'TK_EOF'
};

var Tokenizer = function(input_string, options) {
  this._input = new InputScanner(input_string);
  this._options = options || {};
  this.__tokens = null;

  this._patterns = {};
  this._patterns.whitespace = new WhitespacePattern(this._input);
};

Tokenizer.prototype.tokenize = function() {
  this._input.restart();
  this.__tokens = new TokenStream();

  this._reset();

  var current;
  var previous = new Token(TOKEN.START, '');
  var open_token = null;
  var open_stack = [];
  var comments = new TokenStream();

  while (previous.type !== TOKEN.EOF) {
    current = this._get_next_token(previous, open_token);
    while (this._is_comment(current)) {
      comments.add(current);
      current = this._get_next_token(previous, open_token);
    }

    if (!comments.isEmpty()) {
      current.comments_before = comments;
      comments = new TokenStream();
    }

    current.parent = open_token;

    if (this._is_opening(current)) {
      open_stack.push(open_token);
      open_token = current;
    } else if (open_token && this._is_closing(current, open_token)) {
      current.opened = open_token;
      open_token.closed = current;
      open_token = open_stack.pop();
      current.parent = open_token;
    }

    current.previous = previous;
    previous.next = current;

    this.__tokens.add(current);
    previous = current;
  }

  return this.__tokens;
};


Tokenizer.prototype._is_first_token = function() {
  return this.__tokens.isEmpty();
};

Tokenizer.prototype._reset = function() {};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  this._readWhitespace();
  var resulting_string = this._input.read(/.+/g);
  if (resulting_string) {
    return this._create_token(TOKEN.RAW, resulting_string);
  } else {
    return this._create_token(TOKEN.EOF, '');
  }
};

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_opening = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._create_token = function(type, text) {
  var token = new Token(type, text,
    this._patterns.whitespace.newline_count,
    this._patterns.whitespace.whitespace_before_token);
  return token;
};

Tokenizer.prototype._readWhitespace = function() {
  return this._patterns.whitespace.read();
};



module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;

},{"../core/inputscanner":65,"../core/token":70,"../core/tokenstream":72,"./whitespacepattern":73}],72:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function TokenStream(parent_token) {
  // private
  this.__tokens = [];
  this.__tokens_length = this.__tokens.length;
  this.__position = 0;
  this.__parent_token = parent_token;
}

TokenStream.prototype.restart = function() {
  this.__position = 0;
};

TokenStream.prototype.isEmpty = function() {
  return this.__tokens_length === 0;
};

TokenStream.prototype.hasNext = function() {
  return this.__position < this.__tokens_length;
};

TokenStream.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__tokens[this.__position];
    this.__position += 1;
  }
  return val;
};

TokenStream.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__tokens_length) {
    val = this.__tokens[index];
  }
  return val;
};

TokenStream.prototype.add = function(token) {
  if (this.__parent_token) {
    token.parent = this.__parent_token;
  }
  this.__tokens.push(token);
  this.__tokens_length += 1;
};

module.exports.TokenStream = TokenStream;

},{}],73:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Pattern = require('../core/pattern').Pattern;

function WhitespacePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  if (parent) {
    this._line_regexp = this._input.get_regexp(parent._line_regexp);
  } else {
    this.__set_whitespace_patterns('', '');
  }

  this.newline_count = 0;
  this.whitespace_before_token = '';
}
WhitespacePattern.prototype = new Pattern();

WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
  whitespace_chars += '\\t ';
  newline_chars += '\\n\\r';

  this._match_pattern = this._input.get_regexp(
    '[' + whitespace_chars + newline_chars + ']+', true);
  this._newline_regexp = this._input.get_regexp(
    '\\r\\n|[' + newline_chars + ']');
};

WhitespacePattern.prototype.read = function() {
  this.newline_count = 0;
  this.whitespace_before_token = '';

  var resulting_string = this._input.read(this._match_pattern);
  if (resulting_string === ' ') {
    this.whitespace_before_token = ' ';
  } else if (resulting_string) {
    var matches = this.__split(this._newline_regexp, resulting_string);
    this.newline_count = matches.length - 1;
    this.whitespace_before_token = matches[this.newline_count];
  }

  return resulting_string;
};

WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
  var result = this._create();
  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
  result._update();
  return result;
};

WhitespacePattern.prototype._create = function() {
  return new WhitespacePattern(this._input, this);
};

WhitespacePattern.prototype.__split = function(regexp, input_string) {
  regexp.lastIndex = 0;
  var start_index = 0;
  var result = [];
  var next_match = regexp.exec(input_string);
  while (next_match) {
    result.push(input_string.substring(start_index, next_match.index));
    start_index = next_match.index + next_match[0].length;
    next_match = regexp.exec(input_string);
  }

  if (start_index < input_string.length) {
    result.push(input_string.substring(start_index, input_string.length));
  } else {
    result.push('');
  }

  return result;
};



module.exports.WhitespacePattern = WhitespacePattern;

},{"../core/pattern":68}],74:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Options = require('./options').Options;
var Output = require('../core/output').Output;
var InputScanner = require('../core/inputscanner').InputScanner;
var Directives = require('../core/directives').Directives;

var directives_core = new Directives(/\/\*/, /\*\//);

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

// tokenizer
var whitespaceChar = /\s/;
var whitespacePattern = /(?:\s|\n)+/g;
var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;

function Beautifier(source_text, options) {
  this._source_text = source_text || '';
  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  this._options = new Options(options);
  this._ch = null;
  this._input = null;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
  this.NESTED_AT_RULE = {
    "@page": true,
    "@font-face": true,
    "@keyframes": true,
    // also in CONDITIONAL_GROUP_RULE below
    "@media": true,
    "@supports": true,
    "@document": true
  };
  this.CONDITIONAL_GROUP_RULE = {
    "@media": true,
    "@supports": true,
    "@document": true
  };

}

Beautifier.prototype.eatString = function(endChars) {
  var result = '';
  this._ch = this._input.next();
  while (this._ch) {
    result += this._ch;
    if (this._ch === "\\") {
      result += this._input.next();
    } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
      break;
    }
    this._ch = this._input.next();
  }
  return result;
};

// Skips any white space in the source text from the current position.
// When allowAtLeastOneNewLine is true, will output new lines for each
// newline character found; if the user has preserve_newlines off, only
// the first newline will be output
Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
  var result = whitespaceChar.test(this._input.peek());
  var isFirstNewLine = true;

  while (whitespaceChar.test(this._input.peek())) {
    this._ch = this._input.next();
    if (allowAtLeastOneNewLine && this._ch === '\n') {
      if (this._options.preserve_newlines || isFirstNewLine) {
        isFirstNewLine = false;
        this._output.add_new_line(true);
      }
    }
  }
  return result;
};

// Nested pseudo-class if we are insideRule
// and the next special character found opens
// a new block
Beautifier.prototype.foundNestedPseudoClass = function() {
  var openParen = 0;
  var i = 1;
  var ch = this._input.peek(i);
  while (ch) {
    if (ch === "{") {
      return true;
    } else if (ch === '(') {
      // pseudoclasses can contain ()
      openParen += 1;
    } else if (ch === ')') {
      if (openParen === 0) {
        return false;
      }
      openParen -= 1;
    } else if (ch === ";" || ch === "}") {
      return false;
    }
    i++;
    ch = this._input.peek(i);
  }
  return false;
};

Beautifier.prototype.print_string = function(output_string) {
  this._output.set_indent(this._indentLevel);
  this._output.non_breaking_space = true;
  this._output.add_token(output_string);
};

Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
  if (isAfterSpace) {
    this._output.space_before_token = true;
  }
};

Beautifier.prototype.indent = function() {
  this._indentLevel++;
};

Beautifier.prototype.outdent = function() {
  if (this._indentLevel > 0) {
    this._indentLevel--;
  }
};

/*_____________________--------------------_____________________*/

Beautifier.prototype.beautify = function() {
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text || '')) {
      eol = source_text.match(lineBreak)[0];
    }
  }


  // HACK: newline parsing inconsistent. This brute force normalizes the this._input.
  source_text = source_text.replace(allLineBreaks, '\n');

  // reset
  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  this._output = new Output(this._options, baseIndentString);
  this._input = new InputScanner(source_text);
  this._indentLevel = 0;
  this._nestedLevel = 0;

  this._ch = null;
  var parenLevel = 0;

  var insideRule = false;
  // This is the value side of a property value pair (blue in the following ex)
  // label { content: blue }
  var insidePropertyValue = false;
  var enteringConditionalGroup = false;
  var insideAtExtend = false;
  var insideAtImport = false;
  var topCharacter = this._ch;
  var whitespace;
  var isAfterSpace;
  var previous_ch;

  while (true) {
    whitespace = this._input.read(whitespacePattern);
    isAfterSpace = whitespace !== '';
    previous_ch = topCharacter;
    this._ch = this._input.next();
    if (this._ch === '\\' && this._input.hasNext()) {
      this._ch += this._input.next();
    }
    topCharacter = this._ch;

    if (!this._ch) {
      break;
    } else if (this._ch === '/' && this._input.peek() === '*') {
      // /* css comment */
      // Always start block comments on a new line.
      // This handles scenarios where a block comment immediately
      // follows a property definition on the same line or where
      // minified code is being beautified.
      this._output.add_new_line();
      this._input.back();

      var comment = this._input.read(block_comment_pattern);

      // Handle ignore directive
      var directives = directives_core.get_directives(comment);
      if (directives && directives.ignore === 'start') {
        comment += directives_core.readIgnored(this._input);
      }

      this.print_string(comment);

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);

      // Block comments are followed by a new line so they don't
      // share a line with other properties
      this._output.add_new_line();
    } else if (this._ch === '/' && this._input.peek() === '/') {
      // // single line comment
      // Preserves the space before a comment
      // on the same line as a rule
      this._output.space_before_token = true;
      this._input.back();
      this.print_string(this._input.read(comment_pattern));

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);
    } else if (this._ch === '@') {
      this.preserveSingleSpace(isAfterSpace);

      // deal with less propery mixins @{...}
      if (this._input.peek() === '{') {
        this.print_string(this._ch + this.eatString('}'));
      } else {
        this.print_string(this._ch);

        // strip trailing space, if present, for hash property checks
        var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

        if (variableOrRule.match(/[ :]$/)) {
          // we have a variable or pseudo-class, add it and insert one space before continuing
          variableOrRule = this.eatString(": ").replace(/\s$/, '');
          this.print_string(variableOrRule);
          this._output.space_before_token = true;
        }

        variableOrRule = variableOrRule.replace(/\s$/, '');

        if (variableOrRule === 'extend') {
          insideAtExtend = true;
        } else if (variableOrRule === 'import') {
          insideAtImport = true;
        }

        // might be a nesting at-rule
        if (variableOrRule in this.NESTED_AT_RULE) {
          this._nestedLevel += 1;
          if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
            enteringConditionalGroup = true;
          }
          // might be less variable
        } else if (!insideRule && parenLevel === 0 && variableOrRule.indexOf(':') !== -1) {
          insidePropertyValue = true;
          this.indent();
        }
      }
    } else if (this._ch === '#' && this._input.peek() === '{') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString('}'));
    } else if (this._ch === '{') {
      if (insidePropertyValue) {
        insidePropertyValue = false;
        this.outdent();
      }
      this.indent();
      this._output.space_before_token = true;
      this.print_string(this._ch);

      // when entering conditional groups, only rulesets are allowed
      if (enteringConditionalGroup) {
        enteringConditionalGroup = false;
        insideRule = (this._indentLevel > this._nestedLevel);
      } else {
        // otherwise, declarations are also allowed
        insideRule = (this._indentLevel >= this._nestedLevel);
      }
      if (this._options.newline_between_rules && insideRule) {
        if (this._output.previous_line && this._output.previous_line.item(-1) !== '{') {
          this._output.ensure_empty_line_above('/', ',');
        }
      }
      this.eatWhitespace(true);
      this._output.add_new_line();
    } else if (this._ch === '}') {
      this.outdent();
      this._output.add_new_line();
      if (previous_ch === '{') {
        this._output.trim(true);
      }
      insideAtImport = false;
      insideAtExtend = false;
      if (insidePropertyValue) {
        this.outdent();
        insidePropertyValue = false;
      }
      this.print_string(this._ch);
      insideRule = false;
      if (this._nestedLevel) {
        this._nestedLevel--;
      }

      this.eatWhitespace(true);
      this._output.add_new_line();

      if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
        if (this._input.peek() !== '}') {
          this._output.add_new_line(true);
        }
      }
    } else if (this._ch === ":") {
      if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideAtExtend && parenLevel === 0) {
        // 'property: value' delimiter
        // which could be in a conditional group query
        this.print_string(':');
        if (!insidePropertyValue) {
          insidePropertyValue = true;
          this._output.space_before_token = true;
          this.eatWhitespace(true);
          this.indent();
        }
      } else {
        // sass/less parent reference don't use a space
        // sass nested pseudo-class don't use a space

        // preserve space before pseudoclasses/pseudoelements, as it means "in any child"
        if (this._input.lookBack(" ")) {
          this._output.space_before_token = true;
        }
        if (this._input.peek() === ":") {
          // pseudo-element
          this._ch = this._input.next();
          this.print_string("::");
        } else {
          // pseudo-class
          this.print_string(':');
        }
      }
    } else if (this._ch === '"' || this._ch === '\'') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString(this._ch));
      this.eatWhitespace(true);
    } else if (this._ch === ';') {
      if (parenLevel === 0) {
        if (insidePropertyValue) {
          this.outdent();
          insidePropertyValue = false;
        }
        insideAtExtend = false;
        insideAtImport = false;
        this.print_string(this._ch);
        this.eatWhitespace(true);

        // This maintains single line comments on the same
        // line. Block comments are also affected, but
        // a new line is always output before one inside
        // that section
        if (this._input.peek() !== '/') {
          this._output.add_new_line();
        }
      } else {
        this.print_string(this._ch);
        this.eatWhitespace(true);
        this._output.space_before_token = true;
      }
    } else if (this._ch === '(') { // may be a url
      if (this._input.lookBack("url")) {
        this.print_string(this._ch);
        this.eatWhitespace();
        parenLevel++;
        this.indent();
        this._ch = this._input.next();
        if (this._ch === ')' || this._ch === '"' || this._ch === '\'') {
          this._input.back();
        } else if (this._ch) {
          this.print_string(this._ch + this.eatString(')'));
          if (parenLevel) {
            parenLevel--;
            this.outdent();
          }
        }
      } else {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
        this.eatWhitespace();
        parenLevel++;
        this.indent();
      }
    } else if (this._ch === ')') {
      if (parenLevel) {
        parenLevel--;
        this.outdent();
      }
      this.print_string(this._ch);
    } else if (this._ch === ',') {
      this.print_string(this._ch);
      this.eatWhitespace(true);
      if (this._options.selector_separator_newline && !insidePropertyValue && parenLevel === 0 && !insideAtImport) {
        this._output.add_new_line();
      } else {
        this._output.space_before_token = true;
      }
    } else if ((this._ch === '>' || this._ch === '+' || this._ch === '~') && !insidePropertyValue && parenLevel === 0) {
      //handle combinator spacing
      if (this._options.space_around_combinator) {
        this._output.space_before_token = true;
        this.print_string(this._ch);
        this._output.space_before_token = true;
      } else {
        this.print_string(this._ch);
        this.eatWhitespace();
        // squash extra whitespace
        if (this._ch && whitespaceChar.test(this._ch)) {
          this._ch = '';
        }
      }
    } else if (this._ch === ']') {
      this.print_string(this._ch);
    } else if (this._ch === '[') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    } else if (this._ch === '=') { // no whitespace before or after
      this.eatWhitespace();
      this.print_string('=');
      if (whitespaceChar.test(this._ch)) {
        this._ch = '';
      }
    } else if (this._ch === '!' && !this._input.lookBack("\\")) { // !important
      this.print_string(' ');
      this.print_string(this._ch);
    } else {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    }
  }

  var sweetCode = this._output.get_code(eol);

  return sweetCode;
};

module.exports.Beautifier = Beautifier;

},{"../core/directives":64,"../core/inputscanner":65,"../core/output":67,"./options":76}],75:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function css_beautify(source_text, options) {
  var beautifier = new Beautifier(source_text, options);
  return beautifier.beautify();
}

module.exports = css_beautify;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":74,"./options":76}],76:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

function Options(options) {
  BaseOptions.call(this, options, 'css');

  this.selector_separator_newline = this._get_boolean('selector_separator_newline', true);
  this.newline_between_rules = this._get_boolean('newline_between_rules', true);
  var space_around_selector_separator = this._get_boolean('space_around_selector_separator');
  this.space_around_combinator = this._get_boolean('space_around_combinator') || space_around_selector_separator;

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":66}],77:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Options = require('../html/options').Options;
var Output = require('../core/output').Output;
var Tokenizer = require('../html/tokenizer').Tokenizer;
var TOKEN = require('../html/tokenizer').TOKEN;

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

var Printer = function(options, base_indent_string) { //handles input/output and some other printing functions

  this.indent_level = 0;
  this.alignment_size = 0;
  this.max_preserve_newlines = options.max_preserve_newlines;
  this.preserve_newlines = options.preserve_newlines;

  this._output = new Output(options, base_indent_string);

};

Printer.prototype.current_line_has_match = function(pattern) {
  return this._output.current_line.has_match(pattern);
};

Printer.prototype.set_space_before_token = function(value, non_breaking) {
  this._output.space_before_token = value;
  this._output.non_breaking_space = non_breaking;
};

Printer.prototype.set_wrap_point = function() {
  this._output.set_indent(this.indent_level, this.alignment_size);
  this._output.set_wrap_point();
};


Printer.prototype.add_raw_token = function(token) {
  this._output.add_raw_token(token);
};

Printer.prototype.print_preserved_newlines = function(raw_token) {
  var newlines = 0;
  if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
    newlines = raw_token.newlines ? 1 : 0;
  }

  if (this.preserve_newlines) {
    newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
  }
  for (var n = 0; n < newlines; n++) {
    this.print_newline(n > 0);
  }

  return newlines !== 0;
};

Printer.prototype.traverse_whitespace = function(raw_token) {
  if (raw_token.whitespace_before || raw_token.newlines) {
    if (!this.print_preserved_newlines(raw_token)) {
      this._output.space_before_token = true;
    }
    return true;
  }
  return false;
};

Printer.prototype.previous_token_wrapped = function() {
  return this._output.previous_token_wrapped;
};

Printer.prototype.print_newline = function(force) {
  this._output.add_new_line(force);
};

Printer.prototype.print_token = function(token) {
  if (token.text) {
    this._output.set_indent(this.indent_level, this.alignment_size);
    this._output.add_token(token.text);
  }
};

Printer.prototype.indent = function() {
  this.indent_level++;
};

Printer.prototype.get_full_indent = function(level) {
  level = this.indent_level + (level || 0);
  if (level < 1) {
    return '';
  }

  return this._output.get_indent_string(level);
};

var get_type_attribute = function(start_token) {
  var result = null;
  var raw_token = start_token.next;

  // Search attributes for a type attribute
  while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
    if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === 'type') {
      if (raw_token.next && raw_token.next.type === TOKEN.EQUALS &&
        raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
        result = raw_token.next.next.text;
      }
      break;
    }
    raw_token = raw_token.next;
  }

  return result;
};

var get_custom_beautifier_name = function(tag_check, raw_token) {
  var typeAttribute = null;
  var result = null;

  if (!raw_token.closed) {
    return null;
  }

  if (tag_check === 'script') {
    typeAttribute = 'text/javascript';
  } else if (tag_check === 'style') {
    typeAttribute = 'text/css';
  }

  typeAttribute = get_type_attribute(raw_token) || typeAttribute;

  // For script and style tags that have a type attribute, only enable custom beautifiers for matching values
  // For those without a type attribute use default;
  if (typeAttribute.search('text/css') > -1) {
    result = 'css';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect)/) > -1) {
    result = 'javascript';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
    result = 'html';
  } else if (typeAttribute.search(/test\/null/) > -1) {
    // Test only mime-type for testing the beautifier when null is passed as beautifing function
    result = 'null';
  }

  return result;
};

function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}

function TagFrame(parent, parser_token, indent_level) {
  this.parent = parent || null;
  this.tag = parser_token ? parser_token.tag_name : '';
  this.indent_level = indent_level || 0;
  this.parser_token = parser_token || null;
}

function TagStack(printer) {
  this._printer = printer;
  this._current_frame = null;
}

TagStack.prototype.get_parser_token = function() {
  return this._current_frame ? this._current_frame.parser_token : null;
};

TagStack.prototype.record_tag = function(parser_token) { //function to record a tag and its parent in this.tags Object
  var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
  this._current_frame = new_frame;
};

TagStack.prototype._try_pop_frame = function(frame) { //function to retrieve the opening tag to the corresponding closer
  var parser_token = null;

  if (frame) {
    parser_token = frame.parser_token;
    this._printer.indent_level = frame.indent_level;
    this._current_frame = frame.parent;
  }

  return parser_token;
};

TagStack.prototype._get_frame = function(tag_list, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._current_frame;

  while (frame) { //till we reach '' (the initial value);
    if (tag_list.indexOf(frame.tag) !== -1) { //if this is it use it
      break;
    } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
      frame = null;
      break;
    }
    frame = frame.parent;
  }

  return frame;
};

TagStack.prototype.try_pop = function(tag, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._get_frame([tag], stop_list);
  return this._try_pop_frame(frame);
};

TagStack.prototype.indent_to_tag = function(tag_list) {
  var frame = this._get_frame(tag_list);
  if (frame) {
    this._printer.indent_level = frame.indent_level;
  }
};

function Beautifier(source_text, options, js_beautify, css_beautify) {
  //Wrapper function to invoke all the necessary constructors and deal with the output.
  this._source_text = source_text || '';
  options = options || {};
  this._js_beautify = js_beautify;
  this._css_beautify = css_beautify;
  this._tag_stack = null;

  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  var optionHtml = new Options(options, 'html');

  this._options = optionHtml;

  this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, 'force'.length) === 'force';
  this._is_wrap_attributes_force_expand_multiline = (this._options.wrap_attributes === 'force-expand-multiline');
  this._is_wrap_attributes_force_aligned = (this._options.wrap_attributes === 'force-aligned');
  this._is_wrap_attributes_aligned_multiple = (this._options.wrap_attributes === 'aligned-multiple');
  this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, 'preserve'.length) === 'preserve';
  this._is_wrap_attributes_preserve_aligned = (this._options.wrap_attributes === 'preserve-aligned');
}

Beautifier.prototype.beautify = function() {

  // if disabled, return the input unchanged.
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (this._options.eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text)) {
      eol = source_text.match(lineBreak)[0];
    }
  }

  // HACK: newline parsing inconsistent. This brute force normalizes the input.
  source_text = source_text.replace(allLineBreaks, '\n');

  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  var last_token = {
    text: '',
    type: ''
  };

  var last_tag_token = new TagOpenParserToken();

  var printer = new Printer(this._options, baseIndentString);
  var tokens = new Tokenizer(source_text, this._options).tokenize();

  this._tag_stack = new TagStack(printer);

  var parser_token = null;
  var raw_token = tokens.next();
  while (raw_token.type !== TOKEN.EOF) {

    if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
      parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token);
      last_tag_token = parser_token;
    } else if ((raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE) ||
      (raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete)) {
      parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, tokens);
    } else if (raw_token.type === TOKEN.TAG_CLOSE) {
      parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
    } else if (raw_token.type === TOKEN.TEXT) {
      parser_token = this._handle_text(printer, raw_token, last_tag_token);
    } else {
      // This should never happen, but if it does. Print the raw token
      printer.add_raw_token(raw_token);
    }

    last_token = parser_token;

    raw_token = tokens.next();
  }
  var sweet_code = printer._output.get_code(eol);

  return sweet_code;
};

Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };
  printer.alignment_size = 0;
  last_tag_token.tag_complete = true;

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    if (last_tag_token.tag_start_char === '<') {
      printer.set_space_before_token(raw_token.text[0] === '/', true); // space before />, no space before >
      if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
        printer.print_newline(false);
      }
    }
    printer.print_token(raw_token);

  }

  if (last_tag_token.indent_content &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.indent();

    // only indent once per opened tag
    last_tag_token.indent_content = false;
  }

  if (!last_tag_token.is_inline_element &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.set_wrap_point();
  }

  return parser_token;
};

Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, tokens) {
  var wrapped = last_tag_token.has_wrapped_attrs;
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else if (last_tag_token.tag_start_char === '{' && raw_token.type === TOKEN.TEXT) {
    // For the insides of handlebars allow newlines or a single space between open and contents
    if (printer.print_preserved_newlines(raw_token)) {
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
    } else {
      printer.print_token(raw_token);
    }
  } else {
    if (raw_token.type === TOKEN.ATTRIBUTE) {
      printer.set_space_before_token(true);
      last_tag_token.attr_count += 1;
    } else if (raw_token.type === TOKEN.EQUALS) { //no space before =
      printer.set_space_before_token(false);
    } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) { //no space before value
      printer.set_space_before_token(false);
    }

    if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === '<') {
      if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
        printer.traverse_whitespace(raw_token);
        wrapped = wrapped || raw_token.newlines !== 0;
      }


      if (this._is_wrap_attributes_force) {
        var force_attr_wrap = last_tag_token.attr_count > 1;
        if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.attr_count === 1) {
          var is_only_attribute = true;
          var peek_index = 0;
          var peek_token;
          do {
            peek_token = tokens.peek(peek_index);
            if (peek_token.type === TOKEN.ATTRIBUTE) {
              is_only_attribute = false;
              break;
            }
            peek_index += 1;
          } while (peek_index < 4 && peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);

          force_attr_wrap = !is_only_attribute;
        }

        if (force_attr_wrap) {
          printer.print_newline(false);
          wrapped = true;
        }
      }
    }
    printer.print_token(raw_token);
    wrapped = wrapped || printer.previous_token_wrapped();
    last_tag_token.has_wrapped_attrs = wrapped;
  }
  return parser_token;
};

Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: 'TK_CONTENT'
  };
  if (last_tag_token.custom_beautifier_name) { //check if we need to format javascript
    this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
  } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    printer.print_token(raw_token);
  }
  return parser_token;
};

Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
  var local = this;
  if (raw_token.text !== '') {

    var text = raw_token.text,
      _beautifier,
      script_indent_level = 1,
      pre = '',
      post = '';
    if (last_tag_token.custom_beautifier_name === 'javascript' && typeof this._js_beautify === 'function') {
      _beautifier = this._js_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'css' && typeof this._css_beautify === 'function') {
      _beautifier = this._css_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'html') {
      _beautifier = function(html_source, options) {
        var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
        return beautifier.beautify();
      };
    }

    if (this._options.indent_scripts === "keep") {
      script_indent_level = 0;
    } else if (this._options.indent_scripts === "separate") {
      script_indent_level = -printer.indent_level;
    }

    var indentation = printer.get_full_indent(script_indent_level);

    // if there is at least one empty line at the end of this text, strip it
    // we'll be adding one back after the text but before the containing tag.
    text = text.replace(/\n[ \t]*$/, '');

    // Handle the case where content is wrapped in a comment or cdata.
    if (last_tag_token.custom_beautifier_name !== 'html' &&
      text[0] === '<' && text.match(/^(<!--|<!\[CDATA\[)/)) {
      var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);

      // if we start to wrap but don't finish, print raw
      if (!matched) {
        printer.add_raw_token(raw_token);
        return;
      }

      pre = indentation + matched[1] + '\n';
      text = matched[4];
      if (matched[5]) {
        post = indentation + matched[5];
      }

      // if there is at least one empty line at the end of this text, strip it
      // we'll be adding one back after the text but before the containing tag.
      text = text.replace(/\n[ \t]*$/, '');

      if (matched[2] || matched[3].indexOf('\n') !== -1) {
        // if the first line of the non-comment text has spaces
        // use that as the basis for indenting in null case.
        matched = matched[3].match(/[ \t]+$/);
        if (matched) {
          raw_token.whitespace_before = matched[0];
        }
      }
    }

    if (text) {
      if (_beautifier) {

        // call the Beautifier if avaliable
        var Child_options = function() {
          this.eol = '\n';
        };
        Child_options.prototype = this._options.raw_options;
        var child_options = new Child_options();
        text = _beautifier(indentation + text, child_options);
      } else {
        // simply indent the string otherwise
        var white = raw_token.whitespace_before;
        if (white) {
          text = text.replace(new RegExp('\n(' + white + ')?', 'g'), '\n');
        }

        text = indentation + text.replace(/\n/g, '\n' + indentation);
      }
    }

    if (pre) {
      if (!text) {
        text = pre + post;
      } else {
        text = pre + text + '\n' + post;
      }
    }

    printer.print_newline(false);
    if (text) {
      raw_token.text = text;
      raw_token.whitespace_before = '';
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
      printer.print_newline(true);
    }
  }
};

Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token) {
  var parser_token = this._get_tag_open_token(raw_token);

  if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) &&
    raw_token.type === TOKEN.TAG_OPEN && raw_token.text.indexOf('</') === 0) {
    // End element tags for unformatted or content_unformatted elements
    // are printed raw to keep any newlines inside them exactly the same.
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
    if (!parser_token.is_inline_element) {
      printer.set_wrap_point();
    }
    printer.print_token(raw_token);
  }

  //indent attributes an auto, forced, aligned or forced-align line-wrap
  if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
    parser_token.alignment_size = raw_token.text.length + 1;
  }

  if (!parser_token.tag_complete && !parser_token.is_unformatted) {
    printer.alignment_size = parser_token.alignment_size;
  }

  return parser_token;
};

var TagOpenParserToken = function(parent, raw_token) {
  this.parent = parent || null;
  this.text = '';
  this.type = 'TK_TAG_OPEN';
  this.tag_name = '';
  this.is_inline_element = false;
  this.is_unformatted = false;
  this.is_content_unformatted = false;
  this.is_empty_element = false;
  this.is_start_tag = false;
  this.is_end_tag = false;
  this.indent_content = false;
  this.multiline_content = false;
  this.custom_beautifier_name = null;
  this.start_tag_token = null;
  this.attr_count = 0;
  this.has_wrapped_attrs = false;
  this.alignment_size = 0;
  this.tag_complete = false;
  this.tag_start_char = '';
  this.tag_check = '';

  if (!raw_token) {
    this.tag_complete = true;
  } else {
    var tag_check_match;

    this.tag_start_char = raw_token.text[0];
    this.text = raw_token.text;

    if (this.tag_start_char === '<') {
      tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    } else {
      tag_check_match = raw_token.text.match(/^{{[#\^]?([^\s}]+)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    }
    this.tag_check = this.tag_check.toLowerCase();

    if (raw_token.type === TOKEN.COMMENT) {
      this.tag_complete = true;
    }

    this.is_start_tag = this.tag_check.charAt(0) !== '/';
    this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
    this.is_end_tag = !this.is_start_tag ||
      (raw_token.closed && raw_token.closed.text === '/>');

    // handlebars tags that don't start with # or ^ are single_tags, and so also start and end.
    this.is_end_tag = this.is_end_tag ||
      (this.tag_start_char === '{' && (this.text.length < 3 || (/[^#\^]/.test(this.text.charAt(2)))));
  }
};

Beautifier.prototype._get_tag_open_token = function(raw_token) { //function to get a full tag and parse its type
  var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);

  parser_token.alignment_size = this._options.wrap_attributes_indent_size;

  parser_token.is_end_tag = parser_token.is_end_tag ||
    in_array(parser_token.tag_check, this._options.void_elements);

  parser_token.is_empty_element = parser_token.tag_complete ||
    (parser_token.is_start_tag && parser_token.is_end_tag);

  parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
  parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
  parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || parser_token.tag_start_char === '{';

  return parser_token;
};

Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {

  if (!parser_token.is_empty_element) {
    if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name); //remove it and all ancestors
    } else { // it's a start-tag
      // check if this tag is starting an element that has optional end element
      // and do an ending needed
      if (this._do_optional_end_element(parser_token)) {
        if (!parser_token.is_inline_element) {
          if (parser_token.parent) {
            parser_token.parent.multiline_content = true;
          }
          printer.print_newline(false);
        }

      }

      this._tag_stack.record_tag(parser_token); //push it on the tag stack

      if ((parser_token.tag_name === 'script' || parser_token.tag_name === 'style') &&
        !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
        parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
      }
    }
  }

  if (in_array(parser_token.tag_check, this._options.extra_liners)) { //check if this double needs an extra line
    printer.print_newline(false);
    if (!printer._output.just_added_blankline()) {
      printer.print_newline(true);
    }
  }

  if (parser_token.is_empty_element) { //if this tag name is a single tag type (either in the list or has a closing /)

    // if you hit an else case, reset the indent level if you are inside an:
    // 'if', 'unless', or 'each' block.
    if (parser_token.tag_start_char === '{' && parser_token.tag_check === 'else') {
      this._tag_stack.indent_to_tag(['if', 'unless', 'each']);
      parser_token.indent_content = true;
      // Don't add a newline if opening {{#if}} tag is on the current line
      var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
      if (!foundIfOnCurrentLine) {
        printer.print_newline(false);
      }
    }

    // Don't add a newline before elements that should remain where they are.
    if (parser_token.tag_name === '!--' && last_token.type === TOKEN.TAG_CLOSE &&
      last_tag_token.is_end_tag && parser_token.text.indexOf('\n') === -1) {
      //Do nothing. Leave comments on same line.
    } else if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_unformatted || parser_token.is_content_unformatted) {
    if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
    if ((parser_token.start_tag_token && parser_token.start_tag_token.multiline_content) ||
      !(parser_token.is_inline_element ||
        (last_tag_token.is_inline_element) ||
        (last_token.type === TOKEN.TAG_CLOSE &&
          parser_token.start_tag_token === last_tag_token) ||
        (last_token.type === 'TK_CONTENT')
      )) {
      printer.print_newline(false);
    }
  } else { // it's a start-tag
    parser_token.indent_content = !parser_token.custom_beautifier_name;

    if (parser_token.tag_start_char === '<') {
      if (parser_token.tag_name === 'html') {
        parser_token.indent_content = this._options.indent_inner_html;
      } else if (parser_token.tag_name === 'head') {
        parser_token.indent_content = this._options.indent_head_inner_html;
      } else if (parser_token.tag_name === 'body') {
        parser_token.indent_content = this._options.indent_body_inner_html;
      }
    }

    if (!parser_token.is_inline_element && last_token.type !== 'TK_CONTENT') {
      if (parser_token.parent) {
        parser_token.parent.multiline_content = true;
      }
      printer.print_newline(false);
    }
  }
};

//To be used for <p> tag special case:
//var p_closers = ['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];

Beautifier.prototype._do_optional_end_element = function(parser_token) {
  var result = null;
  // NOTE: cases of "if there is no more content in the parent element"
  // are handled automatically by the beautifier.
  // It assumes parent or ancestor close tag closes all children.
  // https://www.w3.org/TR/html5/syntax.html#optional-tags
  if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
    return;

  } else if (parser_token.tag_name === 'body') {
    // A head element’s end tag may be omitted if the head element is not immediately followed by a space character or a comment.
    result = result || this._tag_stack.try_pop('head');

    //} else if (parser_token.tag_name === 'body') {
    // DONE: A body element’s end tag may be omitted if the body element is not immediately followed by a comment.

  } else if (parser_token.tag_name === 'li') {
    // An li element’s end tag may be omitted if the li element is immediately followed by another li element or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('li', ['ol', 'ul']);

  } else if (parser_token.tag_name === 'dd' || parser_token.tag_name === 'dt') {
    // A dd element’s end tag may be omitted if the dd element is immediately followed by another dd element or a dt element, or if there is no more content in the parent element.
    // A dt element’s end tag may be omitted if the dt element is immediately followed by another dt element or a dd element.
    result = result || this._tag_stack.try_pop('dt', ['dl']);
    result = result || this._tag_stack.try_pop('dd', ['dl']);

    //} else if (p_closers.indexOf(parser_token.tag_name) !== -1) {
    //TODO: THIS IS A BUG FARM. We are not putting this into 1.8.0 as it is likely to blow up.
    //A p element’s end tag may be omitted if the p element is immediately followed by an address, article, aside, blockquote, details, div, dl, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, main, nav, ol, p, pre, section, table, or ul element, or if there is no more content in the parent element and the parent element is an HTML element that is not an a, audio, del, ins, map, noscript, or video element, or an autonomous custom element.
    //result = result || this._tag_stack.try_pop('p', ['body']);

  } else if (parser_token.tag_name === 'rp' || parser_token.tag_name === 'rt') {
    // An rt element’s end tag may be omitted if the rt element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    // An rp element’s end tag may be omitted if the rp element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('rt', ['ruby', 'rtc']);
    result = result || this._tag_stack.try_pop('rp', ['ruby', 'rtc']);

  } else if (parser_token.tag_name === 'optgroup') {
    // An optgroup element’s end tag may be omitted if the optgroup element is immediately followed by another optgroup element, or if there is no more content in the parent element.
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('optgroup', ['select']);
    //result = result || this._tag_stack.try_pop('option', ['select']);

  } else if (parser_token.tag_name === 'option') {
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('option', ['select', 'datalist', 'optgroup']);

  } else if (parser_token.tag_name === 'colgroup') {
    // DONE: A colgroup element’s end tag may be omitted if the colgroup element is not immediately followed by a space character or a comment.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);

  } else if (parser_token.tag_name === 'thead') {
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);

    //} else if (parser_token.tag_name === 'caption') {
    // DONE: A caption element’s end tag may be omitted if the caption element is not immediately followed by a space character or a comment.

  } else if (parser_token.tag_name === 'tbody' || parser_token.tag_name === 'tfoot') {
    // A thead element’s end tag may be omitted if the thead element is immediately followed by a tbody or tfoot element.
    // A tbody element’s end tag may be omitted if the tbody element is immediately followed by a tbody or tfoot element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('thead', ['table']);
    result = result || this._tag_stack.try_pop('tbody', ['table']);

    //} else if (parser_token.tag_name === 'tfoot') {
    // DONE: A tfoot element’s end tag may be omitted if there is no more content in the parent element.

  } else if (parser_token.tag_name === 'tr') {
    // A tr element’s end tag may be omitted if the tr element is immediately followed by another tr element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('tr', ['table', 'thead', 'tbody', 'tfoot']);

  } else if (parser_token.tag_name === 'th' || parser_token.tag_name === 'td') {
    // A td element’s end tag may be omitted if the td element is immediately followed by a td or th element, or if there is no more content in the parent element.
    // A th element’s end tag may be omitted if the th element is immediately followed by a td or th element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('td', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
    result = result || this._tag_stack.try_pop('th', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
  }

  // Start element omission not handled currently
  // A head element’s start tag may be omitted if the element is empty, or if the first thing inside the head element is an element.
  // A tbody element’s start tag may be omitted if the first thing inside the tbody element is a tr element, and if the element is not immediately preceded by a tbody, thead, or tfoot element whose end tag has been omitted. (It can’t be omitted if the element is empty.)
  // A colgroup element’s start tag may be omitted if the first thing inside the colgroup element is a col element, and if the element is not immediately preceded by another colgroup element whose end tag has been omitted. (It can’t be omitted if the element is empty.)

  // Fix up the parent of the parser token
  parser_token.parent = this._tag_stack.get_parser_token();

  return result;
};

module.exports.Beautifier = Beautifier;

},{"../core/output":67,"../html/options":79,"../html/tokenizer":80}],78:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function style_html(html_source, options, js_beautify, css_beautify) {
  var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
  return beautifier.beautify();
}

module.exports = style_html;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":77,"./options":79}],79:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

function Options(options) {
  BaseOptions.call(this, options, 'html');
  if (this.templating.length === 1 && this.templating[0] === 'auto') {
    this.templating = ['django', 'erb', 'handlebars', 'php'];
  }

  this.indent_inner_html = this._get_boolean('indent_inner_html');
  this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
  this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

  this.indent_handlebars = this._get_boolean('indent_handlebars', true);
  this.wrap_attributes = this._get_selection('wrap_attributes',
    ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
  this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
  this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

  // Block vs inline elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
  // https://www.w3.org/TR/html5/dom.html#phrasing-content
  this.inline = this._get_array('inline', [
    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
    'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
    'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
    'video', 'wbr', 'text',
    // obsolete inline tags
    'acronym', 'big', 'strike', 'tt'
  ]);
  this.void_elements = this._get_array('void_elements', [
    // HTLM void elements - aka self-closing tags - aka singletons
    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
    // NOTE: Optional tags are too complex for a simple list
    // they are hard coded in _do_optional_end_element

    // Doctype and xml elements
    '!doctype', '?xml',

    // obsolete tags
    // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
    // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
    'basefont', 'isindex'
  ]);
  this.unformatted = this._get_array('unformatted', []);
  this.content_unformatted = this._get_array('content_unformatted', [
    'pre', 'textarea'
  ]);
  this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
  this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":66}],80:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseTokenizer = require('../core/tokenizer').Tokenizer;
var BASETOKEN = require('../core/tokenizer').TOKEN;
var Directives = require('../core/directives').Directives;
var TemplatablePattern = require('../core/templatablepattern').TemplatablePattern;
var Pattern = require('../core/pattern').Pattern;

var TOKEN = {
  TAG_OPEN: 'TK_TAG_OPEN',
  TAG_CLOSE: 'TK_TAG_CLOSE',
  ATTRIBUTE: 'TK_ATTRIBUTE',
  EQUALS: 'TK_EQUALS',
  VALUE: 'TK_VALUE',
  COMMENT: 'TK_COMMENT',
  TEXT: 'TK_TEXT',
  UNKNOWN: 'TK_UNKNOWN',
  START: BASETOKEN.START,
  RAW: BASETOKEN.RAW,
  EOF: BASETOKEN.EOF
};

var directives_core = new Directives(/<\!--/, /-->/);

var Tokenizer = function(input_string, options) {
  BaseTokenizer.call(this, input_string, options);
  this._current_tag_name = '';

  // Words end at whitespace or when a tag starts
  // if we are indenting handlebars, they are considered tags
  var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
  var pattern_reader = new Pattern(this._input);

  this.__patterns = {
    word: templatable_reader.until(/[\n\r\t <]/),
    single_quote: templatable_reader.until_after(/'/),
    double_quote: templatable_reader.until_after(/"/),
    attribute: templatable_reader.until(/[\n\r\t =\/>]/),
    element_name: templatable_reader.until(/[\n\r\t >\/]/),

    handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
    handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
    handlebars_open: pattern_reader.until(/[\n\r\t }]/),
    handlebars_raw_close: pattern_reader.until(/}}/),
    comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
    cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
    // https://en.wikipedia.org/wiki/Conditional_comment
    conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
    processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
  };

  if (this._options.indent_handlebars) {
    this.__patterns.word = this.__patterns.word.exclude('handlebars');
  }

  this._unformatted_content_delimiter = null;

  if (this._options.unformatted_content_delimiter) {
    var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
    this.__patterns.unformatted_content_delimiter =
      pattern_reader.matching(literal_regexp)
      .until_after(literal_regexp);
  }
};
Tokenizer.prototype = new BaseTokenizer();

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false; //current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.UNKNOWN;
};

Tokenizer.prototype._is_opening = function(current_token) {
  return current_token.type === TOKEN.TAG_OPEN;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) {
  return current_token.type === TOKEN.TAG_CLOSE &&
    (open_token && (
      ((current_token.text === '>' || current_token.text === '/>') && open_token.text[0] === '<') ||
      (current_token.text === '}}' && open_token.text[0] === '{' && open_token.text[1] === '{')));
};

Tokenizer.prototype._reset = function() {
  this._current_tag_name = '';
};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  var token = null;
  this._readWhitespace();
  var c = this._input.peek();

  if (c === null) {
    return this._create_token(TOKEN.EOF, '');
  }

  token = token || this._read_open_handlebars(c, open_token);
  token = token || this._read_attribute(c, previous_token, open_token);
  token = token || this._read_raw_content(c, previous_token, open_token);
  token = token || this._read_close(c, open_token);
  token = token || this._read_content_word(c);
  token = token || this._read_comment_or_cdata(c);
  token = token || this._read_processing(c);
  token = token || this._read_open(c, open_token);
  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  return token;
};

Tokenizer.prototype._read_comment_or_cdata = function(c) { // jshint unused:false
  var token = null;
  var resulting_string = null;
  var directives = null;

  if (c === '<') {
    var peek1 = this._input.peek(1);
    // We treat all comments as literals, even more than preformatted tags
    // we only look for the appropriate closing marker
    if (peek1 === '!') {
      resulting_string = this.__patterns.comment.read();

      // only process directive on html comments
      if (resulting_string) {
        directives = directives_core.get_directives(resulting_string);
        if (directives && directives.ignore === 'start') {
          resulting_string += directives_core.readIgnored(this._input);
        }
      } else {
        resulting_string = this.__patterns.cdata.read();
      }
    }

    if (resulting_string) {
      token = this._create_token(TOKEN.COMMENT, resulting_string);
      token.directives = directives;
    }
  }

  return token;
};

Tokenizer.prototype._read_processing = function(c) { // jshint unused:false
  var token = null;
  var resulting_string = null;
  var directives = null;

  if (c === '<') {
    var peek1 = this._input.peek(1);
    if (peek1 === '!' || peek1 === '?') {
      resulting_string = this.__patterns.conditional_comment.read();
      resulting_string = resulting_string || this.__patterns.processing.read();
    }

    if (resulting_string) {
      token = this._create_token(TOKEN.COMMENT, resulting_string);
      token.directives = directives;
    }
  }

  return token;
};

Tokenizer.prototype._read_open = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (c === '<') {

      resulting_string = this._input.next();
      if (this._input.peek() === '/') {
        resulting_string += this._input.next();
      }
      resulting_string += this.__patterns.element_name.read();
      token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
    }
  }
  return token;
};

Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (this._options.indent_handlebars && c === '{' && this._input.peek(1) === '{') {
      if (this._input.peek(2) === '!') {
        resulting_string = this.__patterns.handlebars_comment.read();
        resulting_string = resulting_string || this.__patterns.handlebars.read();
        token = this._create_token(TOKEN.COMMENT, resulting_string);
      } else {
        resulting_string = this.__patterns.handlebars_open.read();
        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
      }
    }
  }
  return token;
};


Tokenizer.prototype._read_close = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (open_token) {
    if (open_token.text[0] === '<' && (c === '>' || (c === '/' && this._input.peek(1) === '>'))) {
      resulting_string = this._input.next();
      if (c === '/') { //  for close tag "/>"
        resulting_string += this._input.next();
      }
      token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
    } else if (open_token.text[0] === '{' && c === '}' && this._input.peek(1) === '}') {
      this._input.next();
      this._input.next();
      token = this._create_token(TOKEN.TAG_CLOSE, '}}');
    }
  }

  return token;
};

Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
  var token = null;
  var resulting_string = '';
  if (open_token && open_token.text[0] === '<') {

    if (c === '=') {
      token = this._create_token(TOKEN.EQUALS, this._input.next());
    } else if (c === '"' || c === "'") {
      var content = this._input.next();
      if (c === '"') {
        content += this.__patterns.double_quote.read();
      } else {
        content += this.__patterns.single_quote.read();
      }
      token = this._create_token(TOKEN.VALUE, content);
    } else {
      resulting_string = this.__patterns.attribute.read();

      if (resulting_string) {
        if (previous_token.type === TOKEN.EQUALS) {
          token = this._create_token(TOKEN.VALUE, resulting_string);
        } else {
          token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
        }
      }
    }
  }
  return token;
};

Tokenizer.prototype._is_content_unformatted = function(tag_name) {
  // void_elements have no content and so cannot have unformatted content
  // script and style tags should always be read as unformatted content
  // finally content_unformatted and unformatted element contents are unformatted
  return this._options.void_elements.indexOf(tag_name) === -1 &&
    (this._options.content_unformatted.indexOf(tag_name) !== -1 ||
      this._options.unformatted.indexOf(tag_name) !== -1);
};


Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) { // jshint unused:false
  var resulting_string = '';
  if (open_token && open_token.text[0] === '{') {
    resulting_string = this.__patterns.handlebars_raw_close.read();
  } else if (previous_token.type === TOKEN.TAG_CLOSE && (previous_token.opened.text[0] === '<')) {
    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
    if (tag_name === 'script' || tag_name === 'style') {
      // Script and style tags are allowed to have comments wrapping their content
      // or just have regular content.
      var token = this._read_comment_or_cdata(c);
      if (token) {
        token.type = TOKEN.TEXT;
        return token;
      }
      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
    } else if (this._is_content_unformatted(tag_name)) {
      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
    }
  }

  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }

  return null;
};

Tokenizer.prototype._read_content_word = function(c) {
  var resulting_string = '';
  if (this._options.unformatted_content_delimiter) {
    if (c === this._options.unformatted_content_delimiter[0]) {
      resulting_string = this.__patterns.unformatted_content_delimiter.read();
    }
  }

  if (!resulting_string) {
    resulting_string = this.__patterns.word.read();
  }
  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }
};

module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;

},{"../core/directives":64,"../core/pattern":68,"../core/templatablepattern":69,"../core/tokenizer":71}],81:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var js_beautify = require('./javascript/index');
var css_beautify = require('./css/index');
var html_beautify = require('./html/index');

function style_html(html_source, options, js, css) {
  js = js || js_beautify;
  css = css || css_beautify;
  return html_beautify(html_source, options, js, css);
}
style_html.defaultOptions = html_beautify.defaultOptions;

module.exports.js = js_beautify;
module.exports.css = css_beautify;
module.exports.html = style_html;

},{"./css/index":75,"./html/index":78,"./javascript/index":84}],82:[function(require,module,exports){
/* jshint node: true, curly: false */
// Parts of this section of code is taken from acorn.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git

// ## Character categories


'use strict';

// acorn used char codes to squeeze the last bit of performance out
// Beautifier is okay without that, so we're using regex
// permit $ (36) and @ (64). @ is used in ES7 decorators.
// 65 through 91 are uppercase letters.
// permit _ (95).
// 97 through 123 are lowercase letters.
var baseASCIIidentifierStartChars = "\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";

// inside an identifier @ is not allowed but 0-9 are.
var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
//var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
//var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

var identifierStart = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
var identifierChars = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";

exports.identifier = new RegExp(identifierStart + identifierChars, 'g');
exports.identifierStart = new RegExp(identifierStart);
exports.identifierMatch = new RegExp("(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/; // jshint ignore:line

// Whether a single character denotes a newline.

exports.newline = /[\n\r\u2028\u2029]/;

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

// in javascript, these two differ
// in python they are the same, different methods are called on them
exports.lineBreak = new RegExp('\r\n|' + exports.newline.source);
exports.allLineBreaks = new RegExp(exports.lineBreak.source, 'g');

},{}],83:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Output = require('../core/output').Output;
var Token = require('../core/token').Token;
var acorn = require('./acorn');
var Options = require('./options').Options;
var Tokenizer = require('./tokenizer').Tokenizer;
var line_starters = require('./tokenizer').line_starters;
var positionable_operators = require('./tokenizer').positionable_operators;
var TOKEN = require('./tokenizer').TOKEN;


function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}

function ltrim(s) {
  return s.replace(/^\s+/g, '');
}

function generateMapFromStrings(list) {
  var result = {};
  for (var x = 0; x < list.length; x++) {
    // make the mapped names underscored instead of dash
    result[list[x].replace(/-/g, '_')] = list[x];
  }
  return result;
}

function reserved_word(token, word) {
  return token && token.type === TOKEN.RESERVED && token.text === word;
}

function reserved_array(token, words) {
  return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
}
// Unsure of what they mean, but they work. Worth cleaning up in future.
var special_words = ['case', 'return', 'do', 'if', 'throw', 'else', 'await', 'break', 'continue', 'async'];

var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

// Generate map from array
var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);

var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];

var MODE = {
  BlockStatement: 'BlockStatement', // 'BLOCK'
  Statement: 'Statement', // 'STATEMENT'
  ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
  ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
  ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
  Conditional: 'Conditional', //'(COND-EXPRESSION)',
  Expression: 'Expression' //'(EXPRESSION)'
};

function remove_redundant_indentation(output, frame) {
  // This implementation is effective but has some issues:
  //     - can cause line wrap to happen too soon due to indent removal
  //           after wrap points are calculated
  // These issues are minor compared to ugly indentation.

  if (frame.multiline_frame ||
    frame.mode === MODE.ForInitializer ||
    frame.mode === MODE.Conditional) {
    return;
  }

  // remove one indent from each line inside this section
  output.remove_indent(frame.start_line_index);
}

// we could use just string.split, but
// IE doesn't like returning empty strings
function split_linebreaks(s) {
  //return s.split(/\x0d\x0a|\x0a/);

  s = s.replace(acorn.allLineBreaks, '\n');
  var out = [],
    idx = s.indexOf("\n");
  while (idx !== -1) {
    out.push(s.substring(0, idx));
    s = s.substring(idx + 1);
    idx = s.indexOf("\n");
  }
  if (s.length) {
    out.push(s);
  }
  return out;
}

function is_array(mode) {
  return mode === MODE.ArrayLiteral;
}

function is_expression(mode) {
  return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
}

function all_lines_start_with(lines, c) {
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.charAt(0) !== c) {
      return false;
    }
  }
  return true;
}

function each_line_matches_indent(lines, indent) {
  var i = 0,
    len = lines.length,
    line;
  for (; i < len; i++) {
    line = lines[i];
    // allow empty lines to pass through
    if (line && line.indexOf(indent) !== 0) {
      return false;
    }
  }
  return true;
}


function Beautifier(source_text, options) {
  options = options || {};
  this._source_text = source_text || '';

  this._output = null;
  this._tokens = null;
  this._last_last_text = null;
  this._flags = null;
  this._previous_flags = null;

  this._flag_store = null;
  this._options = new Options(options);
}

Beautifier.prototype.create_flags = function(flags_base, mode) {
  var next_indent_level = 0;
  if (flags_base) {
    next_indent_level = flags_base.indentation_level;
    if (!this._output.just_added_newline() &&
      flags_base.line_indent_level > next_indent_level) {
      next_indent_level = flags_base.line_indent_level;
    }
  }

  var next_flags = {
    mode: mode,
    parent: flags_base,
    last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ''), // last token text
    last_word: flags_base ? flags_base.last_word : '', // last TOKEN.WORD passed
    declaration_statement: false,
    declaration_assignment: false,
    multiline_frame: false,
    inline_frame: false,
    if_block: false,
    else_block: false,
    do_block: false,
    do_while: false,
    import_block: false,
    in_case_statement: false, // switch(..){ INSIDE HERE }
    in_case: false, // we're on the exact line with "case 0:"
    case_body: false, // the indented case-action block
    indentation_level: next_indent_level,
    alignment: 0,
    line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
    start_line_index: this._output.get_line_number(),
    ternary_depth: 0
  };
  return next_flags;
};

Beautifier.prototype._reset = function(source_text) {
  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  this._last_last_text = ''; // pre-last token text
  this._output = new Output(this._options, baseIndentString);

  // If testing the ignore directive, start with output disable set to true
  this._output.raw = this._options.test_output_raw;


  // Stack of parsing/formatting states, including MODE.
  // We tokenize, parse, and output in an almost purely a forward-only stream of token input
  // and formatted output.  This makes the beautifier less accurate than full parsers
  // but also far more tolerant of syntax errors.
  //
  // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
  // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
  // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
  // most full parsers would die, but the beautifier gracefully falls back to
  // MODE.BlockStatement and continues on.
  this._flag_store = [];
  this.set_mode(MODE.BlockStatement);
  var tokenizer = new Tokenizer(source_text, this._options);
  this._tokens = tokenizer.tokenize();
  return source_text;
};

Beautifier.prototype.beautify = function() {
  // if disabled, return the input unchanged.
  if (this._options.disabled) {
    return this._source_text;
  }

  var sweet_code;
  var source_text = this._reset(this._source_text);

  var eol = this._options.eol;
  if (this._options.eol === 'auto') {
    eol = '\n';
    if (source_text && acorn.lineBreak.test(source_text || '')) {
      eol = source_text.match(acorn.lineBreak)[0];
    }
  }

  var current_token = this._tokens.next();
  while (current_token) {
    this.handle_token(current_token);

    this._last_last_text = this._flags.last_token.text;
    this._flags.last_token = current_token;

    current_token = this._tokens.next();
  }

  sweet_code = this._output.get_code(eol);

  return sweet_code;
};

Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
  if (current_token.type === TOKEN.START_EXPR) {
    this.handle_start_expr(current_token);
  } else if (current_token.type === TOKEN.END_EXPR) {
    this.handle_end_expr(current_token);
  } else if (current_token.type === TOKEN.START_BLOCK) {
    this.handle_start_block(current_token);
  } else if (current_token.type === TOKEN.END_BLOCK) {
    this.handle_end_block(current_token);
  } else if (current_token.type === TOKEN.WORD) {
    this.handle_word(current_token);
  } else if (current_token.type === TOKEN.RESERVED) {
    this.handle_word(current_token);
  } else if (current_token.type === TOKEN.SEMICOLON) {
    this.handle_semicolon(current_token);
  } else if (current_token.type === TOKEN.STRING) {
    this.handle_string(current_token);
  } else if (current_token.type === TOKEN.EQUALS) {
    this.handle_equals(current_token);
  } else if (current_token.type === TOKEN.OPERATOR) {
    this.handle_operator(current_token);
  } else if (current_token.type === TOKEN.COMMA) {
    this.handle_comma(current_token);
  } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
    this.handle_block_comment(current_token, preserve_statement_flags);
  } else if (current_token.type === TOKEN.COMMENT) {
    this.handle_comment(current_token, preserve_statement_flags);
  } else if (current_token.type === TOKEN.DOT) {
    this.handle_dot(current_token);
  } else if (current_token.type === TOKEN.EOF) {
    this.handle_eof(current_token);
  } else if (current_token.type === TOKEN.UNKNOWN) {
    this.handle_unknown(current_token, preserve_statement_flags);
  } else {
    this.handle_unknown(current_token, preserve_statement_flags);
  }
};

Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
  var newlines = current_token.newlines;
  var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);

  if (current_token.comments_before) {
    var comment_token = current_token.comments_before.next();
    while (comment_token) {
      // The cleanest handling of inline comments is to treat them as though they aren't there.
      // Just continue formatting and the behavior should be logical.
      // Also ignore unknown tokens.  Again, this should result in better behavior.
      this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
      this.handle_token(comment_token, preserve_statement_flags);
      comment_token = current_token.comments_before.next();
    }
  }

  if (keep_whitespace) {
    for (var i = 0; i < newlines; i += 1) {
      this.print_newline(i > 0, preserve_statement_flags);
    }
  } else {
    if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
      newlines = this._options.max_preserve_newlines;
    }

    if (this._options.preserve_newlines) {
      if (newlines > 1) {
        this.print_newline(false, preserve_statement_flags);
        for (var j = 1; j < newlines; j += 1) {
          this.print_newline(true, preserve_statement_flags);
        }
      }
    }
  }

};

var newline_restricted_tokens = ['async', 'break', 'continue', 'return', 'throw', 'yield'];

Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
  force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

  // Never wrap the first token on a line
  if (this._output.just_added_newline()) {
    return;
  }

  var shouldPreserveOrForce = (this._options.preserve_newlines && current_token.newlines) || force_linewrap;
  var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) ||
    in_array(current_token.text, positionable_operators);

  if (operatorLogicApplies) {
    var shouldPrintOperatorNewline = (
        in_array(this._flags.last_token.text, positionable_operators) &&
        in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)
      ) ||
      in_array(current_token.text, positionable_operators);
    shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
  }

  if (shouldPreserveOrForce) {
    this.print_newline(false, true);
  } else if (this._options.wrap_line_length) {
    if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
      // These tokens should never have a newline inserted
      // between them and the following expression.
      return;
    }
    this._output.set_wrap_point();
  }
};

Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
  if (!preserve_statement_flags) {
    if (this._flags.last_token.text !== ';' && this._flags.last_token.text !== ',' && this._flags.last_token.text !== '=' && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) {
      var next_token = this._tokens.peek();
      while (this._flags.mode === MODE.Statement &&
        !(this._flags.if_block && reserved_word(next_token, 'else')) &&
        !this._flags.do_block) {
        this.restore_mode();
      }
    }
  }

  if (this._output.add_new_line(force_newline)) {
    this._flags.multiline_frame = true;
  }
};

Beautifier.prototype.print_token_line_indentation = function(current_token) {
  if (this._output.just_added_newline()) {
    if (this._options.keep_array_indentation &&
      current_token.newlines &&
      (current_token.text === '[' || is_array(this._flags.mode))) {
      this._output.current_line.set_indent(-1);
      this._output.current_line.push(current_token.whitespace_before);
      this._output.space_before_token = false;
    } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
      this._flags.line_indent_level = this._flags.indentation_level;
    }
  }
};

Beautifier.prototype.print_token = function(current_token) {
  if (this._output.raw) {
    this._output.add_raw_token(current_token);
    return;
  }

  if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA &&
    this._output.just_added_newline()) {
    if (this._output.previous_line.last() === ',') {
      var popped = this._output.previous_line.pop();
      // if the comma was already at the start of the line,
      // pull back onto that line and reprint the indentation
      if (this._output.previous_line.is_empty()) {
        this._output.previous_line.push(popped);
        this._output.trim(true);
        this._output.current_line.pop();
        this._output.trim();
      }

      // add the comma in front of the next token
      this.print_token_line_indentation(current_token);
      this._output.add_token(',');
      this._output.space_before_token = true;
    }
  }

  this.print_token_line_indentation(current_token);
  this._output.non_breaking_space = true;
  this._output.add_token(current_token.text);
  if (this._output.previous_token_wrapped) {
    this._flags.multiline_frame = true;
  }
};

Beautifier.prototype.indent = function() {
  this._flags.indentation_level += 1;
  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
};

Beautifier.prototype.deindent = function() {
  if (this._flags.indentation_level > 0 &&
    ((!this._flags.parent) || this._flags.indentation_level > this._flags.parent.indentation_level)) {
    this._flags.indentation_level -= 1;
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  }
};

Beautifier.prototype.set_mode = function(mode) {
  if (this._flags) {
    this._flag_store.push(this._flags);
    this._previous_flags = this._flags;
  } else {
    this._previous_flags = this.create_flags(null, mode);
  }

  this._flags = this.create_flags(this._previous_flags, mode);
  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
};


Beautifier.prototype.restore_mode = function() {
  if (this._flag_store.length > 0) {
    this._previous_flags = this._flags;
    this._flags = this._flag_store.pop();
    if (this._previous_flags.mode === MODE.Statement) {
      remove_redundant_indentation(this._output, this._previous_flags);
    }
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  }
};

Beautifier.prototype.start_of_object_property = function() {
  return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (
    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || (reserved_array(this._flags.last_token, ['get', 'set'])));
};

Beautifier.prototype.start_of_statement = function(current_token) {
  var start = false;
  start = start || reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD;
  start = start || reserved_word(this._flags.last_token, 'do');
  start = start || (!(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement)) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
  start = start || reserved_word(this._flags.last_token, 'else') &&
    !(reserved_word(current_token, 'if') && !current_token.comments_before);
  start = start || (this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional));
  start = start || (this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement &&
    !this._flags.in_case &&
    !(current_token.text === '--' || current_token.text === '++') &&
    this._last_last_text !== 'function' &&
    current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED);
  start = start || (this._flags.mode === MODE.ObjectLiteral && (
    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || reserved_array(this._flags.last_token, ['get', 'set'])));

  if (start) {
    this.set_mode(MODE.Statement);
    this.indent();

    this.handle_whitespace_and_comments(current_token, true);

    // Issue #276:
    // If starting a new statement with [if, for, while, do], push to a new line.
    // if (a) if (b) if(c) d(); else e(); else f();
    if (!this.start_of_object_property()) {
      this.allow_wrap_or_preserved_newline(current_token,
        reserved_array(current_token, ['do', 'for', 'if', 'while']));
    }
    return true;
  }
  return false;
};

Beautifier.prototype.handle_start_expr = function(current_token) {
  // The conditional starts the statement if appropriate.
  if (!this.start_of_statement(current_token)) {
    this.handle_whitespace_and_comments(current_token);
  }

  var next_mode = MODE.Expression;
  if (current_token.text === '[') {

    if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ')') {
      // this is array index specifier, break immediately
      // a[x], fn()[x]
      if (reserved_array(this._flags.last_token, line_starters)) {
        this._output.space_before_token = true;
      }
      this.print_token(current_token);
      this.set_mode(next_mode);
      this.indent();
      if (this._options.space_in_paren) {
        this._output.space_before_token = true;
      }
      return;
    }

    next_mode = MODE.ArrayLiteral;
    if (is_array(this._flags.mode)) {
      if (this._flags.last_token.text === '[' ||
        (this._flags.last_token.text === ',' && (this._last_last_text === ']' || this._last_last_text === '}'))) {
        // ], [ goes to new line
        // }, [ goes to new line
        if (!this._options.keep_array_indentation) {
          this.print_newline();
        }
      }
    }

    if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR])) {
      this._output.space_before_token = true;
    }
  } else {
    if (this._flags.last_token.type === TOKEN.RESERVED) {
      if (this._flags.last_token.text === 'for') {
        this._output.space_before_token = this._options.space_before_conditional;
        next_mode = MODE.ForInitializer;
      } else if (in_array(this._flags.last_token.text, ['if', 'while'])) {
        this._output.space_before_token = this._options.space_before_conditional;
        next_mode = MODE.Conditional;
      } else if (in_array(this._flags.last_word, ['await', 'async'])) {
        // Should be a space between await and an IIFE, or async and an arrow function
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === 'import' && current_token.whitespace_before === '') {
        this._output.space_before_token = false;
      } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === 'catch') {
        this._output.space_before_token = true;
      }
    } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      // Support of this kind of newline preservation.
      // a = (b &&
      //     (c || d));
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else if (this._flags.last_token.type === TOKEN.WORD) {
      this._output.space_before_token = false;

      // function name() vs function name ()
      // function* name() vs function* name ()
      // async name() vs async name ()
      // In ES6, you can also define the method properties of an object
      // var obj = {a: function() {}}
      // It can be abbreviated
      // var obj = {a() {}}
      // var obj = { a() {}} vs var obj = { a () {}}
      // var obj = { * a() {}} vs var obj = { * a () {}}
      var peek_back_two = this._tokens.peek(-3);
      if (this._options.space_after_named_function && peek_back_two) {
        // peek starts at next character so -1 is current token
        var peek_back_three = this._tokens.peek(-4);
        if (reserved_array(peek_back_two, ['async', 'function']) ||
          (peek_back_two.text === '*' && reserved_array(peek_back_three, ['async', 'function']))) {
          this._output.space_before_token = true;
        } else if (this._flags.mode === MODE.ObjectLiteral) {
          if ((peek_back_two.text === '{' || peek_back_two.text === ',') ||
            (peek_back_two.text === '*' && (peek_back_three.text === '{' || peek_back_three.text === ','))) {
            this._output.space_before_token = true;
          }
        }
      }
    } else {
      // Support preserving wrapped arrow function expressions
      // a.b('c',
      //     () => d.e
      // )
      this.allow_wrap_or_preserved_newline(current_token);
    }

    // function() vs function ()
    // yield*() vs yield* ()
    // function*() vs function* ()
    if ((this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === 'function' || this._flags.last_word === 'typeof')) ||
      (this._flags.last_token.text === '*' &&
        (in_array(this._last_last_text, ['function', 'yield']) ||
          (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
      this._output.space_before_token = this._options.space_after_anon_function;
    }
  }

  if (this._flags.last_token.text === ';' || this._flags.last_token.type === TOKEN.START_BLOCK) {
    this.print_newline();
  } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === '.' || this._flags.last_token.type === TOKEN.COMMA) {
    // do nothing on (( and )( and ][ and ]( and .(
    // TODO: Consider whether forcing this is required.  Review failing tests when removed.
    this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
  }

  this.print_token(current_token);
  this.set_mode(next_mode);
  if (this._options.space_in_paren) {
    this._output.space_before_token = true;
  }

  // In all cases, if we newline while inside an expression it should be indented.
  this.indent();
};

Beautifier.prototype.handle_end_expr = function(current_token) {
  // statements inside expressions are not valid syntax, but...
  // statements must all be closed when their container closes
  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }

  this.handle_whitespace_and_comments(current_token);

  if (this._flags.multiline_frame) {
    this.allow_wrap_or_preserved_newline(current_token,
      current_token.text === ']' && is_array(this._flags.mode) && !this._options.keep_array_indentation);
  }

  if (this._options.space_in_paren) {
    if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
      // () [] no inner space in empty parens like these, ever, ref #320
      this._output.trim();
      this._output.space_before_token = false;
    } else {
      this._output.space_before_token = true;
    }
  }
  this.deindent();
  this.print_token(current_token);
  this.restore_mode();

  remove_redundant_indentation(this._output, this._previous_flags);

  // do {} while () // no statement required after
  if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
    this._previous_flags.mode = MODE.Expression;
    this._flags.do_block = false;
    this._flags.do_while = false;

  }
};

Beautifier.prototype.handle_start_block = function(current_token) {
  this.handle_whitespace_and_comments(current_token);

  // Check if this is should be treated as a ObjectLiteral
  var next_token = this._tokens.peek();
  var second_token = this._tokens.peek(1);
  if (this._flags.last_word === 'switch' && this._flags.last_token.type === TOKEN.END_EXPR) {
    this.set_mode(MODE.BlockStatement);
    this._flags.in_case_statement = true;
  } else if (this._flags.case_body) {
    this.set_mode(MODE.BlockStatement);
  } else if (second_token && (
      (in_array(second_token.text, [':', ',']) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED])) ||
      (in_array(next_token.text, ['get', 'set', '...']) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))
    )) {
    // We don't support TypeScript,but we didn't break it for a very long time.
    // We'll try to keep not breaking it.
    if (!in_array(this._last_last_text, ['class', 'interface'])) {
      this.set_mode(MODE.ObjectLiteral);
    } else {
      this.set_mode(MODE.BlockStatement);
    }
  } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === '=>') {
    // arrow function: (param1, paramN) => { statements }
    this.set_mode(MODE.BlockStatement);
  } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) ||
    reserved_array(this._flags.last_token, ['return', 'throw', 'import', 'default'])
  ) {
    // Detecting shorthand function syntax is difficult by scanning forward,
    //     so check the surrounding context.
    // If the block is being returned, imported, export default, passed as arg,
    //     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
    this.set_mode(MODE.ObjectLiteral);
  } else {
    this.set_mode(MODE.BlockStatement);
  }

  var empty_braces = !next_token.comments_before && next_token.text === '}';
  var empty_anonymous_function = empty_braces && this._flags.last_word === 'function' &&
    this._flags.last_token.type === TOKEN.END_EXPR;

  if (this._options.brace_preserve_inline) // check for inline, set inline_frame if so
  {
    // search forward for a newline wanted inside this block
    var index = 0;
    var check_token = null;
    this._flags.inline_frame = true;
    do {
      index += 1;
      check_token = this._tokens.peek(index - 1);
      if (check_token.newlines) {
        this._flags.inline_frame = false;
        break;
      }
    } while (check_token.type !== TOKEN.EOF &&
      !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
  }

  if ((this._options.brace_style === "expand" ||
      (this._options.brace_style === "none" && current_token.newlines)) &&
    !this._flags.inline_frame) {
    if (this._flags.last_token.type !== TOKEN.OPERATOR &&
      (empty_anonymous_function ||
        this._flags.last_token.type === TOKEN.EQUALS ||
        (reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== 'else'))) {
      this._output.space_before_token = true;
    } else {
      this.print_newline(false, true);
    }
  } else { // collapse || inline_frame
    if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
      if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
        this._output.space_before_token = true;
      }

      if (this._flags.last_token.type === TOKEN.COMMA || (this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame)) {
        this.allow_wrap_or_preserved_newline(current_token);
        this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
        this._flags.multiline_frame = false;
      }
    }
    if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
      if (this._flags.last_token.type === TOKEN.START_BLOCK && !this._flags.inline_frame) {
        this.print_newline();
      } else {
        this._output.space_before_token = true;
      }
    }
  }
  this.print_token(current_token);
  this.indent();

  // Except for specific cases, open braces are followed by a new line.
  if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
    this.print_newline();
  }
};

Beautifier.prototype.handle_end_block = function(current_token) {
  // statements must all be closed when their container closes
  this.handle_whitespace_and_comments(current_token);

  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }

  var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;

  if (this._flags.inline_frame && !empty_braces) { // try inline_frame (only set if this._options.braces-preserve-inline) first
    this._output.space_before_token = true;
  } else if (this._options.brace_style === "expand") {
    if (!empty_braces) {
      this.print_newline();
    }
  } else {
    // skip {}
    if (!empty_braces) {
      if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
        // we REALLY need a newline here, but newliner would skip that
        this._options.keep_array_indentation = false;
        this.print_newline();
        this._options.keep_array_indentation = true;

      } else {
        this.print_newline();
      }
    }
  }
  this.restore_mode();
  this.print_token(current_token);
};

Beautifier.prototype.handle_word = function(current_token) {
  if (current_token.type === TOKEN.RESERVED) {
    if (in_array(current_token.text, ['set', 'get']) && this._flags.mode !== MODE.ObjectLiteral) {
      current_token.type = TOKEN.WORD;
    } else if (current_token.text === 'import' && this._tokens.peek().text === '(') {
      current_token.type = TOKEN.WORD;
    } else if (in_array(current_token.text, ['as', 'from']) && !this._flags.import_block) {
      current_token.type = TOKEN.WORD;
    } else if (this._flags.mode === MODE.ObjectLiteral) {
      var next_token = this._tokens.peek();
      if (next_token.text === ':') {
        current_token.type = TOKEN.WORD;
      }
    }
  }

  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    if (reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD) {
      this._flags.declaration_statement = true;
    }
  } else if (current_token.newlines && !is_expression(this._flags.mode) &&
    (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) &&
    this._flags.last_token.type !== TOKEN.EQUALS &&
    (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ['var', 'let', 'const', 'set', 'get']))) {
    this.handle_whitespace_and_comments(current_token);
    this.print_newline();
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  if (this._flags.do_block && !this._flags.do_while) {
    if (reserved_word(current_token, 'while')) {
      // do {} ## while ()
      this._output.space_before_token = true;
      this.print_token(current_token);
      this._output.space_before_token = true;
      this._flags.do_while = true;
      return;
    } else {
      // do {} should always have while as the next word.
      // if we don't see the expected while, recover
      this.print_newline();
      this._flags.do_block = false;
    }
  }

  // if may be followed by else, or not
  // Bare/inline ifs are tricky
  // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
  if (this._flags.if_block) {
    if (!this._flags.else_block && reserved_word(current_token, 'else')) {
      this._flags.else_block = true;
    } else {
      while (this._flags.mode === MODE.Statement) {
        this.restore_mode();
      }
      this._flags.if_block = false;
      this._flags.else_block = false;
    }
  }

  if (this._flags.in_case_statement && reserved_array(current_token, ['case', 'default'])) {
    this.print_newline();
    if (this._flags.last_token.type !== TOKEN.END_BLOCK && (this._flags.case_body || this._options.jslint_happy)) {
      // switch cases following one another
      this.deindent();
    }
    this._flags.case_body = false;

    this.print_token(current_token);
    this._flags.in_case = true;
    return;
  }

  if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
    if (!this.start_of_object_property()) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
  }

  if (reserved_word(current_token, 'function')) {
    if (in_array(this._flags.last_token.text, ['}', ';']) ||
      (this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ['(', '[', '{', ':', '=', ',']) || this._flags.last_token.type === TOKEN.OPERATOR))) {
      // make sure there is a nice clean space of at least one blank line
      // before a new function definition
      if (!this._output.just_added_blankline() && !current_token.comments_before) {
        this.print_newline();
        this.print_newline(true);
      }
    }
    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
      if (reserved_array(this._flags.last_token, ['get', 'set', 'new', 'export']) ||
        reserved_array(this._flags.last_token, newline_restricted_tokens)) {
        this._output.space_before_token = true;
      } else if (reserved_word(this._flags.last_token, 'default') && this._last_last_text === 'export') {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === 'declare') {
        // accomodates Typescript declare function formatting
        this._output.space_before_token = true;
      } else {
        this.print_newline();
      }
    } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === '=') {
      // foo = function
      this._output.space_before_token = true;
    } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {
      // (function
    } else {
      this.print_newline();
    }

    this.print_token(current_token);
    this._flags.last_word = current_token.text;
    return;
  }

  var prefix = 'NONE';

  if (this._flags.last_token.type === TOKEN.END_BLOCK) {

    if (this._previous_flags.inline_frame) {
      prefix = 'SPACE';
    } else if (!reserved_array(current_token, ['else', 'catch', 'finally', 'from'])) {
      prefix = 'NEWLINE';
    } else {
      if (this._options.brace_style === "expand" ||
        this._options.brace_style === "end-expand" ||
        (this._options.brace_style === "none" && current_token.newlines)) {
        prefix = 'NEWLINE';
      } else {
        prefix = 'SPACE';
        this._output.space_before_token = true;
      }
    }
  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
    // TODO: Should this be for STATEMENT as well?
    prefix = 'NEWLINE';
  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
    prefix = 'SPACE';
  } else if (this._flags.last_token.type === TOKEN.STRING) {
    prefix = 'NEWLINE';
  } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD ||
    (this._flags.last_token.text === '*' &&
      (in_array(this._last_last_text, ['function', 'yield']) ||
        (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
    prefix = 'SPACE';
  } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
    if (this._flags.inline_frame) {
      prefix = 'SPACE';
    } else {
      prefix = 'NEWLINE';
    }
  } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
    this._output.space_before_token = true;
    prefix = 'NEWLINE';
  }

  if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
    if (this._flags.inline_frame || this._flags.last_token.text === 'else' || this._flags.last_token.text === 'export') {
      prefix = 'SPACE';
    } else {
      prefix = 'NEWLINE';
    }

  }

  if (reserved_array(current_token, ['else', 'catch', 'finally'])) {
    if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) ||
        this._options.brace_style === "expand" ||
        this._options.brace_style === "end-expand" ||
        (this._options.brace_style === "none" && current_token.newlines)) &&
      !this._flags.inline_frame) {
      this.print_newline();
    } else {
      this._output.trim(true);
      var line = this._output.current_line;
      // If we trimmed and there's something other than a close block before us
      // put a newline back in.  Handles '} // comment' scenario.
      if (line.last() !== '}') {
        this.print_newline();
      }
      this._output.space_before_token = true;
    }
  } else if (prefix === 'NEWLINE') {
    if (reserved_array(this._flags.last_token, special_words)) {
      // no newline between 'return nnn'
      this._output.space_before_token = true;
    } else if (this._flags.last_token.text === 'declare' && reserved_array(current_token, ['var', 'let', 'const'])) {
      // accomodates Typescript declare formatting
      this._output.space_before_token = true;
    } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
      if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ['var', 'let', 'const'])) && this._flags.last_token.text !== ':') {
        // no need to force newline on 'var': for (var x = 0...)
        if (reserved_word(current_token, 'if') && reserved_word(current_token.previous, 'else')) {
          // no newline for } else if {
          this._output.space_before_token = true;
        } else {
          this.print_newline();
        }
      }
    } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
      this.print_newline();
    }
  } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === ',' && this._last_last_text === '}') {
    this.print_newline(); // }, in lists get a newline treatment
  } else if (prefix === 'SPACE') {
    this._output.space_before_token = true;
  }
  if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
    this._output.space_before_token = true;
  }
  this.print_token(current_token);
  this._flags.last_word = current_token.text;

  if (current_token.type === TOKEN.RESERVED) {
    if (current_token.text === 'do') {
      this._flags.do_block = true;
    } else if (current_token.text === 'if') {
      this._flags.if_block = true;
    } else if (current_token.text === 'import') {
      this._flags.import_block = true;
    } else if (this._flags.import_block && reserved_word(current_token, 'from')) {
      this._flags.import_block = false;
    }
  }
};

Beautifier.prototype.handle_semicolon = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    // Semicolon can be the start (and end) of a statement
    this._output.space_before_token = false;
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  var next_token = this._tokens.peek();
  while (this._flags.mode === MODE.Statement &&
    !(this._flags.if_block && reserved_word(next_token, 'else')) &&
    !this._flags.do_block) {
    this.restore_mode();
  }

  // hacky but effective for the moment
  if (this._flags.import_block) {
    this._flags.import_block = false;
  }
  this.print_token(current_token);
};

Beautifier.prototype.handle_string = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    // One difference - strings want at least a space before
    this._output.space_before_token = true;
  } else {
    this.handle_whitespace_and_comments(current_token);
    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
      this._output.space_before_token = true;
    } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else {
      this.print_newline();
    }
  }
  this.print_token(current_token);
};

Beautifier.prototype.handle_equals = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  if (this._flags.declaration_statement) {
    // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
    this._flags.declaration_assignment = true;
  }
  this._output.space_before_token = true;
  this.print_token(current_token);
  this._output.space_before_token = true;
};

Beautifier.prototype.handle_comma = function(current_token) {
  this.handle_whitespace_and_comments(current_token, true);

  this.print_token(current_token);
  this._output.space_before_token = true;
  if (this._flags.declaration_statement) {
    if (is_expression(this._flags.parent.mode)) {
      // do not break on comma, for(var a = 1, b = 2)
      this._flags.declaration_assignment = false;
    }

    if (this._flags.declaration_assignment) {
      this._flags.declaration_assignment = false;
      this.print_newline(false, true);
    } else if (this._options.comma_first) {
      // for comma-first, we want to allow a newline before the comma
      // to turn into a newline after the comma, which we will fixup later
      this.allow_wrap_or_preserved_newline(current_token);
    }
  } else if (this._flags.mode === MODE.ObjectLiteral ||
    (this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral)) {
    if (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }

    if (!this._flags.inline_frame) {
      this.print_newline();
    }
  } else if (this._options.comma_first) {
    // EXPR or DO_BLOCK
    // for comma-first, we want to allow a newline before the comma
    // to turn into a newline after the comma, which we will fixup later
    this.allow_wrap_or_preserved_newline(current_token);
  }
};

Beautifier.prototype.handle_operator = function(current_token) {
  var isGeneratorAsterisk = current_token.text === '*' &&
    (reserved_array(this._flags.last_token, ['function', 'yield']) ||
      (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]))
    );
  var isUnary = in_array(current_token.text, ['-', '+']) && (
    in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) ||
    in_array(this._flags.last_token.text, line_starters) ||
    this._flags.last_token.text === ','
  );

  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    var preserve_statement_flags = !isGeneratorAsterisk;
    this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
  }

  if (reserved_array(this._flags.last_token, special_words)) {
    // "return" had a special handling in TK_WORD. Now we need to return the favor
    this._output.space_before_token = true;
    this.print_token(current_token);
    return;
  }

  // hack for actionscript's import .*;
  if (current_token.text === '*' && this._flags.last_token.type === TOKEN.DOT) {
    this.print_token(current_token);
    return;
  }

  if (current_token.text === '::') {
    // no spaces around exotic namespacing syntax operator
    this.print_token(current_token);
    return;
  }

  // Allow line wrapping between operators when operator_position is
  //   set to before or preserve
  if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
    this.allow_wrap_or_preserved_newline(current_token);
  }

  if (current_token.text === ':' && this._flags.in_case) {
    this.print_token(current_token);

    this._flags.in_case = false;
    this._flags.case_body = true;
    if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
      this.indent();
      this.print_newline();
    } else {
      this._output.space_before_token = true;
    }
    return;
  }

  var space_before = true;
  var space_after = true;
  var in_ternary = false;
  if (current_token.text === ':') {
    if (this._flags.ternary_depth === 0) {
      // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
      space_before = false;
    } else {
      this._flags.ternary_depth -= 1;
      in_ternary = true;
    }
  } else if (current_token.text === '?') {
    this._flags.ternary_depth += 1;
  }

  // let's handle the operator_position option prior to any conflicting logic
  if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
    var isColon = current_token.text === ':';
    var isTernaryColon = (isColon && in_ternary);
    var isOtherColon = (isColon && !in_ternary);

    switch (this._options.operator_position) {
      case OPERATOR_POSITION.before_newline:
        // if the current token is : and it's not a ternary statement then we set space_before to false
        this._output.space_before_token = !isOtherColon;

        this.print_token(current_token);

        if (!isColon || isTernaryColon) {
          this.allow_wrap_or_preserved_newline(current_token);
        }

        this._output.space_before_token = true;
        return;

      case OPERATOR_POSITION.after_newline:
        // if the current token is anything but colon, or (via deduction) it's a colon and in a ternary statement,
        //   then print a newline.

        this._output.space_before_token = true;

        if (!isColon || isTernaryColon) {
          if (this._tokens.peek().newlines) {
            this.print_newline(false, true);
          } else {
            this.allow_wrap_or_preserved_newline(current_token);
          }
        } else {
          this._output.space_before_token = false;
        }

        this.print_token(current_token);

        this._output.space_before_token = true;
        return;

      case OPERATOR_POSITION.preserve_newline:
        if (!isOtherColon) {
          this.allow_wrap_or_preserved_newline(current_token);
        }

        // if we just added a newline, or the current token is : and it's not a ternary statement,
        //   then we set space_before to false
        space_before = !(this._output.just_added_newline() || isOtherColon);

        this._output.space_before_token = space_before;
        this.print_token(current_token);
        this._output.space_before_token = true;
        return;
    }
  }

  if (isGeneratorAsterisk) {
    this.allow_wrap_or_preserved_newline(current_token);
    space_before = false;
    var next_token = this._tokens.peek();
    space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
  } else if (current_token.text === '...') {
    this.allow_wrap_or_preserved_newline(current_token);
    space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
    space_after = false;
  } else if (in_array(current_token.text, ['--', '++', '!', '~']) || isUnary) {
    // unary operators (and binary +/- pretending to be unary) special cases
    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
      this.allow_wrap_or_preserved_newline(current_token);
    }

    space_before = false;
    space_after = false;

    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
    // if there is a newline between -- or ++ and anything else we should preserve it.
    if (current_token.newlines && (current_token.text === '--' || current_token.text === '++')) {
      this.print_newline(false, true);
    }

    if (this._flags.last_token.text === ';' && is_expression(this._flags.mode)) {
      // for (;; ++i)
      //        ^^^
      space_before = true;
    }

    if (this._flags.last_token.type === TOKEN.RESERVED) {
      space_before = true;
    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
      space_before = !(this._flags.last_token.text === ']' && (current_token.text === '--' || current_token.text === '++'));
    } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
      // a++ + ++b;
      // a - -b
      space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(this._flags.last_token.text, ['--', '-', '++', '+']);
      // + and - are not unary when preceeded by -- or ++ operator
      // a-- + b
      // a * +b
      // a - -b
      if (in_array(current_token.text, ['+', '-']) && in_array(this._flags.last_token.text, ['--', '++'])) {
        space_after = true;
      }
    }


    if (((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame) || this._flags.mode === MODE.Statement) &&
      (this._flags.last_token.text === '{' || this._flags.last_token.text === ';')) {
      // { foo; --i }
      // foo(); --bar;
      this.print_newline();
    }
  }

  this._output.space_before_token = this._output.space_before_token || space_before;
  this.print_token(current_token);
  this._output.space_before_token = space_after;
};

Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
  if (this._output.raw) {
    this._output.add_raw_token(current_token);
    if (current_token.directives && current_token.directives.preserve === 'end') {
      // If we're testing the raw output behavior, do not allow a directive to turn it off.
      this._output.raw = this._options.test_output_raw;
    }
    return;
  }

  if (current_token.directives) {
    this.print_newline(false, preserve_statement_flags);
    this.print_token(current_token);
    if (current_token.directives.preserve === 'start') {
      this._output.raw = true;
    }
    this.print_newline(false, true);
    return;
  }

  // inline block
  if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
    this._output.space_before_token = true;
    this.print_token(current_token);
    this._output.space_before_token = true;
    return;
  } else {
    this.print_block_commment(current_token, preserve_statement_flags);
  }
};

Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
  var lines = split_linebreaks(current_token.text);
  var j; // iterator for this case
  var javadoc = false;
  var starless = false;
  var lastIndent = current_token.whitespace_before;
  var lastIndentLength = lastIndent.length;

  // block comment starts with a new line
  this.print_newline(false, preserve_statement_flags);

  // first line always indented
  this.print_token_line_indentation(current_token);
  this._output.add_token(lines[0]);
  this.print_newline(false, preserve_statement_flags);


  if (lines.length > 1) {
    lines = lines.slice(1);
    javadoc = all_lines_start_with(lines, '*');
    starless = each_line_matches_indent(lines, lastIndent);

    if (javadoc) {
      this._flags.alignment = 1;
    }

    for (j = 0; j < lines.length; j++) {
      if (javadoc) {
        // javadoc: reformat and re-indent
        this.print_token_line_indentation(current_token);
        this._output.add_token(ltrim(lines[j]));
      } else if (starless && lines[j]) {
        // starless: re-indent non-empty content, avoiding trim
        this.print_token_line_indentation(current_token);
        this._output.add_token(lines[j].substring(lastIndentLength));
      } else {
        // normal comments output raw
        this._output.current_line.set_indent(-1);
        this._output.add_token(lines[j]);
      }

      // for comments on their own line or  more than one line, make sure there's a new line after
      this.print_newline(false, preserve_statement_flags);
    }

    this._flags.alignment = 0;
  }
};


Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
  if (current_token.newlines) {
    this.print_newline(false, preserve_statement_flags);
  } else {
    this._output.trim(true);
  }

  this._output.space_before_token = true;
  this.print_token(current_token);
  this.print_newline(false, preserve_statement_flags);
};

Beautifier.prototype.handle_dot = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    this.handle_whitespace_and_comments(current_token, true);
  }

  if (reserved_array(this._flags.last_token, special_words)) {
    this._output.space_before_token = false;
  } else {
    // allow preserved newlines before dots in general
    // force newlines on dots after close paren when break_chained - for bar().baz()
    this.allow_wrap_or_preserved_newline(current_token,
      this._flags.last_token.text === ')' && this._options.break_chained_methods);
  }

  // Only unindent chained method dot if this dot starts a new line.
  // Otherwise the automatic extra indentation removal will handle the over indent
  if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
    this.deindent();
  }

  this.print_token(current_token);
};

Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
  this.print_token(current_token);

  if (current_token.text[current_token.text.length - 1] === '\n') {
    this.print_newline(false, preserve_statement_flags);
  }
};

Beautifier.prototype.handle_eof = function(current_token) {
  // Unwind any open statements
  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }
  this.handle_whitespace_and_comments(current_token);
};

module.exports.Beautifier = Beautifier;

},{"../core/output":67,"../core/token":70,"./acorn":82,"./options":85,"./tokenizer":86}],84:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function js_beautify(js_source_text, options) {
  var beautifier = new Beautifier(js_source_text, options);
  return beautifier.beautify();
}

module.exports = js_beautify;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":83,"./options":85}],85:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

function Options(options) {
  BaseOptions.call(this, options, 'js');

  // compatibility, re
  var raw_brace_style = this.raw_options.brace_style || null;
  if (raw_brace_style === "expand-strict") { //graceful handling of deprecated option
    this.raw_options.brace_style = "expand";
  } else if (raw_brace_style === "collapse-preserve-inline") { //graceful handling of deprecated option
    this.raw_options.brace_style = "collapse,preserve-inline";
  } else if (this.raw_options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
    this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
    // } else if (!raw_brace_style) { //Nothing exists to set it
    //   raw_brace_style = "collapse";
  }

  //preserve-inline in delimited string will trigger brace_preserve_inline, everything
  //else is considered a brace_style and the last one only will have an effect

  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);

  this.brace_preserve_inline = false; //Defaults in case one or other was not specified in meta-option
  this.brace_style = "collapse";

  for (var bs = 0; bs < brace_style_split.length; bs++) {
    if (brace_style_split[bs] === "preserve-inline") {
      this.brace_preserve_inline = true;
    } else {
      this.brace_style = brace_style_split[bs];
    }
  }

  this.unindent_chained_methods = this._get_boolean('unindent_chained_methods');
  this.break_chained_methods = this._get_boolean('break_chained_methods');
  this.space_in_paren = this._get_boolean('space_in_paren');
  this.space_in_empty_paren = this._get_boolean('space_in_empty_paren');
  this.jslint_happy = this._get_boolean('jslint_happy');
  this.space_after_anon_function = this._get_boolean('space_after_anon_function');
  this.space_after_named_function = this._get_boolean('space_after_named_function');
  this.keep_array_indentation = this._get_boolean('keep_array_indentation');
  this.space_before_conditional = this._get_boolean('space_before_conditional', true);
  this.unescape_strings = this._get_boolean('unescape_strings');
  this.e4x = this._get_boolean('e4x');
  this.comma_first = this._get_boolean('comma_first');
  this.operator_position = this._get_selection('operator_position', validPositionValues);

  // For testing of beautify preserve:start directive
  this.test_output_raw = this._get_boolean('test_output_raw');

  // force this._options.space_after_anon_function to true if this._options.jslint_happy
  if (this.jslint_happy) {
    this.space_after_anon_function = true;
  }

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":66}],86:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var InputScanner = require('../core/inputscanner').InputScanner;
var BaseTokenizer = require('../core/tokenizer').Tokenizer;
var BASETOKEN = require('../core/tokenizer').TOKEN;
var Directives = require('../core/directives').Directives;
var acorn = require('./acorn');
var Pattern = require('../core/pattern').Pattern;
var TemplatablePattern = require('../core/templatablepattern').TemplatablePattern;


function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}


var TOKEN = {
  START_EXPR: 'TK_START_EXPR',
  END_EXPR: 'TK_END_EXPR',
  START_BLOCK: 'TK_START_BLOCK',
  END_BLOCK: 'TK_END_BLOCK',
  WORD: 'TK_WORD',
  RESERVED: 'TK_RESERVED',
  SEMICOLON: 'TK_SEMICOLON',
  STRING: 'TK_STRING',
  EQUALS: 'TK_EQUALS',
  OPERATOR: 'TK_OPERATOR',
  COMMA: 'TK_COMMA',
  BLOCK_COMMENT: 'TK_BLOCK_COMMENT',
  COMMENT: 'TK_COMMENT',
  DOT: 'TK_DOT',
  UNKNOWN: 'TK_UNKNOWN',
  START: BASETOKEN.START,
  RAW: BASETOKEN.RAW,
  EOF: BASETOKEN.EOF
};


var directives_core = new Directives(/\/\*/, /\*\//);

var number_pattern = /0[xX][0123456789abcdefABCDEF]*|0[oO][01234567]*|0[bB][01]*|\d+n|(?:\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/;

var digit = /[0-9]/;

// Dot "." must be distinguished from "..." and decimal
var dot_pattern = /[^\d\.]/;

var positionable_operators = (
  ">>> === !== " +
  "<< && >= ** != == <= >> || " +
  "< / - + > : & % ? ^ | *").split(' ');

// IMPORTANT: this must be sorted longest to shortest or tokenizing many not work.
// Also, you must update possitionable operators separately from punct
var punct =
  ">>>= " +
  "... >>= <<= === >>> !== **= " +
  "=> ^= :: /= << <= == && -= >= >> != -- += ** || ++ %= &= *= |= " +
  "= ! ? > < : / ^ - + * & % ~ |";

punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
punct = punct.replace(/ /g, '|');

var punct_pattern = new RegExp(punct);

// words which should always start on new line.
var line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
var reserved_words = line_starters.concat(['do', 'in', 'of', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as']);
var reserved_word_pattern = new RegExp('^(?:' + reserved_words.join('|') + ')$');

// var template_pattern = /(?:(?:<\?php|<\?=)[\s\S]*?\?>)|(?:<%[\s\S]*?%>)/g;

var in_html_comment;

var Tokenizer = function(input_string, options) {
  BaseTokenizer.call(this, input_string, options);

  this._patterns.whitespace = this._patterns.whitespace.matching(
    /\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source,
    /\u2028\u2029/.source);

  var pattern_reader = new Pattern(this._input);
  var templatable = new TemplatablePattern(this._input)
    .read_options(this._options);

  this.__patterns = {
    template: templatable,
    identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
    number: pattern_reader.matching(number_pattern),
    punct: pattern_reader.matching(punct_pattern),
    // comment ends just before nearest linefeed or end of file
    comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
    //  /* ... */ comment ends with nearest */ or end of file
    block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
    html_comment_start: pattern_reader.matching(/<!--/),
    html_comment_end: pattern_reader.matching(/-->/),
    include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
    shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
    xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/),
    single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
    double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
    template_text: templatable.until(/[`\\$]/),
    template_expression: templatable.until(/[`}\\]/)
  };

};
Tokenizer.prototype = new BaseTokenizer();

Tokenizer.prototype._is_comment = function(current_token) {
  return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
};

Tokenizer.prototype._is_opening = function(current_token) {
  return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) {
  return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) &&
    (open_token && (
      (current_token.text === ']' && open_token.text === '[') ||
      (current_token.text === ')' && open_token.text === '(') ||
      (current_token.text === '}' && open_token.text === '{')));
};

Tokenizer.prototype._reset = function() {
  in_html_comment = false;
};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  var token = null;
  this._readWhitespace();
  var c = this._input.peek();

  if (c === null) {
    return this._create_token(TOKEN.EOF, '');
  }

  token = token || this._read_string(c);
  token = token || this._read_word(previous_token);
  token = token || this._read_singles(c);
  token = token || this._read_comment(c);
  token = token || this._read_regexp(c, previous_token);
  token = token || this._read_xml(c, previous_token);
  token = token || this._read_non_javascript(c);
  token = token || this._read_punctuation();
  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  return token;
};

Tokenizer.prototype._read_word = function(previous_token) {
  var resulting_string;
  resulting_string = this.__patterns.identifier.read();
  if (resulting_string !== '') {
    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');
    if (!(previous_token.type === TOKEN.DOT ||
        (previous_token.type === TOKEN.RESERVED && (previous_token.text === 'set' || previous_token.text === 'get'))) &&
      reserved_word_pattern.test(resulting_string)) {
      if (resulting_string === 'in' || resulting_string === 'of') { // hack for 'in' and 'of' operators
        return this._create_token(TOKEN.OPERATOR, resulting_string);
      }
      return this._create_token(TOKEN.RESERVED, resulting_string);
    }
    return this._create_token(TOKEN.WORD, resulting_string);
  }

  resulting_string = this.__patterns.number.read();
  if (resulting_string !== '') {
    return this._create_token(TOKEN.WORD, resulting_string);
  }
};

Tokenizer.prototype._read_singles = function(c) {
  var token = null;
  if (c === '(' || c === '[') {
    token = this._create_token(TOKEN.START_EXPR, c);
  } else if (c === ')' || c === ']') {
    token = this._create_token(TOKEN.END_EXPR, c);
  } else if (c === '{') {
    token = this._create_token(TOKEN.START_BLOCK, c);
  } else if (c === '}') {
    token = this._create_token(TOKEN.END_BLOCK, c);
  } else if (c === ';') {
    token = this._create_token(TOKEN.SEMICOLON, c);
  } else if (c === '.' && dot_pattern.test(this._input.peek(1))) {
    token = this._create_token(TOKEN.DOT, c);
  } else if (c === ',') {
    token = this._create_token(TOKEN.COMMA, c);
  }

  if (token) {
    this._input.next();
  }
  return token;
};

Tokenizer.prototype._read_punctuation = function() {
  var resulting_string = this.__patterns.punct.read();

  if (resulting_string !== '') {
    if (resulting_string === '=') {
      return this._create_token(TOKEN.EQUALS, resulting_string);
    } else {
      return this._create_token(TOKEN.OPERATOR, resulting_string);
    }
  }
};

Tokenizer.prototype._read_non_javascript = function(c) {
  var resulting_string = '';

  if (c === '#') {
    if (this._is_first_token()) {
      resulting_string = this.__patterns.shebang.read();

      if (resulting_string) {
        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
      }
    }

    // handles extendscript #includes
    resulting_string = this.__patterns.include.read();

    if (resulting_string) {
      return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
    }

    c = this._input.next();

    // Spidermonkey-specific sharp variables for circular references. Considered obsolete.
    var sharp = '#';
    if (this._input.hasNext() && this._input.testChar(digit)) {
      do {
        c = this._input.next();
        sharp += c;
      } while (this._input.hasNext() && c !== '#' && c !== '=');
      if (c === '#') {
        //
      } else if (this._input.peek() === '[' && this._input.peek(1) === ']') {
        sharp += '[]';
        this._input.next();
        this._input.next();
      } else if (this._input.peek() === '{' && this._input.peek(1) === '}') {
        sharp += '{}';
        this._input.next();
        this._input.next();
      }
      return this._create_token(TOKEN.WORD, sharp);
    }

    this._input.back();

  } else if (c === '<' && this._is_first_token()) {
    resulting_string = this.__patterns.html_comment_start.read();
    if (resulting_string) {
      while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
        resulting_string += this._input.next();
      }
      in_html_comment = true;
      return this._create_token(TOKEN.COMMENT, resulting_string);
    }
  } else if (in_html_comment && c === '-') {
    resulting_string = this.__patterns.html_comment_end.read();
    if (resulting_string) {
      in_html_comment = false;
      return this._create_token(TOKEN.COMMENT, resulting_string);
    }
  }

  return null;
};

Tokenizer.prototype._read_comment = function(c) {
  var token = null;
  if (c === '/') {
    var comment = '';
    if (this._input.peek(1) === '*') {
      // peek for comment /* ... */
      comment = this.__patterns.block_comment.read();
      var directives = directives_core.get_directives(comment);
      if (directives && directives.ignore === 'start') {
        comment += directives_core.readIgnored(this._input);
      }
      comment = comment.replace(acorn.allLineBreaks, '\n');
      token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
      token.directives = directives;
    } else if (this._input.peek(1) === '/') {
      // peek for comment // ...
      comment = this.__patterns.comment.read();
      token = this._create_token(TOKEN.COMMENT, comment);
    }
  }
  return token;
};

Tokenizer.prototype._read_string = function(c) {
  if (c === '`' || c === "'" || c === '"') {
    var resulting_string = this._input.next();
    this.has_char_escapes = false;

    if (c === '`') {
      resulting_string += this._read_string_recursive('`', true, '${');
    } else {
      resulting_string += this._read_string_recursive(c);
    }

    if (this.has_char_escapes && this._options.unescape_strings) {
      resulting_string = unescape_string(resulting_string);
    }

    if (this._input.peek() === c) {
      resulting_string += this._input.next();
    }

    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');

    return this._create_token(TOKEN.STRING, resulting_string);
  }

  return null;
};

Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
  // regex and xml can only appear in specific locations during parsing
  return (previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
    (previous_token.type === TOKEN.END_EXPR && previous_token.text === ')' &&
      previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ['if', 'while', 'for'])) ||
    (in_array(previous_token.type, [TOKEN.COMMENT, TOKEN.START_EXPR, TOKEN.START_BLOCK, TOKEN.START,
      TOKEN.END_BLOCK, TOKEN.OPERATOR, TOKEN.EQUALS, TOKEN.EOF, TOKEN.SEMICOLON, TOKEN.COMMA
    ]));
};

Tokenizer.prototype._read_regexp = function(c, previous_token) {

  if (c === '/' && this._allow_regexp_or_xml(previous_token)) {
    // handle regexp
    //
    var resulting_string = this._input.next();
    var esc = false;

    var in_char_class = false;
    while (this._input.hasNext() &&
      ((esc || in_char_class || this._input.peek() !== c) &&
        !this._input.testChar(acorn.newline))) {
      resulting_string += this._input.peek();
      if (!esc) {
        esc = this._input.peek() === '\\';
        if (this._input.peek() === '[') {
          in_char_class = true;
        } else if (this._input.peek() === ']') {
          in_char_class = false;
        }
      } else {
        esc = false;
      }
      this._input.next();
    }

    if (this._input.peek() === c) {
      resulting_string += this._input.next();

      // regexps may have modifiers /regexp/MOD , so fetch those, too
      // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
      resulting_string += this._input.read(acorn.identifier);
    }
    return this._create_token(TOKEN.STRING, resulting_string);
  }
  return null;
};

Tokenizer.prototype._read_xml = function(c, previous_token) {

  if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
    var xmlStr = '';
    var match = this.__patterns.xml.read_match();
    // handle e4x xml literals
    //
    if (match) {
      // Trim root tag to attempt to
      var rootTag = match[2].replace(/^{\s+/, '{').replace(/\s+}$/, '}');
      var isCurlyRoot = rootTag.indexOf('{') === 0;
      var depth = 0;
      while (match) {
        var isEndTag = !!match[1];
        var tagName = match[2];
        var isSingletonTag = (!!match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
        if (!isSingletonTag &&
          (tagName === rootTag || (isCurlyRoot && tagName.replace(/^{\s+/, '{').replace(/\s+}$/, '}')))) {
          if (isEndTag) {
            --depth;
          } else {
            ++depth;
          }
        }
        xmlStr += match[0];
        if (depth <= 0) {
          break;
        }
        match = this.__patterns.xml.read_match();
      }
      // if we didn't close correctly, keep unformatted.
      if (!match) {
        xmlStr += this._input.match(/[\s\S]*/g)[0];
      }
      xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
      return this._create_token(TOKEN.STRING, xmlStr);
    }
  }

  return null;
};

function unescape_string(s) {
  // You think that a regex would work for this
  // return s.replace(/\\x([0-9a-f]{2})/gi, function(match, val) {
  //         return String.fromCharCode(parseInt(val, 16));
  //     })
  // However, dealing with '\xff', '\\xff', '\\\xff' makes this more fun.
  var out = '',
    escaped = 0;

  var input_scan = new InputScanner(s);
  var matched = null;

  while (input_scan.hasNext()) {
    // Keep any whitespace, non-slash characters
    // also keep slash pairs.
    matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);

    if (matched) {
      out += matched[0];
    }

    if (input_scan.peek() === '\\') {
      input_scan.next();
      if (input_scan.peek() === 'x') {
        matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
      } else if (input_scan.peek() === 'u') {
        matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
      } else {
        out += '\\';
        if (input_scan.hasNext()) {
          out += input_scan.next();
        }
        continue;
      }

      // If there's some error decoding, return the original string
      if (!matched) {
        return s;
      }

      escaped = parseInt(matched[1], 16);

      if (escaped > 0x7e && escaped <= 0xff && matched[0].indexOf('x') === 0) {
        // we bail out on \x7f..\xff,
        // leaving whole string escaped,
        // as it's probably completely binary
        return s;
      } else if (escaped >= 0x00 && escaped < 0x20) {
        // leave 0x00...0x1f escaped
        out += '\\' + matched[0];
        continue;
      } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
        // single-quote, apostrophe, backslash - escape these
        out += '\\' + String.fromCharCode(escaped);
      } else {
        out += String.fromCharCode(escaped);
      }
    }
  }

  return out;
}

// handle string
//
Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
  var current_char;
  var pattern;
  if (delimiter === '\'') {
    pattern = this.__patterns.single_quote;
  } else if (delimiter === '"') {
    pattern = this.__patterns.double_quote;
  } else if (delimiter === '`') {
    pattern = this.__patterns.template_text;
  } else if (delimiter === '}') {
    pattern = this.__patterns.template_expression;
  }

  var resulting_string = pattern.read();
  var next = '';
  while (this._input.hasNext()) {
    next = this._input.next();
    if (next === delimiter ||
      (!allow_unescaped_newlines && acorn.newline.test(next))) {
      this._input.back();
      break;
    } else if (next === '\\' && this._input.hasNext()) {
      current_char = this._input.peek();

      if (current_char === 'x' || current_char === 'u') {
        this.has_char_escapes = true;
      } else if (current_char === '\r' && this._input.peek(1) === '\n') {
        this._input.next();
      }
      next += this._input.next();
    } else if (start_sub) {
      if (start_sub === '${' && next === '$' && this._input.peek() === '{') {
        next += this._input.next();
      }

      if (start_sub === next) {
        if (delimiter === '`') {
          next += this._read_string_recursive('}', allow_unescaped_newlines, '`');
        } else {
          next += this._read_string_recursive('`', allow_unescaped_newlines, '${');
        }
        if (this._input.hasNext()) {
          next += this._input.next();
        }
      }
    }
    next += pattern.read();
    resulting_string += next;
  }

  return resulting_string;
};

module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;
module.exports.positionable_operators = positionable_operators.slice();
module.exports.line_starters = line_starters.slice();

},{"../core/directives":64,"../core/inputscanner":65,"../core/pattern":68,"../core/templatablepattern":69,"../core/tokenizer":71,"./acorn":82}],87:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((e=e||self).Sqrl={})}(this,function(e){"use strict";var n={},r={},t=/{{ *?(?:(?:([\w$]+) *?\((.*?)\) *?([\w$]*))|(?:([\w$]+) *?\((.*?)\) *?\/)|(?:([\w$@].*?) *?((?:\| *?[\w$]+ *)*))|(?:\/ *?([\w$]+))|(?:# *?([\w$]+))|(?:!--[^]+?--)) *?}}\n?/g,i={s:"{{",e:"}}"},a=/@(?:((?:\.\.\/)+)|([\w$]+):)?/g,l=t,o=i;function s(e,n){var r=e+l.source.slice(o.s.length,0-(o.e.length+3))+n+"\\n?",t=l.lastIndex;o={s:e,e:n},(l=RegExp(r,"g")).lastIndex=t}function f(e,n,r){return e.replace(a,function(e,t,i){return"hvals"+(t&&t.length?n[r-t.length/3-1].id:i||"")+"."})}var u={if:{helperStart:function(e){return"if("+e+"){"},helperEnd:function(){return"}"},blocks:{else:function(){return"}else{"}}},each:{helperStart:function(e,n){return"for(var i=0;i<"+e+".length; i++){tR+=(function(hvals){var tR='';var hvals"+n+"=hvals;"},helperEnd:function(e){return"return tR})({this:"+e+"[i],index:i})};"}},foreach:{helperStart:function(e,n){return"for(var key in "+e+"){if(!"+e+".hasOwnProperty(key)) continue;tR+=(function(hvals){var tR='';var hvals"+n+"=hvals;"},helperEnd:function(e){return"return tR})({this:"+e+"[key], key: key})};"}},log:{selfClosing:function(e){return"console.log("+e+");"}},tags:{selfClosing:function(e){return s(e.slice(0,e.indexOf(",")).trim(),e.slice(e.indexOf(",")+1).trim()),""}},js:{selfClosing:function(e){return e+";"}}},c={"&":"&amp;","<":"&lt;",'"':"&quot;","'":"&#39;"};function v(e){return c[e]}var d=/[&<"']/g,h=/[&<"']/,p={e:function(e){var n=String(e);return h.test(n)?n.replace(d,v):n}},g={},y={start:"",end:""};var x=!0;function R(e,n){var r,t=!1,i="",a="";if(n&&""!==n){r=n.split("|");for(var l=0;l<r.length;l++)r[l]=r[l].trim(),""!==r[l]&&("safe"!==r[l]?(i="Sqrl.F."+r[l]+"("+i,a+=")"):t=!0)}return i+=y.start,a+=y.end,!t&&x&&(i+="Sqrl.F.e(",a+=")"),i+e+a}function w(e){var n,a=0,s="var tR='';",c=[],v=-1,d=0,h={};function p(n){a!==n&&(s+="tR+='"+e.slice(a,n).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"';")}function g(e,n){var r=f(e,c,v);return"@"===e[0]?R(r,n):R("options."+r,n)}for(o=i,(l=t).lastIndex=0;null!==(n=l.exec(e));)if(p(n.index),a=n[0].length+n.index,n[1]){var y=n[3];""!==y&&null!==y||(y=d,d++);var x=u.hasOwnProperty(n[1]);v+=1;var w=n[2]||"";w=f(w,c,v),x||(w="["+w+"]");var m={name:n[1],id:y,params:w,native:x};c[v]=m,x?(s+=u[n[1]].helperStart(w,y),a=l.lastIndex):s+="tR+=Sqrl.H."+n[1]+"("+w+",function(hvals){var hvals"+y+"=hvals;var tR='';"}else if(n[4]){var P=n[5]||"";if(P=f(P,c,v),"include"===n[4]){var S=e.slice(0,n.index),F=e.slice(n.index+n[0].length),O=P.replace(/'|"/g,""),$=r[O];e=S+$+F,a=l.lastIndex=n.index}else u.hasOwnProperty(n[4])&&u[n[4]].hasOwnProperty("selfClosing")?(s+=u[n[4]].selfClosing(P),a=l.lastIndex):s+="tR+=Sqrl.H."+n[4]+"("+P+");"}else if(n[6])s+="tR+="+g(n[6],n[7])+";";else if(n[8]){var k=c[v];k&&k.name===n[8]?(v-=1,!0===k.native?s+=u[k.name].helperEnd(k.params,k.id):h[k.id]?s+="return tR}});":s+="return tR});"):console.error("Helper beginning & end don't match.")}else if(n[9]){var q=c[v];if(q.native){var H=u[q.name];H.blocks&&H.blocks[n[9]]?(s+=H.blocks[n[9]](q.id),a=l.lastIndex):console.warn("Native helper '%s' doesn't accept that block.",q.name)}else h[q.id]?s+="return tR},"+n[9]+":function(hvals){var hvals"+q.id+"=hvals;var tR='';":(s+="return tR},{"+n[9]+":function(hvals){var hvals"+q.id+"=hvals;var tR='';",h[q.id]=!0)}return p(e.length),s+="return tR",new Function("options","Sqrl",s.replace(/\n/g,"\\n").replace(/\r/g,"\\r"))}var m={};function P(e,n){var r=e.$file,t=e.$name,i=e.$cache;if(r){var a=require("fs");return!1!==i?(m.hasOwnProperty(r)||(m[r]=w(a.readFileSync(r,"utf8"))),m[r]):w(a.readFileSync(r,"utf8"))}return"string"==typeof n?t&&!1!==i?(m.hasOwnProperty(t)||(m[t]=w(n)),m[t]):!0===i?(m.hasOwnProperty(n)||(m[n]=w(n)),m[n]):w(n):t&&!1!==i&&m.hasOwnProperty(t)?m[t]:"No template"}function S(e,t){return t.$file=e,P(t)(t,{H:n,F:p,P:r})}e.Compile=w,e.F=p,e.H=n,e.P=r,e.Render=function(e,t){return"function"==typeof e?e(t,{H:n,F:p,P:r}):"string"==typeof e?P(t,e)(t,{H:n,F:p,P:r}):void 0},e.__express=function(e,n,r){return r(null,S(e,n))},e.autoEscaping=function(e){return x=e},e.defaultTags=function(e){s(e[0],e[1]),t=l,i=o},e.defineFilter=function(e,n){p[e]=n},e.defineHelper=function(e,r){n[e]=r},e.defineNativeHelper=function(e,n){u[e]=n},e.definePartial=function(e,n){r[e]=n},e.load=P,e.renderFile=S,e.setDefaultFilters=function(e){if("clear"===e)g={};else for(var n in e)e.hasOwnProperty(n)&&(g[n]=e[n]);!function(){for(var e in y={start:"",end:""},g)g.hasOwnProperty(e)&&g[e]&&(y.start+="Sqrl.F."+e+"(",y.end+=")")}()},Object.defineProperty(e,"__esModule",{value:!0})});


},{"fs":7}]},{},[13]);
