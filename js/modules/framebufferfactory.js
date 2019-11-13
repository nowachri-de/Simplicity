

module.exports.FrameBufferFactory = class FrameBufferFactory {
	//http://www.songho.ca/opengl/gl_fbo.html
	//https://github.com/tsherif/webgl2examples/blob/master/deferred.html
	//https://hacks.mozilla.org/2014/01/webgl-deferred-shading/
	//https://stackoverflow.com/questions/34154300/readpixels-on-multiple-draw-buffers-in-webgl
	//https://www.cs.cornell.edu/courses/cs4620/2017sp/cs4621/lecture08/exhibit03.html
	static createFrameBuffer(gl, texture) {
		// create and bind renderbuffer
		//var renderBuffer = gl.createRenderbuffer();
		//gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		//gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
		//gl.renderbufferStorage(gl.RENDERBUFFER, gl.UNSIGNED_BYTE, texture.width, texture.height);

		// create and bind framebuffer
		var frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		//gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, texture.texture, /*level*/ 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, /*level*/ 0);
		//gl.framebufferRenderbuffer(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT1_WEBGL, gl.RENDERBUFFER, renderBuffer);

		//gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			throw "Error: binding of framebuffer failed";

		var result = {
			texture: texture,
			frameBuffer: frameBuffer,
			//renderBuffer: renderBuffer,
			//name: name,
			width: texture.width,
			height: texture.height
		}

		return result;
	}

	static createFrameBufferMultiAttachement(gl, ...textures) {
		let ext = gl.getExtension('WEBGL_draw_buffers');
		let offset = ext.COLOR_ATTACHMENT0_WEBGL;
		let buffers = [];
		let i = 0;

		textures.forEach(() => {
			buffers.push(offset + i);
			i++;
		});
		

		var frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		i = 0;
		textures.forEach(arg => {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, arg.texture, /*level*/ 0);
			++i;
		});

		ext.drawBuffersWEBGL(buffers);
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			console.log("Error: binding of framebuffer failed");

		var result = {
			frameBuffer: frameBuffer
		}

		return result;
	}
}