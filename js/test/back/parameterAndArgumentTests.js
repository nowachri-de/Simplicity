var assert = require('assert');
const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserready.js');

browserReady();
describe('Test parameters and arguments', function () {
    it('Validate exception if kernel is called with too many parameters - zero input parameters', function () {
        try {
            Kernel.create(function main() {
                let a = 2.0 * 3.0;
                return a;
            }).setOutput([2, 2])([[5, 5], [5, 5]]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'mismatch between number of declared function parameters and number of actually passed arguments');
        }
    });
    it('Validate exception if kernel is called with too many parameters - three input parameters', function () {
        try {
            Kernel.create(function main(a = 0, b = 0, c = 0.) {
                return a[this.thread.x][this.thread.y] + b + c;
            }).setOutput([3, 3])(1, 2, 3, 4).delete();

            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'mismatch between number of declared function parameters and number of actually passed arguments');
        }
    });
    it('Validate exception if kernel is called with too little parameters', function () {
        try {
            Kernel.create(function main(a = 0, b = 0, c = 0.) {
                return a[this.thread.x][this.thread.y] + b + c;
            }).setOutput([3, 3])(1, 2).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'mismatch between number of declared function parameters and number of actually passed arguments');
        }
    });
    it('Validate exception if kernel is called with wrong argument type - int instead of 2d array', function () {
        try {
            Kernel.create(function main(a = [[]]) {
                return a[this.thread.x][this.thread.y];
            }).setOutput([3, 3])(1).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'expected function argument 0 to be of type two dimensional array');
        }
    });
    it('Validate exception if kernel is called with wrong argument type - 2d array instead of int', function () {
        try {
            Kernel.create(function main(a = 0) {
                return a[this.thread.x][this.thread.y];
            }).setOutput([3, 3])([[1, 2], [1, 2]]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'expected function argument 0 to be of type integer');
        }
    });

    it('Validate exception if kernel is called with wrong argument type - 2d array instead of float', function () {
        try {
            Kernel.create(function main(a = 0.0) {
                return a;
            }).setOutput([3, 3])([[1, 2], [1, 2]]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'expected function argument 0 to be of type float');
        }
    });

    it('Validate exception if kernel is called with wrong argument type - 1d array instead of 2d array', function () {
        try {
            Kernel.create(function main(a = [[]]) {
                return a[this.thread.x][this.thread.y];
            }).setOutput([3, 3])([1]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'expected function argument 0 to be of type two dimensional array');
        }
    });

    it('Validate exception if kernel is called with wrong argument type - 2d array instead of 1d array', function () {
        try {
            Kernel.create(function main(a = []) {
                return a[this.thread.x];
            }).setOutput([3, 3])([[1], [2]]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'expected function argument 0 to be of type 1d array but is 2d array');
        }
    });

    it('Validate that kernel can handle float argument only', function () {
        let test = Kernel.create(function main(a = 0.) {
            return a;
        }).setOutput([3, 3])(1.0).delete();
    });

    it('Validate that kernel can handle int argument only', function () {
        let test = Kernel.create(function main(a = 0) {
            return a;
        }).setOutput([3, 3])(1.0).delete();
    });

    it('Validate that kernel returns correct result when only single parameter is specified', function () {
        let test = Kernel.create(function main(a = 0.) {
            return a;
        }).setOutput([3, 3]);
        test = test(1.0);
        TestUtil.compare2DArray(test.result(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
        test.delete();
    });

    it('Test mixed input function parameters. Use parameters in simple math operation', function () {
        let test = Kernel.create(function main(a = [[]], b = 0, c = 0.) {
            return a[this.thread.y][this.thread.x] + b + c;
        }).setOutput([3, 3]);
        TestUtil.compare2DArray(test([[1, 1, 1], [2, 2, 2], [3, 3, 3]], 10, 11).result(), [[22, 22, 22], [23, 23, 23], [24, 24, 24]]);
        test.delete();
    });

    it('Test 2D and 1D array as input parameter', function () {
        let test = Kernel.create(function main(a = [[]], b = []) {
            return a[this.thread.y][this.thread.x] + b[this.thread.x];
        }).setOutput([3, 3]);

        TestUtil.compare2DArray(test([[1, 1, 1], [2, 2, 2], [3, 3, 3]], [1, 1, 1]).result(), [[2, 2, 2], [3, 3, 3], [4, 4, 4]]);
        test.delete();
    });

    it('Test 1D array as input parameter', function () {
        let test = Kernel.create(function main(a = []) {
            return a[this.thread.x];
        }).setOutput([5, 1])
        TestUtil.compare2DArray(test([1., 2., 3., 4., 5]).result(), [1, 2, 3, 4, 5]);
    });

    it('Should throw exception since no parameters specified but function is called using parameters', function () {
        try {
            Kernel.create(function main() {
                let a = 2.0 * 3.0;
                return a;
            }).setOutput([2, 2])([[5, 5], [5, 5]]).delete();
            assert.fail('expected exception not thrown'); // this throws an AssertionError
        } catch (e) {
            assert.equal(e, 'mismatch between number of declared function parameters and number of actually passed arguments');
        }
    });


});