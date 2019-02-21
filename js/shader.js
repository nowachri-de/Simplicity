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
		 
			varying highp vec2	   		vTexture;		// row, column to calculate 
			uniform highp sampler2D     usamplerA;			// matrixA
			uniform highp sampler2D     usamplerB;			// matrixB
			uniform highp int 			uNumInputColumns;	//
			uniform highp float	  		uStepInCol; 		// increment across source texture
			uniform highp float	  		uOutRows;   		// size of output in rows 
			uniform highp float	  		uOutCols;   		// size of output in columns 
		 
			void main(void) { 
				 
				// coordinate system is explained here
				// http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
				highp float  row = floor(vTexture.t*uOutRows);
				highp float  col = floor(vTexture.s*uOutCols); 
				
				
		        highp float v = texture2D(usamplerA, vec2(row * uStepInCol,col * uStepInCol)).r; 
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
		 
			varying vec2     		    vTexture;			// row, column to calculate 
			uniform highp sampler2D     usamplerA;			// matrixA
			uniform highp sampler2D     usamplerB;			// matrixB
			uniform highp int 			uNumInputColumns;	//
			uniform highp float	  		uStepInCol; 		// increment across source texture
			uniform highp float	  		uOutRows;   		// size of output in rows 
			uniform highp float	  		uOutCols;   		// size of output in columns 
		 
		 
			// sum row r x col c 
			float sumrowcol(float rowB, float colB) { 
				float sum  = 0.;	// sum 
				float colA = 0.;    // always start from the beginning of the row
				float rowA = rowB;  // is like this due to matrix multiplication rules	
				int   numInputColumns = 2;
				for (int pos=0 ; pos<2048 ; ++pos) { 
					if(pos>=uNumInputColumns) break; // we have iterated a whole row of the input matrix
					
					//Matrix A
					float m1 = texture2D(usamplerA, vec2(rowA * uStepInCol,colA)).r; 
					//Matrix B
					float m2 = texture2D(usamplerB, vec2(colA,colB * uStepInCol)).r; 
					sum += (m1*m2); 
					colA += uStepInCol;
				} 
				return sum; 
			} 

			void main(void) { 
				// The texture coordinates are coming from the target texture 
				// WebGL coordinate system is explained here
				// http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_images.html
				highp float  row = floor(vTexture.t*uOutRows);
				highp float  col = floor(vTexture.s*uOutCols); 
				
				// sum row x col for the passed pixel 
				//float v = sumrowcol(row,col);
				float v = 0.;
				if (v==0.) { 
					gl_FragColor = vec4(v,0.,0.,0.); 
					return; 
				}  
				gl_FragColor = vec4(v,0.,0.,0.);
			}
		`;
		return code;
	}
}