/**
 * The array 'usedIndices' and the map 'referenceCount' form kind of a trivial garbage collector.
 * Each texture beeing created will get assigned a unique index. This means, at any given time
 * no textures do exist that have the same index. When the texture is deleted, the texture's
 * index must be reused by any texture beeing newly created. 
 * When a texture is newly created it will  get assigned a unique index and will
 * have a reference count of 1. When a texture is passed as argument to another kernel, the texture 
 * may not be deleted by the originating kernel. For that reason the reference count of the texture's
 * index will be incremented. Only textures which do have an index with a reference count of zero will be removed
 * from the list of used indices.
 */

let usedIndices = new Array();
/** 
 * each index has a reference count, which is usually one expect a result texture is passed to another kernel, 
 * in this case the index's reference count get's increased.
*/ 
let referenceCount = new Map();

/**
 * This function removes the given index (value) from the index array
 * or reduces it`s count in case the reference count of this index is greater than one.
 * 
 * @param array array from which index has to be removed
 * @param value index which needs to be removed
 * @return 0: index was removed, -1: index was not removed since referenceCount was >1
 */
function removeFromIndex(array,value){
	var index = array.indexOf(value);

	//delete reference count if it is <=1
	if (getReferenceCount(index)<=1){
		referenceCount.delete(index);
	}else{
		//decrease reference count in case it is >= 1
		setReferenceCount(index,getReferenceCount(index)-1);
		return -1;
	}

	if (index > -1) {
		array.splice(index, 1);
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
    }

	/**
	 * Delete the gl texture and free the corresponding memory.
	 * Only do so in case the textures referenceCount !>1
	 */
    delete(){
		if (removeFromIndex(usedIndices,this.index) === 0){
			this.gl.deleteTexture(this.texture);
		}
    }
};

class TextureFactory {
	
	//returns the next free index
	static fetchFreeIndex(){
		//There are no used indexes yet, so return index 0
		if ( usedIndices.length === 0){
			return 0;
		}

		//Sort the usedIndices array ascending (or descending?)
		usedIndices.sort(function(a, b){return a - b});
		let i = 0;
		while(usedIndices.includes(i)){
			++i;
		}
		return i;
	}

	//add the given index to the list of used indexes
	static useIndex(index){
		//test if the index is already used
		if(usedIndices.indexOf(index) !== -1){
			//if this is the case increase it's reference count
			setReferenceCount(index,getReferenceCount(index)++);
			return;
		}
		//if the index is not already used, add it to the list of used indices
		setReferenceCount(index,1);
		usedIndices.push(index);
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

	static debugPrint(message) {
		if (this.debug === true) {
			console.log(message);
		}
	}
}

module.exports.TextureFactory = TextureFactory