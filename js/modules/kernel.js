const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Util } = require(__dirname + '\\..\\modules\\util.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');
const { Program } = require(__dirname + '\\..\\modules\\program.js');
const { ShaderFactory } = require(__dirname + '\\..\\modules\\shader.js');

function check(impl,args,options) {
  if (typeof impl.dimensions === 'undefined')
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';

  let i = 0;
  args.forEach(arg => {
    //console.log(arg);
    console.log(options.parameterMap.get(i));
    if (Util.isArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
      console.log('Array');
    }

    if (Util.is2DArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }

      if (!Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }
      console.log('2DArray');
    }
    i++;
  });
}

function setUniforms(program,width,height, args, options) {
  let gl = program.gl;

  gl.uniform1f(gl.getUniformLocation(program.glProgram, "uTextureWidth"), width);
  gl.uniform1f(gl.getUniformLocation(program.glProgram, "uTextureHeight"), height);
}

function createOptions(parameters, code) {
  let options = {};
  options.parameterMap = new Map();
  options.samplers = [];
  options.samplers2D = [];
  options.integers = [];
  options.floats = [];
  options.functions = [];
  options.main = "";
  let i = 0;

  parameters.forEach(param => {
    let type = param.type;
    let value = { name: param.name, type: type, index: i };

    if (Util.isArray(type)) {
      options.samplers.push(value);
    }

    if (Util.is2DArray(type)) {
      options.samplers2D.push(value);
    }

    if (Util.isInteger(type)) {
      options.integers.push(value);
    }

    if (Util.isFloat(type)) {
      options.floats.push(value);
    }

    options.parameterMap.set(i, value);
    i++;
  });
  options.main = code;
  return options;
}

class FunctionBuilder {
  static buildFunction(codeGen, templateCode) {

    let options = createOptions(codeGen.function.parameters, templateCode);
    let fragmentShaderCode = ShaderCode.generateFragmentShader(options);
    let vertexShaderCode   = ShaderCode.generateVertexShaderCode();

    function implementation(...args) {
      check(implementation,args, options);
      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      let program = new Program(width,height);
      let vertexShader = ShaderFactory.createVertexShader(program.gl, vertexShaderCode);
      let fragmentShader = ShaderFactory.getFragmentShader(program.gl, fragmentShaderCode);
      
      console.log(fragmentShaderCode);
      program.buildProgram(vertexShader, fragmentShader);

      setUniforms(program,width,height,args, options);
      //console.log(options);
      //console.log(templateCode);
      //console.log(ShaderCode.generateVertexShaderCode());
      
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
  constructor() { }

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