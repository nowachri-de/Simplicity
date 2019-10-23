const { ShaderCode } = require(__dirname + "\\..\\modules\\ShaderCode.js");
const { Program } = require(__dirname + "\\..\\modules\\program.js");
const { ShaderFactory } = require(__dirname + "\\..\\modules\\shader.js");
const { ResultReader } = require(__dirname + "\\..\\modules\\resultreader.js");
const { MatrixStorage } = require(__dirname + "\\..\\modules\\matrixstorage.js");
const { TextureFactory } = require(__dirname + "\\..\\modules\\texturefactory.js");
const { FrameBufferFactory } = require(__dirname + "\\..\\modules\\framebufferfactory.js");
const { Matrix } = require(__dirname + "\\..\\modules\\matrix.js");

let resultTexture;
let testTexture;

function multiply(gl,inputTexture,program,outputDimensions){
    gl.useProgram(program);
    gl.viewport(0, 0, outputDimensions.width, outputDimensions.height);

    resultTexture = TextureFactory.createReadableTexture(gl, 'resultTexture', outputDimensions);
    testTexture = TextureFactory.createReadableTexture(gl, 'testTexture', outputDimensions);
    var frameBuffer = FrameBufferFactory.createFrameBufferMultiAttachement(gl, resultTexture,testTexture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
    program.doSingleTextureBindings(inputTexture, outputDimensions, program.program, 0, 1, 0);

    gl.drawElements(gl.TRIANGLES, /*num items*/ 6, gl.UNSIGNED_SHORT, 0);
    resultTexture.frameBuffer = frameBuffer;

    return resultTexture;
}
function test(matrixA, matrixB) {
    let matrixStorage = new MatrixStorage();
    let program = new Program(matrixA.width, matrixA.height);
    let gl = program.gl;

    //prepare the storage of the two matrices in a single texture
    matrixStorage.reset();
    matrixStorage.store(matrixA, 'R');
    matrixStorage.store(matrixB, 'G');

    //width input texture = maxwidth(matrixA,matrixB,...), height of input texture = maxheight(matrixA,matrixB,...)
    let inputTexture = TextureFactory.createTextureByDimension(gl, "inputTexture", matrixStorage.maxRows, matrixStorage.maxColumns, matrixStorage.getTexels());
    let outputDimensions = matrixA.getResultMatrixDimensions(matrixB);
    let vertexShader = ShaderFactory.createVertexShader(gl, ShaderCode.getCode("VERTEX"));
    let fragmentShader = ShaderFactory.getFragmentShader(gl, ShaderCode.getCode("SINGLE"));
    program.buildProgram(vertexShader, fragmentShader);

    //let computationResult = program.multiplySingleTexture(inputTexture, outputDimensions, 0, 1);
    multiply(gl,inputTexture,program,outputDimensions);

    inputTexture.delete();
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    program.delete();

    console.log(Matrix.texture2matrix(gl,testTexture,0));

   
}
var matrixA = new Matrix(4, 4).randomInitialize();
var matrixB = new Matrix(4, 4).randomInitialize();
test(matrixA, matrixB);