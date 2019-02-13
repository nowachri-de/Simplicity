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
		var code =  
          
		return code;
	}
	
	this.getFragmentShaderCode(){
		var code =  `
		
// EXPERIMENTAL: READ FLOAT DATA FROM RGBA BYTES IN IEEE754 
// fragment shader that calculates the sum of the passed row and column (texture coord). 
// we loop over the row and column and sum the product. 
// product is then rendered to 32-bit IEEE754 floating point in the 
// output RGBA canvas. 
// readPixel is used to read the bytes. 
#ifdef GL_ES 
	precision highp float; 
#endif 

	varying vec2	  vTex;         // row, column to calculate 
	uniform sampler2D usampler1;	// LEFT 
	uniform sampler2D usampler2;	// RIGHT 
	uniform int		  uLength;      // r1xc1.r2xc2 => product has r2 (or c1) terms 
	uniform float	  uStepS;       // increment across source texture 
	uniform float	  uStepT;       // increment down source texture 
	uniform float	  uOutRows;     // size of output in rows 
	uniform float	  uOutCols;     // size of output in columns 

	// sum row r x col c 
	float sumrowcol(float row, float col) { 
		float sum = 0.;             // sum 
		float ss = 0.;              // column on source texture 
		float tt = 0.;              // row on source texture 
		float r = row*uStepT;       // moving texture coordinate 
		float c = col*uStepS;       // moving texture coordinate 
		for (int pos=0 ; pos<2048 ; ++pos) { 
			if(pos>=uLength) break; // stop when we multiple a row by a column 
			float m1 = texture2D(usampler1,vec2(ss,r)); 
			float m2 = texture2D(usampler2,vec2(c,tt)); 
			sum += (m1*m2); 
			ss += uStepS; 
			tt += uStepT; 
		} 
		return sum; 
	} 
	 
	void main(void) { 
		 
		// get the implied row and column from .s and .t of passed texel 
		float col = floor((vTex.s*uOutRows)); 
		float row = floor((vTex.t*uOutCols));    

		// sum row x col for the passed pixel 
		float v = sumrowcol(row,col); 

		// Render to IEEE 754 Floating Point 
		if (v==0.) { 
			gl_FragColor = vec4(0.,0.,0.,0.); 
			return; 
		} 
		
		gl_FragColor = vec4(m3,m2,m1,e);			// output an IEEE754 32-bit floating point number 
	} 
		'
		return code;
	}`
}