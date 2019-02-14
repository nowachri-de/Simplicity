function Shader(canvasID,matrixA,matrixB){
	this.matrixA = matrixA;
	this.matrixB = matrixB;
	this.canvasID = canvasID;
	
	this.init = function(canvasID,matrixA,matrixB) {
        // update canvas size
        var canvas = document.getElementById(canvasID);
		canvas.width = matrixB.numColumns;
        canvas.height = matrixA.numRows;
        

        if (this.gl === undefined) {
            // get webgl context
            this.gl = canvas.getContext("experimental-webgl", {
                premultipliedAlpha: false,
                preserveDrawingBuffer: false
            });

            if (this.gl === undefined)
                throw "webgl is not supported.";
            // must support float texture
            var ext;
            try {
                ext = this.gl.getExtension("OES_texture_float");
            } catch (e) {}

            if (!ext) {
                console.log("Your browser does not support OES_texture_float extension.");
            }
        }

        this.gl.viewport(0, 0, canvas.width, canvas.height);
        return this.gl;
    }
	
	this.gl = this.init(canvasID,this.matrixA,this.matrixB);
	
	this.doBindings = function(textureUnitA,textureUnitB,matrixA,matrixB) {
        this.doUnifromBindings(textureUnitA,textureUnitB,matrixA,matrixB);
        this.doVertexBindings();
    }

    this.doUnifromBindings = function(textureUnitA,textureUnitB,matrixA,matrixB) {
        var gl = this.gl;
        var renderer = this.renderer;
		
        // get var locations
        var length = gl.getUniformLocation(renderer, "uInputCols"); //number of input columns 
        var outR = gl.getUniformLocation(renderer, "uOutRows");
        var outC = gl.getUniformLocation(renderer, "uOutCols");
        var stepX = gl.getUniformLocation(renderer, "uStepX");
        var stepY = gl.getUniformLocation(renderer, "uStepY");

        gl.uniform1i(gl.getUniformLocation(this.renderer, "usamplerA"), textureUnitA);
		gl.uniform1i(gl.getUniformLocation(this.renderer, "usamplerB"), textureUnitB);

        // bind length of one multiply run
        gl.uniform1i(length, matrixA.numColumns);
        gl.uniform1f(outR, matrixA.numRows);
        gl.uniform1f(outC, matrixB.numColumns);

        gl.uniform1f(stepX, 1. / Math.max(matrixA.numColumns,matrixB.numColumns));
        gl.uniform1f(stepY, 1. / Math.max(matrixA.numRows,matrixB.numRows));
    }
	
	this.doVertexBindings = function() {
        var gl = this.gl;
        // bind vertices
        var aPosition = gl.getAttribLocation(this.renderer, "aPosition");
        var vertexBuffer = gl.createBuffer();
        var vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, /*item size*/ 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // bind texture cords
        var aTexture = gl.getAttribLocation(this.renderer, "aTexture");
        var texCoords = gl.createBuffer();
        var textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
		
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aTexture, /*item size*/ 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTexture);

        // index to vertices
        var indices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        var vertexIndices = [0, 1, 2, 0, 2, 3];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    }
	
	this.buildProgram = function(vertexShaderCode, fragmentShaderCode) {
        var gl = this.gl;
        // get compiled shaders
        var vertexShader = this.getVertexShader(vertexShaderCode);
        var fragmentShader = this.getFragmentShader(fragmentShaderCode);
        // var fragmentShader = this.getFragmentShader(this.test());
        // link into a program
        this.renderer = gl.createProgram();
        gl.attachShader(this.renderer, vertexShader);
        gl.attachShader(this.renderer, fragmentShader);
        gl.linkProgram(this.renderer);
        gl.useProgram(this.renderer);

        return this.renderer;
    }
	
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