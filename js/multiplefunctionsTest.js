const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');

describe('Test multiple function definitions - call function in function', function () {
  it('Test multiple functions', function () {
    let test = Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2]);

    TestUtil.compare2DArray(test().result(), [[0, 1], [0, 1]]);
    test.delete();
  });

  it('Test multiple functions', function () {
    let test = Kernel.create(function main(a = 0.) {
      return test(this.thread.x + a);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2]);
    TestUtil.compare2DArray(test(0.5).result(), [[.5, 1.5], [0.5, 1.5]]);
    test.delete();
  });

  it('Many functions and function calls - pass array to internal function', function () {
    let test = Kernel.create(
      function main(a = []) {
        return test(a);
      },
      function test(a = []) {
        return test2(a);
      },
      function test2(a = []) {
        return a[this.thread.x];
      }
    ).setOutput([5, 1]);

    TestUtil.compare1DArray(test([1, 2, 3, 4, 5]).result(), [1, 2, 3, 4, 5]);
    test.delete();
  });

  it('Many functions and function calls - pass 1d and 2d array to internal function', function () {
    let test = Kernel.create(
      function main(a = [], b = [[]]) {
        return test(a, b);
      },
      function test(a = [], b = [[]]) {
        return test2(a, b);
      },
      function test2(a = [], b = [[]]) {
        return a[this.thread.x] + b[this.thread.x][this.thread.y];
      }
    ).setOutput([5, 1]);

    TestUtil.compare1DArray(test([1, 2, 3, 4, 5], [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]]).result(), [2, 4, 6, 8, 10]);
    test.delete();
  });

  it('Validate passing internally multiple arrays as well as float parameter', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return test(a, a, 1.0);
    }, function test(b = [[]], c = [[]], x = 0.) {
      return b[this.thread.x][this.thread.y] + c[this.thread.x][this.thread.y] + x;
    }
    ).setOutput([2, 2]);

    TestUtil.compare2DArray(test([[1, 2], [1, 2]]).result(), [[3, 5], [3, 5]]);
    test.delete()
  });

  it('Passing this.thread.x + passed argument to internal function', function () {
    let test = Kernel.create(function main(a = 0.) {
      return test(this.thread.x + a);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([2, 2]);

    TestUtil.compare2DArray(test(5.).result(), [[5, 6], [5, 6]]);
    test.delete();
  });

  it('Passing this.thread.x to internal function - output dimension [5,2]', function () {
    let test = Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(), [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]]);
    test.delete();
  });

  it('Passing this.thread.x to internal function - output dimension [5,5]', function () {
    let test = Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([5, 5]);

    TestUtil.compare2DArray(test().result(), [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]]);
    test.delete();
  });

  it('Validate that update operation can be performed on inner function parameter', function () {
    let test = Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a++;
    }
    ).setOutput([5, 5]);

    TestUtil.compare2DArray(test().result(), [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]]);
    test.delete();
  });

  it('Passing this.thread.x to internal function - output dimension [5,5]', function () {
    let test = Kernel.create(function main() {
      return test(this.thread.x);
    }, function test(a = 0.0) {
      return a;
    }
    ).setOutput([5, 5]);

    TestUtil.compare2DArray(test().result(), [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]]);
    test.delete();
  });

  it('Using function for variable initialization', function () {
    let test = Kernel.create(function main(i = 0.0) {
      let a = test(i) + 1;
      a++;
      return a;
    }, function test(a = 0.0) {
      return a++;
    }
    ).setOutput([5, 1]);

    TestUtil.compare1DArray(test(2).result(), [4, 4, 4, 4, 4]);
    test.delete();
  });

  it('Validate individual function result', function () {
    let test = Kernel.create(
      function main() {
        return test(3.0) + 1;
      },
      function test(a = 0.) {
        return a;
      }
    ).setOutput([5, 5]);

    TestUtil.compare2DArray(test().result('test'), [[3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3]]);
    TestUtil.compare2DArray(test().result('main'), [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4]]);
    test.delete();
  });

});

