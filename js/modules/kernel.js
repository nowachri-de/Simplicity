const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Util } = require(__dirname + '\\..\\modules\\util.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');


function check(fnct) {
  if (typeof fnct.dimensions === 'undefined')
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';
}

function createOptions(parameters,code) {
  let options = {};
  options.samplers = [];
  options.integers = [];
  options.floats = [];
  options.functions = [];
  options.main = "";
  let i = 0;

  parameters.forEach(param => {
    let type = param.type;

    if (Util.isArray(type)) {
      options.samplers.push({ name: param.name });
    }

    if (Util.isInteger(type)) {
      options.integers.push({ name: param.name });
    }

    if (Util.isFloat(type)) {
      options.floats.push({ name: param.name });
    }
    
  });
  options.main = code;
  return options;
}

class FunctionBuilder {
  static buildFunction(codeGen, templateCode) {

    let options = createOptions(codeGen.function.parameters,templateCode);
    let shader = ShaderCode.generateFragmentShader(options);

    function implementation(...args) {
      check(implementation);
      console.log(templateCode);
      console.log(ShaderCode.generateVertexShaderCode());
      console.log(shader);
    }

    implementation.setOutput = function (a) {
      implementation.dimensions = a;
      return implementation;
    }

    implementation.functionName = codeGen.function.id.name;
    implementation.code = codeGen.function.code;
    return implementation;
  }
}

class Kernel {
  constructor() {}
  
  static create(...fncts) {
    let results = [];
    for (let i = 0; i < fncts.length; ++i) {
      let codeGen = new CodeGenerator();
      let templateCode = codeGen.translate(fncts[i].toString());
      results.push(FunctionBuilder.buildFunction(codeGen, templateCode));
    }

    for (let i = 0; i < results.length; ++i) {
      if (results[i].functionName === 'main') {
        return results[i];
      }
    }

    throw "could not find main function";
  }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;