function Shader(gl,matrixA,matrixB){
	this.matrixA = matrixA;
	this.matrixB = matrixB;
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
	
	this.getVertexShaderCode = function(){
		var code =  `	
			// vertex shader for a single quad 
			// work is performed based on the texels being passed 
			// through to the texture shader. 
			#ifdef GL_ES 
				precision highp float; 
			#endif 
			attribute highp vec3 aPos; 
			attribute highp vec2 aTex; 
			varying   highp vec2   vTex; 
			void main(void) 
			{ 
				// just pass the position and texture coords 
				gl_Position = vec4(aPos, 1.0); 
				vTex = aTex; 
			}`;
          
		return code;
	}
	
	this.getReadableShaderCode = function(){
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
		 
			varying vec2	      vTex;         // row, column to calculate 
			uniform highp sampler2D     usamplerA;	// matrixA
			uniform highp sampler2D     usamplerB;	// matrixB
			uniform int		      uInputCols;   // r1xc1.r2xc2 => product has r2 (or c1) terms 
			uniform highp float	  uStepX;       // increment across source texture 
			uniform highp float	  uStepY;       // increment down source texture 
			uniform highp float	  uOutRows;     // size of output in rows 
			uniform highp float	  uOutCols;     // size of output in columns 
		 
			void main(void) { 
				 
				// get the implied row and column from .s and .t of passed texel 
				highp float  col = floor((vTex.s*uOutRows)); 
				highp float  row = floor((vTex.t*uOutCols));
				highp float  c = col*uStepX;  // moving texture coordinate 
				highp float  r = row*uStepY;  // moving texture coordinate 
				
		        highp float  v = texture2D(usamplerA, vec2(c,r)).r; 
				
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
	
	this.getFragmentShaderCode = function(){
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
		 
			varying vec2	      		vTex; // row, column to calculate 
			uniform highp sampler2D     usamplerA;	// matrixA
			uniform highp sampler2D     usamplerB;	// matrixB
			uniform int		      		uInputCols;   // r1xc1.r2xc2 => product has r2 (or c1) terms 
			uniform highp float	  		uStepX;       // increment across source texture 
			uniform highp float	  		uStepY;       // increment down source texture 
			uniform highp float	  		uOutRows;     // size of output in rows 
			uniform highp float	  		uOutCols;     // size of output in columns 
		 
		 
			// sum row r x col c 
			float sumrowcol(float row, float col) { 
				float  sum = 0.;        // sum 
				float  curX = 0.;       // column on source texture 
				float  curY = 0.;       // row on source texture 
				float  r = row*uStepY;  // moving texture coordinate 
				float  c = col*uStepX;  // moving texture coordinate 
				for (int pos=0 ; pos<2048 ; ++pos) { 
					if(pos>=uInputCols) break; // stop when we multiple a row by a column 
					float m1 = texture2D(usamplerA, vec2(curX,r)).r; 
					float m2 = texture2D(usamplerB, vec2(c,curY)).r; 
					// sum += (m1*m2); 
					curX += uStepX; 
					curY += uStepY; 
				} 
				return sum; 
			} 

			void main(void) { 
				 
				// get the implied row and column from .s and .t of passed texel 
				float col = floor((vTex.s*uOutRows)); 
				float row = floor((vTex.t*uOutCols));    
		 
				// sum row x col for the passed pixel 
				float v = sumrowcol(row,col);
				if (v==0.) { 
					gl_FragColor = vec4(0.,0.,0.,0.); 
					return; 
				}  
				gl_FragColor = vec4(v,0.,0.,0.);
			}
		`;
		return code;
	}
}