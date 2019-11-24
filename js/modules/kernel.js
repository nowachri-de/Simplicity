const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Util } = require(__dirname + '\\..\\modules\\util.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');
const { Program } = require(__dirname + '\\..\\modules\\program.js');
const { TextureFactory } = require(__dirname + '\\..\\modules\\texturefactory.js');
const { Formatter } = require(__dirname + "\\formatter.js");

function checkDimensions(impl) {
  if (typeof impl.dimensions === 'undefined') {
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';
  }
}
function checkArguments(args, options) {
  if (options.parameterMap.size !== args.length) {
    throw "mismatch between number of declared function parameters and number of actually passed arguments"
  }

  for (let i = 0; i < args.length; i++) {
    if (Util.isArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(args[i])) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
    }

    if (Util.is2DArray(options.parameterMap.get(i).type)) {
      if (!Array.isArray(args[i])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }

      if (!Array.isArray(args[i])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }
    }
  }
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

      setUniformLocationFloat(program, "uSampler_" + name + "_width", width);
      //set propper height
      if (Util.is2DArray(type)) {
        height = arg[0].length;
        setUniformLocationFloat(program, "uSampler_" + name + "_height", height);
      }
      let inputTexture = TextureFactory.createTextureByDimension(gl, "texture_uSampler_" + name, width, height, arg);

      textures.push(inputTexture);
      setUniformLocationInt(program, "uSampler_" + name, inputTexture.index);

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

//The functionsDescriptor is a map which is mapping function names to function code
function setupFunctionsDescriptor() {
  let functionsDescriptor = {};
  functionsDescriptor.functionMap = new Map();
  functionsDescriptor.getFunctionsExclusiveMain = function () {
    let result = [];
    this.functionMap.forEach(function (functionDescriptor, nameKey) {
      if (nameKey !== 'main') {
        result.push(functionDescriptor);
      }
    });
    return result;
  }

  functionsDescriptor.getAll = function () {
    let result = [];
    this.functionMap.forEach(function (functionDescriptor, nameKey) {
      result.push(functionDescriptor);
    });
    return result;
  }

  functionsDescriptor.get = function (key) {
    return this.functionMap.get(key);
  }

  functionsDescriptor.set = function (key, value) {
    this.functionMap.set(key, value);
  }
  return functionsDescriptor;
}

/*
  Create options to be passed to template engine. 
  One set of options per function. 
*/
function setupOptions(functions, functionsDescriptor) {
  for (let i = 0; i < functions.length; ++i) {
    let options = {};
    options.samplers = [];
    options.samplers2D = [];
    options.integers = [];
    options.floats = [];
    options.signature = "";
    options.parameterMap = new Map();

    let codeGen = functions[i].codeGen;
    let parameters = codeGen.function.parameters;

    options.signature = codeGen.function.signature;
    options.functionName = codeGen.function.id.name;

    if (typeof functionsDescriptor.get(codeGen.function.id.name) !== 'undefined') {
      throw "function names must be unique. " + codeGen.function.id.name + " has already been defined";
    }

    functionsDescriptor.set(codeGen.function.id.name, functions[i]);
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
  }

  return functionsDescriptor;
}

function createFunctionsDescriptor(functions) {
  let functionsDescriptor = setupFunctionsDescriptor();
  functionsDescriptor = setupOptions(functions, functionsDescriptor);

  let main = functionsDescriptor.get('main');
  let options = main.options;
  options.main = (new Formatter()).format(main.glslCode);
  options.functions = [];
  options.signatures = [];
  options.preprocessor = [];

  functions = functionsDescriptor.getFunctionsExclusiveMain();
  let i = 1;
  functions.forEach(funct => {
    options.functions.push((new Formatter()).format(funct.glslCode));
    options.signatures.push(funct.options.signature);
    options.preprocessor.push({ name: funct.options.functionName.toUpperCase(), id: i });
    funct.targetIndex = i;
    i++;
  });

  return functionsDescriptor;
}

function createTextures(functionsDescriptor, width, height){

  let result = [];
  let texture = TextureFactory.createReadableTexture(gl, 'resultTexture', { width: width, height: height });
  functionsDescriptor.getAll().forEach(funct => {
    funct.texture = texture;
  });

  //only one texture supported for now
  result.push(texture);
  return result;
}

class FunctionBuilder {
  static buildFunction(functions) {

    //let options = createOptions(codeGen.function.parameters, glslCode);
    let functionsDescriptor = createFunctionsDescriptor(functions);
    let fragmentShaderCode = ShaderCode.generateFragmentShader(functionsDescriptor);
    let vertexShaderCode = ShaderCode.generateVertexShaderCode();

    function implementation(...args) {
      //check(implementation, args, implementation.options);
      let options = functionsDescriptor.get('main').options;
      checkDimensions(implementation);
      checkArguments(args, options);

      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      let program = new Program(width, height);

      //console.log(vertexShaderCode);
      //console.log(fragmentShaderCode);

      program.buildProgram(vertexShaderCode, fragmentShaderCode);
      let inputTextures = setUniforms(program, width, height, args, options);

      let resultTextures = program.execute();

      resultTextures.forEach(texture => {
        texture.delete();
      })

      program.delete();

      inputTextures.forEach(texture => {
        texture.delete();
      });
    }

    //implementation.options = functionsDescriptor.get('main').options;


    implementation.setOutput = function (dimensions) {
      this.dimensions = dimensions;
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