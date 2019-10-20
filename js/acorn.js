
const acorn = require('acorn');
const Interpreter = require(__dirname + "\\modules\\interpreter.js");
const Visitor = require(__dirname + "\\modules\\visitor.js");
const {ShaderCode} = require(__dirname + "\\modules\\ShaderCode.js");


var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function isInt(n) {
    return Number.isInteger(n);
}

function isFloat(n) {
    return !Number.isInteger(n);
}

function generateFunction(a) {
    var shaderTemplate =
        `
/**
* This is a generated shader.
*/

#ifdef GL_ES 
    precision highp float; 
#endif

{{each(options.samplers)}}
uniform sampler2D uSampler_{{@this.name}};
{{/each}}

{{each(options.samplers)}}
uniform float uSampler_{{@this.name}}_width;
uniform float uSampler_{{@this.name}}_height;

{{/each}}
uniform highp float uResultWidth; // result texture width
uniform highp float uResultHeight; // result texture height

/*
*  functions for accessing values of sampler 
*  parameter x: pixel coordinate of result texture beeing shaded
*  parameter y: pixel coordinate of result texture beeing shaded
*  parameter index: R,G,B,A component
*/
{{each(options.samplers)}}
float getValueSampler_{{@this.name}}(float x,float y, int index){
    //convert pixel coordinates of result texture to texture coordinates of sampler texture
    float {{@this.name}}_x = (x/uSampler_{{@this.name}}_width)+(1.0/(2.0*uSampler_{{@this.name}}_width));
    float {{@this.name}}_y = (y/uSampler_{{@this.name}}_height)+(1.0/(2.0*uSampler_{{@this.name}}_height));

    if (targetIndex == 0) texture2D(uSampler_{{@this.name}},vec2({{@this.name}}_x,{{@this.name}}_y)).x;
    if (targetIndex == 1) texture2D(uSampler_{{@this.name}},vec2({{@this.name}}_x,{{@this.name}}_y)).y;
    if (targetIndex == 2) texture2D(uSampler_{{@this.name}},vec2({{@this.name}}_x,{{@this.name}}_y)).z;
    if (targetIndex == 3) texture2D(uSampler_{{@this.name}},vec2({{@this.name}}_x,{{@this.name}}_y)).w;
}

{{/each}}

void main(void) { 
    //x,y are texture coordinates
    highp float  x = vTexture.s;
    highp float  y = vTexture.t;

    //convert texture coordinates to pixel coordinates
    highp float  x = (x-(1.0/(2.0*uResultWidth)))*uResultWidth;
    highp float  y = (y-(1.0/(2.0*uResultHeight)))*uResultHeight;

    float v = matrixmul(x,y);
    gl_FragColor = getResultValue(x,y,v,uTargetIndex);
}
`;

    let samplers = [];
    samplers.push({ name: 'input', width: '100', height: '100' });
    samplers.push({ name: 'bias', width: '100', height: '1' });

    let options = {
        samplers: samplers
    }

    console.log(ShaderCode.generateFragmentShader(options));
}
generateFunction(1.0);



let source = "for(let a=0; a < 1 ; ++a){let b = c[1.0];}";
const jsInterpreter = new Interpreter(new Visitor(), source);
const body = acorn.parse(source).body;


jsInterpreter.interpret(body);

