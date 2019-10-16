var headlessGL = require('gl');


module.exports.Program = class Program {

	constructor(width, height, gl) {
		this.frameBuffers = new Map();
		this.self = this;
		this.program = null;
		this.vShader = null;
		this.fShader = null;
		this.width = width;
		this.height = height;
		this.index = 0;
		this.debug = false;

		if (typeof gl === 'undefined') {
			this.gl = Program.createGl(width, height);
		} else {
			this.gl = gl;
		}
	}

	static createGl(width, height) {
		var gl = headlessGL(width, height, {
			premultipliedAlpha: false,
			preserveDrawingBuffer: false
		});

		if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		var ext;
		try {
			ext = gl.getExtension("OES_texture_float");
		} catch (e) { }

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}

		return gl;
	}

	createFrameBuffer(texture, name) {
		var gl = this.gl;

		// create and bind renderbuffer
		var renderBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.width, texture.height);

		// create and bind framebuffer
		var frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, /*level*/ 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			console.log("Error: binding of framebuffer failed");

		var result = {
			texture: texture,
			frameBuffer: frameBuffer,
			renderBuffer: renderBuffer,
			name: name,
			width: texture.width,
			height: texture.height
		}

		this.frameBuffers.set(name, result);

		return result;
	}

	doBindings(textureA, textureB, program, targetIndex) {
		this.doUniformBindings(textureA, textureB, program, targetIndex);
		this.doVertexBindings(program);
	}

	doBindings2(texture,resultTexture, program, componentIndexA, componentIndexB,targetIndex) {
		this.doUniformBindingsSingleTexture(texture, resultTexture,program, componentIndexA, componentIndexB, targetIndex);
		this.doVertexBindings(program);
	}

	doUniformBindings(textureA, textureB, program, targetIndex) {
		var gl = this.gl;

		var uStepInCol = gl.getUniformLocation(program, "uStepInCol");
		var uNumInputColumns = gl.getUniformLocation(program, "uNumInputColumns");
		var uTargetIndex = undefined;

		if (targetIndex !== undefined) {
			uTargetIndex = gl.getUniformLocation(program, "uTargetIndex");
		}
		gl.uniform1i(gl.getUniformLocation(program, "usamplerA"), textureA.index);
		gl.uniform1i(gl.getUniformLocation(program, "usamplerB"), textureB.index);

		gl.uniform1i(uNumInputColumns, textureA.width);
		gl.uniform1f(uStepInCol, 1. / textureA.width);

		if (targetIndex !== undefined) {
			gl.uniform1i(uTargetIndex, targetIndex);
		}
	}

	doUniformBindingsSingleTexture(inputTexture,resultTexture, program, componentIndexA, componentIndexB, targetIndex) {
		var gl = this.gl;
		
		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexA"), componentIndexA);
		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexB"), componentIndexB);
		gl.uniform1i(gl.getUniformLocation(program, "uTargetIndex"), targetIndex);
		
		gl.uniform1i(gl.getUniformLocation(program, "usampler"), inputTexture.index);
		gl.uniform1f(gl.getUniformLocation(program, "uWidth"), inputTexture.width);
		gl.uniform1f(gl.getUniformLocation(program, "uHeight"), inputTexture.height);
		gl.uniform1f(gl.getUniformLocation(program, "uStepX"), 1. / inputTexture.width);
		gl.uniform1f(gl.getUniformLocation(program, "uStepY"), 1. / inputTexture.height);

		gl.uniform1f(gl.getUniformLocation(program, "uResultWidth"), resultTexture.width);
		gl.uniform1f(gl.getUniformLocation(program, "uResultHeight"), resultTexture.height);
	}

	doVertexBindings(program) {
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

	buildProgram(vertexShader, fragmentShader) {
		var gl = this.gl;

		this.vShader = vertexShader;
		this.fShader = fragmentShader;

		// link into a program
		var program = gl.createProgram();
		gl.validateProgram(program);
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.useProgram(program);
		gl.validateProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			var info = gl.getProgramInfoLog(program);
			throw 'Could not compile WebGL program. \n\n' + info;
		}

		this.program = program;
		return program;
	}

	compute(textureA, textureB, textureC, outputDimensions) {
		var t0 = Date.now();
		var gl = this.gl;
		var canvas = this.getRenderCanvas(this.width, this.height);

		canvas.width = outputDimensions.width;
		canvas.height = outputDimensions.height;

		gl.useProgram(this.program);
		gl.viewport(0, 0, canvas.width, canvas.height);

		var frameBuffer = this.createFrameBuffer(textureC);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings(textureA, textureB, this.program);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		var t1 = Date.now();
		textureC.duration = t1 - t0;
		return textureC;
	}

	multiplySingleTexture(texture, resultTexture, outputDimensions, componentA, componentB, targetIndex) {
		var t0 = Date.now();
		var gl = this.gl;

		gl.useProgram(this.program);
		gl.viewport(0, 0, outputDimensions.width, outputDimensions.height);

		var frameBuffer = this.createFrameBuffer(resultTexture, "multiplySingleTexture");

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.doBindings2(texture,resultTexture, this.program, componentA, componentB,targetIndex);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		

		return {
			resultTexture: resultTexture,
			duration: Date.now() - t0
		}
	}

	debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}
	free() {
		let gl = this.gl;
		let self = this;
		this.frameBuffers.forEach(function logMapElements(value, key, map) {
			gl.deleteFramebuffer(value.frameBuffer);
			gl.deleteRenderbuffer(value.renderBuffer);
			gl.deleteTexture(value.texture.texture);
			self.debugPrint("Called gl.deleteFramebuffer for framebuffer " + value.name + " holding texture with texture index " + value.texture.index);
		});
		gl.deleteShader(this.vShader);
		this.debugPrint("Deleted vertex shader");
		gl.deleteShader(this.fShader);
		this.debugPrint("Deleted fragment shader");
		gl.deleteProgram(this.program);
		this.debugPrint("Deleted program");
	}
}