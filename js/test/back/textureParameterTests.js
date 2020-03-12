"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const { TextureFactory } = require('./../modules/texturefactory.js');
const { Util } = require('./../modules/util.js');
const { Program } = require('./../modules/program.js');
const { Matrix } = require('./../modules/matrix.js');
const { matrix, index, multiply } = require('mathjs');

browserReady();

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
describe('', function () {
    after(function () {
        if (TextureFactory.getReferenceCount() !== 0) {
            TextureFactory.logReferenceCount();
            throw 'Expected reference count to be zero'
        }
    });
    it('Call kernel with 1D texture as argument', function () {
        this.timeout(0);//disable timeout;
        
        let sharedGL = Program.createGl(1, 1);
        let texture = Util.data2Texture1D([2, 5], 2,sharedGL);

        let textureKernel = Kernel.create(function main(a = []) {
            return a[this.thread.x];
        }).setOutput([2, 1]).setGL(sharedGL);
        TestUtil.compare1DArray(textureKernel(texture).result(), [2, 5]);

        textureKernel.delete();
        texture.delete();

    });
    it('Call kernel with 2 1D texture as argument', function () {
        this.timeout(0);//disable timeout;
        
        let sharedGL = Program.createGl(1, 1);
        let textureA = Util.data2Texture1D([5, 5], 2,sharedGL);
        let textureB = Util.data2Texture1D([5, 5], 2,sharedGL);

        let textureKernel = Kernel.create(function main(a = [],b=[]) {
            return a[this.thread.x] * b[this.thread.x];
        }).setOutput([2, 1]).setGL(sharedGL);
        TestUtil.compare1DArray(textureKernel(textureA,textureB).result(), [25, 25]);

        textureKernel.delete();
        textureA.delete();
        textureB.delete();
    });

    it('Call kernel with 2D texture as argument - 1', function () {
        this.timeout(0);//disable timeout;
        let texture = Util.data2Texture2D([[5, 5], [5, 5]], 2, 2);

        let textureKernel = Kernel.create(function main(a = [[]]) {
            let b = a[1][2];
            return b;
        }).setOutput([2, 2]).setGL(texture.gl);

        //check texture
        TestUtil.compare2DArray(Util.texture2array(texture.gl, texture, 0), [[5, 5], [5, 5]]);
        //check kernel result
        TestUtil.compare2DArray(textureKernel(texture).result(), [[5, 5], [5, 5]]);

        textureKernel.delete();
        texture.delete();

    });

    it('Call kernel with two 2D textures as argument', function () {
        this.timeout(0);//disable timeout;
        let texture1 = Util.data2Texture2D([[1, 2], [3, 4]], 2, 2);
        let texture2 = Util.data2Texture2D([[5, 6], [7, 8]], 2, 2, texture1.gl);

        let textureKernel = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
        }).setOutput([2, 2]).setGL(texture1.gl);

        //check texture1
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture1, 0), [[1, 2], [3, 4]]);
        //check texture2
        TestUtil.compare2DArray(Util.texture2array(texture2.gl, texture2, 0), [[5, 6], [7, 8]]);

        //check kernel result
        TestUtil.compare2DArray(textureKernel(texture1, texture2).result(), [[5, 12], [21, 32]]);

        textureKernel.delete();
        texture1.delete();
        texture2.delete();

    });

    it('Call kernel multiple times with two 2D textures as argument ', function () {
        this.timeout(0);//disable timeout
        let texture1 = Util.data2Texture2D([[1, 2], [3, 4]], 2, 2);
        let texture2 = Util.data2Texture2D([[5, 6], [7, 8]], 2, 2, texture1.gl);

        let textureKernel = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
        }).setOutput([2, 2]).setGL(texture1.gl);

        //check texture1
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture1, 0), [[1, 2], [3, 4]]);
        //check texture2
        TestUtil.compare2DArray(Util.texture2array(texture2.gl, texture2, 0), [[5, 6], [7, 8]]);

        //check kernel call multiple times
        for (let i = 0; i < 10; ++i) {
            TestUtil.compare2DArray(textureKernel(texture1, texture2).result(), [[5, 12], [21, 32]]);
        }

        textureKernel.delete();
        texture1.delete();
        texture2.delete();
    });

    it('Call kernel with 2D texture as argument - texture coming from another kernel', function () {
        this.timeout(0);//disable timeout;
        let sharedGL = Program.createGl(1, 1);

        let test = Kernel.create(function main(a = [[]]) {
            return a[this.thread.x][this.thread.y];
        }).setOutput([2, 2]).setGL(sharedGL);

        let textureKernel = Kernel.create(function main(a = [[]]) {
            let b = a[1][2];
            return b;
        }).setOutput([2, 2]).setGL(sharedGL);

        let texture = test([[5, 5], [5, 5]]).rawResult();
        TestUtil.compare2DArray(test.result(), [[5, 5], [5, 5]]);
        TestUtil.compare2DArray(textureKernel(texture).result(), [[5, 5], [5, 5]]);

        test.delete();
        textureKernel.delete();
        texture.delete();

    });


    it('Test if matrix multiplication using textures as parameters works and validate result', function () {
        this.timeout(0);//disable timeout;

        let sharedGL = Program.createGl(100,100);
        let matrixMultiplicationKernel = Kernel.create(function main(a = [[]], b = [[]], width = 0) {
            let result = 0.;
            for (let j = 0; j < 2048; j++) {
                if (j == width) break;
                result += a[this.thread.y][j] * b[j][this.thread.x];
            }
            return result;
        }).setOutput([4, 4]).setGL(sharedGL);

        var matrixA = new Matrix(4, 4);
        var matrixB = new Matrix(4, 4);

        matrixA.sequenzeInitialize();
        matrixB.oneInitialize();

        let textureMatrixA = Util.data2Texture2D(matrixA.data,4,4,sharedGL);
        let textureMatrixB = Util.data2Texture2D(matrixB.data,4,4,sharedGL);
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
        TestUtil.compare2DArray(matrixA.multiply(matrixB).data,matrixMultiplicationKernel(textureMatrixA,textureMatrixB,textureMatrixA.width).result());
        textureMatrixA.delete();
        textureMatrixB.delete();
        matrixMultiplicationKernel.delete();
    });

    it('Test if large matrix (500x500) multiplication using textures as parameters works and validate result', function () {
        this.timeout(0);//disable timeout;

        let sharedGL = Program.createGl(500,500);
        let matrixMultiplicationKernel = Kernel.create(function main(a = [[]], b = [[]], width = 0) {
            let result = 0.;
            for (let j = 0; j < 2048; j++) {
                if (j == width) break;
                result += a[this.thread.y][j] * b[j][this.thread.x];
            }
            return result;
        }).setOutput([500, 500]).setGL(sharedGL);

        var matrixA = new Matrix(500, 500);
        var matrixB = new Matrix(500, 500);

        matrixA.randomInitialize();
        matrixB.randomInitialize();

        let textureMatrixA = Util.data2Texture2D(matrixA.data,500,500,sharedGL);
        let textureMatrixB = Util.data2Texture2D(matrixB.data,500,500,sharedGL);
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
        TestUtil.compare2DArray(matrixA.multiply(matrixB).data,matrixMultiplicationKernel(textureMatrixA,textureMatrixB,textureMatrixA.width).result());
        textureMatrixA.delete();
        textureMatrixB.delete();
        matrixMultiplicationKernel.delete();
    });

});
