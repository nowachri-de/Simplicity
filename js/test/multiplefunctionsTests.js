const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserReady.js');

browserReady();
describe('Test multiple function definitions - call function in function', function () {
  it('Test multiple functions', function () {
    this.timeout(0);//disable timeout
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
        return a[this.thread.x] + b[this.thread.y][this.thread.x];
      }
    ).setOutput([5, 1]);

    TestUtil.compare1DArray(test([1, 2, 3, 4, 5], [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]]).result(), [2, 4, 6, 8, 10]);
    test.delete();
  });

  it('Validate passing internally multiple arrays as well as float parameter', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return test(a, a, 1.0);
    }, function test(b = [[]], c = [[]], x = 0.) {
      return b[this.thread.y][this.thread.x] + c[this.thread.y][this.thread.x] + x;
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

  it('Validate individual function results of 16 functions in total', function () {
    this.timeout(0);//disable timeout
    let test = Kernel.create(
      function main() {
        test2();
        return 1.0;
      },
      function test2() {
        test3();
        return 2.0;
      },
      function test3() {
        test4();
        return 3.0;
      },
      function test4() {
        test5();
        return 4.0;
      },
      function test5() {
        test6();
        return 5.0;
      },
      function test6() {
        test7();
        return 6.0;
      },
      function test7() {
        test8();
        return 7.0;
      },
      function test8() {
        test9();
        return 8.0;
      },
      function test9() {
        test10();
        return 9.0;
      },
      function test10() {
        test11();
        return 10.0;
      },
      function test11() {
        test12();
        return 11.0;
      },
      function test12() {
        test13();
        return 12.0;
      },
      function test13() {
        test14();
        return 13.0;
      },
      function test14() {
        test15();
        return 14.0;
      },
      function test15() {
        test16();
        return 15.0;
      },
      function test16() {
        return 16.0;
      }
    ).setOutput([5, 5]);

    test()
    TestUtil.compare2DArray(test.result('main'),
      [[1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1]]);
    TestUtil.compare2DArray(test.result('test2'),
      [[2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2]]);
    TestUtil.compare2DArray(test.result('test3'),
      [[3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3]]);
    TestUtil.compare2DArray(test.result('test4'),
      [[4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4]]);
    TestUtil.compare2DArray(test.result('test5'),
      [[5, 5, 5, 5, 5],
      [5, 5, 5, 5, 5],
      [5, 5, 5, 5, 5],
      [5, 5, 5, 5, 5],
      [5, 5, 5, 5, 5]]);
    TestUtil.compare2DArray(test.result('test6'),
      [[6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6]]);
    TestUtil.compare2DArray(test.result('test7'),
      [[7, 7, 7, 7, 7],
      [7, 7, 7, 7, 7],
      [7, 7, 7, 7, 7],
      [7, 7, 7, 7, 7],
      [7, 7, 7, 7, 7]]);
    TestUtil.compare2DArray(test.result('test8'),
      [[8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8]]);
    TestUtil.compare2DArray(test.result('test9'),
      [[9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9]]);
    TestUtil.compare2DArray(test.result('test10'),
      [[10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10]]);
    TestUtil.compare2DArray(test.result('test11'),
      [[11, 11, 11, 11, 11],
      [11, 11, 11, 11, 11],
      [11, 11, 11, 11, 11],
      [11, 11, 11, 11, 11],
      [11, 11, 11, 11, 11]]);
    TestUtil.compare2DArray(test.result('test12'),
      [[12, 12, 12, 12, 12],
      [12, 12, 12, 12, 12],
      [12, 12, 12, 12, 12],
      [12, 12, 12, 12, 12],
      [12, 12, 12, 12, 12]]);
    TestUtil.compare2DArray(test.result('test13'),
      [[13, 13, 13, 13, 13],
      [13, 13, 13, 13, 13],
      [13, 13, 13, 13, 13],
      [13, 13, 13, 13, 13],
      [13, 13, 13, 13, 13]]);
    TestUtil.compare2DArray(test.result('test14'),
      [[14, 14, 14, 14, 14],
      [14, 14, 14, 14, 14],
      [14, 14, 14, 14, 14],
      [14, 14, 14, 14, 14],
      [14, 14, 14, 14, 14]]);
    TestUtil.compare2DArray(test.result('test15'),
      [[15, 15, 15, 15, 15],
      [15, 15, 15, 15, 15],
      [15, 15, 15, 15, 15],
      [15, 15, 15, 15, 15],
      [15, 15, 15, 15, 15]]);
    TestUtil.compare2DArray(test.result('test16'),
      [[16, 16, 16, 16, 16],
      [16, 16, 16, 16, 16],
      [16, 16, 16, 16, 16],
      [16, 16, 16, 16, 16],
      [16, 16, 16, 16, 16]]);
  
    test.delete();
  });

});

