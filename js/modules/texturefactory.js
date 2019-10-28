let usedIndices = new Array();

function removeFromArray(array,value){
	var index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	 }
}

class Texture{
    constructor(gl,texture,index,name,width,height){
        this.gl = gl;
        this.texture= texture;
        this.index =  index;
        this.name= name;
        this.width = width;
        this.height= height;
    }

    delete(){
		this.gl.deleteTexture(this.texture);
		removeFromArray(usedIndices,this.index);
    }
};

class TextureFactory {
	
	static fetchFreeIndex(){
		if ( usedIndices.length === 0){
			return 0;
		}
		usedIndices.sort(function(a, b){return a - b});

		let i = 0;
		while(usedIndices.includes(i)){
			++i;
		}
		return i;
	}

	static useIndex(index){
		usedIndices.push(index);
	}

	static createReadableTexture(gl,name, outputdimensions) {
		var texture = gl.createTexture();
		
		let index = TextureFactory.fetchFreeIndex();
		TextureFactory.useIndex(index);

		gl.activeTexture(gl.TEXTURE0 + index );
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

        return new Texture(gl,texture,index,name,outputdimensions.width, outputdimensions.height);
	}

	static createTexture(gl, name, matrix, component) {
		return this.createTextureByDimension(gl,name, matrix.width, matrix.height, matrix.getTexels(component));
	}

	static createReadableTexture(gl, name, outputdimensions) {
		return this.createTextureByDimension(gl,name, outputdimensions.width, outputdimensions.height, null);
	}

	static createTextureByDimension(gl, name, width, height, data) {
		var texture = gl.createTexture();
		
		let index = TextureFactory.fetchFreeIndex();
		TextureFactory.useIndex(index);

		gl.activeTexture(gl.TEXTURE0 + index );
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// clamp to edge to support non-power of two textures
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// don't interpolate when getting data from texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);

		return (new Texture(gl,texture,index,name,width, height));
	}

	static debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}
}

module.exports.TextureFactory = TextureFactory