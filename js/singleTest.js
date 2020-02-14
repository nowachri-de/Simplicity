var assert = require('assert');
const { Matrix } = require(__dirname + '\\..\\modules\\matrix.js');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');
const { matrix, index, multiply } = require('mathjs');
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
  //console.log(jsResult);
  for (var row = 0; row < result.height; ++row) {
    for (var column = 0; column < result.width; ++column) {
      var jsValue = jsResult.subset(index(row, column));
      var value = result.getValue(row, column);

      if (Math.abs(jsValue - value) > TOLERANCE) {
        throw "matrix multiplication result is wrong " + value + " does not match math.js matrix multiplication value of " + jsValue;
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

  describe('Single Test', function () {
      it('Test iterating 1d array', function () {
        let test = Kernel.create(function main(a = [[]],b=[[]],width = 0) {
          let result = 0.;
          for(let j=0; j < 2048;j++){
              if (j == width) {break;}
              result +=  a[this.thread.y][j] *b[j][this.thread.x];
          }
          return result;
        }).setOutput([3,3]);
        //console.log(test([1., 2., 3., 4., 5.]).result());
        TestUtil.compare2DArray(test( [[1., 2., 3.],[1., 2., 3.],[1., 2., 3.]],
                                      [[1., 2., 3.],[1., 2., 3.],[1., 2., 3.]],3).result(), 
                                      [[6,12,18],[6,12,18],[6,12,18]]);
       
        test.delete();
    });

   it('Test matrix mult', function () {
      var matrixA = new Matrix(3, 3);
      var matrixB = new Matrix(3, 3);
      matrixA.sequenzeInitializePerRow();
      matrixB.sequenzeInitializePerRow();
      let result = matrixA.multiply(matrixB);
      console.log(result);
      validateMultiplicationResult(matrixA, matrixB, result);
  });
   
});