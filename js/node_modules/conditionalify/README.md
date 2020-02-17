conditionalify
==============

[Browserify](https://github.com/substack/node-browserify) transform to remove code using conditional comments. Comments are evaluated using [`angular-expressions`](https://www.npmjs.com/package/angular-expressions).

Installation
------------

```sh
$ npm install --save-dev conditionalify
```

Usage
-----

### Given the Following `script.js`:
```javascript
var data = require('data.json');

/* #if someValue === 'foo' */
var result = require('foo-parser')(data);
/* #endif */
/* #if someValue !== 'foo' */
var result = require('other-parser')(data);
/* #endif */

console.log(result);
```

### And the Following Usage:

#### CLI

```sh
$ browserify script.js -o bundle.js \
  -t [ conditionalify --context [ --someValue foo ] ]
```

#### Node

```javascript
var fs = require('fs');
var browserify = require('browserify');
browserify('./script.js')
    .transform('conditionalify', {
        context: {
            someValue: 'foo'
        }
    })
    .bundle()
    .pipe(fs.createWriteStream('bundle.js'));
```

### The Following Output Would be Produced:
```javascript
var data = require('data.json');

/* #if someValue === 'foo' */
var result = require('foo-parser')(data);
/* #endif */
/* #if someValue !== 'foo' */
/* #endif */

console.log(result);
```

### Options

The following configuration options are available (and are all optional):

* **context** (`Object`): An `Object` whose keys will be available as variables in the comment expressions
* **marker** (`String`): The character to look for at the start of a comment (before `if` or `endif`)—defaults to `#`
* **ecmaVersion** (`Number`): Version of ECMAScript to pass to [`acorn`](https://www.npmjs.com/package/acorn) when parsing each module
* **exts** (`Array` of `String`s): A whitelist of file extensions (without the leading ".")—if a file does not have one of the extensions in the list, it will be ignored by conditionalify—defaults to `['js']`

Options may be passed in via standard [browserify](https://github.com/substack/node-browserify#btransformtr-opts) ways:

```sh
$ browserify -t [ conditionalify --marker @ ]
```

```js
browserify().transform('conditionalify', { marker: '@' });
```

```js
var conditionalify = require('conditionalify');
browserify().transform(conditionalify, { marker: '@' });
```