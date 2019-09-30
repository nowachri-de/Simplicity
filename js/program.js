function Program (canvasID) {
    this.canvasID 		= canvasID;	
	this.frameBuffers	= new Map();
	this.self           = this;
	this.program        = null;
	this.vShader        = null;
	this.fShader        = null;
	
	
	this.getRenderCanvas = function(canvasID){
		return document.getElementById(canvasID);
	};
	
	this.getGl = function(canvasID) {
        var canvas = this.getRenderCanvas(canvasID);
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
		
        return gl;
    }
	
	this.getOutputDimensions = function(matrixA,matrixB){
		
		var outRows = matrixA.numRows;
		var outColumns = matrixB.numColumns;
		
		var result = {
			numRows : outRows,
			numColumns : outColumns
		};
		
		return result;
	}
	
	this.gl 			= this.getGl(canvasID);
	this.textureIndex	= 0;

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
			renderBuffer: renderBuffer,
			name : name,
			width : texture.width,
			height : texture.height
		}
		
		this.frameBuffers.set(name,result);
	
        return result;
    }
	
	this.doBindings = function(textureA,textureB,program,targetIndex) {
        this.doUnifromBindings(textureA,textureB,program,targetIndex);
        this.doVertexBindings(program);
    }
	
	this.doBindings2 = function(texture,program,componentIndexA,componentIndexB) {
        this.doUnifromBindings2(texture,program,componentIndexA,componentIndexB);
        this.doVertexBindings(program);
    }
    
	this.doUnifromBindings = function(textureA,textureB,program,targetIndex) {
        var gl = this.gl;
			
        var uStepInCol = gl.getUniformLocation(program, "uStepInCol");
		var uNumInputColumns = gl.getUniformLocation(program, "uNumInputColumns");
		var uTargetIndex = undefined;
		
		if (targetIndex !== undefined){
			uTargetIndex = gl.getUniformLocation(program, "uTargetIndex");
		}
        gl.uniform1i(gl.getUniformLocation(program, "usamplerA"), textureA.textureIndex);
		gl.uniform1i(gl.getUniformLocation(program, "usamplerB"), textureB.textureIndex);
		
		gl.uniform1i(uNumInputColumns, textureA.width);
		gl.uniform1f(uStepInCol, 1./ textureA.width);
		
		if (targetIndex !== undefined){
			gl.uniform1i(uTargetIndex, targetIndex);
		}
    }
	
    this.doUnifromBindings2 = function(texture,program,componentIndexA,componentIndexB,targetIndex) {
        var gl = this.gl;
			
        var uStepCol = gl.getUniformLocation(program, "uStepCol");
		
		var uNumColumns  = gl.getUniformLocation(program, "uNumColumns");
		var uRGBAIndexA  = gl.getUniformLocation(program, "uRGBAIndexA");
		var uRGBAIndexB  = gl.getUniformLocation(program, "uRGBAIndexB");
		var uTargetIndex = gl.getUniformLocation(program, "uTargetIndex");
		
		
        gl.uniform1i(gl.getUniformLocation(program, "usampler"), texture.textureIndex);
		
		gl.uniform1i(uNumColumns, texture.width);
		gl.uniform1i(uRGBAIndexA, componentIndexA);
		gl.uniform1i(uRGBAIndexB, componentIndexB);
		gl.uniform1i(uTargetIndex, targetIndex);
		
		gl.uniform1f(uStepCol, 1./ texture.width);
		
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
		
		this.vShader=vertexShader;
		this.fShader=fragmentShader;
		
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

		this.program = program;
        return program;
    }
	
	this.compute = function(textureA,textureB,textureC,outputDimensions) {
		var t0 = performance.now();
        var gl = this.gl;
		var canvas = this.getRenderCanvas(this.canvasID);
		
		canvas.width = outputDimensions.numColumns;
		canvas.height = outputDimensions.numRows;
		
		gl.useProgram(this.program);
        gl.viewport(0, 0,canvas.width,canvas.height);
		
		var frameBuffer = this.createFrameBuffer(textureC);
		
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings(textureA,textureB,this.program);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		var t1 = performance.now();
		textureC.duration = t1-t0;
		return textureC;
    }
	
	this.compute2 = function(texture,textureResult,outputDimensions,componentA,componentB,targetIndex) {
        var t0 = performance.now();
		var gl = this.gl;
		var canvas = this.getRenderCanvas(this.canvasID);
		
		canvas.width = outputDimensions.numColumns;
		canvas.height = outputDimensions.numRows;
		
		gl.useProgram(this.program);
        gl.viewport(0, 0,canvas.width,canvas.height);
		
		var frameBuffer = this.createFrameBuffer(textureResult);
		
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings2(texture,this.program,componentA,componentB,targetIndex);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		var t1 = performance.now();
		
		return {
			textureResult : textureResult,
			duration : t1 - t0
		} 
    }
	
	this.free = function(){
		var gl = this.gl;
		this.frameBuffers.forEach(function logMapElements(value, key, map) {
			gl.deleteFramebuffer(value.frameBuffer);
			gl.deleteRenderbuffer(value.renderBuffer);
			gl.deleteTexture(value.texture.texture);
			
			console.log("Called gl.deleteFramebuffer for framebuffer " + value.name + " holding texture with texture index " +value.texture.textureIndex );
		});
		gl.deleteShader(this.vShader);
		console.log("Deleted vertex shader");
		gl.deleteShader(this.fShader);
		console.log("Deleted fragment shader");
		gl.deleteProgram(this.program);
		console.log("Deleted program");
		
		gl.canvas.width = 1;
		gl.canvas.height = 1;
	}
	
}
