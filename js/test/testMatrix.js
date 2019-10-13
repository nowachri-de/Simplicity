const Matrix = require(__dirname + '\\..\\modules\\matrix.js');

const math = require('mathjs');
var assert = require('assert');

describe('Matrix', function () {
  describe('#multiply(Matrix)', function () {
    it('should return a x b. Matrix a and Matrix b are same size', function () {
      var matrixA = new Matrix.Matrix(200, 200);
      var matrixB = new Matrix.Matrix(200, 200);

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });
  describe('#multiply(Matrix)', function () {
    it('should return a x b. Matrix a and Matrix b are not same size', function () {
      var matrixA = new Matrix.Matrix(10, 10);//rows, columns
      var matrixB = new Matrix.Matrix(10, 1);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });
  describe('#multiply(Matrix)', function () {
    it('should return a x b. Matrix a and Matrix b are not same size', function () {
      var matrixA = new Matrix.Matrix(3, 10);//rows, columns
      var matrixB = new Matrix.Matrix(10, 10);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should return a x b repeated multiple times. Matrix a and Matrix b are not same size', function () {
      var matrixA = new Matrix.Matrix(3, 10);//rows, columns
      var matrixB = new Matrix.Matrix(10, 10);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });
  describe('#multiply(Matrix)', function () {
    it('should multiply matrix a with matrix b 100 times. Different matrix dimensions', function () {
      this.timeout(0);//disable timeout
      var matrixA = new Matrix.Matrix(3, 200);//rows, columns
      var matrixB = new Matrix.Matrix(200, 10);//rows, columns
      for (let i = 0; i < 100; i++) {
        //Do random initialization
        matrixA.randomInitialize();
        matrixB.randomInitialize();
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      }
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should multiply matrix a with matrix b 10 times. Same matrix dimensions', function () {
      this.timeout(0);//disable timeout
      var matrixA = new Matrix.Matrix(200, 200);//rows, columns
      var matrixB = new Matrix.Matrix(200, 200);//rows, columns
      for (let i = 0; i < 10; i++) {
        //Do random initialization
        matrixA.randomInitialize();
        matrixB.randomInitialize();
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      }
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
