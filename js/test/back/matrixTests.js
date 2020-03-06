const { Matrix } = require('../modules/matrix.js');
const { matrix, index, multiply } = require('mathjs');
const { browserReady} = require('../modules/browserready.js');
const assert = require('assert');

browserReady();
describe('Matrix', function () {
  it('should add a column to matrix', function () {
    var matrixA = new Matrix(2, 2);
    matrixA.insertColumn(0, [0, 0]);
    matrixA.insertColumn(1, [1, 1]);
    let col0 = matrixA.getColumn(0);
    let col1 = matrixA.getColumn(1);
    let row0 = matrixA.getRow(0);
    let row1 = matrixA.getRow(1);

    assert.equal(col0[0], 0);
    assert.equal(col0[1], 0);
    assert.equal(col1[0], 1);
    assert.equal(col1[1], 1);

    assert.equal(row0[0], 0);
    assert.equal(row0[1], 1);
    assert.equal(row1[0], 0);
    assert.equal(row1[1], 1);
  });

  it('should throw an error since column index is out of scope', function () {
    var matrixA = new Matrix(2, 2);
    matrixA.insertColumn(0, [0, 0]);
    matrixA.insertColumn(1, [1, 1]);
    assert.throws(() => matrixA.insertColumn(2, [1, 1]));
  });

  it('should add a row to matrix', function () {
    var matrixA = new Matrix(2, 2);
    matrixA.insertRow(0, [0, 0]);
    matrixA.insertRow(1, [1, 1]);
    let col0 = matrixA.getColumn(0);
    let col1 = matrixA.getColumn(1);
    let row0 = matrixA.getRow(0);
    let row1 = matrixA.getRow(1);

    assert.equal(col0[0], 0);
    assert.equal(col0[1], 1);
    assert.equal(col1[0], 0);
    assert.equal(col1[1], 1);

    assert.equal(row0[0], 0);
    assert.equal(row0[1], 0);
    assert.equal(row1[0], 1);
    assert.equal(row1[1], 1);
  });

  it('should return a string representation of the matrix with 3 desimals', function () {
    var matrixA = new Matrix(4, 4).randomInitialize();
    assert.ok(matrixA.print(3).length > 0);
  });

  it('should return a string representation of the matrix with 0 desimals', function () {
    var matrixA = new Matrix(4, 4).randomInitialize();
    assert.ok(matrixA.print(0).length > 0);
  });

  it('should return 4 x 4.', function () {
    var matrixA = new Matrix(4, 4);
    var matrixB = new Matrix(4, 4);

    assert.equal(matrixA.getResultMatrixDimensions(matrixB).width, 4);
    assert.equal(matrixA.getResultMatrixDimensions(matrixB).height, 4);
  });

  it('should return 3 x 1.', function () {
    var matrixA = new Matrix(3, 1);
    var matrixB = new Matrix(3, 3);

    assert.equal(matrixA.getResultMatrixDimensions(matrixB).width, 3);
    assert.equal(matrixA.getResultMatrixDimensions(matrixB).height, 1);
  });

  it('should cause matrixB to be the same as matrix A', function () {
    var matrixA = new Matrix(3, 3).randomInitialize();
    var matrixB = new Matrix(3, 3).setData(matrixA.as2DArray());

    isEqual(matrixA, matrixB);
  });

  it('should cause matrixB to be the same as matrix A', function () {
    var matrixA = new Matrix(1, 10).randomInitialize();
    var matrixB = new Matrix(1, 10).setData(matrixA.as2DArray());

    isEqual(matrixA, matrixB);
  });

  it('should cause matrixB to be the same as matrix A', function () {
    var matrixA = new Matrix(10, 10).randomInitialize();
    var matrixB = new Matrix(10, 10).setData(matrixA.as2DArray());

    isEqual(matrixA, matrixB);
  });

  it('should cause matrixB to be the same as matrix A', function () {
    var matrixA = new Matrix(10, 1).randomInitialize();
    var matrixB = new Matrix(10, 1);
    matrixB.setData(matrixA.as2DArray());

    isEqual(matrixA, matrixB);
  });

  it('should return a x b. Matrix a and Matrix b are same size (4x4)', function () {
    var matrixA = new Matrix(4, 4);
    var matrixB = new Matrix(4, 4);

    matrixA.sequenzeInitialize();
    matrixB.oneInitialize();
    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });
  it('should return a x b. Matrix a (4x1) and Matrix b (1x4))', function () {
    var matrixA = new Matrix(4, 1).randomInitialize();//rows, columns
    var matrixB = new Matrix(1, 4).randomInitialize();//rows, columns

    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });
  it('should return a x b. should return a x b. Matrix a (20x5) and Matrix b (1x20))', function () {
    var matrixA = new Matrix(20, 5).randomInitialize();//rows, columns
    var matrixB = new Matrix(1, 20).randomInitialize();//rows, columns

    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });
  it('should return a x b. should return a x b. Matrix a (20x5) and Matrix b (15x20))', function () {
    var matrixA = new Matrix(20, 5).randomInitialize();//rows, columns
    var matrixB = new Matrix(15, 20).randomInitialize();//rows, columns

    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });

  it('should multiply matrix a (200x200) with matrix b (200x200) using random initialization and validate the result', function () {
    this.timeout(0);//disable timeout
    var matrixA = new Matrix(200, 200);//rows, columns
    var matrixB = new Matrix(200, 200);//rows, columns
    
    matrixA.randomInitialize();
    matrixB.randomInitialize();
    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });

  it('should multiply matrix a (200x200) with matrix b (200x200) using sequence initialization and validate the result', function () {
    this.timeout(0);//disable timeout
    var matrixA = new Matrix(200, 200);//rows, columns
    var matrixB = new Matrix(200, 200);//rows, columns
    
    matrixA.sequenzeInitialize(10000); //the given parameter is used as a factor and causes the sequence numbers to be devided by the given number 
    matrixB.sequenzeInitialize(10000); 
    validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
  });

  it('should multiply matrix a (200x3) with matrix b (10x200) 10 times.', function () {
    this.timeout(0);//disable timeout
    var matrixA = new Matrix(200, 3);//rows, columns
    var matrixB = new Matrix(10, 200);//rows, columns

    for (let i = 0; i < 10; i++) {
      matrixA.randomInitialize();
      matrixB.randomInitialize();
      validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
    }
  });

  it('should multiply matrix a (200x200) with matrix b (200x200) 10 times. No validation', function () {
    this.timeout(0);//disable timeout
    var matrixA = new Matrix(200, 200);//rows, columns
    var matrixB = new Matrix(200, 200);//rows, columns
    for (let i = 0; i < 10; i++) {
      matrixA.randomInitialize();
      matrixB.randomInitialize();
      matrixA.multiply(matrixB)
    }
  });

  it('should multiply matrix a (500x500) with matrix b (500x500). No validation', function () {
    this.timeout(0);//disable timeout
    var matrixA = new Matrix(500, 500);//rows, columns
    var matrixB = new Matrix(500, 500);//rows, columns

    matrixA.randomInitialize();
    matrixB.randomInitialize();
    matrixA.multiply(matrixB);
  });

 
});

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
