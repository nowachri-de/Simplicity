const {Matrix} = require(__dirname + '\\..\\modules\\matrix.js');
const {MatrixStorage} = require(__dirname + '\\..\\modules\\matrixstorage.js');


const math = require('mathjs');
const assert = require('assert');

describe('MatrixStorage', function () {
  describe('#store(Matrix,targetComponent)', function () {
    it('should store four matrices using the store method', function () {
      let matrixA = new Matrix(2, 2);//rows, columns
      let matrixB = new Matrix(2, 2);//rows, columns
      let matrixC = new Matrix(2, 2);//rows, columns
      let matrixD = new Matrix(2, 2);//rows, columns
      let storage = new MatrixStorage();

      matrixA.randomInitialize();
      matrixB.randomInitialize();
      matrixC.randomInitialize();
      matrixD.randomInitialize();
      
      storage.store(matrixA,'R');
      storage.store(matrixB,'G');
      storage.store(matrixC,'B');
      storage.store(matrixD,'A');

      let outputDimensions = matrixA.getOutputDimensions(matrixB);
      Matrix.multiply2Texture(storage,matrixA.componentToIndex('R'),matrixA.componentToIndex('G'),outputDimensions);
      
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
