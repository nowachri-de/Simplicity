//See requirements at the end of the file. Requirements are at the end of the file due to circular dependencies.
module.exports.ResultReader = class ResultReader{
	constructor(gl,width,height){
		this.gl = gl;
		this.build(width,height);
	}

	build(width,height){
		this.vertexShader 	= ShaderFactory.createVertexShader(this.gl,ShaderCode.getCode("VERTEX"));
		this.fragmentShader = ShaderFactory.getFragmentShader(this.gl,ShaderCode.getCode("READABLE"));
		
		this.program  = new Program(width,height,this.gl);
		this.program.buildProgram(this.vertexShader,this.fragmentShader);
	}

	runShaders(textureA,textureB,targetIndex) {
        var gl = this.gl;
		/*var canvas = this.getRenderCanvas(this.canvasID);
		
		canvas.width = textureB.width;
		canvas.height = textureB.height;*/
		
		gl.useProgram(this.program.program);
        gl.viewport(0, 0,textureB.width,textureB.height);
		gl.scissor(0, 0, textureB.width,textureB.height);
		var frameBuffer = FrameBufferFactory.createFrameBuffer(gl,textureB);
		
		//gl.activeTexture(gl.TEXTURE0 + textureB.index);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.program.doBindings(textureA,textureB,this.program.program,targetIndex);
        
		gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
		return frameBuffer;
    }
	
	read(textureA,textureB,targetIndex){
		this.runShaders(textureA,textureB,targetIndex);
		
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(textureB.width * textureB.height * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  textureB.width,textureB.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(textureB.height,textureB.width);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
	//http://www.realtimerendering.com/blog/webgl-2-basics/
	readByResultDimension(inputTexture,outputTexture,dimension,targetIndex){
		var gl = this.gl;
		let frameBuffer = this.runShaders(inputTexture,outputTexture,targetIndex);
		
	  
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(dimension.height * dimension.width * 4);
		var glresult = new Uint8Array(rawBuffer);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, textureA.frameBuffer);
		//gl.readBuffer(ext.COLOR_ATTACHMENT1_WEBGL);
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
        gl.readPixels(0, 0,  dimension.width,dimension.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(dimension.width,dimension.height);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
	
	delete(){		
		var gl = this.gl;
		this.program.delete();
		gl.canvas.width = 1;
		gl.canvas.height = 1;
	}
}

const {ShaderFactory} = require(__dirname + "\\shader.js");
const {ShaderCode} = require(__dirname + "\\shadercode.js");
const {Program} = require(__dirname + "\\program.js");
const {FrameBufferFactory} = require(__dirname + "\\framebufferfactory.js");
const Matrix = require(__dirname + "\\matrix.js");