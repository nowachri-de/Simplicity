const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Util } = require(__dirname + '\\..\\modules\\util.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');
const { Program } = require(__dirname + '\\..\\modules\\program.js');
const { Matrix } = require(__dirname + '\\..\\modules\\matrix.js');


function check(impl, args, options) {
  if (typeof impl.dimensions === 'undefined')
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';

  if (options.parameterMap.size !== args.length) {
    throw "Mismatch between number of declared function parameters and number of actually passed arguments"
  }

  let i = 0;
  args.forEach(arg => {

    if (Util.isArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
    }

    if (Util.is2DArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }

      if (!Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }
    }
    i++;
  });
}

function getUniformLocation(program, id) {
  let location = program.gl.getUniformLocation(program.glProgram, id);
  
  if (location === null) {
    throw 'could not find unifrom ' + id;
  }

  return location;
}

function setUniformLocationFloat(program, id, value) {
  let gl = program.gl;
  gl.uniform1f(getUniformLocation(program, id), value);
}

function setUniformLocationInt(program, id, value) {
  let gl = program.gl;
  gl.uniform1i(getUniformLocation(program, id), value);
}

function setUniforms(program, width, height, args, options) {
  let textures = [];
  let gl = program.gl;

  setUniformLocationFloat(program, "uResultTextureWidth", width);
  setUniformLocationFloat(program, "uResultTextureHeight", height);

  let i = 0;
  args.forEach(arg => {
    let type = options.parameterMap.get(i).type;
    let name = options.parameterMap.get(i).name;

    if (Util.isArray(type) || Util.is2DArray(type)) {
      //width and height of inputTexture not required to be same dimensions as resultTexture
      let width = arg.length;
      let height = 1.0;

      //set propper height
      if (Util.is2DArray(type)) {
        height = arg[0].length;
      }

      let inputTexture = Util.createTexture(gl, "texture_uSampler_" + name, width, height, arg);
      textures.push(inputTexture);
      setUniformLocationInt(program, "uSampler_" + name , inputTexture.index);
      setUniformLocationFloat(program, "uSampler_" + name, width);
      setUniformLocationFloat(program, "uSampler_" + name, height);
    }

    if (Util.isInteger(type)) {
      setUniformLocationInt(program, "u_" + name, arg);
    }

    if (Util.isFloat(type)) {
      setUniformLocationFloat(program, "u_" + name, arg);
    }
    i++;
  });
  return textures;
}

function createFunctionsDescriptor(functions) {
  let functionsDescriptor = {};
  functionsDescriptor.functionMap = new Map();
  functionsDescriptor.functionMap.getFunctionsExclusiveMain = function(){
    let result = [];
    this.forEach(function(functionDescriptor,nameKey,map){
      if (nameKey !== 'main'){
        result.push(functionDescriptor);
      }
    });
    return result;
  }

  for (let i = 0; i < functions.length; ++i) {
    let options = {};
    options.samplers = [];
    options.samplers2D = [];
    options.integers = [];
    options.floats = [];
    options.parameterMap = new Map();

    let codeGen = functions[i].codeGen;
    let parameters = codeGen.function.parameters;
    let paramIndex = 0;
    parameters.forEach(param => {
      let type = param.type;
      let value = { name: param.name, type: type, index: paramIndex };

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

      options.parameterMap.set(paramIndex, value);
      paramIndex++;
    });
    functions[i].options = options;
    functionsDescriptor.functionMap.set(codeGen.function.id.name,functions[i]);
  }

  return functionsDescriptor;
}

class FunctionBuilder {
  static buildFunction(functions) {

    //let options = createOptions(codeGen.function.parameters, glslCode);
    let functionsDescriptor = createFunctionsDescriptor(functions);
    let fragmentShaderCode = ShaderCode.generateFragmentShader(functionsDescriptor);
    let vertexShaderCode = ShaderCode.generateVertexShaderCode();

    function implementation(...args) {
      check(implementation, args, implementation.options);
      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      let program = new Program(width, height);

      console.log(vertexShaderCode);
      console.log(fragmentShaderCode);

      program.buildProgram(vertexShaderCode, fragmentShaderCode);
      let textures = setUniforms(program, width, height, args, implementation.options);

      console.log(Matrix.texture2matrix(program.gl, program.execute(), 0));
      program.delete();
      textures.forEach(texture => {
        texture.delete();
      });
    }

   implementation.options = functionsDescriptor.functionMap.get('main').options;
   
    implementation.setOutput = function (a) {
      this.dimensions = a;
      return implementation;
    };
    return implementation;
  }
}

class Kernel {
  constructor() { }

  static create(...fncts) {
    let functions = [];
    for (let i = 0; i < fncts.length; ++i) {
      let codeGen = new CodeGenerator();
      let glslCode = codeGen.translate(fncts[i].toString());
      functions.push({ codeGen: codeGen, glslCode: glslCode });
    }
    let result = FunctionBuilder.buildFunction(functions);
    return result;
  }
}
module.exports.Kernel = Kernel;
module.exports.FunctionBuilder = FunctionBuilder;