const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');

function getType(argument) {
  if (Array.isArray(argument)) {
    return "array";
  }

  if (Number.isInteger(argument)) {
    return 'int';
  }

  if (typeof argument === 'number') {
    if (argument.toString().includes('.')) {
      return 'float';
    }
  }

  if (typeof argument === 'boolean') {
    return 'bool';
  }
}


class FunctionBuilder {
  static buildFunction(codeGen, templateCode) {

    function createOptions(codeGen, args) {
      let options = {};
      let samplers = [];
      let integers = [];
      let i = 0;

      args.forEach(arg => {
        let type = getType(arg);
        if (type === 'array'){
          if (arg.length === 0){
            throw 'argument ' +  codeGen.parameters[i] + ' contains empty array';
          }
          samplers.push({ name: codeGen.parameters[i], width: (getType(arg[0]) === 'array')?arg[0].length:1 , height: arg.length });
        }else if (type === 'int'){
          integers.push({ name: codeGen.parameters[i]});
        }
        ++i;
      });
      options.samplers = samplers;
      options.integers = integers;
      options.functions = [];
      return options;
    }

    function check(fnct){
      if (typeof fnct.dimensions === 'undefined')
        throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';
    }

    function implementation(...args) {
      check(implementation);
      console.log(templateCode);
    }
 
    implementation.setOutput= function(a){
      implementation.dimensions=a;
      return  implementation;
    }
    implementation.functionName = codeGen.function.id.name;
    implementation.code = codeGen.function.code;
    return  implementation;
  }
}

class Kernel {
  constructor() {

  }
  static create(...fncts) {
    let results = [];
    for (let i = 0; i < fncts.length;++i){
      let codeGen = new CodeGenerator();
      let templateCode = codeGen.translate(fncts[i].toString());
      results.push(FunctionBuilder.buildFunction(codeGen, templateCode));
    }
    
    for(let i=0; i < results.length;++i){
      if (results[i].functionName === 'main'){
        return results[i];
      }
    }

    throw "could not find main function";
  }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;