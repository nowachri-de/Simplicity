function Shader(gl){
	this.gl = gl;
	
	this.getVertexShader = function(vertexShaderCode) {
        var gl = this.gl;
        // create appropriate type of shader
        var shader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(shader, vertexShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
    }
	
	this.getFragmentShader = function(fragmentShaderCode) {
        var gl = this.gl;
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
    }
}

class ShaderCode {

  static getShaderCode(type) {
    switch (type){
		case "READABLE": 	return ShaderCode.getReadableShaderCode();
		case "SINGLE": 		return ShaderCode.getSingleTextureCode();
		case "DUAL": 		return ShaderCode.getDualTextureCode();
		case "VERTEX": 		return ShaderCode.getVertexShaderCode();
		default: throw "getShaderCode "+ type+" not known.";
	}
  }
  static getVertexShaderCode(){
	var code =  `	
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
  static getReadableShaderCode(){
	  var code =  ` 
			// fragment shader that calculates the sum of the passed row and 
			// column (texture coord). 
			// we loop over the row and column and sum the product. 
			// product is then rendered to 32-bit IEEE754 floating point in the 
			// output RGBA canvas. 
			// readPixel is used to read the bytes. 
			#ifdef GL_ES 
				precision highp float; 
			#endif 
		 
			varying highp vec2	   		vTexture;		// row, column to calculate 
			uniform highp sampler2D     usamplerA;			// matrixA
			uniform highp sampler2D     usamplerB;			// matrixB
			uniform highp int 			uNumInputColumns;	//
			uniform highp float	  		uStepInCol; 		// increment across source texture
		    uniform int					uTargetIndex;       // index where to read result;

		    highp float readValue(highp float col,highp float row,int targetIndex){
				
				highp vec4 result = texture2D(usamplerA, vec2(col,row));
				
				if (targetIndex == 0) return result.x;
				if (targetIndex == 1) return result.y;
				if (targetIndex == 2) return result.z;
				if (targetIndex == 3) return result.w;
				
				//This return statement should not be reached
				return result.x;
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
			}
		`;
		return code;
  }
  
  static getDualTextureCode(){
	  var code = ` 
			// fragment shader that calculates the sum of the passed row and 
			// column (texture coord). 
			// we loop over the row and column and sum the product. 
			// product is then rendered to 32-bit IEEE754 floating point in the 
			// output RGBA canvas. 
			// readPixel is used to read the bytes. 
			#ifdef GL_ES 
				precision highp float; 
			#endif 
		 
			varying highp vec2          vTexture;			// row, column to calculate 
			uniform highp sampler2D     usampler;			// merged matrix texels
			uniform 	  int 			uNumColumns;	//
			uniform highp float	  		uStepCol; 		    // column step texture
			
		    uniform 	  int 			uRGBAIndexA;        // R,G,B,A index matrixA
			uniform       int           uRGBAIndexB;        // R,G,B,A index matrixB
			uniform       int           uTargetIndex;       // vec4 index where to put result
			
			float getMatrixValue(float a, float b,int rgbaIndex){
				if (rgbaIndex == 0) return texture2D(usampler,vec2(a,b)).r;
				if (rgbaIndex == 1) return texture2D(usampler,vec2(a,b)).g;
				if (rgbaIndex == 2) return texture2D(usampler,vec2(a,b)).b;
				if (rgbaIndex == 3) return texture2D(usampler,vec2(a,b)).a;
				
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
				highp float cc = 0.;
				highp float rr = 0.;
				
				for (int index=0; index < 2048; index ++){
					if (index>=uNumColumns) break;
					
					//float m1 = texture2D(usampler,vec2(cc,row)).r;
					//float m2 = texture2D(usampler,vec2(col,cc)).g;
					
					float m1 = getMatrixValue(cc,row,uRGBAIndexA);
					float m2 = getMatrixValue(col,cc,uRGBAIndexB);
					
					cc  += uStepCol;
					
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
				
				
				float v = matrixmul(col,row);
				gl_FragColor = getResultValue(col,row,v,uTargetIndex);
			}
		`;
		return code;
  }
  
  static getSingleTextureCode(){
	  		var code = ` 
			// fragment shader that calculates the sum of the passed row and 
			// column (texture coord). 
			// we loop over the row and column and sum the product. 
			// product is then rendered to 32-bit IEEE754 floating point in the 
			// output RGBA canvas. 
			// readPixel is used to read the bytes. 
			#ifdef GL_ES 
				precision highp float; 
			#endif 
		 
			varying highp vec2          vTexture;			// row, column to calculate 
			uniform highp sampler2D     usampler;			// merged matrix texels
			uniform 	  int 			uNumColumns;	//
			uniform highp float	  		uStepCol; 		    // column step texture
			
		    uniform 	  int 			uRGBAIndexA;        // R,G,B,A index matrixA
			uniform       int           uRGBAIndexB;        // R,G,B,A index matrixB
			uniform       int           uTargetIndex;       // vec4 index where to put result
			
			float getMatrixValue(float a, float b,int rgbaIndex){
				if (rgbaIndex == 0) return texture2D(usampler,vec2(a,b)).r;
				if (rgbaIndex == 1) return texture2D(usampler,vec2(a,b)).g;
				if (rgbaIndex == 2) return texture2D(usampler,vec2(a,b)).b;
				if (rgbaIndex == 3) return texture2D(usampler,vec2(a,b)).a;
				
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
				highp float cc = 0.;
				highp float rr = 0.;
				
				for (int index=0; index < 2048; index ++){
					if (index>=uNumColumns) break;
					
					//float m1 = texture2D(usampler,vec2(cc,row)).r;
					//float m2 = texture2D(usampler,vec2(col,cc)).g;
					
					float m1 = getMatrixValue(cc,row,uRGBAIndexA);
					float m2 = getMatrixValue(col,cc,uRGBAIndexB);
					
					cc  += uStepCol;
					
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
				
				
				float v = matrixmul(col,row);
				gl_FragColor = getResultValue(col,row,v,uTargetIndex);
			}
		`;
		return code;
	}
}
