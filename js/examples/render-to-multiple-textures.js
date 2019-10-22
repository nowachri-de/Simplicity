const { ShaderCode } = require(__dirname + "\\..\\modules\\ShaderCode.js");
const { Program } = require(__dirname + "\\..\\modules\\program.js");
const { Shader } = require(__dirname + "\\..\\modules\\shader.js");
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

    resultTexture = TextureFactory.createResultTexture(gl, 'resultTexture', outputDimensions);
    testTexture = TextureFactory.createResultTexture(gl, 'testTexture', outputDimensions);
    var frameBuffer = FrameBufferFactory.createFrameBufferMultiAttachement(gl, resultTexture,testTexture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
    program.doBindings2(inputTexture, outputDimensions, program.program, 0, 1, 0);

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
    let vertexShader = Shader.getVertexShader(gl, ShaderCode.getCode("VERTEX"));
    let fragmentShader = Shader.getFragmentShader(gl, ShaderCode.getCode("SINGLE"));
    program.buildProgram(vertexShader, fragmentShader);

    //let computationResult = program.multiplySingleTexture(inputTexture, outputDimensions, 0, 1);
    let resultTexture = multiply(gl,inputTexture,program,outputDimensions);

    console.log(Matrix.texture2matrix(gl,testTexture,0));

   
}
var matrixA = new Matrix(4, 4).randomInitialize();
var matrixB = new Matrix(4, 4).randomInitialize();
test(matrixA, matrixB);