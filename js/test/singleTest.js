var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('Single Test', function () {
  it('Validate individual function result', function () {
    let test = Kernel.create(
      function main() {
        test();
        return  1;
      },
      function test() {
        test1();
        return  2;
      },
      function test1() {
        test2();
        return  3;
      },
      function test2() {
        return  4;
      }
    ).setOutput([5, 5]);

    console.log(test().result('main'));
    console.log(test().result('test'));
    console.log(test().result('test1'));
    console.log(test().result('test2'));

    //TestUtil.compare2DArray(test().result('test'), [[3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3]]);
    //TestUtil.compare2DArray(test().result('main'), [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4]]);
    test.delete();
  });
});