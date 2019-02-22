function ResultReader(gl){
	this.gl = gl;
	
	this.read = function(texture){
		var gl = this.gl;
		 // extract the product and return in new matrix
        var rawBuffer = new ArrayBuffer(texture.height * texture.width);
        var glresult = new Uint8Array(rawBuffer);
        gl.readPixels(0, 0,  texture.width,texture.height, gl.RGBA, gl.UNSIGNED_BYTE, glresult);
        var result = new Matrix(texture.height,texture.width);
        result.setData(new Float32Array(rawBuffer));
	
		return result;
	}
}