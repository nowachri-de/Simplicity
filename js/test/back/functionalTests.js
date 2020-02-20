const { Kernel } = require('./../modules/kernel.js');
const { TestUtil } = require('./../modules/testutil.js');
var assert = require('assert');
const { browserReady} = require('./../modules/browserReady.js');

browserReady();

describe('Kernel functional tests', function () {

  it('Test variable declaration using expression as assigment pattern - 1', function () {
    let test = Kernel.create(function main() {
      let a = (2. * 3. * 4.) / 120.0;
      return a;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(), [[.2, .2, .2, .2, .2], [.2, .2, .2, .2, .2]]);
    test.delete();

  });

  it('Test variable declaration using expression as assigment pattern - 2', function () {
    let test = Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120.0;
      return a;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(), [[.2, .2, .2, .2, .2], [.2, .2, .2, .2, .2]]);
    test.delete();
  });

  it('Test variable declaration using expression as assigment pattern - 3', function () {
    let test = Kernel.create(function main(i = 0) {
      let a = i + (2 * 3 * 4);
      return a;
    }).setOutput([10, 1]);

    TestUtil.compare2DArray(test(1).result(), [24, 24, 24, 24, 24, 24, 24, 24, 24, 24]);
    test.delete();
  });

  it('Test variable declaration using expression as assigment pattern - 4', function () {
    let test = Kernel.create(function main() {
      let a = 2.0 * 3 * 4.0;
      return a;
    }).setOutput([2, 2]);
    TestUtil.compare2DArray(test().result(), [[24, 24], [24, 24]]);
    test.delete();
  });

  it('Test variable declaration using expression as assigment pattern - 5', function () {
    let test = Kernel.create(function main() {
      let a = 2.0 * 3.0 * 4.0;
      return a;
    }).setOutput([2, 2]);
    TestUtil.compare2DArray(test().result(), [[24, 24], [24, 24]]);
    test.delete();
  });

  it('Test variable declaration using expression as assigment pattern - 6', function () {
    let test = Kernel.create(function main(a = 0, b = [[]]) {
      let c = a + b[this.thread.y][this.thread.x] + (2.0 * 3.0 * 4.0);
      return c;
    }).setOutput([2, 2]);

    TestUtil.compare2DArray(test(1, [[1, 2], [3, 4]]).result(), [[26, 27], [28, 29]]);
    test.delete();
  });

  it('Test self substraction 1D array', function () {
    let test = Kernel.create(function main(x = []) {
      return x[this.thread.x] - x[this.thread.x];
    }).setOutput([5, 1]);
    TestUtil.compare1DArray(test([1., 2., 3., 4., 5.]).result(), [0, 0, 0, 0, 0]);
    test.delete();
  });

  it('Test Update expression - preincrement', function () {
    let test = Kernel.create(function main(i = 0) {
      let b = i;
      return ++b;
    }).setOutput([2, 2]);
    TestUtil.compare2DArray(test(1).result(), [[2, 2], [2, 2]]);
    test.delete();
  });

  it('should throw an exception since y is used but not declared', function () {
    try {
      Kernel.create(function main(x = 0) {
        y[x];
      }).setOutput([1, 1])(1, 1).delete();
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(":y undefined"));
    }
  });

  it('Validate that exception is thrown since y is not an array', function () {
    try {
      Kernel.create(function main(y = 0, x = 0, z = 0) {
        y[x][z];
      }).setOutput([1, 2])([1.0, 2.0], 2).delete();
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes('y is of type int but must be array type'));
    }
  });

  it('Validate that exception is thrown in case array is assigned to variable', function () {
    try {
      Kernel.create(function main(a = []) {
        let b = a;
      }).setOutput([2, 1])([1.0, 2.0]).delete();
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes('assignment of array to variable not supported'));
    }
  });

  it('Validate that updating a parameter of function "main" causes exception', function () {
    try {
      let test = Kernel.create(function main(i = 0) {
        let b = i++;
        return ++b;
      }).setOutput([2, 2]);
      TestUtil.compare2DArray(test(1).result(), [[3, 3], [3, 3]]);
      test.delete();
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes('update operation can not be performed on parameter of main function'));
    }
  });

  it('Validate that updating a parameter of an inner function does not cause exception - postincrement', function () {
    let test = Kernel.create(
      function main(i = 0) {
        return test(i);
      },
      function test(b = 0) {
        return b++;
      }).setOutput([2, 2]);
    TestUtil.compare2DArray(test(1).result(), [[1, 1], [1, 1]]);
    test.delete();
  });

  it('Validate that updating a parameter of an inner function does not cause exception - preincrement', function () {
    let test = Kernel.create(
      function main(i = 0) {
        return test(i);
      },
      function test(b = 0) {
        return ++b;
      }).setOutput([2, 2]);
    TestUtil.compare2DArray(test(1).result(), [[2, 2], [2, 2]]);
    test.delete();
  });

  it('Validate that updating a parameter of an inner function does not cause exception - predecrement', function () {
    let test = Kernel.create(
      function main(i = 0) {
        return test(i);
      },
      function test(b = 0) {
        return --b;
      }).setOutput([2, 2]);
    TestUtil.compare2DArray(test(1).result(), [[0, 0], [0, 0]]);
    test.delete();
  });

  it('Validate that kernel can handle float argument only', function () {
    let test = Kernel.create(function main(a = 0.) {
      return a;
    }).setOutput([3, 3]);

    test = test(1.0);
    TestUtil.compare2DArray(test.result(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    test.delete();
  });

  it('Validate that kernel can add constant to parameter', function () {
    let test = Kernel.create(function main(a = 0.) {
      return a + 9;
    }).setOutput([3, 3]);

    test = test(1.0);
    TestUtil.compare2DArray(test.result(), [[10, 10, 10], [10, 10, 10], [10, 10, 10]]);
    test.delete();
  });
});
