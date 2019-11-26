var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('CodeGenerator', function () {
    it('Many functions and function calls - pass array to internal function', function () {
        let test = Kernel.create(
          function main(a=[[]]) {
            return test(a);
          },
          function test(a=[[]]) {
            return test2(a);
          },
          function test2(a=[[]]) {
            return a[this.thread.x][this.thread.y];
          }
        ).setOutput([5, 2]);
        console.log(test([[1,2,3,4,5],[1,2,3,4,5]]).result());
        //TestUtil.compare1DArray(test([1,2,3,4,5],[[1,2,3,4,5],[1,2,3,4,5]]).result(), [1,2,3,4,5]);
        test.delete();
      });
});
