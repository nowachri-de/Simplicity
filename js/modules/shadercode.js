var Sqrl = require('squirrelly');
const { Formatter } = require("./formatter.js");

class ShaderCode {

    static getCode(type) {
        switch (type) {
            case "READABLE": return ShaderCode.getReadableShaderCode();
            case "READABLE2": return ShaderCode.getReadableShaderCode2();
            case "SINGLE": return ShaderCode.getSingleTextureCode();
            case "DUAL": return ShaderCode.getDualTextureCode();
            case "VERTEX": return ShaderCode.getVertexShaderCode();
            default: throw "getCode " + type + " not known.";
        }
    }

    static getVertexShaderCode() {
        var code = `
        
        // vertex shader for a single quad 
        // work is performed based on the texels being passed 
        // through to the texture shader. 
        #ifdef GL_ES
            precision highp float; 
        #endif 
        attribute highp vec3 aPosition; 
        attribute highp vec2 aTexture; 
        varying   highp vec2 vTexture; 
        void main(void) 
        { 
            // just pass the position and texture coords 
            gl_Position = vec4(aPosition, 1.0); 
            vTexture = aTexture; 
        }`;
        return code;
    }
    static getReadableShaderCode2() {
        var code = ` 
            /*ShaderFactory that creates a texture that can be converted to byte.
             *This is needed when reading a texture from javascript.*/

            #ifdef GL_ES 
                precision highp float; 
            #endif 
          
            varying highp vec2	   		vTexture;		    // row, column to calculate 
            uniform highp sampler2D     usamplerA;			// matrixA
            uniform highp sampler2D     usamplerB;			// matrixB
            uniform highp int 			uNumInputColumns;	//
            uniform highp float	  		uStepInCol; 		// increment across source texture
            uniform int					uTargetIndex;       // index where to read result;

            highp float readValue(highp float col,highp float row,int targetIndex){
                
                highp vec4 result = texture2D(usamplerA, vec2(col,row));
                
                /*if (targetIndex == 0) return result.x;
                if (targetIndex == 1) return result.y;
                if (targetIndex == 2) return result.z;
                if (targetIndex == 3) return result.w;*/

                if (targetIndex == 0) return result.r;
                if (targetIndex == 1) return result.g;
                if (targetIndex == 2) return result.b;
                if (targetIndex == 3) return result.a;
                
                //This return statement should not be reached
                return -1.0;
            }
            void main(void) { 
                 
                // coordinate system is explained here
                // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                highp float  row = vTexture.t;
                highp float  col = vTexture.s;
                
                highp float v = readValue(col,row,uTargetIndex);				
                if (v==0.) { 
                    gl_FragColor = vec4(0.,0.,0.,0.); 
                    return; 
                } 
               
                highp float a = abs(v);                   			// encode absolute value + sign
                highp float exp = floor(log2(a));         			// number of powers of 2
                highp float mant = (a * pow(2.,23.-exp)); 			// multiply to fill 24 bits (implied leading 1) 
                highp float mant1 = floor(mant / 256. / 256.);    	// first 8 bits of mantissa 
                highp float mant2 = mod(floor(mant / 256.),256.); 	// second 8 bits 
                highp float mant3 = mod(mant,256.);               	// third 8 bits 

                highp float sign = 128.-128.*(a/v);					// sign bit is 256 
                highp float e = (sign+exp+127.)/510.;				// exponent and sign 
                highp float m1 = (mant1-(128.*(1.-mod(exp+127.,2.))))/255.; // handle leading bit 
                highp float m2 = (mant2)/255.;						// middle part 
                highp float m3 = (mant3+.5)/255.;					// scale to 0 - 255 
                gl_FragColor = vec4(m3,m2,m1,e);					// output an IEEE754 32-bit floating point number 
            }
        `;
        return code;
    }

    static getReadableShaderCode() {
        var code = ` 
            /*ShaderFactory that creates a texture that can be converted to byte.
             *This is needed when reading a texture from javascript.*/

            #ifdef GL_ES 
                precision highp float; 
            #endif 
          
            varying highp vec2	   		vTexture;		    // row, column to calculate 
            uniform highp sampler2D     usamplerA;			// matrixA
            uniform highp sampler2D     usamplerB;			// matrixB
            uniform highp int 			uNumInputColumns;	//
            uniform highp float	  		uStepInCol; 		// increment across source texture
            uniform int					uTargetIndex;       // index where to read result;

            highp float readValue(highp float col,highp float row,int targetIndex){
                
                highp vec4 result = texture2D(usamplerA, vec2(col,row));
                
                if (targetIndex == 0) return result.r;
                if (targetIndex == 1) return result.g;
                if (targetIndex == 2) return result.b;
                if (targetIndex == 3) return result.a;
                
                //This return statement should not be reached
                return -1.0;
            }
            void main(void) { 

                highp float  row = vTexture.t;
                highp float  col = vTexture.s;
                
                highp float value = readValue(col,row,uTargetIndex);				

             
                if (value == 0.0) {
                    gl_FragColor = vec4(0.,0.,0.,0.);
                    return;
                }
                
                
                float exponent;
                float mantissa;
                vec4  result;
                float sgn;
                
                sgn = step(0.0, -value);
                value = abs(value);
                exponent = floor(log2(value));
                mantissa = value*pow(2.0, -exponent)-1.0;
                exponent = exponent+127.0;
                result   = vec4(0,0,0,0);
                result.a = floor(exponent/2.0);
                exponent = exponent - result.a*2.0;
                result.a = result.a + 128.0*sgn;
                result.b = floor(mantissa * 128.0);
                mantissa = mantissa - result.b / 128.0;
                result.b = result.b + exponent*128.0;
                result.g = floor(mantissa*32768.0);
                mantissa = mantissa - result.g/32768.0;
                result.r = floor(mantissa*8388608.0);
                gl_FragColor = result/255.0;					// output an IEEE754 32-bit floating point number 
            }
        `;
        return code;
    }

    static getDualTextureCode() {
        var code = `
            //Do matrix multiplication using two textures
            #ifdef GL_ES
                    precision highp float;
            #endif

            varying highp vec2          vTexture;                   	// row, column to calculate
            uniform highp sampler2D     usamplerA;                  	// matrixA
            uniform highp sampler2D     usamplerB;                  	// matrixB
            uniform int					uNumInputColumns;   			
            uniform highp float         uStepInCol;						// increment across source texture

            highp float matrixmul(float col, float row){
                    highp float sum = 0.;
                    highp float cc = 0.;

                    for (int index=0; index < 2048; index ++){
                            if (index>=uNumInputColumns) break;

                            float m1 = texture2D(usamplerA,vec2(cc,row)).r;
                            float m2 = texture2D(usamplerB,vec2(col,cc)).r;

                            cc  += uStepInCol;
                            sum += (m1*m2);
                    }
                    return sum;
                    //return texture2D(usamplerA,vec2(col * uStepInCol,row * uStepInCol)).r;
            }

            void main(void) {
                    // The texture coordinates are coming from the target texture
                    // WebGL coordinate system is explained here
                    // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                    highp float  col = vTexture.s;
                    highp float  row = vTexture.t;


                    float v = matrixmul(col,row);
                    gl_FragColor = vec4(v,0.,0.,0.);
            }
    `;
        return code;
    }


    static getSingleTextureCode() {
        var code = `
            /* Do matrix multiplication using a single texture 
            *  Upto four matrices can be stored in a single texture using the RGBA components. */
            #extension GL_EXT_draw_buffers : require
            #ifdef GL_ES 
                precision highp float; 
            #endif 
         
            varying highp vec2          vTexture;			// row, column to calculate 
            uniform highp sampler2D     usampler;			// merged matrix texels
            uniform highp float			uWidth;	    		// input texture width
            uniform highp float			uHeight;	    	// input texture height
            uniform highp float			uResultWidth;	    // result texture width
            uniform highp float			uResultHeight;	    // result texture height

            uniform 	  int 			uRGBAIndexA;        // R,G,B,A index matrixA
            uniform       int           uRGBAIndexB;        // R,G,B,A index matrixB
            uniform       int           uTargetIndex;       // vec4 index where to put result
            
            float getMatrixValue(float x, float y,int rgbaIndex){
                if (rgbaIndex == 0) return texture2D(usampler,vec2(x,y)).x;
                if (rgbaIndex == 1) return texture2D(usampler,vec2(x,y)).y;
                if (rgbaIndex == 2) return texture2D(usampler,vec2(x,y)).z;
                if (rgbaIndex == 3) return texture2D(usampler,vec2(x,y)).w;
                
                return 0.;
            }
            
            vec4 getResultValue(float col, float row,float value,int targetIndex){
                vec4 result = texture2D(usampler,vec2(col,row));
                
                if (targetIndex == 0) result.x = value; return result;
                if (targetIndex == 1) result.y = value; return result;
                if (targetIndex == 2) result.z = value; return result;
                if (targetIndex == 3) result.w = value; return result;

                return result;
            }
            
            float matrixmul(float col, float row){
                highp float sum = 0.;
                
                //convert pixel coordinate to texture coordinate
                highp float x = (col/uWidth)+(1.0/(2.0*uWidth));
                highp float y = (row/uHeight)+(1.0/(2.0*uHeight));
                
                //colum a and row b to multiply
                highp float columnA = y;
                highp float rowB    = x;

                //initialize x and y to zero texture coordinate
                x = (0.0/uWidth)+(1.0/(2.0*uWidth));
                y = (0.0/uHeight)+(1.0/(2.0*uHeight));

                highp float stepX = 1.0/uWidth;
                highp float stepY = 1.0/uHeight;

                for (int index=0; index < 2048; index ++){
                    if (index>=int(uWidth)) break;

                    float m1 = getMatrixValue(x,columnA,uRGBAIndexA);
                    float m2 = getMatrixValue(rowB,y,uRGBAIndexB);
                    
                    x  += stepX;
                    y  += stepY;

                    sum += (m1*m2);
                }
                return sum;
            }
            
            void main(void) { 
                // The texture coordinates are coming from the target texture 
                // WebGL coordinate system is explained here
                // http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
                highp float  col = vTexture.s;
                highp float  row = vTexture.t;
                
                //convert result texture coordinates to result texture pixel coordinates
                highp float  x = (col-(1.0/(2.0*uResultWidth)))*uResultWidth;
                highp float  y = (row-(1.0/(2.0*uResultHeight)))*uResultHeight;
                
                //x = (x/uResultWidth)+(1.0/(2.0*uResultWidth));
                //y = (y/uResultHeight)+(1.0/(2.0*uResultHeight));

                float v = matrixmul(x,y);
                //gl_FragColor = getResultValue(x,y,v,uTargetIndex);
                gl_FragData[0] = getResultValue(x,y,v,uTargetIndex);
            }
        `;
        return code;
    }

   
    static generateVertexShaderCode() {
        var code = `
// vertex shader for a single quad 
// work is performed based on the texels being passed 
// through to the texture shader.

#ifdef GL_ES
    precision highp float; 
#endif 
attribute highp vec3 aPosition; 
attribute highp vec2 aTexture;
        
uniform float uResultTextureWidth; // result texture width
uniform float uResultTextureHeight; // result texture height

varying float vKernelX; 
varying float vKernelY; 
varying highp vec2 vTexture;
//U = S = x dimension
//V = T = y dimension

void main(void) { 
    // just pass the position and texture coords 
    gl_Position = vec4(aPosition, 1.0); 
            
    //convert texture coordinates to pixel coordinates
    vKernelX = (aTexture.s-(1.0/(2.0*uResultTextureWidth)))*uResultTextureWidth;
    vKernelY = (aTexture.t-(1.0/(2.0*uResultTextureHeight)))*uResultTextureHeight;
    vTexture = aTexture;
}`;
        return code;
    }
    static generateFragmentShader(functionsDescriptor) {

        var shaderTemplate = `
/**
* This is a generated fragment shader.
*/
#extension GL_EXT_draw_buffers : require        
#ifdef GL_ES 
  precision highp float; 
#endif

varying highp float vKernelX; 
varying highp float vKernelY; 
varying highp vec2  vTexture;

{{resultDeclarations(options.numResults)}}
{{/resultDeclarations}}

#define MAIN 0
{{each(options.preprocessor)}}
#define {{@this.name}} {{@this.id}}

{{/each}}
{{each(options.samplers)}}

uniform sampler2D uSampler_{{@this.name}};
uniform float uSampler_{{@this.name}}_width;
uniform float uSampler_{{@this.name}}_height;

{{/each}}
{{each(options.samplers2D)}}
uniform sampler2D uSampler_{{@this.name}};
uniform float uSampler_{{@this.name}}_width;
uniform float uSampler_{{@this.name}}_height;

{{/each}}

{{each(options.integers)}}
uniform int u_{{@this.name}};
{{/each}}
{{each(options.floats)}}
uniform float u_{{@this.name}};
{{/each}}
float readTexture(int x, float width, in sampler2D sampler);
float readTexture(float x, int width, in sampler2D sampler);
float readTexture(int x, int width, in sampler2D sampler);
float readTexture(int x, float y,float width,float height, in sampler2D sampler);
float readTexture(float x, int y,float width,float height, in sampler2D sampler);
float readTexture(int x, int y,float width,float height, in sampler2D sampler);

float write (float value, int index){
    int vecIndex = index / 4;
    int vecComponentIndex = int(mod(float(index),4.0));
    vec4 vector2set = vResults[vecIndex];

    if (vecComponentIndex == 0) { vector2set = vec4(value,vector2set.y,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 1) { vector2set = vec4(vector2set.x,value,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 2) { vector2set = vec4(vector2set.x,vector2set.y,value,vector2set.w); }
    if (vecComponentIndex == 3) { vector2set = vec4(vector2set.x,vector2set.y,vector2set.z,value); }

    vResults[vecIndex] = vector2set;
    gl_FragData[vecIndex] = vector2set;
    return value;
}

float write (int value, int index){
    int vecIndex = index / 4;
    int vecComponentIndex = int(mod(float(index),4.0));
    vec4 vector2set = vResults[vecIndex];

    if (vecComponentIndex == 0) { vector2set = vec4(float(value),vector2set.y,vector2set.z,vector2set.w); }
    if (vecComponentIndex == 1) { vector2set = vec4(vector2set.x,float(value),vector2set.z,vector2set.w); }
    if (vecComponentIndex == 2) { vector2set = vec4(vector2set.x,vector2set.y,float(value),vector2set.w); }
    if (vecComponentIndex == 3) { vector2set = vec4(vector2set.x,vector2set.y,vector2set.z,float(value)); }

    vResults[vecIndex] = vector2set;
    gl_FragData[vecIndex] = vector2set;

    return float(value);
}

{{if(options.samplers.length > 0)}}
/*
*  functions for accessing values of a 1D array which is represented by a 2D texture
*  parameter x:       pixel coordinate of result texture beeing shaded
*  parameter width:   width of texture which is read by given sampler
*  parameter sampler: sampler which is used to read values from texture
*/
float readTexture(float x, float width, in sampler2D sampler){
    int index = 0;
    //convert pixel coordinates of result texture to texture coordinates of sampled texture
    float y = (x + 0.5)/(width);

    if (index == 0) return texture2D(sampler,vec2(y,0.)).x;
    if (index == 1) return texture2D(sampler,vec2(y,0.)).y;
    if (index == 2) return texture2D(sampler,vec2(y,0.)).z;
    if (index == 3) return texture2D(sampler,vec2(y,0.)).w;
}
float readTexture(int x, float width, in sampler2D sampler){
    return readTexture(float(x),width,sampler);
}

float readTexture(float x, int width, in sampler2D sampler){
    return readTexture(x,float(width),sampler);
}

float readTexture(int x, int width, in sampler2D sampler){
    return readTexture(float(x),float(width),sampler);
}
{{/if}}

{{if(options.samplers2D.length > 0)}}
/*
*  functions for accessing values of a 2D array which is represented by a 2D texture
*  parameter x:       x pixel coordinate of result texture beeing shaded
*  parameter y:       y pixel coordinate of result texture beeing shaded
*  parameter width:   width of texture which is read by given sampler
*  parameter height:  height of texture which is read by given sampler
*  parameter sampler: sampler which is used to read values from texture
*/
float readTexture(float y, float x,float width,float height, in sampler2D sampler ){
   int index = 0;

   //convert pixel coordinates of result texture to texture coordinates of sampler texture
   float xx = (x+0.5)/width;
   float yy = (y+0.5)/height;

   
   if (index == 0) return texture2D(sampler,vec2(xx,yy)).x;
   if (index == 1) return texture2D(sampler,vec2(xx,yy)).y;
   if (index == 2) return texture2D(sampler,vec2(xx,yy)).z;
   if (index == 3) return texture2D(sampler,vec2(xx,yy)).w;

   /*if (index == 0) return texture2D(sampler,vec2(yy,xx)).x;
   if (index == 1) return texture2D(sampler,vec2(yy,xx)).y;
   if (index == 2) return texture2D(sampler,vec2(yy,xx)).z;
   if (index == 3) return texture2D(sampler,vec2(yy,xx)).w;*/

   return -1.0;
}

float readTexture(int x, float y,float width,float height, in sampler2D sampler){
    return readTexture(float(x), y, width,height, sampler);
}

float readTexture(float x, int y,float width,float height, in sampler2D sampler){
    return readTexture(x, float(y), width,height, sampler);
}

float readTexture(int x, int y,float width,float height, in sampler2D sampler){
    return readTexture(float(x), float(y), width,height, sampler);
}
{{/if}}
{{each(options.signatures)}}
{{@this}};
{{/each}}

{{each(options.functions)}}
{{@this}}

{{/each}}
{{init(options.numResults)}}
{{/init}}
{{main}}
`;
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };

        let oldRender = Sqrl.Render;
        Sqrl.Render = function (...args) {
            let result = oldRender.apply(this, arguments);
            return result.replaceAll('&lt;', '<');
        }

        Sqrl.defineHelper("resultDeclarations", function (args, content, blocks, options) {
            let result = "";
            if (args[0] > 0){
                result+="vec4 vResults[" + args[0] + "];\r\n";
            }
            
            return result;
        })

        Sqrl.defineHelper("init", function (args, content, blocks, options) {
            let result = "void init(){\r\n";
            if (args[0] > 0){
                for (let i =0; i < args[0];++i){
                    result+="   vResults[" + i + "] = vec4(0.,0.,0.,0.);\r\n";
                }
            }
            result += "}\r\n";
            return result;
        })

        Sqrl.definePartial("mypartial", "Partial content: the value of arr is ")
        return Sqrl.Render(shaderTemplate, functionsDescriptor.get('main').options);
        //return extendedRender(shaderTemplate, options);
    }
}
module.exports.ShaderCode = ShaderCode