function Program (canvasID,width,height) {
    this.canvasID 		= canvasID;
	this.matrixA = matrixA;
	this.matrixB = matrixB;
	
	this.textures		= new Map();
	this.frameBuffers	= new Map();
	
	this.getGl = function(canvasID,width,height) {
        var canvas = document.getElementById(canvasID);
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
	
	this.gl 			= this.getGl(canvasID,width,height);
	this.textureIndex	= this.gl.TEXTURE0;
	
    this.getRenderCanvas = function(canvasID){
		return document.getElementById(canvasID);
	};
	
	this.createReadableTexture = function(name) {
        var gl = this.gl;
        var renderCanvas = this.getRenderCanvas(this.canvasID);
		
        // create and bind texture to render to
        var texture = gl.createTexture();
        gl.activeTexture(this.textureIndex);
		this.textureIndex++;
        gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderCanvas);
		
		var result={
			texture : texture,
			textureIndex : this.textureIndex - 1,
			name : name
		}
		textures.set(name,result);
        return result;
    }
	
	this.createTexture=function(name,width, height, data) {
        var gl = this.gl;
        
		var texture = gl.createTexture();
        gl.activeTexture(this.textureIndex);
		this.textureIndex++;
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
			textureIndex : this.textureIndex -1,
			name : name,
			width : width,
			height : height
		}
		
		this.textures.set(name,result);
        return result;
    }

    this.createFrameBuffer = function(texture,rows,columns) {
        var gl = this.gl;

        // create and bind renderbuffer
        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,rows,columns);

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
			name : name
		}
		
		this.frameBuffers.set(name,result);
	
        return result;
    }
	
	this.doBindings = function(textureUnitA,textureUnitB,matrixA,matrixB,program) {
        this.doUnifromBindings(textureUnitA,textureUnitB,matrixA,matrixB,program);
        this.doVertexBindings();
    }

    this.doUnifromBindings = function(textureUnitA,textureUnitB,matrixA,matrixB,program) {
        var gl = this.gl;
        
        // get var locations
        var length = gl.getUniformLocation(program, "uInputCols"); //number of input columns 
        var outR = gl.getUniformLocation(program, "uOutRows");
        var outC = gl.getUniformLocation(program, "uOutCols");
        var stepX = gl.getUniformLocation(program, "uStepX");
        var stepY = gl.getUniformLocation(program, "uStepY");

        gl.uniform1i(gl.getUniformLocation(program, "usamplerA"), textureUnitA);
		gl.uniform1i(gl.getUniformLocation(program, "usamplerB"), textureUnitB);

        // bind length of one multiply run
        gl.uniform1i(length, matrixA.numColumns);
        gl.uniform1f(outR, matrixA.numRows);
        gl.uniform1f(outC, matrixB.numColumns);

        gl.uniform1f(stepX, 1. / Math.max(matrixA.numColumns,matrixB.numColumns));
        gl.uniform1f(stepY, 1. / Math.max(matrixA.numRows,matrixB.numRows));
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
		
        // var fragmentShader = this.getFragmentShader(this.test());
        // link into a program
        this.renderer = gl.createProgram();
        gl.attachShader(this.renderer, vertexShader);
        gl.attachShader(this.renderer, fragmentShader);
        gl.linkProgram(this.renderer);
        gl.useProgram(this.renderer);

        return this.renderer;
    }
	
	this.compute = function(textureA,textureB) {
        var gl = this.gl;
        var frameBuffer = this.createFrameBuffer(textureB,textureB.width,textureB.height);
		gl.bindTexture(gl.TEXTURE_2D,textureA.texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
        gl.viewport(0, 0,textureA.width,textureA.height);
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
    }
}
