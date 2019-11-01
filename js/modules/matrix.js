const { Program } = require(__dirname + "\\program.js");
const { ShaderFactory } = require(__dirname + "\\shader.js");
const { ShaderCode } = require(__dirname + "\\shadercode.js");
const { ResultReader } = require(__dirname + "\\resultreader.js");
const { MatrixStorage } = require(__dirname + "\\matrixstorage.js");
const { TextureFactory } = require(__dirname + "\\texturefactory.js");

module.exports.Matrix = class Matrix {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.resultTexture = null;
        this.data = new Array();
        for (var row = 0; row < this.height; row++) {
            this.data.push(new Float32Array(width));
        }
    }

    /**
     * Initializes the matrix to zeros.
     * @returns This matrix.
     */
    zeroInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = 0;
            }
        }
        return this;
    }

    /**
     * Randomly initialzes the matrix.
     * Note that the math random number is divided by 10 in order to
     * generate small numbers.
     * @returns This matrix
     */
    randomInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = Math.random() / 10.0;
            }
        }
        return this;
    }

    /**
     * Initializes the matrix to ones
     * @returns This matrix
     */
    oneInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = 1;
            }
        }
        return this;
    }

    /**
     * Add column at given column index to matrix
     * @param column index of column
     * @param columnVector column data to be set
     * @returns this matrix
     */

    insertColumn(column, columnVector) {
        if (columnVector.length != this.height) {
            throw 'column vector length does not match matrix height'
        }
        if (column >= this.width) {
            throw 'column index is out of scope'
        }

        for (var row = 0; row < this.height; row++) {
            this.data[row][column] = columnVector[row];
        }

        return this;
    }

    /**
     * Add columnVector values to column at given column index
     * @param column index of column
     * @param columnVector column data to be set
     * @returns this matrix
     */

    addColumn(column, columnVector) {
        if (columnVector.length != this.height) {
            throw 'column vector length does not match matrix height'
        }
        if (column >= this.width) {
            throw 'column index is out of scope'
        }

        for (var row = 0; row < this.height; row++) {
            this.data[row][column] += columnVector[row];
        }

        return this;
    }

    /** 
     * Add rowVector values to row at given row index
    * @returns This matrix
    */
    addRow(row, data) {

        for (var col = 0; col < this.width; col++) {
            this.data[row][col] += data[col];
        }

        return this;
    }
    /** 
     * Add row at given row index to matrix
     * @param row index of row
     * @param rowVector row data to be set
     * @returns this matrix
     */

    insertRow(row, rowVector) {
        if (rowVector.length != this.width) {
            throw 'row vector length does not match matrix width'
        }
        if (row >= this.height) {
            throw 'row index is out of scope'
        }
        this.data[row] = rowVector;

        return this;
    }
    /** Initializes the matrix to an ascending sequence.
    * @returns This matrix
    */
    sequenzeInitialize() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.data[row][col] = (row * this.width) + col;
            }
        }
        return this;
    }

    /**
     * Return that matrix value at the given row and column.
     * @param {Integer} row row of matrix
     * @param {Integer} col column of matrix
     * @returns Requested value, null if row and/or col arguments are not in the range of the matrix dimension.
     */
    getValue(row, col) {
        if (row < this.height && col < this.width) {
            return this.data[row][col];
        }
        return null;
    }

    /**
     * Returns the matrix values of the given column.
     * @param {Integer} col 
     */
    getColumn(col) {
        var column = new Array();

        if (col < this.width) {
            for (var row = 0; row < this.height; row++) {
                column.push(this.data[row][col]);
            }
        }

        return column;
    }
    /**
     * Returns the matrix values of the given row.
     * @param {Integer} row
     * @returns row as array, empty array if the given row argument is out of matrix scope. 
     */
    getRow(row) {
        if (row < this.height) {
            return this.data[row];
        }
        return [];
    }

    /**
     * Set matrix value at the given row and column
     * @param {Integer} row 
     * @param {Integer} col
     * @param {Number} value
     * @returns This matrix
     */
    setValue(row, col, value) {
        if (row < this.height && col < this.width) {
            this.data[row][col] = value;
        }
        return this;
    }

    /**
     * Set matrix data
     * @param {array} data 2 dimensional array containing the matrix data 
     * @returns this matrix
     */
    setData(data) {
        let cnt = 0;
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                this.data[row][col] = data[cnt++];
            }
        }
        return this;
    }

    /**
     * Returns the matrix as a string in order to log it to the console
     * @param {Integer} decimals number of decimals to be printed 
     * @returns the matrix data
     */
    print(decimals) {

        let result = "";
        let rowContent = "";
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                rowContent += (this.data[row][col]).toFixed(decimals) + " ; "
            }
            result += rowContent + "\r\n";
            rowContent = "";
        }
        return result;
    }

    /** 
     * Returns the data as non typed 2D array
     * @returns Matrix data as non typed 2D array
     */
    as2DArray() {
        let result = [];

        for (let row = 0; row < this.height; row++) {
            result[row] = [];
            for (let col = 0; col < this.width; col++) {
                result[row].push(this.data[row][col]);
            }
        }
        return result;
    }

    getRow(rowIndex) {
        return this.data[rowIndex];
    }

    mergeRow(texelRowOrig, texelRowCopy, copyComponent, targetComponent) {
        let length = Math.min(texelRowOrig.length, texelRowCopy.length);
        let copyOffset = 0;

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

        for (let cnt = 4; cnt < length; cnt += 4) {

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
        let result = new Float32Array(4 * this.height * this.width);
        let cnt = 0;

        if (component === undefined) {
            component = "R";
        }

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;

                switch (component) {
                    //R component of RGBA color
                    case 'R':
                        result[cnt - 4] = this.data[row][col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = this.data[row][col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = this.data[row][col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = this.data[row][col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }

    getResultMatrixDimensions(matrixB) {
        let thisHeight = this.height;
        let otherWidth = matrixB.width;

        return {
            height: thisHeight,
            width: otherWidth
        };
    }

    /**
	 * multiply2Texture multiplies two matrices and stores the multiplication result in a texture.
     * 
     * @param {MatrixStorage} matrixStorage -   MatrixStorage containing the matrices
     * @param {integer} componentAIndex -   value between 0 and 3. The componentA value specifies the first matrix to take from the matrix storage for multiplication
     * @param {integer} componentBIndex -   value between 0 and 3. The componentB value specifies the second matrix to take from the matrix storage for multiplication
     * @param {ResultDimension} resultDimensions -  Dimension of result matrix. MatrixA x MatrixB = ResultMatrix
     * @return {Texture} - The result of the matrix multiplication stored in a texture
    */

    static multiply2Texture(matrixA, matrixB) {
        let matrixStorage = new MatrixStorage();
        
        //prepare the storage of the two matrices in a single texture
        matrixStorage.store(matrixA, 'R');
        matrixStorage.store(matrixB, 'G');

        let program = new Program( matrixStorage.maxRows, matrixStorage.maxColumns);
        let gl = program.gl;

        //width input texture = maxwidth(matrixA,matrixB,...), height of input texture = maxheight(matrixA,matrixB,...)
        let inputTexture = TextureFactory.createTextureByDimension(gl, "inputTexture", matrixStorage.maxRows, matrixStorage.maxColumns, matrixStorage.getTexels());

        let vertexShader = ShaderFactory.createVertexShader(gl, ShaderCode.getCode("VERTEX"));
        let fragmentShader = ShaderFactory.getFragmentShader(gl, ShaderCode.getCode("SINGLE"));
        program.buildProgram(vertexShader, fragmentShader);

        let result = program.multiplySingleTexture(inputTexture, matrixA.getResultMatrixDimensions(matrixB), 0, 1, 0);

        inputTexture.delete();
        program.delete();
        ShaderFactory.delete(gl,vertexShader);
        ShaderFactory.delete(gl,fragmentShader);
        program.delete();

        result.gl = gl;
        return result;
    }

    /**
	 * converts the given texture containing matrix values to a matrix object
     * 
     * @param {Texture} texture -   Texture to read matrix values from
     * @return {Integer} sourceIndex - The component index (R,G,B,A) to read the values from
    */
    static texture2matrix(gl,texture, sourceIndex) {
        
        let dimension = { width: texture.width, height: texture.height };
        let readableTexture = TextureFactory.createReadableTexture(gl, 'readableTexture', dimension);
        let resultReader = new ResultReader(gl, texture.width, texture.height);
        let result = resultReader.readByResultDimension(texture, readableTexture, dimension, sourceIndex);

        readableTexture.delete();
        return result;
    }

    /**
	 * multiply this matrix by the given matrix and return the matrix multiplication result as new matrix
     * 
     * @param {Matrix} matrixB -   The matrix to be multiplied with this matrix
     * @return {Texture} - The result of the matrix multiplication stored in a texture
    */
    multiply(matrixB) {
        let resultTexture = Matrix.multiply2Texture(this,matrixB);
        let result = Matrix.texture2matrix(resultTexture.gl,resultTexture, 0); //0 stands for index of component 'R'

        return result;
    }
}


