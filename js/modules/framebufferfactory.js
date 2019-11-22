class FrameBuffer{
    constructor(gl,frameBuffer,texture,width,height){
		this.gl = gl,
		this.glFrameBuffer = frameBuffer,
		this.texture = texture,
		this.width = width,
		this.height = height
    }

    delete(){
		this.gl.deleteFramebuffer(this.glFrameBuffer);
    }
};

module.exports.FrameBufferFactory = class FrameBufferFactory {
	//http://www.songho.ca/opengl/gl_fbo.html
	//https://github.com/tsherif/webgl2examples/blob/master/deferred.html
	//https://hacks.mozilla.org/2014/01/webgl-deferred-shading/
	//https://stackoverflow.com/questions/34154300/readpixels-on-multiple-draw-buffers-in-webgl
	//https://www.cs.cornell.edu/courses/cs4620/2017sp/cs4621/lecture08/exhibit03.html
	static createFrameBuffer(gl, texture) {
		// create and bind framebuffer
		var glFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, /*level*/ 0);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
			throw "Error: binding of framebuffer failed";

		return new FrameBuffer(gl,glFrameBuffer,texture,texture.width,texture.height);
	}

	static createFrameBufferMultiAttachement(gl, textures) {
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
			gl:gl,
			glFrameBuffer: frameBuffer,
			delete: function(){
				this.gl.deleteFramebuffer(this.glFrameBuffer);
			}
		}

		return result;
	}
}