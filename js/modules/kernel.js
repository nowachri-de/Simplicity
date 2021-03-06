/**
 * Validate that outputdimensions have been specified
 * @param {implementation function} impl 
 */

function checkOutputDimensions(impl) {
  if (typeof impl.dimensions === 'undefined') {
    throw 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions';
  }
}
/**
 * Validate that passed arguments have type/dimension as specified
 * @param {function arguments} args 
 * @param {options} options 
 */
function checkArguments(args, options) {

  if (options.parameterMap.size !== args.length) {
    throw "mismatch between number of declared function parameters and number of actually passed arguments"
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    let type = options.parameterMap.get(i).type;

    if (Util.isTexture(arg)) {
      continue;
    }

    if (Util.isArray(type)) {
      if (Array.isArray(arg[0])) {
        throw 'expected function argument ' + i + ' to be of type 1d array but is 2d array';
      }
      if (!Array.isArray(arg) && !ArrayBuffer.isView(arg)) {
        throw 'expected function argument ' + i + ' to be of type array';
      }
    }

    if (Util.is2DArray(type)) {
      if (!Array.isArray(arg[0]) && !ArrayBuffer.isView(arg[0])) {
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
/**
 * Get the uniform location from the given program using the given id
 * @param {program instance} program 
 * @param {id of unifrom location} id 
 */
function getUniformLocation(program, id) {
  let location = program.gl.getUniformLocation(program.glProgram, id);

  if (location === null) {
    throw 'could not find unifrom ' + id;
  }

  return location;
}
/**
 * Set the value of uniform location with the given id
 * @param {program instance} program 
 * @param {id of unifrom location} id 
 * @param {value to be set} value 
 */
function setUniformLocationFloat(program, id, value) {
  let gl = program.gl;
  gl.uniform1f(getUniformLocation(program, id), value);
}
/**
 * Set the value of uniform location with the given id
 * @param {program instance} program 
 * @param {id of unifrom location} id 
 * @param {value to be set} value 
 */
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

    if (Util.isTexture(arg)) {
      let width = arg.width;
      let height = arg.height;
      //Util.setActiveTexture(program.gl,arg);
      setUniformLocationFloat(program, "uSampler_" + name + "_height", height);
      setUniformLocationFloat(program, "uSampler_" + name + "_width", width);
      textures.push(arg);
      setUniformLocationInt(program, "uSampler_" + name, arg.index);

      continue;
    }

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

      let inputTexture = TextureFactory.createTextureByDimension(gl, "inputTexture_" + name, width, height, Util.data2Texel(width, height, arg, 'R'));
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

//The dictionary is a map which is mapping function names to function code
function createFunctionDictonary() {
  let dictionary = {};

  //add properties
  dictionary.functionMap = new Map();
  //function property that retrieves all dictionary excluding the main function
  dictionary.getFunctionsExclusiveMain = function () {
    let result = [];
    this.functionMap.forEach(function (fnct, name) {
      if (name !== 'main') {
        result.push(fnct);
      }
    });
    return result;
  }

  //function property that retrieves all functions
  dictionary.getAll = function () {
    let result = [];
    this.functionMap.forEach(function (fnct) {
      result.push(fnct);
    });
    return result;
  }

  //get function by name
  dictionary.get = function (name) {
    return this.functionMap.get(name);
  }

  //set function by name
  dictionary.set = function (name, fnct) {
    this.functionMap.set(name, fnct);
  }

  return dictionary;
}

/** 
  Create options to be passed to template engine. 
  One set of options per function.

  @param functions functions that have been passed as arguments
  @param dictionary dictionary to lookup functions
*/
function setupTemplateOptions(functions, dictionary) {
  for (let i = 0; i < functions.length; ++i) {
    let options = {};
    options.samplers = [];
    options.samplers2D = [];
    options.integers = [];
    options.floats = [];
    options.signature = "";
    options.parameterMap = new Map();

    let codeGen = functions[i].codeGen;
    let parameters = codeGen.function.parameters; //parameters of function

    options.signature = codeGen.function.signature;
    options.functionName = codeGen.function.id.name;

    if (typeof dictionary.get(codeGen.function.id.name) !== 'undefined') {
      throw "function names must be unique. " + codeGen.function.id.name + " has already been defined";
    }

    dictionary.set(codeGen.function.id.name, functions[i]);
    let paramIndex = 0;

    parameters.forEach(param => {
      let type = param.type;
      let value = { name: param.name, type: type, index: paramIndex };

      if (Util.isArray(type)) {
        //options.samplers.push(value);
        options.samplers2D.push(value);
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

  return dictionary;
}
function setAdditionalOptions(mainOptions, dictionary) {
  //set object (mainOptions) keys dynamically
  mainOptions['functions'] = []; //same as { functions: [] }
  mainOptions['signatures'] = []; //same as { signatures: [] }
  mainOptions['preprocessor'] = []; //same as { preprocessor: [] }
  mainOptions['targetIndex'] = 0; //same as { targetIndex: [] }

  //functions array contains all functions exclusive main function
  let functions = dictionary.getFunctionsExclusiveMain();
  /*
  * Compute the number of actually required textures.
  * Since a texture can store channels (R,G,B,A)
  */
  let numResultTextures = Math.floor((functions.length) / 4) + 1;
  mainOptions.numResults = numResultTextures;
  let i = 1;
  functions.forEach(funct => {
    mainOptions.functions.push((new Formatter()).format(funct.glslCode));
    /*signatures array is used by shadercode template. For each function a signature will be
      generated in the shader*/
    mainOptions.signatures.push(funct.options.signature);
    /*preprocessor array is used by shadercode template. For each function a preprocessor
      declarative will be created in the shader*/
    mainOptions.preprocessor.push({ name: funct.options.functionName.toUpperCase(), id: i });

    /*targetIndex is reflecting R,G,B,A component within the shader */
    funct.options.targetIndex = i; //used for result lookup
    i++;
  });
}

function checkMain(main) {
  if (typeof main === 'undefined')
    throw 'no function with name main found'

  return main;
}

function createDictionary(functions) {
  let dictionary = createFunctionDictonary();
  dictionary = setupTemplateOptions(functions, dictionary);

  let main = checkMain(dictionary.get('main'));
  let mainOptions = main.options;
  mainOptions.main = (new Formatter()).format(main.glslCode);


  setAdditionalOptions(mainOptions, dictionary);

  return dictionary;
}


class FunctionBuilder {
  /**
   * Create an instance (function) of the kernel
   * 
   * @param functions Array of javascript functions. Multiple functions can be passed to the Kernel
   * @return kernel. 
   */
  static buildFunction(functions) {


    function implementation(...args) {
      //check(implementation, args, implementation.options);
      let options = dictionary.get('main').options;
      //check if the outputdimensions of the result texture(s) have been set
      checkOutputDimensions(implementation);
      checkArguments(args, options);

      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      /**
       * This allows definitions of setOuput([x]). Note that only one dimension is provided
       */
      if (typeof height === 'undefined') {
        height = 1;
      }

      /*
      * If the kernel is called for the first time there will be no input textures.
      * If the kernel is called multiple times, the previously used input textures 
      * need to be deleted.
      */
      implementation.inputTextures.forEach(texture => {
        if (!texture.isRaw) {
          texture.delete();
        }
      });

      implementation.program = new Program(width, height, implementation.gl);
      implementation.gl = implementation.program.gl;
      implementation.program.buildProgram(implementation.vertexShaderCode, implementation.fragmentShaderCode);
      implementation.inputTextures = setUniforms(implementation.program, width, height, args, options);

      /*
      * If the kernel is called for the first time there will be no result textures.
      * If the kernel is called multiple times, the previously used result textures 
      * need to be deleted. However, only delete the texture in case it is not a raw texture.
      */
      implementation.resultTextures.forEach(texture => {
        if (!texture.isRaw) {
          texture.delete();
        }
      });


      implementation.resultTextures = implementation.program.execute(options.numResults);
      return implementation;
    }

    let dictionary = createDictionary(functions);

    implementation.fragmentShaderCode = ShaderCode.generateFragmentShader(dictionary);;
    implementation.vertexShaderCode = ShaderCode.generateVertexShaderCode();
    implementation.dictionary = dictionary;
    implementation.inputTextures = [];
    implementation.resultTextures = [];
    implementation.program = null;
    implementation.gl;

    implementation.getVertexShaderCode = function () {
      return implementation.vertexShaderCode;
    }

    implementation.setGL = function (gl) {
      implementation.gl = gl;
      return implementation;
    }

    implementation.getGL = function (gl) {
      return implementation.gl;
    }

    implementation.getFragmentShaderCode = function () {
      return implementation.fragmentShaderCode;
    }

    implementation.result = function (name) {
      if (typeof name === 'undefined') {
        name = 'main';
      }
      let targetIndex = implementation.dictionary.get(name).options.targetIndex;

      if (typeof targetIndex === 'undefined') {
        throw 'could not lookup result of function ' + name;
      }

      let textureIndex = Math.floor(targetIndex / 4);
      targetIndex = targetIndex % 4;
      return Util.texture2array(implementation.program.gl, implementation.resultTextures[textureIndex], targetIndex);
    }

    implementation.rawResult = function (name) {
      if (typeof name === 'undefined') {
        name = 'main';
      }
      let targetIndex = implementation.dictionary.get(name).options.targetIndex;

      if (typeof targetIndex === 'undefined') {
        throw 'could not lookup raw result of function ' + name;
      }

      let textureIndex = Math.floor(targetIndex / 4);
      targetIndex = targetIndex % 4;

      let texture = implementation.resultTextures[textureIndex];
      texture.isRaw = true; //prevent deletion of texture by next call to kernel
      return texture;
    }

    /**
     * Free the required gl memory
     */
    implementation.delete = function () {
      (implementation.program !== null) ? implementation.program.delete() : '';
      implementation.resultTextures.forEach(texture => {
        if (!texture.isRaw) {
          texture.delete();
        }
      });
      implementation.inputTextures.forEach(texture => {
        if (!texture.isRaw) {
          texture.delete();
        }
      });
      implementation.resultTextures = [];
      implementation.inputTextures = [];
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
    let supportFunctions = []; //support functions must be wrapped in array and do not generate result
    let functions = [];

    /**
     * Process each function being passed to the kernel
     */
    for (let i = 0; i < fncts.length; ++i) {
      /**
      * The subsequent statement will check if the given argument is an array.
      * In case the argument is an array, this is indicating that the argument is a support function
      * or a support function reference. Note that the array can contain multiple functions.
      * The result of a support function will not be stored in texture.
      */
      if (Array.isArray(fncts[i])) {
        //loop over values in array, each value represents a support function or a support function reference
        for (let j = 0; j < fncts[i].length; ++j) {
          supportFunctions.push(fncts[i][j]);
        }
        continue;
      }
      let codeGen = new CodeGenerator();
      let glslCode = codeGen.translate(fncts[i].toString());
      functions.push({ codeGen: codeGen, glslCode: glslCode });
    }

    /**
     * Process all support functions
     */
    for (let i = 0; i < supportFunctions.length; ++i) {
      let codeGen = new CodeGenerator(true); //true in constructor means, supportFunction is generated
      let glslCode = codeGen.translate(supportFunctions[i].toString());
      functions.push({ codeGen: codeGen, glslCode: glslCode, isHelper: true });
    }

    // Do the magic
    let result = FunctionBuilder.buildFunction(functions);
    return result;
  }

}

module.exports = {
  Kernel,
  FunctionBuilder
}
const { CodeGenerator } = require('./../modules/codegenerator.js');
const { Util } = require('./../modules/util.js');
const { ShaderCode } = require('./../modules/shadercode.js');
const { Program } = require('./../modules/program.js');
const { TextureFactory } = require('./../modules/texturefactory.js');
const { Formatter } = require("./formatter.js");