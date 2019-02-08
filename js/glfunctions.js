class Matrix {
  
    constructor(canvasID, columns, rows) {
        this.numRows = rows;
        this.numColumns = columns;
        this.canvasID = canvasID;

        this.rows = new Array();
        for (var row = 0; row < this.numRows; row++) {
            this.rows.push(new Float32Array(columns));
        }
    }

    zeroInitialize() {
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                this.rows[row][col] = 0;
            }
        }
    }

    randomInitialize() {
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                this.rows[row][col] = Math.random();
            }
        }
    }

    setData(f32Array) {
        var cnt = 0;
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                this.rows[row][col] = f32Array[cnt++];
            }
        }
    }

    print(decimals) {
        if (decimals === undefined)
            decimals = 15;

        var rowContent = "";
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                rowContent += (this.rows[row][col]).toFixed(decimals) + ";"
            }
            console.log(rowContent);
            rowContent = "";
        }
    }

    as2DArray() {
        var result = [];

        for (var row = 0; row < this.numRows; row++) {
            result[row] = [];
            for (var col = 0; col < this.numColumns; col++) {
                result[row].push(this.rows[row][col]);
            }
        }

        return result;
    }

    getTexels(matrix) {

        var result = new Float32Array(3 * this.numRows * this.numColumns);
        var cnt = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numColumns; col++) {
                //value R
                result[cnt++] = this.rows[row][col];
                //value G
                result[cnt++] = matrix.rows[row][col];
                //Value B
                result[cnt++] = 0;
            }
        }

        return result;
    }

    multiply(matrixB) {
        return (new MatrixGL("canvas", this, matrixB)).compute();
    }

    set numRows(rows) {
        this._numRows = rows;
    }

    get numRows() {
        return this._numRows;
    }

    get numColumns() {
        return this._numColumns;
    }

    set numColumns(cols) {
        this._numColumns = cols;
    }

    get columns() {
        return this._columns;
    }

    set columns(columns) {
        this._columns = columns;
    }

    get rows() {
        return this._rows;
    }

    set rows(rows) {
        this._rows = rows;
    }

    set frameBuffer(buffer) {
        this._frameBuffer = buffer;
    }

    get frameBuffer() {
        return this._frameBuffer;
    }

    set renderBuffer(buffer) {
        this._renderBuffer = buffer;
    }

    get renderBuffer() {
        return this._renderBuffer;
    }

    get canvasID() {
        return _canvasID;
    }

    set canvasID(canvasID) {
        this._canvasID = canvasID;
    }
}

class MatrixGL {
    constructor(canvasID, matrixA, matrixB) {
        this.canvasID = canvasID;
        this.matrixA = matrixA;
        this.matrixB = matrixB;

        this.numRows = matrixA.numRows;
        this.numColumns = matrixA.numColumns;
        this.init(canvasID, this.numRows, this.numColumns);
        this.buildRenderer();
        this.createMatrixTexture();
        this.doBindings();
        this.bindFrameBuffer(this.createDestinationTexture());
    }

    init(canvasID, rows, columns) {
        // update canvas size
        var canvas = document.getElementById(canvasID);
        canvas.height = rows;
        canvas.width = columns;

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

        this.gl.viewport(0, 0, columns, rows);
		this.printGLInfo();
        return this.gl;
    }
	
	printGLInfo(){
		console.log(this.getMaximumTextureUnits());
	}

    buildRenderer(vertexShaderCode, fragmentShaderCode) {
        var gl = this.gl;
        // get compiled shaders
        var vertexShader = this.getVertexShader(this.getVertexShaderCode());
        var fragmentShader = this.getFragmentShader(this.getFragmentShaderCode());

        // link into a program
        this.renderer = gl.createProgram();
        gl.attachShader(this.renderer, vertexShader);
        gl.attachShader(this.renderer, fragmentShader);
        gl.linkProgram(this.renderer);
        gl.useProgram(this.renderer);

        return this.renderer;
    }

    createMatrixTexture() {

        var gl = this.gl;
        var texels = this.matrixA.getTexels(this.matrixB);
        var texture = gl.createTexture();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGB, this.numColumns, this.numRows, 0, gl.RGB, gl.FLOAT, texels);
        // clamp to edge to support non-power of two textures
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // don't interpolate when getting data from texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        return texture;
    }

    getRenderCanvas(canvasID) {
        // Safari readPixels will not work from an 'off-screen' canvas
        return document.getElementById(canvasID);
    }

    bindFrameBuffer(dstTex) {
        var gl = this.gl;
		
        // create and bind renderbuffer
        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.numColumns, this.numRows);

        // create and bind framebuffer
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dstTex, /*level*/ 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            alert("Error: binding of framebuffer failed");

        return frameBuffer;
    }

    compute() {
        var gl = this.gl;
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);

        // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(this.numColumns * this.numRows * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0, this.numColumns, this.numRows, gl.RGBA, gl.UNSIGNED_BYTE, glresult);

        var result = new Matrix(this.numColumns, this.numRows);
        result.setData(new Float32Array(rawBuffer));

        return result;
    }

    createDestinationTexture() {
        var gl = this.gl;
        var renderCanvas = this.getRenderCanvas(this.canvasID);

        // create and bind texture to render to
        var dstTex = gl.createTexture();

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, dstTex);
        gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderCanvas);

        return dstTex;
    }

    doBindings() {
        this.doUnifromBindings();
        this.doVertexBindings();
    }

    doUnifromBindings() {
        var gl = this.gl;
        var renderer = this.renderer;
        // get var locations
        var length = gl.getUniformLocation(renderer, "uLength");
        var outR = gl.getUniformLocation(renderer, "uOutRows");
        var outC = gl.getUniformLocation(renderer, "uOutCols");
        var stepS = gl.getUniformLocation(renderer, "uStepS");
        var stepT = gl.getUniformLocation(renderer, "uStepT");
		
        gl.uniform1i(gl.getUniformLocation(this.renderer, "usampler"), 0);
		
        // bind length of one multiply run
        gl.uniform1i(length, this.numRows);
        gl.uniform1f(outR, this.numRows);
        gl.uniform1f(outC, this.numColumns);

        gl.uniform1f(stepS, 1. / this.numRows);
        gl.uniform1f(stepT, 1. / this.numRows);
    }

    doVertexBindings() {
        var gl = this.gl;
        // bind vertices
        var aPos = gl.getAttribLocation(this.renderer, "aPos");
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPos, /*item size*/ 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPos);

        // bind texture cords
        var aTex = gl.getAttribLocation(this.renderer, "aTex");
        var texCoords = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
        var textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aTex, /*item size*/ 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTex);

        // index to vertices
        var indices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        var vertexIndices = [0, 1, 2, 0, 2, 3];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    }

    getVertexShader(vertexShaderCode) {
        var gl = this.gl;
        // create appropriate type of shader
        var shader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(shader, vertexShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
    }

    getVertexShaderCode() {
        var vertexShader =
            "   // vertex shader for a single quad \n" +
            "   // work is performed based on the texels being passed \n" +
            "   // through to the texture shader. \n" +
            "#ifdef GL_ES \n" +
            "	precision highp float; \n" +
            "#endif \n" +
            "	attribute vec3 aPos; \n" +
            "	attribute vec2 aTex; \n" +
            "	varying vec2   vTex; \n" +
            "	void main(void) \n" +
            "	{ \n" +
            "		// just pass the position and texture coords \n" +
            "		gl_Position = vec4(aPos, 1.0); \n" +
            "		vTex = aTex; \n" +
            "   }";

        return vertexShader;
    }

    getFragmentShader(fragmentShaderCode) {
        var gl = this.gl;
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderCode);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
            console.log(gl.getShaderInfoLog(shader));
        return shader;
    }

    getFragmentShaderCode() {
        var fragmentShader = "" +
            "    // fragment shader that calculates the sum of the passed row and " +
            "    // column (texture coord). \n" +
            "    // we loop over the row and column and sum the product. \n" +
            "    // product is then rendered to 32-bit IEEE754 floating point in the \n" +
            "    // output RGBA canvas. \n" +
            "    // readPixel is used to read the bytes. \n" +
            "#ifdef GL_ES \n" +
            "	precision highp float; \n" +
            "#endif \n" +
            "\n" +
            "	varying vec2	  vTex;         // row, column to calculate \n" +
            "	uniform sampler2D usampler;		// left in .r, right in .g \n" +
            "	uniform int		  uLength;      // r1xc1.r2xc2 => product has r2 (or c1) terms \n" +
            "	uniform float	  uStepS;       // increment across source texture \n" +
            "	uniform float	  uStepT;       // increment down source texture \n" +
            "	uniform float	  uOutRows;     // size of output in rows \n" +
            "	uniform float	  uOutCols;     // size of output in columns \n" +
            "	 \n" +
            "	// sum row r x col c \n" +
            "	float sumrowcol(float row, float col) { \n" +
            "		float sum = 0.;             // sum \n" +
            "		float ss = 0.;              // column on source texture \n" +
            "		float tt = 0.;              // row on source texture \n" +
            "		float r = row*uStepT;       // moving texture coordinate \n" +
            "		float c = col*uStepS;       // moving texture coordinate \n" +
            "		for (int pos=0 ; pos<2048 ; ++pos) { \n" +
            "			if(pos>=uLength) break; // stop when we multiple a row by a column \n" +
            "			float m1 = texture2D(usampler,vec2(ss,r)).r; \n" +
            "			float m2 = texture2D(usampler,vec2(c,tt)).g; \n" +
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
            "	} ";
        return fragmentShader;
    }
	
	getMaximumTextureUnits(){
		return this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
	}
	
    get renderer() {
        return this._renderer;
    }

    set renderer(renderer) {
        this._renderer = renderer;
    }

    get gl() {
        return this._gl;
    }

    set gl(gl) {
        this._gl = gl;
    }

    get matrixA() {
        return this._matrixA;
    }

    set matrixA(matrix) {
        this._matrixA = matrix;;
    }

    get matrixB() {
        return this._matrixB;
    }

    set matrixB(matrix) {
        this._matrixB = matrix;
    }

    set canvasID(canvasID) {
        this._canvasID = canvasID;
    }

    get canvasID() {
        return this._canvasID;
    }
}