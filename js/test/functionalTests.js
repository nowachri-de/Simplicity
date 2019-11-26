var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');


describe('Kernel functional tests', function () {
  it('Validate that kernel returns correct result when only single parameter is specified', function () {
    let test = Kernel.create(function main(a = 0.) {
      return a;
    }).setOutput([3, 3]);
    test = test(1.0);
    TestUtil.compare2DArray(test.result(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    test.delete();
  });

  it('Validate that kernel returns correct result when multiple input function parameters of mixed type are used', function () {
    let test = Kernel.create(function main(weights = [[]], dEtot2dOut = [], dOut2dNet = [], prevOutput = [], learningRate = 0.) {
      let weight = weights[this.thread.y][this.thread.x];
      let dETot2dOut = dEtot2dOut[this.thread.x];
      let dOut2dNet_ = dOut2dNet[this.thread.x];
      let dNet2dWeight = prevOutput[this.thread.x];
      return weight - (learningRate * (dETot2dOut * dOut2dNet_ * dNet2dWeight)); //updated weight
    }).setOutput([2, 2]);
    test([[1, 2], [1, 2]], [1, 2], [1, 2], [1, 2], 0.5);
    TestUtil.compare2DArray(test.result(),[[0.5, -3], [1.5, -2]]);
    test.delete();
  });

  it('Test mixed input function parameters. Use parameters in simple math operation', function () {
    Kernel.create(function main(a = [[]], b = 0, c = 0.) {
      return a[this.thread.x][this.thread.y] + b + c;
    }).setOutput([3, 3])([[1, 1, 1], [2, 2, 2], [3, 3, 3]], 10, 11).delete();
  });

  it('Test 2D and 1D array as input parameter', function () {
    Kernel.create(function main(a = [[]], b = []) {
      return a[this.thread.x][this.thread.y] + b[this.thread.x];
    }).setOutput([3, 3])([[1, 1, 1], [2, 2, 2], [3, 3, 3]], [1, 1, 1]).delete();
  });

  it('Test 1D array as input parameter', function () {
    Kernel.create(function main(a = []) {
      return a[this.thread.x];
    }).setOutput([10, 1])([6., 7., 8., 9., 10]).delete();
  });

 

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = (2. * 3. * 4.) / 120.0;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120.0;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = 2 * 3 * 4;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = 2.0 * 3 * 4.0;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    Kernel.create(function main() {
      let a = 2.0 * 3.0 * 4.0;
      return a;
    }).setOutput([2, 2])().delete();
  });

  it('Test variable declaration using expression as assigment pattern', function () {
    //
    Kernel.create(function main() {
      let a = 2.0 * 3.0;
      return a;
    }).setOutput([2, 2])().delete();
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


  it('Test multiple functions', function () {
    Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2])().delete();
  });

  it('Test multiple functions', function () {
    Kernel.create(function main(a = 0.) {
      return test(this.thread.x + a);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2])(5.).delete();
  });

  it('Test self substraction 1D array', function () {
    Kernel.create(function main(x = []) {
      return x[this.thread.x] - x[this.thread.x];
    }).setOutput([2, 1])([1., 2.]).delete();
  });

  it('Test Update expression', function () {
    Kernel.create(function main(i = 0) {
      let b = i;
      return ++b;
    }).setOutput([2, 2])(1).delete();
  });

  it('Test created options using 2d array', function () {
    Kernel.create(function main(y = [[]]) {
      return y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]).delete();
  });

  it('Test created options using array', function () {
    Kernel.create(function main(y = []) {
      return y[this.thread.x];
    }).setOutput([1, 1])([1., 2., 3.]).delete();
  });

  it('Test created options using float parameter', function () {
    Kernel.create(function main(i = 0.) {
      return i;
    }).setOutput([1, 1])(1.0).delete();
  });

  it('Test created options using int parameter', function () {
    Kernel.create(function main(i = 0) {
      return i;
    }).setOutput([1, 1])(1).delete();
  });

  it('Test created options using array parameter', function () {
    Kernel.create(function main(y = []) {
      return y[this.thread.x];
    }).setOutput([1, 1])([1, 1]).delete();
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

  it('should throw an exception since y is not an array', function () {
    try {
      Kernel.create(function main(y = 0, x = 0, z = 0) {
        y[x][z];
      }).setOutput([1, 2])([1.0, 2.0], 2).delete();
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(':y is of type int but must be array type'));
    }
  });

  it('', function () {
    Kernel.create(function main(a = [[]]) {
      return a[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1, 5], [1, 5]]).delete();
  });

  it('', function () {
    Kernel.create(function main(a = []) {
      return a[this.thread.x];
    }).setOutput([2, 2])([1, 5]).delete();
  });

  it('', function () {
    Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2])().delete();
  });

  it('', function () {
    Kernel.create(function main(a = 0.) {
      return test(this.thread.x + a);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2])(5.).delete();
  });

  it('', function () {
    Kernel.create(function main(a = []) {
      return test(a);
    }, function test(b = []) {
      return b[this.thread.x];
    }
    ).setOutput([2, 2])([1, 2]).delete();
  });

  it('', function () {
    Kernel.create(function main(a = [[]]) {
      return test(a);
    }, function test(b = [[]]) {
      return b[this.thread.x][this.thread.y];
    }
    ).setOutput([2, 2])([[1, 2], [1, 2]]).delete();
  });

  it('', function () {
    Kernel.create(function main(a = [[]]) {
      return test(a, a, 1.0);
    }, function test(b = [[]], c = [[]], x = 0.) {
      return b[this.thread.x][this.thread.y] + c[this.thread.x][this.thread.y];
    }
    ).setOutput([2, 2])([[1, 2], [1, 2]]).delete();
  });

  it('Should throw an exception: assigment of array to variable not supported', function () {
    try {
      Kernel.create(function main(a = []) {
        let b = a;
      }).setOutput([2, 1])([1.0, 2.0]).delete();
    } catch (e) {

    }
    //assert.fail('expected exception not thrown'); // this throws an AssertionError
  });

  it('Many functions and function calls', function () {
    Kernel.create(function main(a = []) {
      return test(a);
    }, function test(a = []) {
      return test2(a);
    }, function test2(a = []) {
      return a[this.thread.x];
    }).setOutput([2, 1])([1.0, 2.0]).delete();
    //assert.fail('expected exception not thrown'); // this throws an AssertionError
  });

  it('', function () {
    let test = Kernel.create(function main(a = []) {
      return a[this.thread.x];
    }).setOutput([5, 1]);
    test([1.0, 2.0, 3.0, 4.0, 5.0]);
    console.log(test.result());
    test.delete();
    //assert.fail('expected exception not thrown'); // this throws an AssertionError
  });
  it('Validate that kernel can handle float argument only', function () {
    let test = Kernel.create(function main(a = 0.) {
      return a;
    }).setOutput([3, 3]);

    test = test(1.0);
    TestUtil.compare2DArray(test.result(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
  });
});
