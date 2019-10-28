var Sqrl = require('squirrelly');
const acorn = require('acorn');
let space = 0;

function genSpace(space) {
    let s = [];
    for (let i = 0; i < space; ++i) {
        s.push(' ');
    }
    return s.join('');
}
function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}

const l = console.log

let globalScope = new Map();
class Visitor {
    constructor() { }

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
        this.visitor.codenodes = [];
    }
    interpret(nodes) {
        return this.visitor.run(nodes);
    }
}

class CodeGenerator {

    constructor() {
        this.variables = new Map();
    }

  
    postProcess(nodes) {
    }
    
    translate(source) {
        this.interpreter = new Interpreter(new Visitor(), source);
        this.body = acorn.parse(source).body;
        this.codenodes = this.interpreter.interpret(this.body);

        let sb = [];
        this.iterate(this.codenodes, sb);
        this.postProcess(this.postProcessNodes, sb);
        return sb.join('');
    }

    setVariableType(name,type){
        this.variables.set(name,type);
    }

    iterate(codenodes, sb) {
        codenodes.forEach(node => {
            this.handleType(node, sb);
        });
    }

    handleType(node, sb) {
        console.log(node.type);
        switch (node.type) {
            case 'VariableDeclarator': return this.genVariableDeclarator(node, sb);
            case 'VariableDeclaration': return this.genVariableDeclaration(node, sb);
            case 'ForStatement': return this.genForStatement(node, sb);
            case 'BinaryExpression': return this.genBinaryExpression(node, sb);
            case 'Identifier': return this.genIdentifier(node, sb);
            case 'Literal': return this.genLiteral(node, sb);
            case 'ForSLiteraltatement': return this.genLiteral(node, sb);
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
        }
    }

    genReturnStatement(node, sb) {
        sb.push('return ');
        this.handleType(node.argument, sb);
        sb.push(';');
    }
    genArrayExpression(node, sb) {

    }
    genThisExpression(node, sb) {
        sb.push('this');
    }
    genFunctionDeclaration(node, sb) {
        this.handleType(node.id, sb);
        this.handleType(node.body, sb);
    }
    genAssignmentExpression(node, sb) {
        this.handleType(node.left, sb);
        sb.push(node.operator);
        this.handleType(node.right, sb);
    }
    genWhileStatement(node, sb) {
        sb.push('while (')
        this.handleType(node.test, sb);
        sb.push(')')
        this.handleType(node.body, sb);
    }
    genIfStatement(node, sb) {
        sb.push(genSpace(space));
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
        sb.push(genSpace(space));
        sb.push('{');
        this.iterate(node.body, sb);
        sb.push('}');
    }
    genExpressionStatement(node, sb) {
        this.handleType(node.expression, sb)
        sb.push[';'];
    }
    genCallExpression(node, sb) {
        this.handleType(node.callee, sb);
        sb.push('(');

        for (let i = 0; i < node.arguments.length; ++i) {
            this.handleType(node.arguments[i], sb);
            if (i + 1 < node.arguments.length) {
                sb.push(',');
            }
        }
        sb.push(')');
        sb.push(';');
    }
    genMemberExpression(node, sb) {
        this.handleType(node.object, sb);
        node.computed === false ? sb.push('.') : sb.push('[');
        this.handleType(node.property, sb);
        node.computed === false ? "" : sb.push(']');
    }
    type2String(node) {
        if (node.type === 'Literal' && typeof node.value === 'number') {
            if (node.raw.includes(".")) {
                return "float";
            } else {
                return "int";
            }
        }
    }
    genVariableDeclarator(node, sb) {
        if (node.init === null && typeof this.variables.get(node.id.name) === 'undefined' ) {
            throw '@line ' + node.start + " .Variable declarator needs to be initialized or type of variable needs to be specified using type declaration.";
        }
        let type;
        if (node.init === null){
            type = this.variables.get(node.id.name);
        }else{
            type = this.type2String(node.init);
        }
        sb.push(type + ' ');
        
        sb.push(node.id.name);
        sb.push('=');
        (node.init !== null) ? this.handleType(node.init, sb):"";

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
        this.iterate(node, sb);
        sb.push('}');
    }
    genBinaryExpression(node, sb) {
        this.handleType(node.left, sb);
        sb.push(node.operator);
        this.handleType(node.right, sb);
    }
    genIdentifier(node, sb) {
        sb.push(node.name);
    }
    genLiteral(node, sb) {
        sb.push(node.raw);
    }
    genUpdateExpression(node, sb) {
        (node.prefix === true) ? sb.push(node.operator):"";
        this.handleType(node.argument, sb);
        (node.prefix !== true) ? sb.push(node.operator):"";
    }
}
module.exports.CodeGenerator = CodeGenerator