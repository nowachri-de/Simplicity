const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const Sqrl = require('squirrelly');

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
    static buildFunction(codeGen,templateCode){
      
      function getFunctionParameters(){
        return codeGen.parameters;
      }
      function abc(...args){
        let parameters = getFunctionParameters();
        let options = {};
        let i = 0;
        parameters.forEach(element => {
          Object.defineProperty(options, 'arg_' + element + '_type', 
            {
              value : getType(args[i]),
              writable : true,
              enumerable : true,
              configurable : true
            });
            ++i;
        });
        console.log(Sqrl.Render(templateCode,options));
      }
      return abc;
    }
}

class Kernel{
    constructor(){

    }
    static create(fnct){
        let codeGen = new CodeGenerator();
        let templateCode = codeGen.translate(fnct.toString());
        
        return FunctionBuilder.buildFunction(codeGen,templateCode);
    }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;