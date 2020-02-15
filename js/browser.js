const { Matrix } = require('./modules/matrix');
const { matrix, index, multiply } = require('mathjs');

window.test =function test(){
    var matrixA = new Matrix(4, 4);
    var matrixB = new Matrix(4, 4);

    matrixA.sequenzeInitialize();
    matrixB.oneInitialize();
    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    console.log(matrixA.multiply(matrixB).print(3));
}
function jsMatMul(matrixA, matrixB) {
    var mat1 = matrix(matrixA.as2DArray());
    var mat2 = matrix(matrixB.as2DArray());
  
    var result = multiply(mat1, mat2);
    return result;
  }
  
  function validateMultiplicationResult(matrixA, matrixB, result) {
    var outputDimensions = matrixA.getResultMatrixDimensions(matrixB);
    var TOLERANCE = 0.001;
    if (outputDimensions.height != result.height) {
      throw "result row dimension " + "does not match expected dimension";
    }
    var jsResult = jsMatMul(matrixA, matrixB);
    for (var row = 0; row < result.height; ++row) {
      for (var column = 0; column < result.width; ++column) {
        var jsValue = jsResult.subset(index(row, column));
        var value = result.getValue(row, column);
  
        if (Math.abs(jsValue - value) > TOLERANCE) {
          throw "matrix multiplication result is wrong " + value + " does not match math.js matric multiplication value of " + jsValue;
        }
      }
    }
  }
  
  function isEqual(matrixA, matrixB) {
    var TOLERANCE = 0.001;
    var jsResult = matrix(matrixB.as2DArray());
    for (var row = 0; row < matrixA.height; ++row) {
      for (var column = 0; column < matrixA.width; ++column) {
        var jsValue = jsResult.subset(index(row, column));
        var value = matrixA.getValue(row, column);
  
        if (Math.abs(jsValue - value) > TOLERANCE) {
          throw "not equal. " + value + " does not match value " + jsValue;
        }
      }
    }
  }