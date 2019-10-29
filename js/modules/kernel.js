const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');


function getType(argument) {
    if (Array.isArray(argument)) {
      return "float[]";
    }
    
    if (Number.isInteger(argument)) {
      return 'int';
    }
  
    if (typeof argument === 'number') {
      if (argument.toString().includes('.')){
        return 'float';
      }
    }
  
    if (typeof argument === 'boolean') {
      return 'bool';
    }
  }


class FunctionBuilder{
    static buildFunction(codeGen,codeTemplate){
       
        let src = 
        `
            let src = 
        
        
        `;
       let fnctSource = Function(codeGen.parameters,src);

       fnctSource.extend = function()
       return fnctSource;
    }
}

class Kernel{
    constructor(){

    }
    static create(fnct){
        let codeGen = new CodeGenerator();
        let templateCode = codeGen.translate(fnct.toString());
        
        FunctionBuilder.buildFunction(codeGen,templateCode);
    }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;