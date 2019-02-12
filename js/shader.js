function Shader(gl){
	this.gl = gl;
	
	this.doBindings(textureUnit) {
        this.doUnifromBindings(textureUnit);
        this.doVertexBindings();
    }

    this.doUnifromBindings(textureUnit) {
        var gl = this.gl;
        var renderer = this.renderer;
        // get var locations
        var length = gl.getUniformLocation(renderer, "uLength");
        var outR = gl.getUniformLocation(renderer, "uOutRows");
        var outC = gl.getUniformLocation(renderer, "uOutCols");
        var stepS = gl.getUniformLocation(renderer, "uStepS");
        var stepT = gl.getUniformLocation(renderer, "uStepT");

        gl.uniform1i(gl.getUniformLocation(this.renderer, "usampler"), textureUnit);

        // bind length of one multiply run
        gl.uniform1i(length, this.numRows);
        gl.uniform1f(outR, this.numRows);
        gl.uniform1f(outC, this.numColumns);

        gl.uniform1f(stepS, 1. / this.numRows);
        gl.uniform1f(stepT, 1. / this.numRows);
    }
	
	this.doVertexBindings = function() {
        var gl = this.gl;
        // bind vertices
        var aPos = gl.getAttribLocation(this.renderer, "aPosition");
        var vertexBuffer = gl.createBuffer();
        var vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPos, /*item size*/ 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPos);

        // bind texture cords
        var aTex = gl.getAttribLocation(this.renderer, "aTexture");
        var texCoords = gl.createBuffer();
        var textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
		
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aTex, /*item size*/ 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTex);

        // index to vertices
        var indices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        var vertexIndices = [0, 1, 2, 0, 2, 3];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
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
	
	this.getVertexShaderCode(){
		var code =  `
            #ifdef GL_ES
				precision highp float;
            #endif
            attribute vec3 aPosition;
            attribute vec2 aTexture;
            varying vec2   vTexture;
            void main(void){
				// just pass the position and texture coords
				gl_Position = vec4(aPos, 1.0);
				vTex = aTex;
            }`;
		return code;
	}
	
	this.getFragmentShaderCode(){
		var code =  `
            #ifdef GL_ES
				precision highp float;
            #endif
            varying vec2	  vTexture; 		// row, column to calculate
            uniform sampler2D uSamplerSource;	// left in .r, right in .g
			uniform sampler2D uSamplerTarget;	// 
            uniform int		  uLength;  		// r1xc1.r2xc2 => product has r2 (or c1) terms
            uniform float	  uStepS;   		// increment across source texture
            uniform float	  uStepT;   		// increment down source texture
            uniform float	  uOutRows; 		// size of output in rows
            uniform float	  uOutCols; 		// size of output in columns
            // sum row r x col c \n" +
            float sumrowcol(float row, float col) {
				float sum   = 0.; 		// sum
				float stcol = 0.;  		// source texture (st) column
				float strow = 0.;  		// source texture (st) row
            	float r = row*uStepT;   // moving texture coordinate
            	float c = col*uStepS;   // moving texture coordinate
            	for (int pos=0 ; pos<2048 ; ++pos) {
            	if(pos>=uLength) break; //stop criterion
            		float m1 = texture2D(uSamplerSource,vec2(ss,r)).r;
            		float m2 = texture2D(usampler,vec2(c,tt)).g;
            "			sum += (m1*m2); \n" +
            "			ss += uStepS; \n" +
            "			tt += uStepT; \n" +
            "		} \n" +
            "		return sum; \n" +
            "	} \n" +
            "	 \n" +
            "	void main(void) { \n" +
            "		 \n" +
            "		// get the implied row and column from .s and .t of passed texel \n" +
            "		float col = floor((vTex.s*uOutRows)); \n" +
            "		float row = floor((vTex.t*uOutCols));    \n" +
            "\n" +
            "		// sum row x col for the passed pixel \n" +
            "		float v = sumrowcol(row,col); \n" +
            "\n" +
            "		// Render to IEEE 754 Floating Point \n" +
            "		if (v==0.) { \n" +
            "			gl_FragColor = vec4(0.,0.,0.,0.); \n" +
            "			return; \n" +
            "		} \n" +
            "		float a = abs(v);                           // encode absolute value + sign \n" +
            "		float exp = floor(log2(a));                 // number of powers of 2 \n" +
            "		float mant = (a * pow(2.,23.-exp));         // multiply to fill 24 bits (implied leading 1) \n" +
            "		float mant1 = floor(mant / 256. / 256.);    // first 8 bits of mantissa \n" +
            "		float mant2 = mod(floor(mant / 256.),256.); // second 8 bits \n" +
            "		float mant3 = mod(mant,256.);               // third 8 bits \n" +
            "		 \n" +
            "		highp float sign = 128.-128.*(a/v);			// sign bit is 256 or 0 \n" +
            "		highp float e = (sign+exp+127.)/510.;		// exponent and sign \n" +
            "		highp float m1 = (mant1-(128.*(1.-mod(exp+127.,2.))))/255.; // handle leading bit \n" +
            "		highp float m2 = (mant2)/255.;				// middle part \n" +
            "		highp float m3 = (mant3+.5)/255.;			// scale to 0 - 255 \n" +
            "		gl_FragColor = vec4(m3,m2,m1,e);			// output an IEEE754 32-bit floating point number \n" +
            "	}`;
		return code;
	}
}