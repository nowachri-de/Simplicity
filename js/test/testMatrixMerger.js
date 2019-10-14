const Matrix = require(__dirname + '\\..\\modules\\matrix.js');

const math = require('mathjs');
var assert = require('assert');

describe('MatrixMerger', function () {
  describe('#prepare(Matrix,targetComponent)', function () {
    it('should prepare four matrices using the prepare method', function () {
      var matrixA = new Matrix.Matrix(2, 2);//rows, columns
      var matrixB = new Matrix.Matrix(2, 2);//rows, columns
      var matrixC = new Matrix.Matrix(2, 2);//rows, columns
      var matrixD = new Matrix.Matrix(2, 2);//rows, columns

      matrixA.randomInitialize();
      matrixB.randomInitialize();
      matrixC.randomInitialize();
      matrixD.randomInitialize();
      
      matrixA.prepare(matrixA,'R');
      matrixA.prepare(matrixB,'G');
      matrixA.prepare(matrixC,'B');
      matrixA.prepare(matrixD,'A');
     
      matrixA.manyMultiply();
     
    
      let outputDimensions = matrixA.matrixMerger.getOutputDimensions();
      let result = matrixA.readResult(0,outputDimensions.numColumns,outputDimensions.numRows);
      console.log(result);
      validateMultiplicationResult(matrixA, matrixB, result);
    });
  });
});

function jsMatMul(matrixA, matrixB) {
  var mat1 = math.matrix(matrixA.as2DArray());
  var mat2 = math.matrix(matrixB.as2DArray());

  var result = math.multiply(mat1, mat2);
  return result;
}

function validateMultiplicationResult(matrixA, matrixB, result) {
  var outputDimensions = matrixA.getOutputDimensions(matrixB);
  var TOLERANCE = 0.0003;
  if (outputDimensions.numRows != result.numRows) {
    throw "result row dimension " + "does not match expected dimension";
  }
  var jsResult = jsMatMul(matrixA, matrixB);
  for (var row = 0; row < result.numRows; ++row) {
    for (var column = 0; column < result.numColumns; ++column) {
      var jsValue = jsResult.subset(math.index(row, column));
      var value = result.getValue(row, column);

      if (Math.abs(jsValue - value) > TOLERANCE) {
        throw "matrix multiplication result is wrong " + value + " does not match math.js matric multiplication value of " + jsValue;
      }
    }
  }
}
