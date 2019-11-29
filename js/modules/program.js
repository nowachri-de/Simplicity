var headlessGL = require('gl');
function genTextures(gl,num,width,height) {
	let textures = [];
	for (let i=0; i < num;++i){
		textures.push(TextureFactory.createReadableTexture(gl, 'resultTexture', { width: width, height: height }));
	}
	return textures;
}
class Program {

	constructor(width, height, gl) {
		this.glProgram = null;
		this.debug = false;
		this.vertexBuffer = null;
		this.texCoords = null;
		this.width = width;
		this.height = height;

		if (typeof gl === 'undefined' && typeof this.gl === 'undefined') {
			this.gl = Program.createGl(width, height);
		} else {
			this.gl = gl;
		}
	}

	static createGl(width, height) {
		let gl = headlessGL(width, height, {
			premultipliedAlpha: false,
			preserveDrawingBuffer: false
		});

		if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		let ext;
		try {
			ext = gl.getExtension("OES_texture_float");
		} catch (e) { }

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}

		return gl;
	}


	doBindings(textureA, textureB, program, targetIndex) {
		this.doUniformBindings(textureA, textureB, program, targetIndex);
		//this.doVertexBindings(program);
	}

	doSingleTextureBindings(texture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex) {
		this.doUniformBindingsSingleTexture(texture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex);
		//this.doVertexBindings(program);
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
	doGenericUniformBinding(unifroms) {

	}
	doUniformBindingsSingleTexture(inputTexture, outputDimensions, program, componentIndexA, componentIndexB, targetIndex) {
		var gl = this.gl;

		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexA"), componentIndexA);
		gl.uniform1i(gl.getUniformLocation(program, "uRGBAIndexB"), componentIndexB);
		gl.uniform1i(gl.getUniformLocation(program, "uTargetIndex"), targetIndex);

		gl.uniform1i(gl.getUniformLocation(program, "usampler"), inputTexture.index);
		gl.uniform1f(gl.getUniformLocation(program, "uWidth"), inputTexture.width);
		gl.uniform1f(gl.getUniformLgenTexturesocation(program, "uStepY"), 1. / inputTexture.height);

		gl.uniform1f(gl.getUniformLocation(program, "uResultWidth"), outputDimensions.width);
		gl.uniform1f(gl.getUniformLocation(program, "uResultHeight"), outputDimensions.height);
	}

	doVertexBindings() {

		let gl = this.gl;
		// bind vertices
		let aPosition = gl.getAttribLocation(this.glProgram, "aPosition");
		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

		let vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		// bind texture cords
		let aTexture = gl.getAttribLocation(this.glProgram, "aTexture");
		this.texCoords = gl.createBuffer();
		let textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoords);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aTexture);

		// index to vertices
		let indices = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
		let vertexIndices = [0, 1, 2, 0, 2, 3];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
	}


	execute(num) {
		let numTextures = num;

		if (typeof numTextures === 'undefined'){
			numTextures = 1;
		}

		let textures = genTextures(this.gl,numTextures,this.width,this.height);
		return this.executeUsingTextures(textures);
	}

	executeUsingTextures(textures) {
		let gl = this.gl;
		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, this.width, this.height);

		let frameBuffer = FrameBufferFactory.createFrameBufferMultiAttachement(gl, textures);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);

		frameBuffer.delete();
		return textures;
	}

	getResult(texture) {
		Util.texture2array(texture);
	}

	buildProgram(vertexShaderCode, fragmentShaderCode) {
		let gl = this.gl;
		// link into a program
		this.glProgram = gl.createProgram();

		this.vShader = ShaderFactory.createVertexShader(gl, vertexShaderCode);
		this.fShader = ShaderFactory.createFragmentShader(gl, fragmentShaderCode);


		gl.attachShader(this.glProgram, this.vShader);
		gl.attachShader(this.glProgram, this.fShader);
		gl.linkProgram(this.glProgram);
		gl.useProgram(this.glProgram);
		gl.validateProgram(this.glProgram);

		if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
			var info = gl.getProgramInfoLog(this.glProgram);
			throw 'Could not compile WebGL program.' + info;
		}

		this.doVertexBindings();

		return this.glProgram;
	}

	compute(textureA, textureB, textureC, outputDimensions) {
		var t0 = Date.now();
		var gl = this.gl;
		var canvas = this.getRenderCanvas(this.width, this.height);

		canvas.width = outputDimensions.width;
		canvas.height = outputDimensions.height;

		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, canvas.width, canvas.height);

		var frameBuffer = FrameBufferFactory.createFrameBuffer(gl, textureC);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		this.doBindings(textureA, textureB, this.glProgram);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		frameBuffer.delete();

		var t1 = Date.now();
		textureC.duration = t1 - t0;
		return textureC;
	}

	multiplySingleTexture(texture, outputDimensions, componentA, componentB, targetIndex) {
		let gl = this.gl;

		gl.useProgram(this.glProgram);
		gl.viewport(0, 0, outputDimensions.width, outputDimensions.height);

		let resultTexture = TextureFactory.createReadableTexture(gl, 'resultTexture', outputDimensions);
		let frameBuffer = FrameBufferFactory.createFrameBuffer(gl, resultTexture);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.glFrameBuffer);
		this.doSingleTextureBindings(texture, resultTexture, this.glProgram, componentA, componentB, targetIndex);

		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		frameBuffer.delete();

		return resultTexture;
	}

	debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}

	delete() {
		let gl = this.gl;

		gl.deleteShader(this.vShader);
		this.debugPrint("Deleted vertex shader");
		gl.deleteShader(this.fShader);
		this.debugPrint("Deleted fragment shader");
		gl.deleteProgram(this.glProgram);
		this.debugPrint("Deleted program");
		gl.deleteBuffer(this.vertexBuffer);
		this.debugPrint("Deleted vertex buffer");
		gl.deleteBuffer(this.texCoords);
		this.debugPrint("Deleted texture coordinates");
	}
}

module.exports.Program = Program
const { FrameBufferFactory } = require(__dirname + "\\framebufferfactory.js");
const { TextureFactory } = require(__dirname + "\\texturefactory.js");
const { ShaderFactory } = require(__dirname + "\\shader.js");
const { Util } = require(__dirname + "\\util.js");
