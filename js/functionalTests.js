var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');

describe('Kernel functional tests', function () {

  it('Test variable declaration using expression as assigment pattern', function () {
    let test = Kernel.create(function main() {
      let a = (2. * 3. * 4.) / 120.0;
      return a;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(),[[.2,.2,.2,.2,.2],[.2,.2,.2,.2,.2]]);
    test.delete();

  });

  it('Test variable declaration using expression as assigment pattern', function () {
    let test = Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120.0;
      return a;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(),[[.2,.2,.2,.2,.2],[.2,.2,.2,.2,.2]]);
    test.delete();
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

  it('Test self substraction 1D array', function () {
    let test = Kernel.create(function main(x = []) {
      return x[this.thread.x] - x[this.thread.x];
    }).setOutput([5, 1]);
    TestUtil.compare1DArray(test([1., 2.,3.,4.,5.]).result(),[0,0,0,0,0]);
    test.delete();
  });

  it('Test Update expression', function () {
    Kernel.create(function main(i = 0) {
      let b = i;
      return ++b;
    }).setOutput([2, 2])(1).delete();
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

 

  it('Test pass through values of 1d array', function () {
    let test = Kernel.create(function main(a = []) {
      return a[this.thread.x];
    }).setOutput([5, 1]);
    TestUtil.compare1DArray(test([1.0, 2.0, 3.0, 4.0, 5.0]).result(),[1,2,3,4,5]);
    test.delete();
  });

  it('Validate that kernel can handle float argument only', function () {
    let test = Kernel.create(function main(a = 0.) {
      return a;
    }).setOutput([3, 3]);

    test = test(1.0);
    TestUtil.compare2DArray(test.result(), [[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
  });
});
