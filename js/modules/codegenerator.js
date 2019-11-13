const acorn = require('acorn');
const Sqrl = require('squirrelly');
const { Formatter } = require(__dirname + "\\formatter.js");
const { Util } = require(__dirname + "\\util.js");

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

function handleMemberExpression(sb, data) {
    sb.push('read_');
    sb.push(data.name);
    sb.push('(');
    for (let i = 0; i < data.properties.length; i++) {
        data.properties[i] = data.properties[i].replaceAll('this.thread.x', 'vKernelX');
        data.properties[i] = data.properties[i].replaceAll('this.thread.y', 'vKernelY');
        sb.push(data.properties[i]);
        if (i + 1 < data.properties.length) {
            sb.push(',');
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

class CodeGenerator {

    constructor() {
        this.scopes = [];
        this.code = "";
        this.postProcessNodes = [];
        this.eventListeners = new Map();
        this.function = null;
        this.sequenceID = 0;
        this.scopeIndex = -1;
        this.transformationRequests = new Map();
    }

    translate(source) {
        this.interpreter = new Interpreter(new Visitor(), source);
        this.body = acorn.parse(source, { preserveParens: true }).body;
        this.codenodes = this.interpreter.interpret(this.body);
        this.pushScope();
        let sb = [];
        this.iterate(this.codenodes, sb);
        this.code = this.postProcess(this.postProcessNodes, sb);
        return this.code;

    }
    postProcess(codenodes, sb) {

        let options = {};
        codenodes.forEach(function (node) {
            options[node.tagID] = node.translatedCode;
        })
        return (new Formatter()).format(Sqrl.Render(sb.join(''), options));
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
    addVariableType(name, type) {
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
            case 'ParenthesizedExpression': return this.getParenthesizedExpression(node, sb);
        }
    }


    genAssignmentPattern(node, sb) {
        sb.push(this.type2String(node.right) + ' ');
        this.handleType(node.left, sb);
    }
    genReturnStatement(node, sb) {
        let replace = 'gl_FragColor = vec4({{returnValue}},0.,0.,0.);';

        if (this.transformationRequests.get('replaceReturnStatement') === true) {
            let tmp = [];
            if (node.argument.type === 'MemberExpression') {
                let data = {};
                data.name = node.argument.object.object.name;
                data.properties = [];

                this.transformationRequests.set('memberExpression', data);
                this.handleType(node.argument, []);

                handleMemberExpression(tmp, data);

            } else {
                this.handleType(node.argument, tmp);
            }

            replace = Sqrl.Render(replace, { returnValue: tmp.join('') });
            sb.push(replace);
            this.transformationRequests.delete('replaceReturnStatement');
        } else {
            sb.push('return ');
            this.handleType(node.argument, sb);
            sb.push(';');
        }
    }
    genArrayExpression(node, sb) {

    }
    genThisExpression(node, sb) {
        sb.push('this');
    }
    genFunctionDeclaration(node, sb) {
        let tmp = [];
        this.handleType(node.id, tmp);
        let name = tmp.join('');

        //if the function has the name main it needs to be handled specially
        if (name === 'main') {
            sb.push('void ');
            this.transformationRequests.set('replaceReturnStatement', true);
        }
        sb.push(name);
        sb.push('(');
        let self = this;

        tmp = [];
        node.parameters = [];
        let functionNode = node;
        //process function parameters and store in tmp stringbuilder
        this.iteratePlus(node.params, tmp, function (nodes, node, index, sb) {
            let name = '';
            if (node.type === 'AssignmentPattern') {
                name = node.left.name;
            } else {
                throw formatThrowMessage(node, 'function parameters need to have default values assigned')
            };

            if (self.getScope().variables.get(name)) {
                throw formatThrowMessage(node, 'variable ' + name + ' already has been declared in this scope')
            }

            self.getScope().variables.set(name, self.type2String(node));
            functionNode.parameters.push({ node: functionNode, name: name, type: self.type2String(node) });

            self.handleType(node, sb);
            if ((index + 1) < nodes.length) {
                sb.push(',');
            }
        })

        if (name === 'main') {
            sb.push('void');
        } else {
            sb.push(tmp.join(''));
        }

        sb.push(')');
        this.handleType(node.body, sb);
        node.code = sb.join('');
        this.function = node;
    }
    getParenthesizedExpression(node, sb) {
        sb.push('(');
        this.handleType(node.expression, sb);
        sb.push(')');
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

        if (node.expression.type === 'MemberExpression') {
            let object = node.expression.object;

            while (object.type !== "Identifier") {
                object = object["object"];
            }
            if (this.getType(object.name) === null) {
                throw formatThrowMessage(node, node.expression.object.name + ' undefined');
            }
            if (!Util.isArray(this.getType(object.name))) {
                throw formatThrowMessage(node, object.name + ' is of type ' + this.getType(object.name) + ' but must be array type');
            }


            let data = {};
            data.name = object.name;
            data.properties = [];

            this.transformationRequests.set('memberExpression', data);
            this.handleType(node.expression, tmp);
            handleMemberExpression(sb, data);
            sb.push(';');
            this.transformationRequests.delete('memberExpression');
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
            let tmp = []
            self.handleType(node, tmp);
            if (node.type === 'Identifier' && self.getType(tmp.join('')) === null) {
                throw formatThrowMessage(node, tmp.join('') + " unknown identifier");
            }
            sb.push(tmp.join(''));
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
            //check that property (variable) has been defined.
            if (node.property.type === 'Identifier' && this.getType(node.property.name) === null) {
                throw formatThrowMessage(node, node.property.name + ' undefined')
            }
            if (typeof this.transformationRequests.get('memberExpression') != 'undefined') {
                let tmp = [];
                this.handleType(node.property, tmp);
                this.transformationRequests.get('memberExpression').properties.push(tmp.join(''));
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
                case '%': return 'int'; break
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

        return "unknown";
    }

    genVariableDeclarator(node, sb) {
        if (node.init === null && this.getType(node.id.name) === null) {
            throw formatThrowMessage(node, "Variable declarator must be initialized");
        }
        let type;
        if (node.init === null) {
            type = this.getType(node.id.name);
        } else {
            type = this.type2String(node.init);
        }

        this.addVariableType(node.id.name, type);
        sb.push(type + ' ');
        sb.push(node.id.name);
        sb.push('=');

        if (node.init.type === 'MemberExpression') {
            let tmp = [];
            let data = {};
            data.name = node.init.object.object.name;
            data.properties = [];

            this.transformationRequests.set('memberExpression', data);
            this.handleType(node.init, tmp);

            handleMemberExpression(sb, data);
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
        this.iterate(node, sb);
        sb.push('}');
    }

    genBinaryExpression(node, sb) {
        let typeLeft = this.type2String(node.left);
        let typeRight = this.type2String(node.right);

        /*if typeLeft != typeRight get the type to which 
        one of the sides needs to get casted to*/
        let castType = castNeeded(typeLeft, typeRight);

        //check if left side needs to get casted
        if (castType !== null && typeLeft !== castType) {
            sb.push(castType + '(')
            if (node.left.type === 'MemberExpression') {
                let tmp = [];
                let data = {};
                data.name = node.left.object.object.name;
                data.properties = [];

                this.transformationRequests.set('memberExpression', data);
                this.handleType(node.left, tmp);

                handleMemberExpression(sb, data);
            } else {
                this.handleType(node.left, sb);
                sb.push(')')
            }
        } else {
            if (node.left.type === 'MemberExpression') {
                let tmp = [];
                let data = {};
                data.name = node.left.object.object.name;
                data.properties = [];

                this.transformationRequests.set('memberExpression', data);
                this.handleType(node.left, tmp);

                handleMemberExpression(sb, data);
            } else {
                this.handleType(node.left, sb);
               
            }
        }

        sb.push(node.operator);

        //check if right side needs to get casted
        if (castType !== null && typeRight !== castType) {
            sb.push(castType + '(')
            if (node.right.type === 'MemberExpression') {
                let tmp = [];
                let data = {};
                data.name = node.right.object.object.name;
                data.properties = [];

                this.transformationRequests.set('memberExpression', data);
                this.handleType(node.right, tmp);

                handleMemberExpression(sb, data);
            } else {
                this.handleType(node.right, sb);
                sb.push(')')
            }
            sb.push(')')
        } else {
            if (node.right.type === 'MemberExpression') {
                let tmp = [];
                let data = {};
                data.name = node.right.object.object.name;
                data.properties = [];

                this.transformationRequests.set('memberExpression', data);
                this.handleType(node.right, tmp);

                handleMemberExpression(sb, data);
            } else {
                this.handleType(node.right, sb);
            }
            
        }
    }

    genIdentifier(node, sb) {
        sb.push(node.name);
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