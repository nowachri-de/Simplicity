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

    //check if variable has been declared
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