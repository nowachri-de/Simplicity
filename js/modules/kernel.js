const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Util } = require(__dirname + '\\..\\modules\\util.js');
const { ShaderCode } = require(__dirname + '\\..\\modules\\shadercode.js');
const { Program } = require(__dirname + '\\..\\modules\\program.js');
const { ShaderFactory } = require(__dirname + '\\..\\modules\\shader.js');
const { Matrix } = require(__dirname + '\\..\\modules\\matrix.js');


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

function getUniformLocation(program,id){
  let location = program.gl.getUniformLocation(program.glProgram, id);

  if (location === null){
    throw 'could not find unifrom ' + id;
  }

  return location;
}

function setUniformLocationFloat(program,id,value){
  let gl = program.gl;
  gl.uniform1f(getUniformLocation(program,id), value);
}

function setUniformLocationInt(program,id,value){
  let gl = program.gl;
  gl.uniform1i(getUniformLocation(program,id), value);
}

function setUniforms(program,width,height, args, options) {
  let textures = [];
  let gl = program.gl;

  setUniformLocationFloat(program,"uTextureWidth",width);
  setUniformLocationFloat(program,"uTextureHeight",height);

  let i = 0;
  args.forEach(arg => {
    let type = options.parameterMap.get(i).type;
    let name = options.parameterMap.get(i).name;

    if (Util.isArray(type) || Util.is2DArray(type)) {

      let width = arg.length;
      let height = 1.0;

      if (Util.is2DArray(type)){
        height = arg[0].length;
      }
      let texture = Util.createTexture(gl,"",width,height,arg);
      textures.push(texture);
      setUniformLocationInt(program, "uSampler_"+ name,texture.index);
      setUniformLocationFloat(program, "uSampler_"+ name+"_width",width);
      setUniformLocationFloat(program, "uSampler_"+ name+"_height",height);
    
    }  

    if (Util.isInteger(type)) {
     
    }

    if (Util.isFloat(type)) {
    
    }
    i++;
  });
  return textures;
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

 /*   fragmentShaderCode =       `#ifdef GL_ES
    precision highp float;
#endif

varying   highp float vKernelX;
varying   highp float vKernelY;


uniform sampler2D uSampler_y;
uniform float uSampler_y_width;
uniform float uSampler_y_height;

float read_y(float x, float y){
    int index = 0;
    //convert pixel coordinates of result texture to texture coordinates of sampler texture
    float y_x = (x/uSampler_y_width)+(1.0/(2.0*uSampler_y_width));
    float y_y = (y/uSampler_y_height)+(1.0/(2.0*uSampler_y_height));

    return texture2D(uSampler_y,vec2(y_x,y_y)).x;
    //return uSampler_y_height;
  }

void main(void) {
  ;
  gl_FragColor = vec4(read_y(vKernelX,vKernelY), 0., 0., 0.);
}`*/
    let vertexShaderCode   = ShaderCode.generateVertexShaderCode();

    function implementation(...args) {
      check(implementation,args, options);
      let width = implementation.dimensions[0];
      let height = implementation.dimensions[1];
      let program = new Program(width,height);
      let vertexShader = ShaderFactory.createVertexShader(program.gl, vertexShaderCode);
      let fragmentShader = ShaderFactory.getFragmentShader(program.gl, fragmentShaderCode);
      console.log(vertexShaderCode);
      console.log(fragmentShaderCode);


      program.buildProgram(vertexShader, fragmentShader);
      let inputTextures = setUniforms(program,width,height,args, options);
      program.gl.useProgram(program.glProgram);
      program.gl.viewport(0, 0, width, height);
      
      let resultTexture = Util.createReadableTexture(program.gl, 'resultTexture',width,height);
      program.gl.bindFramebuffer(program.gl.FRAMEBUFFER, Util.createFrameBuffer(program.gl,resultTexture));
      program.gl.drawElements(program.gl.TRIANGLES, /*num items*/ 6, program.gl.UNSIGNED_SHORT, 0);
      console.log(Matrix.texture2matrix(program.gl,resultTexture,0));
      //console.log(options);
      console.log(templateCode);
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