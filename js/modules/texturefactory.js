class Texture{
    constructor(gl,texture,index,name,width,height){
        this.gl = gl;
        this.texture= texture;
        this.index=  index;
        this.name= name;
        this.width = width;
        this.height= height;
    }

    free(){
        this.gl.deleteTexture(this.texture);
    }
};

module.exports.TextureFactory = class TextureFactory {

	constructor(gl) {
		this.gl = gl;
		this.index = 0;
	}

	createReadableTexture(name, outputdimensions) {
		var gl = this.gl;

		var texture = gl.createTexture();

		gl.activeTexture(this.gl.TEXTURE0 + this.index);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		//gl.texImage2D(gl.TEXTURE_2D, /*level*/ 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data/*renderCanvas*/);
		// clamp to edge to support non-power of two textures
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// don't interpolate when getting data from texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, outputdimensions.width, outputdimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(new ArrayBuffer(12 * 12 * 4)));
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, outputdimensions.width, outputdimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        return new Texture(gl,texture,this.index ++,name,outputdimensions.width, outputdimensions.height);
	}

	createTexture(name, matrix, component) {
		return this.createTextureByDimension(name, matrix.width, matrix.height, matrix.getTexels(component));
	}

	createResultTexture(name, outputdimensions) {
		return this.createTextureByDimension(name, outputdimensions.width, outputdimensions.height, null);
	}

	createTextureByDimension(name, width, height, data) {
		var gl = this.gl;

		var texture = gl.createTexture();
		gl.activeTexture(this.gl.TEXTURE0 + this.index);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// clamp to edge to support non-power of two textures
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// don't interpolate when getting data from texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);

		return (new Texture(gl,texture,this.index ++,name,width, height));
	}

	debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}
}