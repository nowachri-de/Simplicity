var Sqrl = require('squirrelly');
const acorn = require('acorn');

class Code {
    constructor(node) {
        this.node = node;
    }
}

class BinaryExpression extends Code {
    constructor(node) {
        super(node);
    }
    generate(node) {

    }
}

class UpdateExpression extends Code {
    constructor(node) {
        super(node);
    }
    generate(node) {

    }
}
class ForStatement extends Code {
    constructor(node) {
        super(node);
    }
    generate(node) {
        let init = new VariableDeclaration(node);
        let test = new BinaryExpression(node);
        let update = new UpdateExpression(node);

        let template = "for ({{init}};{{test}};{{update}})"

        Sqrl.Render(template, {init:init,test:test,update:update});
    }
}

class VariableDeclarator extends Code{
    constructor(node){
        super(node);
    }
    generate(node){
        if (node.init != "undefined" && isInt(node.init.value)) {
            sb.push('int ');
        }
        sb.push(node.id.name);
        if (node.init !== null) {
            sb.push('=');
            sb.push(node.init.value);
        }
    }
}


function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}

const l = console.log
const ops = {
    ADD: '+',
    SUB: '-',
    MUL: '*',
    DIV: '/'
}
let globalScope = new Map();
class Visitor {
    constructor(){

    }
    handleFunctionDeclaration(node) {
        this.codeElements.push({ node: node });
        node.body.parent = node;
        this.visitNode(node.body);
    }
    handleBlockStatement(node) {
        node.codeElements = [];
        this.codeElements.push({ node: node })
        let prevCodeElements = this.codeElements;
        this.codeElements = node.codeElements;
        this.visitNodes(node.body);

        this.codeElements = prevCodeElements;
    }
    handleVariableDeclaration(node) {
        node.declarations.parent = node.node;
        this.codeElements.push({ node: node });
        this.visitNodes(node.declarations);
    }
    handleVariableDeclarator(node) {
        this.codeElements.push({ node: node });
        this.visitNode(node.init);
    }

    handleForStatement(node) {
        this.codeElements.push({ node: node });
        node.body.parent = node;
        this.visitNode(node.body);
    }

    handleBinaryExpression(node) {
        this.codeElements.push({ node: node });
    }
    handleMemberExpression(node) {
        this.codeElements.push({ node: node });
    }

    visitNodes(nodes) {
        for (const node of nodes) {
            this.visitNode(node)
        }
    }
    visitNode(node) {
        if (node === null || typeof node === 'undefined'){
            return;
        }
        //console.log(node);
        switch (node.type) {
            case 'FunctionDeclaration': this.handleFunctionDeclaration(node); break;
            case 'BlockStatement': this.handleBlockStatement(node); break;
            case 'VariableDeclarator': this.handleVariableDeclarator(node); break;
            case 'VariableDeclaration': this.handleVariableDeclaration(node); break;
            case 'ForStatement': this.handleForStatement(node); break;
            case 'BinaryExpression': this.handleBinaryExpression(node); break;
            case 'MemberExpression': this.handleMemberExpression(node); break;
        }
    }
    run(nodes) {
        this.visitNodes(nodes);
        return this.codeElements;
    }
}


class Interpreter {
    constructor(visitor, source) {
        this.visitor = visitor;
        this.source = source;
        this.visitor.codeElements = [];
    }
    interpret(nodes) {
        return this.visitor.run(nodes);
    }
}

class CodeGenerator {
    constructor(){}

    translate(source) {
        this.interpreter = new Interpreter(new Visitor(), source);
        this.body = acorn.parse(source).body;
        this.codeElements = this.interpreter.interpret(this.body);

        let sb = [];
        this.codeElements.forEach(element => {
            console.log(element.node.type);
            this.handleType(element, sb);
        });
        return sb.join('');
    }
    handleType(element, sb) {
        switch (element.node.type) {
            case 'ForStatement': this.forStatment(element, sb); break;
            case 'BlockStatement': this.blockStatement(element.node, sb); break;
            case 'VariableDeclaration': this.variableDeclaration(element.node, sb); break;
            case 'MemberExpression': this.memberExpression(element.node, sb); break;
        }
    }
    blockStatement(node, sb) {
        sb.push('{');
        node.codeElements.forEach(element => {
            console.log(element.node.type);
            this.handleType(element, sb);
        });
        sb.push('}');
    }
    forStatment(ce, sb) {
        console.log(this.source.substring(ce.node.start, ce.node.end));
        sb.push("for(");
        this.variableDeclaration(ce.node.init, sb).push(" ;");
        this.binaryExpression(ce.node.test, sb).push(" ;");
        this.updateExpression(ce.node.update, sb);
        sb.push(")");
    }
    updateExpression(node, sb) {
        sb.push(node.operator);
        return sb;
    }
    binaryExpression(node, sb) {
        sb.push(node.left.name);
        sb.push(node.operator);
        sb.push(node.right.value);
        return sb;
    }
    variableDeclaration(node, sb) {
        node.declarations.forEach(element => {
            this.variableDeclarator(element, sb);
        })
        return sb;
    }
    variableDeclarator(node, sb) {
        if (node.init != "undefined" && isInt(node.init.value)) {
            sb.push('int ');
        }
        sb.push(node.id.name);
        if (node.init !== null) {
            sb.push('=');
            sb.push(node.init.value);
        }
    }
    memberExpression(node, sb) {
        sb.push(node.object.name);
        sb.push("[" + node.property.name + "];");
    }
   
}

module.exports.CodeGenerator = CodeGenerator