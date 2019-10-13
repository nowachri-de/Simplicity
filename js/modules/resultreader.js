const Shader = require(__dirname + "\\shader.js");
const Program = require(__dirname + "\\program.js");
const Matrix = require(__dirname + "\\matrix.js");

module.exports.ResultReader = function ResultReader(gl,width,height){
	this.gl = gl;
	this.program = null;

	
	this.buildProgram = function(){
		this.shader    		= new Shader.Shader(this.gl);
		this.vertexShader 	= this.shader.getVertexShader(Shader.ShaderCode.getShaderCode("VERTEX"));
		this.fragmentShader = this.shader.getFragmentShader(Shader.ShaderCode.getShaderCode("READABLE"));
		
		this.program  = new Program.Program(width,height,this.gl);
		this.program.buildProgram(this.vertexShader,this.fragmentShader);
	}
	
	this.buildProgram();
	
	this.runShaders = function(textureA,textureB,targetIndex) {
        var gl = this.gl;
		/*var canvas = this.getRenderCanvas(this.canvasID);
		
		canvas.width = textureB.width;
		canvas.height = textureB.height;*/
		
		gl.useProgram(this.program.program);
        gl.viewport(0, 0,textureB.width,textureB.height);
		gl.scissor(0, 0, textureB.width,textureB.height);
		var frameBuffer = this.program.createFrameBuffer(textureB);
		
		gl.activeTexture(gl.TEXTURE0 + textureB.textureIndex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.program.doBindings(textureA,textureB,this.program.program,targetIndex);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
    }
	
	this.read = function(textureA,textureB,targetIndex){
		this.runShaders(textureA,textureB,targetIndex);
		
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(textureB.height * textureB.width * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  textureB.width,textureB.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(textureB.height,textureB.width);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
	
	this.readByResultDimension = function(textureA,textureB,dimension,targetIndex){
		this.runShaders(textureA,textureB,targetIndex,dimension);
		
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(dimension.height * dimension.width * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  dimension.width,dimension.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix.Matrix(dimension.height,dimension.width);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
	
	this.free = function(){
		
		var gl = this.gl;
		
		this.program.free();
		gl.canvas.width = 1;
		gl.canvas.height = 1;
	}
}

