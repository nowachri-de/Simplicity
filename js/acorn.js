
const acorn = require('acorn');
const Interpreter = require(__dirname + "\\modules\\interpreter.js");
const Visitor = require(__dirname + "\\modules\\visitor.js");

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function generateFunction(a) {
    if (typeof a === 'function'){
        let parameters = getParamNames(a);
    }
}

const jsInterpreter = new Interpreter(new Visitor());
const body = acorn.parse("for(let a=0; a < 1 ; ++a){let b = c[a];}").body;


jsInterpreter.interpret(body);

