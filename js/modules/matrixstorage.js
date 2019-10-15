const {Matrix} = require(__dirname + "\\matrix.js");
/*
    The matrix storage does store matrices in a texture. It utilizes the R,G,B,A components of the texture to store a matrix.
    Since it is utilizing the R,G,B,A components of a texture it can store up to 4 matrices in a texture.
*/
class MatrixStorage {
    constructor(){
       
        this.mergeInstructions = new Array();
        this.maxColumns = 0;
        this.maxRows = 0;
        this.maxColumMatrix = null;
    }

	/**
	 * Add matrix. The maximum number of matrices that can be added is 4.
	 * If it is attempted to add more than 4 matrices an exception will be thrown.
	 * 
	 * @param {Matrix} matrix - The matrix to be added.
	 * @param {integer} targetComponent - The component (R,G,B or A) where to write the value in the texture.
    */

    store(matrix, targetComponent) {

        var mergInstruction = {
            targetComponent: targetComponent,
            matrix: matrix
        }

        this.mergeInstructions.push(mergInstruction);

        if (matrix.height > this.maxRows) {
            this.maxRows = matrix.height;
        }

        if (matrix.width > this.maxColumns) {
            this.maxColumns = matrix.width;
            this.maxColumMatrix = matrix;
        }
    }

    reset(){
        this.mergeInstructions.length = 0;
    }
    getTexels() {
        var result = new Float32Array(this.maxColumns * this.maxRows * 4);
        var resultIndex = 0;

        for (var row = 0; row < this.maxRows; ++row) {
            for (var column = 0; column < this.maxColumns; ++column) {
                for (var mi = 0; mi < this.mergeInstructions.length; ++mi) {
                    var mergeInstruction = this.mergeInstructions[mi];
                    var matrix = mergeInstruction.matrix;
                    var targetComponentOffset = matrix.componentToIndex(mergeInstruction.targetComponent);

                    var matrixValue = matrix.getValue(row, column);

                    if (matrixValue != null) {
                        result[resultIndex + targetComponentOffset] = matrixValue;
                    } else {
                        result[resultIndex + targetComponentOffset] = 0;
                    }
                }
                resultIndex += 4;
            }
        }

        return result;
    }

    getOutputDimensions() {

        var outRows = this.maxRows;
        var outColumns = this.maxColumns;

        var result = {
            height: outRows,
            width: outColumns
        };

        return result;
    }
}

module.exports.MatrixStorage = MatrixStorage;