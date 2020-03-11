let referenceCount = new Map();

function removeFromReferenceCount(index){
	if (typeof getReferenceCount(index) === 'undefined'){
		return 0;
	}
	//delete reference count if it is <=1
	if (getReferenceCount(index)<=1){
		referenceCount.delete(index);
		
	}else{
		//decrease reference count in case it is >= 1
		setReferenceCount(index,getReferenceCount(index)-1);
		return -1;
	}
	return 0;
}

//return the referenceCount of the given index
function getReferenceCount(index){
	return referenceCount.get(index);
}

//set the referenceCount for the given index
function setReferenceCount(index,value){
	referenceCount.set(index,value);
	return referenceCount.get(index);
}

class Texture{
    constructor(gl,texture,index,name,width,height){
        this.gl = gl;
        this.texture= texture;
        this.index =  index;
        this.name= name;
        this.width = width;
		this.height= height;
		this.isRaw = false;
    }

	/**
	 * Delete the gl texture and free the corresponding memory.
	 * Only do so in case the textures referenceCount !>1
	 */
    delete(){
		if (removeFromReferenceCount(this.index) === 0){
			this.gl.deleteTexture(this.texture);
		}
    }
};

class TextureFactory {
	
	//returns the next free index
	static fetchFreeIndex(){
		//There are no used indexes yet, so return index 0
		if ( referenceCount.size === 0){
			return 0;
		}

		let indices = Array.from( referenceCount.keys() );
		//Sort the usedIndices array ascending (or descending?)
		indices.sort(function(a, b){return a - b});
		let i = 0;
		while(indices.includes(i)){
			++i;
		}
		return i;
	}

	//add the given index to the list of used indexes
	static useIndex(index){
		//if the index is not yet in use
		if(typeof getReferenceCount(index) === 'undefined'){
			setReferenceCount(index,1);
			return;
		}
		//if the index is already in use, increase reference count
		setReferenceCount(index,getReferenceCount(index)++);
		
	}

	static createReadableTexture(gl,name, outputdimensions) {
		var texture = gl.createTexture();
		
		let index = TextureFactory.fetchFreeIndex();
		TextureFactory.useIndex(index);

		gl.activeTexture(gl.TEXTURE0 + index );
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, outputdimensions.width, outputdimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        return new Texture(gl,texture,index,name,outputdimensions.width, outputdimensions.height);
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
		//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
		
		return (new Texture(gl,texture,index,name,width, height));
	}

	static logReferenceCount() {
		function logMapElements(value, key, map) {
			console.log('index: ' + key +'; ' + value + '(count)');
		}
		referenceCount.forEach(logMapElements);
		console.log('reference list size ' + referenceCount.size);
	}

	static getReferenceCount(){
		return referenceCount.size;
	}
}

module.exports.TextureFactory = TextureFactory
module.exports.Texture = Texture