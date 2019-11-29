var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('Single Test', function () {
  it('Validate individual function result', function () {
    let test = Kernel.create(
      function main() {
        test2();
        return  1.0;
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
      function test5(){
        test6();
        return 5.0;
      },
      function test6(){
        test7();
        return 6.0;
      },
      function test7(){
        test8();
        return 7.0;
      },
      function test8(){
        test9();
        return 8.0;
      },
      function test9(){
        test10();
        return 9.0;
      },
      function test10(){
        return 10.0;
      }
    ).setOutput([5, 5]);

    test()
    console.log(test.result('main'));
    console.log(test.result('test'));
    console.log(test.result('test1'));
    console.log(test.result('test2'));
    console.log(test.result('test3'));
    //TestUtil.compare2DArray(test().result('test'), [[3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3]]);
    //TestUtil.compare2DArray(test().result('main'), [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4]]);
    test.delete();
  });
});