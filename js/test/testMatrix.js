const Matrix = require(__dirname + '\\..\\modules\\matrix.js');

const math = require('mathjs');
var assert = require('assert');

describe('Matrix', function () {
  describe('#multiply(Matrix)', function () {
    it('should return a x b. Matrix a and Matrix b are same size (4x4)', function () {
      var matrixA = new Matrix.Matrix(4, 4);
      var matrixB = new Matrix.Matrix(4, 4);
      //Do random initialization
      matrixA.sequenzeInitialize();
      matrixB.oneInitialize();
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should return a x b. Matrix a (4x1) and Matrix b (1x4))', function () {
      var matrixA = new Matrix.Matrix(4, 1);//rows, columns
      var matrixB = new Matrix.Matrix(1, 4);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should return a x b. should return a x b. Matrix a (20x5) and Matrix b (1x20))', function () {
      var matrixA = new Matrix.Matrix(20, 5);//rows, columns
      var matrixB = new Matrix.Matrix(1, 20);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });
  describe('#multiply(Matrix)', function () {
    it('should return a x b. should return a x b. Matrix a (20x5) and Matrix b (15x20))', function () {
      var matrixA = new Matrix.Matrix(20, 5);//rows, columns
      var matrixB = new Matrix.Matrix(15, 20);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should multiply matrix a (200x3) with matrix b (10x200) 10 times. Different matrix dimensions', function () {
      this.timeout(0);//disable timeout
      var matrixA = new Matrix.Matrix(200, 3);//rows, columns
      var matrixB = new Matrix.Matrix(10, 200);//rows, columns
      for (let i = 0; i < 10; i++) {
        //Do random initialization
        matrixA.randomInitialize();
        matrixB.randomInitialize();
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
      }
    });
  });

  describe('#multiply(Matrix)', function () {
    it('should multiply matrix a (200x200) with matrix b (200x200) 10 times. Same matrix dimensions', function () {
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

  describe('#multiply(Matrix)', function () {
    it('should multiply matrix a (500x500) with matrix b (500x500)', function () {
      this.timeout(0);//disable timeout
      var matrixA = new Matrix.Matrix(500, 500);//rows, columns
      var matrixB = new Matrix.Matrix(500, 500);//rows, columns

      //Do random initialization
      matrixA.randomInitialize();
      matrixB.randomInitialize();

      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
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
  if (outputDimensions.height != result.height) {
    throw "result row dimension " + "does not match expected dimension";
  }
  var jsResult = jsMatMul(matrixA, matrixB);
  for (var row = 0; row < result.height; ++row) {
    for (var column = 0; column < result.width; ++column) {
      var jsValue = jsResult.subset(math.index(row, column));
      var value = result.getValue(row, column);

      if (Math.abs(jsValue - value) > TOLERANCE) {
        throw "matrix multiplication result is wrong " + value + " does not match math.js matric multiplication value of " + jsValue;
      }
    }
  }
}
