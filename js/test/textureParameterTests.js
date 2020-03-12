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
        let texture = Util.data2Texture1D([2, 5], 2, sharedGL);

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
        let textureA = Util.data2Texture1D([5, 5], 2, sharedGL);
        let textureB = Util.data2Texture1D([5, 5], 2, sharedGL);

        let textureKernel = Kernel.create(function main(a = [], b = []) {
            return a[this.thread.x] * b[this.thread.x];
        }).setOutput([2, 1]).setGL(sharedGL);
        TestUtil.compare1DArray(textureKernel(textureA, textureB).result(), [25, 25]);

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

        let sharedGL = Program.createGl(100, 100);
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

        let textureMatrixA = Util.data2Texture2D(matrixA.data, 4, 4, sharedGL);
        let textureMatrixB = Util.data2Texture2D(matrixB.data, 4, 4, sharedGL);
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
        TestUtil.compare2DArray(matrixA.multiply(matrixB).data, matrixMultiplicationKernel(textureMatrixA, textureMatrixB, textureMatrixA.width).result());
        textureMatrixA.delete();
        textureMatrixB.delete();
        matrixMultiplicationKernel.delete();
    });

    it('Test if large matrix (500x500) multiplication using textures as parameters works and validate result', function () {
        this.timeout(0);//disable timeout;

        let sharedGL = Program.createGl(500, 500);
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

        let textureMatrixA = Util.data2Texture2D(matrixA.data, 500, 500, sharedGL);
        let textureMatrixB = Util.data2Texture2D(matrixB.data, 500, 500, sharedGL);
        validateMultiplicationResult(matrixA, matrixB, matrixA.multiply(matrixB));
        TestUtil.compare2DArray(matrixA.multiply(matrixB).data, matrixMultiplicationKernel(textureMatrixA, textureMatrixB, textureMatrixA.width).result());
        textureMatrixA.delete();
        textureMatrixB.delete();
        matrixMultiplicationKernel.delete();
    });

    it('Use texture as argument and change output dimension', function () {
        this.timeout(0);//disable timeout
        let texture1 = Util.data2Texture2D([[1, 2], [3, 4]], 2, 2);
        let texture2 = Util.data2Texture2D([[5, 6], [7, 8]], 2, 2, texture1.gl);

        let texture3 = Util.data2Texture2D(
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
                [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
                [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
                [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
                [91, 92, 93, 94, 95, 96, 97, 98, 99, 100],
            ], 10, 10, texture1.gl);

        let texture4 = Util.data2Texture2D(
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
                [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
                [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
                [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
                [91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
            ], 10, 10, texture1.gl);

        let textureKernel = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
        }).setOutput([2, 2]).setGL(texture1.gl);

        //check texture1
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture1, 0), [[1, 2], [3, 4]]);
        //check texture2
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture2, 0), [[5, 6], [7, 8]]);

        //check texture3
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture3, 0),
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
                [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
                [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
                [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
                [91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
            ]);
        //check texture4
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture4, 0),
            [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
                [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
                [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
                [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
                [91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
            ]);


        TestUtil.compare2DArray(textureKernel(texture1, texture2).result(), [[5, 12], [21, 32]]);

        textureKernel.setOutput([10, 10]);
        TestUtil.compare2DArray(textureKernel(texture3, texture4).result(),
            [
                [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
                [121, 144, 169, 196, 225, 256, 289, 324, 361, 400],
                [441, 484, 529, 576, 625, 676, 729, 784, 841, 900],
                [961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600],
                [1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500],
                [2601, 2704, 2809, 2916, 3025, 3136, 3249, 3364, 3481, 3600],
                [3721, 3844, 3969, 4096, 4225, 4356, 4489, 4624, 4761, 4900],
                [5041, 5184, 5329, 5476, 5625, 5776, 5929, 6084, 6241, 6400],
                [6561, 6724, 6889, 7056, 7225, 7396, 7569, 7744, 7921, 8100],
                [8281, 8464, 8649, 8836, 9025, 9216, 9409, 9604, 9801, 10000]
            ]);
        
        textureKernel.delete();
        texture1.delete();
        texture2.delete();
        texture3.delete();
        texture4.delete();
    });

});
