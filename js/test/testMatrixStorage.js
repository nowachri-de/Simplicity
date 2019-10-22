const {Matrix} = require(__dirname + '\\..\\modules\\matrix.js');
const {MatrixStorage} = require(__dirname + '\\..\\modules\\matrixstorage.js');


const math = require('mathjs');
const assert = require('assert');

describe('MatrixStorage', function () {
  describe('#store(Matrix,targetComponent)', function () {
    it('should store four matrices using the store method', function () {
      let matrixA = new Matrix(2, 2);//rows, columns
      let matrixB = new Matrix(2, 2);//rows, columns
     

      matrixA.randomInitialize();
      matrixB.randomInitialize();
     
     
      Matrix.multiply2Texture(matrixA,matrixB);
      
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
  var outputDimensions = matrixA.getResultMatrixDimensions(matrixB);
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
