var Sqrl = require('squirrelly');
class ShaderCode {

    static getCode(type) {
        switch (type) {
            case "READABLE": return ShaderCode.getReadableShaderCode();
            case "SINGLE": return ShaderCode.getSingleTextureCode();
            case "SINGLE-ACTIVATION": return ShaderCode.getMatMulWithActivationCode();
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
                //gl_FragData[1] = vec4(m3,m2,m1,e);					// output an IEEE754 32-bit floating point number
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
                gl_FragData[1] = vec4(2.0,2.0,2.0,2.0);
                //gl_FragColor = vec4(v,0.,0.,0.);
            }
        `;
        return code;
    }

    static getMatMulWithActivationCode() {
        var code = ` 
      /* Do matrix multiplication using a single texture 
      *  Upto four matrices can be stored in a single texture using the RGBA components. */
      
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
        return 1.0/(1.0+exp(sum*(-1.0)));
        // return sum; 
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
          gl_FragColor = getResultValue(x,y,v,uTargetIndex);
      } `;
        return code;
    };
    static generateFragmentShader(options) {
        var shaderTemplate = `
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

    {{main}}

}
`;
        return Sqrl.Render(shaderTemplate, options);
    }
}
module.exports.ShaderCode = ShaderCode