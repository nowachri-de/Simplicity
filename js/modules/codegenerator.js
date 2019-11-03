const acorn = require('acorn');
const Sqrl = require('squirrelly');
const { Formatter } = require(__dirname + "\\formatter.js");

let space = 0;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

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

function translateMemberExpression(eventType, node, self) {
    if (eventType === 'Identifier' && this.identifier === null) {
        this.identifier = node.name;
        return;
    }

    if (eventType === 'Property') {
        let sb = [];
        self.handleType(node, sb);
        this.properties.push(sb.join(''));
    }

    if (eventType === 'Generate') {
        let sb = [];
        sb.push('read_' + this.identifier + '(');

        for (let i = 0; i < this.properties.length; ++i) {
            sb.push(this.properties[i]);
            if (i < (this.properties.length - 1)) {
                sb.push(',');
            }
        }
        sb.push(');');
        this.identifier = null;
        this.properties = [];
        let code = sb.join('');
        code = code.replaceAll('this.thread.x','kernelX');
        code = code.replaceAll('this.thread.y','kernelY');
        return code;
    }
}


class CodeGenerator {

    constructor() {
        this.scopes = [];
        this.parameters = [];
        this.postProcessNodes = [];
        this.eventListeners = new Map();
        this.sequenceID = 0;
        this.scopeIndex = -1;
    }

    translate(source) {
        this.interpreter = new Interpreter(new Visitor(), source);
        this.body = acorn.parse(source).body;
        this.codenodes = this.interpreter.interpret(this.body);

        let sb = [];
        this.iterate(this.codenodes, sb);
        return this.postProcess(this.postProcessNodes, sb);
        
    }
    postProcess(codenodes, sb) {
        let self = this;
        codenodes.forEach(function (node) {
            switch (node.node.type) {
                case 'MemberExpression':
                    translateMemberExpression = translateMemberExpression.bind({ identifier: null, properties: [] });
                    self.register(translateMemberExpression, 'MemberExpression');
                    self.handleType(node.node, []);
                    node.translatedCode =  translateMemberExpression('Generate', null, null);
                    self.unregister('MemberExpression');
            }
        })
        let options = {};
        codenodes.forEach(function (node) {
           options[node.tagID] = node.translatedCode;
        })
        return (new Formatter()).format(Sqrl.Render(sb.join(''),options));
    }

    pushScope() {
        if (this.scopeIndex <= (this.scopes.length-1)){
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
    getVariableType(name){
        this.scopes.forEach(function(scope,index,scopes){
            while(index >= 0){
                if (scope.get(name) !== 'undefined'){
                    return scope.get(name).type;
                }
                scope = scopes[--index];
            }
        });
    }
    addVariableType(name,type){
        this.getScope().variables.set(name,type);
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
        console.log(node.type);
        switch (node.type) {
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
        }
    }

    register(listener, type) {
        let newListener = [];
        newListener.push(listener);
        typeof (this.eventListeners.get(type) === 'undefined') ? this.eventListeners.set(type, newListener) : this.eventListeners.get(type).concat(newListener);
    }

    unregister(key){
        this.eventListeners.delete(key);
    }

    event(type, node) {
        let self = this;
        this.eventListeners.forEach(function (value, key, map) {
            value.forEach(function (action, index, array) {
                action(type, node, self);
            });
        });

    }
    genAssignmentPattern(node, sb) {
        //console.log(node);
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
        sb.push('(');
        let self = this;
        this.iteratePlus(node.params, sb, function (nodes, node, index, sb) {
            sb.push(self.arg2String(node));
            let name;
            if (node.type === 'AssignmentPattern') {
                name = node.left.name;
            } else {
                throw 'function parameters need to have default values assigned'
            };

            if (self.getScope().variables.get(name)){
                throw 'variable '+name+' already has been declared in this scope'
            }
            self.getScope().variables.set(name,self.arg2String(node));

            self.parameters.push(name);
            sb.push(name);
            self.handleType(node, sb);
            if ((index + 1) < nodes.length) {
                sb.push(',');
            }
        })
        sb.push(')');
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
        this.iterate(node.body, sb);
        sb.push('}');
        this.popScope();
    }
    genExpressionStatement(node, sb) {
        let tmp = [];
        this.handleType(node.expression, tmp);
        if (node.expression.type === 'MemberExpression') {
            let appendix =  '_' +(this.sequenceID++);
            this.pushScope().node = node.expression;
            this.getScope().code = tmp;
            this.getScope().tagID =  node.expression.type + appendix;
            this.postProcessNodes.push(this.getScope());
            sb.push('{{' + node.expression.type +appendix+ '}}');
        } else {
            sb.concat(tmp);
            sb.push(';');
        }
    }
    genCallExpression(node, sb) {
        this.handleType(node.callee, sb);
        sb.push('(');
        let self = this;
        this.iteratePlus(node.arguments, sb, function (nodes, node, index, sb) {
            self.handleType(node, sb);
            if ((index + 1) < nodes.length) {
                sb.push(',');
            }
        })
        sb.push(')');
    }
    genMemberExpression(node, sb) {
        this.handleType(node.object, sb);
        node.computed === false ? sb.push('.') : sb.push('[');
        this.handleType(node.property, sb);

        if (node.computed) {
            this.event('Property', node.property);
            sb.push(']');
        }
    }
    type2String(node) {
        if (node.type === 'Literal' && typeof node.value === 'number') {
            if (node.raw.includes(".")) {
                return "float ";
            } else {
                return "int ";
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
            switch(node.operator){
                case '%' : return 'int'; break
                case '+' : {
                    let left = this.type2String(node.left);
                    let right = this.type2String(node.right);
                }
            }
        }


        return "unknown";
        //return '{{arg_' + node.name + '_type}} '
    }

    arg2String(node) {
        // return '{{arg_' + node.name + '_type}} '
        return this.type2String(node);
    }
    genVariableDeclarator(node, sb) {
        if (node.init === null && typeof this.getVariableType(node.id.name) === 'undefined') {
            throw '@line ' + node.start + " .Variable declarator needs to be initialized or type of variable needs to be specified using type declaration.";
        }
        let type;
        if (node.init === null) {
            type = this.getVariableType(node.id.name);
        } else {
            type = this.type2String(node.init);
        }
        this.addVariableType(node.id.name,type);
        sb.push(type + ' ');

        sb.push(node.id.name);
        sb.push('=');
        (node.init !== null) ? this.handleType(node.init, sb) : "";

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
        this.event('Identifier', node);
    }
    genLiteral(node, sb) {
        sb.push(node.raw);
    }
    genUpdateExpression(node, sb) {
        (node.prefix === true) ? sb.push(node.operator) : "";
        this.handleType(node.argument, sb);
        (node.prefix !== true) ? sb.push(node.operator) : "";
    }
}

function transformMemberAccess() {

}
module.exports.CodeGenerator = CodeGenerator