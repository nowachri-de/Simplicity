const Program = require(__dirname + "\\program.js");
const Shader = require(__dirname + "\\shader.js");
const ResultReader = require(__dirname + "\\resultreader.js");

class Matrix {

    constructor(rows, columns) {
        this.numRows = rows;
        this.numColumns = columns;
        this.matrixMerger = new MatrixMerger();
        this.resultTexture= null;

        this.rows = new Array();
        for (var row = 0; row < this.numRows; row++) {
            this.rows.push(new Float32Array(columns));
        }
    }

    zeroInitialize() {
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                this.rows[row][col] = 0;
            }
        }
    }

    randomInitialize() {
        for (var col = 0; col < this.numColumns; col++) {
            for (var row = 0; row < this.numRows; row++) {
                this.rows[row][col] = Math.random();
            }
        }
        return this.rows;
    }

    getValue(row, col) {
        if (row < this.numRows && col < this.numColumns) {
            return this.rows[row][col];
        }
        return null;
    }

    getColumn(col) {
        var column = new Array();

        if (col < this.numColumns) {
            for (var row = 0; row < this.numRows; row++) {
                column.push(this.rows[row][col]);
            }
        }

        return column;
    }

    getRow(row) {
        if (row < this.numRows) {
            return this.row[row];
        }
        return [];
    }

    setValue(row, col, value) {
        if (row < this.numRows && col < this.numColumns) {
            this.rows[row][col] = value;
        }
        return value;
    }

    setData(f32Array) {
        var cnt = 0;
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numColumns; col++) {
                this.rows[row][col] = f32Array[cnt++];
            }
        }
    }

    print(decimals) {
        if (decimals === undefined)
            decimals = 15;

        var result = "";
        var rowContent = "";
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numColumns; col++) {
                rowContent += (this.rows[row][col]).toFixed(decimals) + " ; "
            }
            console.log(rowContent);
            rowContent = "";
        }
        return result;
    }

    as2DArray() {
        var result = [];

        for (var row = 0; row < this.numRows; row++) {
            result[row] = [];
            for (var col = 0; col < this.numColumns; col++) {
                result[row].push(this.rows[row][col]);
            }
        }

        return result;
    }

    getRow(rowIndex) {
        return this.rows[rowIndex];
    }

    mergeRow(texelRowOrig, texelRowCopy, copyComponent, targetComponent) {
        var length = Math.min(texelRowOrig.length, texelRowCopy.length);
        var copyOffset = 0;

        switch (copyComponent) {
            //R component of RGBA color
            case 'R':
                copyOffset = 4;
                break;
            //G component of RGBA color
            case 'G':
                copyOffset = 3;
                break;
            //B component of RGBA color
            case 'B':
                copyOffset = 2;
                break;
            //A component of RGBA color
            case 'A':
                copyOffset = 1;
                break;
            default:
                throw "mergeRow: copyComponent " + copyComponent + " unknown";
        }

        for (var cnt = 4; cnt < length; cnt += 4) {

            switch (targetComponent) {
                //R component of RGBA color
                case 'R':
                    texelRowOrig[cnt - 4] = texelRowCopy[cnt - copyOffset];
                    break;
                //G component of RGBA color
                case 'G':
                    texelRowOrig[cnt - 3] = texelRowCopy[cnt - copyOffset];
                    break;
                //B component of RGBA color
                case 'B':
                    texelRowOrig[cnt - 2] = texelRowCopy[cnt - copyOffset];
                    break;
                //A component of RGBA color
                case 'A':
                    texelRowOrig[cnt - 1] = texelRowCopy[cnt - copyOffset];
                    break;
                default:
                    throw "mergeRow: targetComponent " + targetComponent + " unknown";
            }
        }
    }

    componentToIndex(component) {
        switch (component) {
            //R component of RGBA color
            case 'R':
                return 0;
            //G component of RGBA color
            case 'G':
                return 1;
            //B component of RGBA color
            case 'B':
                return 2;
            //A component of RGBA color
            case 'A':
                return 3;
            default:
                throw "componentToIndex: component " + component + " unknown";
        }
    }

    getTexels(component) {

        var result = new Float32Array(4 * this.numRows * this.numColumns);
        var cnt = 0;

        if (component === undefined) {
            component = "R";
        }

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numColumns; col++) {
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;

                switch (component) {
                    //R component of RGBA color
                    case 'R':
                        result[cnt - 4] = this.rows[row][col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = this.rows[row][col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = this.rows[row][col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = this.rows[row][col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }

    getOutputDimensions(matrixB) {
        var thisRows = this.numRows;
        var otherColumns = matrixB.numColumns;

        var result = {
            numRows: thisRows,
            numColumns: otherColumns
        };

        return result;
    }
    /**
	 * The prepare method is used to combine multiple matrices in a single texture.
     * At maximum 4 matrices can be compared within a texture. Each color component (R,G,B,A) of the texture will
     * be used to hold the values of the added matrix
	 * 
	 * @param {Matrix} matrix - The matrix to be added.
	 * @param {string} targetComponent - The component (R,G,B,A) where to write the value in the texture.
    */
    prepare(matrix,targetComponent){
        let matrixMerger = this.matrixMerger;
        matrixMerger.addMatrix(matrix, targetComponent);
    }

    /**
	 * The manyMultiply method is used to multiply all matrices which have been defined for multiplication 
     * using the prepare method.
    */

    manyMultiply(){
        let t0 = Date.now();
        let matrixMerger = this.matrixMerger;
        let outputDimensions = matrixMerger.getOutputDimensions();

        this.program = new Program.Program(outputDimensions.numColumns, outputDimensions.numRows);
        this.textureFactory = new Program.TextureFactory(this.program.gl);
       
        let texture = this.textureFactory.createTextureByDimension("inputTexture", matrixMerger.maxRows, matrixMerger.maxColumns, matrixMerger.getTexels());
        this.resultTexture = this.textureFactory.createResultTexture('resultTexture', outputDimensions);
        this.readableTexture = this.textureFactory.createReadableTexture('readableTexture', outputDimensions);

        let shader = new Shader.Shader(this.program.gl);
        let vertexShader = shader.getVertexShader(Shader.ShaderCode.getShaderCode("VERTEX"));
        let fragmentShader = shader.getFragmentShader(Shader.ShaderCode.getShaderCode("SINGLE"));
        this.program.buildProgram(vertexShader, fragmentShader);
        this.program.compute2(texture, this.resultTexture, outputDimensions, 0, 1, 0);
        this.program.compute2(texture, this.resultTexture, outputDimensions, 0, 1, 1);
    }

    /**
	 * The readResult method is used to read a result after the manyMultiply method was executed.
     * 
     * @param {integer} resultIndex -   Integer between 0 and 4. The result texture contains for matrices. One in each color component (RGBA)
     *                                  The resultIndex specifies which matrix to read.
	 * @param {integer} width       -   width of result matrix. Width equals number of columns.
     * @param {integer} height      -   height of result matrix. Height equals number of rows.
    */
    readResult(resultIndex,width,height){
        let t0 = Date.now();
        let program = this.program;
        let textureFactory = this.textureFactory;

        var resultReader = new ResultReader.ResultReader(program.gl, width, height);
        var result = resultReader.readByResultDimension(this.resultTexture, this.readableTexture,{width:width,height:height}, resultIndex);

       // textureFactory.free();
       // program.free();

        var t1 = Date.now();
        result.duration = t1 - t0;
        return result;
    }

    multiply(matrixB) {
        let t0 = Date.now();
        let matrixMerger = this.matrixMerger;

        matrixMerger.reset();
        matrixMerger.addMatrix(this, 'R');
        matrixMerger.addMatrix(matrixB, 'G');

        let program = new Program.Program(this.numColumns, this.numRows);
        let textureFactory = new Program.TextureFactory(program.gl);
        let outputDimensions = matrixMerger.getOutputDimensions();

        let texture = textureFactory.createTextureByDimension("inputTexture", matrixMerger.maxRows, matrixMerger.maxColumns, matrixMerger.getTexels());
        let resultTexture = textureFactory.createResultTexture('resultTexture', outputDimensions);
        let readableTexture = textureFactory.createReadableTexture('readableTexture', outputDimensions);

        let shader = new Shader.Shader(program.gl);
        let vertexShader = shader.getVertexShader(Shader.ShaderCode.getShaderCode("VERTEX"));
        let fragmentShader = shader.getFragmentShader(Shader.ShaderCode.getShaderCode("SINGLE"));
        program.buildProgram(vertexShader, fragmentShader);
        var computationResult = program.compute2(texture, resultTexture, outputDimensions, 0, 1);

        var matrixDimension = this.getOutputDimensions(matrixB);
        var resultDimension = {
            width: matrixDimension.numColumns,
            height: matrixDimension.numRows
        }
        var resultReader = new ResultReader.ResultReader(program.gl, resultDimension.width, resultDimension.height);
        var result = resultReader.readByResultDimension(computationResult.resultTexture, readableTexture, resultDimension, 0);

        textureFactory.free();
        program.free();

        var t1 = Date.now();
        result.duration = t1 - t0;
        return result;
    }



    set numRows(rows) {
        this._numRows = rows;
    }

    get numRows() {
        return this._numRows;
    }

    get numColumns() {
        return this._numColumns;
    }

    set numColumns(cols) {
        this._numColumns = cols;
    }

    get columns() {
        return this._columns;
    }

    set columns(columns) {
        this._columns = columns;
    }

    get rows() {
        return this._rows;
    }

    set rows(rows) {
        this._rows = rows;
    }

    set frameBuffer(buffer) {
        this._frameBuffer = buffer;
    }

    get frameBuffer() {
        return this._frameBuffer;
    }

    set renderBuffer(buffer) {
        this._renderBuffer = buffer;
    }

    get renderBuffer() {
        return this._renderBuffer;
    }
}

/*
	This class can write 4 matrices into one texture. This class will take care to create a texture of the appropriate size
	depending on the size of the given matrices.
*/
class MatrixMerger {
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

    addMatrix(matrix, targetComponent) {
        if (this.mergeInstructions.length >= 4) {
            throw "Can not add another matrix, class already contains 4 matrices";
        }

        var mergInstruction = {
            targetComponent: targetComponent,
            matrix: matrix
        }

        this.mergeInstructions.push(mergInstruction);

        if (matrix.numRows > this.maxRows) {
            this.maxRows = matrix.numRows;
        }

        if (matrix.numColumns > this.maxColumns) {
            this.maxColumns = matrix.numColumns;
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
                    //var sourceComponentOffset = matrix.componentToIndex(mergeInstruction.sourceComponent);
                    var sourceComponentOffset = matrix.componentToIndex('R');
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
            numRows: outRows,
            numColumns: outColumns
        };

        return result;
    }
}

module.exports.Matrix = Matrix;
module.exports.MatrixMerger = MatrixMerger;