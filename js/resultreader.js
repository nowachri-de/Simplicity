function ResultReader(gl,canvasID,outputDimensions){
	this.gl = gl;
	this.program = null;
	this.canvasID = canvasID;
	this.outputDimensions = outputDimensions;
	
	this.getRenderCanvas = function(canvasID){
		return document.getElementById(canvasID);
	};
	
	this.buildProgram = function(){
		var shader   = new Shader(this.gl);
		this.program  = new Program(canvasID);
		this.program.buildProgram(shader.getVertexShader(shader.getVertexShaderCode()),shader.getFragmentShader(shader.getReadableShaderCode()));
	}
	
	this.buildProgram();
	
	this.runShaders = function(textureA,textureB) {
        var gl = this.gl;
		var canvas = this.getRenderCanvas(this.canvasID);
		
		canvas.width = textureB.width;
		canvas.height = textureB.height;
		
		gl.useProgram(this.program.program);
        gl.viewport(0, 0,canvas.width,canvas.height);
		
		var frameBuffer = this.program.createFrameBuffer(textureB);
		
		gl.activeTexture(gl.TEXTURE0 + textureB.textureIndex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
		this.program.doBindings(textureA,textureB,this.program.program,this.outputDimensions);
        
        gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
    }
	
	this.read = function(textureA,textureB){
		this.runShaders(textureA,textureB);
		
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(textureB.height * textureB.width * 4);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  textureB.width,textureB.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix(textureB.height,textureB.width);
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

function TextureFactory(canvasID){
	this.textureIndex	= 0;
	this.textures		= new Map();
	this.canvasID 		= canvasID;
	
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
	
	this.gl = this.getGl(canvasID);
	
	this.createReadableTexture = function(name,outputdimensions) {
        var gl = this.gl;
		
        var renderCanvas = this.getRenderCanvas(this.canvasID);
		renderCanvas.width = outputdimensions.numColumns;
		renderCanvas.height = outputdimensions.numRows;
		
        // create and bind texture to render to
        var texture = gl.createTexture();
        gl.activeTexture(this.gl.TEXTURE0 + this.textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderCanvas);
		
		var result={
			texture : texture,
			textureIndex : this.textureIndex,
			name : name,
			width : outputdimensions.numColumns,
			height : outputdimensions.numRows
		}
		this.textureIndex++;
		this.textures.set(name,result);
        return result;
    }
	
	this.createTexture=function(name,matrix,component) {
       return this.createTextureByDimension(name,matrix.numRows,matrix.numColumns,matrix.getTexels(component));
    }

	this.createResultTexture=function(name,outputdimensions) {
		return this.createTextureByDimension(name,outputdimensions.numRows,outputdimensions.numColumns,null);
    }
	
	this.createTextureByDimension=function(name,rows,cols,data) {
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
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.FLOAT,data);
		
		var result = {
			texture : texture,
			textureIndex : this.textureIndex,
			name : name,
			width : cols,
			height : rows
		}
		
		this.textureIndex++;
		this.textures.set(name,result);
        return result;
    }
	
	this.free = function(){
		var gl = this.gl;
		this.textures.forEach(function logMapElements(value, key, map) {
			gl.deleteTexture(value.texture);
			console.log("Called gl.deleteTexture for texture " + value.name + " with index " +value.textureIndex );
		});
		
		gl.canvas.width = 1;
		gl.canvas.height = 1;
	}
}