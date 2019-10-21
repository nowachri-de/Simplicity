
const acorn = require('acorn');
const Interpreter = require(__dirname + "\\modules\\interpreter.js");
const Visitor = require(__dirname + "\\modules\\visitor.js");
const {ShaderCode} = require(__dirname + "\\modules\\ShaderCode.js");


var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function isInt(n) {
    return Number.isInteger(n);
}

function isFloat(n) {
    return !Number.isInteger(n);
}

let source = "for(let a=0; a < 1 ; ++a){let b = c[1.0];}";
const jsInterpreter = new Interpreter(new Visitor(), source);
const body = acorn.parse(source).body;


jsInterpreter.interpret(body);

