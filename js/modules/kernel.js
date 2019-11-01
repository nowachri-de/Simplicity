const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Formatter } = require(__dirname + '\\..\\modules\\formatter.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');

const Sqrl = require('squirrelly');

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
      let options;
      if (typeof args !== 'undefined') {
        options = createOptions(codeGen, args);
      }
      //console.log(ShaderCode.generateFragmentShader(options));
      
      /*let parameters = getFunctionParameters();
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
      console.log((new Formatter()).format(Sqrl.Render(templateCode,options)));*/
      console.log((new Formatter()).format(templateCode));
      console.log(implementation.dimensions);
    }
 

    implementation.setOutput= function(a){
      implementation.dimensions=a;
      return  implementation;
    }
    return  implementation;
  }
}

class Kernel {
  constructor() {

  }
  static create(fnct) {
    let codeGen = new CodeGenerator();
    let templateCode = codeGen.translate(fnct.toString());

    return FunctionBuilder.buildFunction(codeGen, templateCode);
  }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;