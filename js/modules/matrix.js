const { Program } = require(__dirname + "\\program.js");
const { Shader } = require(__dirname + "\\shader.js");
const { ShaderCode } = require(__dirname + "\\shadercode.js");
const { ResultReader }= require(__dirname + "\\resultreader.js");
const { MatrixStorage }= require(__dirname + "\\matrixstorage.js");
const { TextureFactory } = require(__dirname + "\\texturefactory.js");

module.exports.Matrix = class Matrix {

    constructor(rows, columns) {
        this.height = rows;
        this.width = columns;
        this.resultTexture = null;

        this.rows = new Array();
        for (var row = 0; row < this.height; row++) {
            this.rows.push(new Float32Array(columns));
        }
    }

    zeroInitialize() {
        for (var col = 0; col < this.width; col++) {
            for (var row = 0; row < this.height; row++) {
                this.rows[row][col] = 0;
            }
        }
    }

    randomInitialize() {
        for (var col = 0; col < this.width; col++) {
            for (var row = 0; row < this.height; row++) {
                this.rows[row][col] = Math.random();
            }
        }
        return this.rows;
    }

    getValue(row, col) {
        if (row < this.height && col < this.width) {
            return this.rows[row][col];
        }
        return null;
    }

    getColumn(col) {
        var column = new Array();

        if (col < this.width) {
            for (var row = 0; row < this.height; row++) {
                column.push(this.rows[row][col]);
            }
        }

        return column;
    }

    getRow(row) {
        if (row < this.height) {
            return this.row[row];
        }
        return [];
    }

    setValue(row, col, value) {
        if (row < this.height && col < this.width) {
            this.rows[row][col] = value;
        }
        return value;
    }

    setData(f32Array) {
        var cnt = 0;
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.rows[row][col] = f32Array[cnt++];
            }
        }
    }

    print(decimals) {
        if (decimals === undefined)
            decimals = 15;

        var result = "";
        var rowContent = "";
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                rowContent += (this.rows[row][col]).toFixed(decimals) + " ; "
            }
            console.log(rowContent);
            rowContent = "";
        }
        return result;
    }

    as2DArray() {
        var result = [];

        for (var row = 0; row < this.height; row++) {
            result[row] = [];
            for (var col = 0; col < this.width; col++) {
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

        var result = new Float32Array(4 * this.height * this.width);
        var cnt = 0;

        if (component === undefined) {
            component = "R";
        }

        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
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
        var thisHeight = this.height;
        var otherWidth = matrixB.width;

        var result = {
            height: thisHeight,
            width: otherWidth
        };

        return result;
    }

    /**
	 * multiply2Texture multiplies two matrices from a matrix storage to a texture. The resulting texture will be returned.
     * 
     * @param {MatrixStorage} matrixStorage -   MatrixStorage containing the matrices
     * @param {integer} componentA -   value between 0 and 3. The componentA value specifies the first matrix to take from the matrix storage for multiplication
     * @param {integer} componentB -   value between 0 and 3. The componentB value specifies the second matrix to take from the matrix storage for multiplication
     * @param {ResultDimension} resultDimension -  Dimension of result matrix. MatrixA x MatrixB = ResultMatrix
    */

    static multiply2Texture(matrixStorage, componentAIndex, componentBIndex, resultDimensions) {

        let program = new Program(resultDimensions.width, resultDimensions.height);
        let textureFactory = new TextureFactory(program.gl);

        let inputTexture = textureFactory.createTextureByDimension("inputTexture", resultDimensions.width, resultDimensions.height, matrixStorage.getTexels());
        let resultTexture = textureFactory.createResultTexture('resultTexture', resultDimensions);

        let gl = program.gl;
        let vertexShader = Shader.getVertexShader(gl, ShaderCode.getCode("VERTEX"));
        let fragmentShader = Shader.getFragmentShader(gl, ShaderCode.getCode("SINGLE"));


        program.buildProgram(vertexShader, fragmentShader);
        program.compute2(inputTexture, resultTexture, resultDimensions, componentAIndex, componentBIndex, 0);

        inputTexture.free();
        Shader.free(gl, vertexShader);
        Shader.free(gl, fragmentShader);
        program.free();

        return resultTexture;
    }


    multiply(matrixB) {
        let t0 = Date.now();
        let matrixStorage = new MatrixStorage();

        matrixStorage.reset();
        matrixStorage.store(this, 'R');
        matrixStorage.store(matrixB, 'G');

        let program = new Program(this.width, this.height);
        let gl = program.gl;

        let textureFactory = new TextureFactory(gl);
        let outputDimensions = matrixStorage.getOutputDimensions();

        let inputTexture = textureFactory.createTextureByDimension("inputTexture", matrixStorage.maxRows, matrixStorage.maxColumns, matrixStorage.getTexels());
        let resultTexture = textureFactory.createResultTexture('resultTexture', outputDimensions);
        let readableTexture = textureFactory.createReadableTexture('readableTexture', outputDimensions);


        let vertexShader = Shader.getVertexShader(gl, ShaderCode.getCode("VERTEX"));
        let fragmentShader = Shader.getFragmentShader(gl, ShaderCode.getCode("SINGLE"));
        program.buildProgram(vertexShader, fragmentShader);
        var computationResult = program.compute2(inputTexture, resultTexture, outputDimensions, 0, 1);

        var matrixDimension = this.getOutputDimensions(matrixB);
        var resultDimension = {
            width: matrixDimension.width,
            height: matrixDimension.height
        }
        var resultReader = new ResultReader(gl, resultDimension.width, resultDimension.height);
        var result = resultReader.readByResultDimension(computationResult.resultTexture, readableTexture, resultDimension, 0);

        program.free();
        program.gl.deleteTexture(inputTexture.texture);
        program.gl.deleteTexture(resultTexture.texture);

        var t1 = Date.now();
        result.duration = t1 - t0;
        return result;
    }

    set height(rows) {
        this._height = rows;
    }

    get height() {
        return this._height;
    }

    get width() {
        return this._width;
    }

    set width(cols) {
        this._width = cols;
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


