function Program (canvasID,matrixA,matrixB) {
    this.canvasID 		= canvasID;	
	this.textures		= new Map();
	this.frameBuffers	= new Map();
	this.matrixA = matrixA;
	this.matrixB = matrixB;
	
	this.getRenderCanvas = function(canvasID){
		return document.getElementById(canvasID);
	};
	
	this.getGl = function(canvasID,width,height) {
        var canvas = this.getRenderCanvas(canvasID);
		canvas.width = width;
		canvas.height = height;
		
		
        var gl = canvas.getContext("experimental-webgl", {
			premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		var ext;
		try {
			ext = gl.getExtension("OES_texture_float");
		} catch (e) {}

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}
		
		gl.viewport(0, 0, width, height);		
        return gl;
    }
	
	this.getOutputDimensions = function(){
		
		var outRows = this.matrixA.numRows;
		var outColumns = this.matrixB.numColumns;
		
		var result = {
			numRows : outRows,
			numColumns : outColumns
		};
		
		return result;
	}
	
	var outputDimension = this.getOutputDimensions();
	
	this.gl 			= this.getGl(canvasID,outputDimension.numColumns,outputDimension.numRows);
	this.textureIndex	= 0;
	
	this.createReadableTexture = function(name,width, height) {
        var gl = this.gl;
		
        var renderCanvas = this.getRenderCanvas(this.canvasID);
		renderCanvas.width = width;
		renderCanvas.height = height;
		
        // create and bind texture to render to
        var texture = gl.createTexture();
        gl.activeTexture(this.gl.TEXTURE0 + this.textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderCanvas);
		
		var result={
			texture : texture,
			textureIndex : this.textureIndex,
			name : name,
			width : width,
			height : height
		}
		this.textureIndex++;
		this.textures.set(name,result);
        return result;
    }
	
	this.createTexture=function(name,width, height, data) {
        var gl = this.gl;
        
		var texture = gl.createTexture();
        gl.activeTexture(this.gl.TEXTURE0 + this.textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, texture);
       
        // clamp to edge to support non-power of two textures
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // don't interpolate when getting data from texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);
		
		var result = {
			texture : texture,
			textureIndex : this.textureIndex,
			name : name,
			width : width,
			height : height
		}
		
		this.textureIndex++;
		this.textures.set(name,result);
        return result;
    }

    this.createFrameBuffer = function(texture) {
        var gl = this.gl;

        // create and bind renderbuffer
        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,texture.width,texture.height);

        // create and bind framebuffer
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, /*level*/ 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            alert("Error: binding of framebuffer failed");
		
		var result = {
			texture: texture,
			frameBuffer : frameBuffer,
			name : name,
			width : texture.width,
			height : texture.height
		}
		
		this.frameBuffers.set(name,result);
	
        return result;
    }
	
	this.doBindings = function(textureA,textureB,program) {
        this.doUnifromBindings(textureA.textureIndex,textureB.textureIndex,program);
        this.doVertexBindings(program);
    }

    this.doUnifromBindings = function(textureUnitA,textureUnitB,program) {
        var gl = this.gl;
			
        var uOutRows = gl.getUniformLocation(program, "uOutRows");
        var uOutCols = gl.getUniformLocation(program, "uOutCols");
        var uStepInCol = gl.getUniformLocation(program, "uStepInCol");
		var uNumInputColumns = gl.getUniformLocation(program, "uNumInputColumns");
		
        gl.uniform1i(gl.getUniformLocation(program, "usamplerA"), textureUnitA);
		gl.uniform1i(gl.getUniformLocation(program, "usamplerB"), textureUnitB);

        // bind length of one multiply run
		var outputDimension = this.getOutputDimensions();
		
		gl.uniform1i(uNumInputColumns, outputDimension.numRows);
        gl.uniform1f(uOutRows, outputDimension.numRows);
        gl.uniform1f(uOutCols, outputDimension.numColumns);
		gl.uniform1f(uStepInCol, 1./ outputDimension.numRows);
    }
	
	this.doVertexBindings = function(program) {
        var gl = this.gl;
        // bind vertices
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var vertexBuffer = gl.createBuffer();
        var vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, /*item size*/ 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // bind texture cords
        var aTexture = gl.getAttribLocation(program, "aTexture");
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
	
	this.buildProgram = function(vertexShader, fragmentShader) {
        var gl = this.gl;
		
        // link into a program
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
		gl.validateProgram(program);

		if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
		  var info = gl.getProgramInfoLog(program);
		  throw 'Could not compile WebGL program. \n\n' + info;
		}

        return program;
    }
	
	this.compute = function(textureA,textureB,textureC,program) {
        var gl = this.gl;
		
		gl.useProgram(program);
        gl.viewport(0, 0,textureB.width,textureB.height);
		var frameBuffer = this.createFrameBuffer(textureC);
		
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings(textureA,textureB,program);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		return textureC;
    }
	
	this.computeB = function(textureA,textureB,program) {
        var gl = this.gl;
		gl.useProgram(program);
        gl.viewport(0, 0,textureB.width,textureB.height);
		
		var frameBuffer = this.createFrameBuffer(textureB);
		//gl.bindTexture(gl.TEXTURE_2D,textureA.texture);
		gl.activeTexture(gl.TEXTURE0 + textureB.textureIndex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings(textureA,textureB,program);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
    }
	
	this.read = function(){
		var gl = this.gl;
		var outputDimension = this.getOutputDimensions();
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(outputDimension.numRows * outputDimension.numColumns * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0, outputDimension.numColumns,outputDimension.numRows, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix(outputDimension.numColumns,outputDimension.numRows);
        result.setData(new Float32Array(rawBuffer));
		
		return result;
	}
}
