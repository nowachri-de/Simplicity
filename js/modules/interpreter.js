function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}

class CodeGenerator {
    generate() {
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
    memberExpression(node, sb) {
        sb.push(node.object.name);
        sb.push("["+node.property.name+"];");
    }
    variableDeclarator(node, sb) {
        if (isInt(node.init.value)) {
            sb.push('int ');
        }
        sb.push(node.id.name);
        if (node.init !== null) {
            sb.push('=');
            sb.push(node.init.value);
        }

    }


}
class Interpreter {
    constructor(visitor) {
        this.visitor = visitor;
        this.visitor.codeGenerator = new CodeGenerator();
        this.visitor.codeGenerator.codeElements = [];
    }
    interpret(nodes) {
        this.visitor.run(nodes);
        console.log(this.visitor.codeGenerator.generate());
    }
}
module.exports = Interpreter