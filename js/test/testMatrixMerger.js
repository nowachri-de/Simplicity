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
    });
  });
});