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
    let arg = args[i];
    let type = options.parameterMap.get(i).type;

    if (Util.isArray(type)) {
      if (Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type 1d array but is 2d array';
      }
      if (!Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
    }

    if (Util.is2DArray(type)) {
      if (!Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type two dimensional array';
      }
    }

    if (Util.isInteger(type)) {
      if (!Util.isArgumentInteger(arg)) {
        throw 'expected function argument ' + i + ' to be of type integer';
      }
    }

    if (Util.isFloat(type)) {
      if (Array.isArray(arg)) {
        throw 'expected function argument ' + i + ' to be of type float';
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

  for (let i = 0; i < args.length; ++i) {
    let arg = args[i];
    let type = options.parameterMap.get(i).type;
    let name = options.parameterMap.get(i).name;

    if (Util.isArray(type) || Util.is2DArray(type)) {
      //width and height of inputTexture not required to be same dimensions as resultTexture
      let width = arg.length;
      let height = 1.0;

      //set propper height
      if (Util.is2DArray(type)) {
        width = arg[0].length;
        height = arg.length;
        setUniformLocationFloat(program, "uSampler_" + name + "_height", height);
      }
      setUniformLocationFloat(program, "uSampler_" + name + "_width", width);

      let inputTexture = TextureFactory.createTextureByDimension(gl, "texture_uSampler_" + name, width, height, Util.data2Texel(width, height, arg, 'R'));
      textures.push(inputTexture);
      setUniformLocationInt(program, "uSampler_" + name, inputTexture.index);

    }

    if (Util.isInteger(type)) {
      setUniformLocationInt(program, "u_" + name, arg);
    }

    if (Util.isFloat(type)) {
      setUniformLocationFloat(program, "u_" + name, arg);
    }

  }

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
function setAdditionalOptions(mainOptions, functionsDescriptor) {
  let functions = functionsDescriptor.getFunctionsExclusiveMain();
  let i = 1;
  let numResultTextures = 2;//Math.floor((functions.length + 1)/4);
 
  for(let j=0; j < numResultTextures;++j){
    mainOptions.resultTextures.push(j+1);
  }

  functions.forEach(funct => {
    mainOptions.functions.push((new Formatter()).format(funct.glslCode));
    mainOptions.signatures.push(funct.options.signature);
    mainOptions.preprocessor.push({ name: funct.options.functionName.toUpperCase(), id: i });
    funct.options.targetIndex = i; //used for result lookup
    i++;
  });
}
function createFunctionsDescriptor(functions) {
  let functionsDescriptor = setupFunctionsDescriptor();
  functionsDescriptor = setupOptions(functions, functionsDescriptor);

  let main = functionsDescriptor.get('main');
  let mainOptions = main.options;
  mainOptions.main = (new Formatter()).format(main.glslCode);
  mainOptions.functions = [];
  mainOptions.signatures = [];
  mainOptions.preprocessor = [];
  mainOptions.resultTextures = [];
  mainOptions.targetIndex = 0;

  setAdditionalOptions(mainOptions, functionsDescriptor);

  return functionsDescriptor;
}


class FunctionBuilder {
  static buildFunction(functions) {

    //let options = createOptions(codeGen.function.parameters, glslCode);
    let functionsDescriptor = createFunctionsDescriptor(functions);
    let fragmentShaderCode = ShaderCode.generateFragmentShader(functionsDescriptor);
    let vertexShaderCode = ShaderCode.generateVertexShaderCode();
    let inputTextures;
    let resultTextures;
    let program;

    function implementation(...args) {
      //check(implementation, args, implementation.options);
      let options = functionsDescriptor.get('main').options;
      checkDimensions(implementation);
      checkArguments(args, options);

      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      program = new Program(width, height);

      //console.log(vertexShaderCode);
      console.log(fragmentShaderCode);

      program.buildProgram(vertexShaderCode, fragmentShaderCode);
      inputTextures = setUniforms(program, width, height, args, options);

      resultTextures = program.execute();

      /*resultTextures.forEach(texture => {
        texture.delete();
      })*/
      return implementation;
    }

    implementation.fragmentShaderCode = fragmentShaderCode;
    implementation.vertexShaderCode = vertexShaderCode;
    implementation.functionsDescriptor = functionsDescriptor;

    implementation.getVertexShaderCode = function () {
      return implementation.vertexShaderCode;
    }

    implementation.getFragmentShaderCode = function () {
      return implementation.fragmentShaderCode;
    }

    implementation.result = function (name) {
      if (typeof name === 'undefined') {
        name = 'main';
      }
      let targetIndex = implementation.functionsDescriptor.get(name).options.targetIndex;

      if (typeof targetIndex === 'undefined') {
        throw 'could not lookup result of function ' + name;
      }
      return Util.texture2array(program.gl, resultTextures[0], targetIndex);
    }

    implementation.delete = function () {
      program.delete();
      resultTextures.forEach(texture => {
        texture.delete();
      });
      inputTextures.forEach(texture => {
        texture.delete();
      });
    }

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