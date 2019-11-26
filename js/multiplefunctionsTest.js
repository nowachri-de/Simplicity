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

    TestUtil.compare2DArray(test([1,2,3,4,5]).result(), [1,2,3,4,5]);
    test.delete();
  });

});
