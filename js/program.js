function Program (canvasID) {
	
    this.canvasID 		= canvasID;
    this.gl 			= this.getGl(canvasID);
	this.textureIndex	= gl.TEXTURE0;
	this.textures		= new Map();
	this.frameBuffers	= new Map();
	
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
			textureIndex : textureIndex - 1,
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
			textureIndex : textureIndex -1,
			name : name
		}
		
		this.textures.set(name,result);
        return result;
    }
	
	this.getGl = function(canvasID) {
        var canvas = document.getElementById(canvasID);
		
        var gl = canvas.getContext("experimental-webgl", {
			premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		var ext;
		try {
			ext = this.gl.getExtension("OES_texture_float");
		} catch (e) {}

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}
		
        return gl;
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
}
