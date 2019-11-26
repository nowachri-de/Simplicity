var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');

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

});