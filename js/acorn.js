
const acorn = require('acorn');
const Interpreter = require("./modules/interpreter.js");
const Visitor = require("./modules/visitor.js");


let source = "for(let a=0; a < 1 ; ++a){let b = c[1.0];}";
const jsInterpreter = new Interpreter(new Visitor(), source);
const body = acorn.parse(source).body;
jsInterpreter.interpret(body);

