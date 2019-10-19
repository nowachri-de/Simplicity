const l = console.log
const ops = {
    ADD: '+',
    SUB: '-',
    MUL: '*',
    DIV: '/'
}
let globalScope = new Map()
class Visitor {

    handleFunctionDeclaration(node) {
        this.codeGenerator.params = node.params;
        this.codeGenerator.codeElements.push({ node: node });
        node.body.parent = node;
        this.visitNode(node.body);
    }
    handleBlockStatement(node) {
        node.codeElements = [];
        this.codeGenerator.codeElements.push({ node: node })
        let prevCodeElements = this.codeGenerator.codeElements;
        this.codeGenerator.codeElements = node.codeElements;
        this.visitNodes(node.body);

        this.codeGenerator.codeElements = prevCodeElements;
    }
    handleVariableDeclaration(node) {
        node.declarations.parent = node.node;
        this.codeGenerator.codeElements.push({ node: node });
        this.visitNodes(node.declarations);
    }
    handleVariableDeclarator(node) {
        this.codeGenerator.codeElements.push({ node: node });
        this.visitNode(node.init);
    }

    handleForStatement(node) {
        this.codeGenerator.codeElements.push({ node: node });
        node.body.parent = node;
        this.visitNode(node.body);
    }

    handleBinaryExpression(node) {
        this.codeGenerator.codeElements.push({ node: node });
    }
    handleMemberExpression(node) {
        this.codeGenerator.codeElements.push({ node: node });
    }

    visitNodes(nodes) {
        for (const node of nodes) {
            this.visitNode(node)
        }
    }
    visitNode(node) {
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
        return this.visitNodes(nodes)
    }
}
module.exports = Visitor