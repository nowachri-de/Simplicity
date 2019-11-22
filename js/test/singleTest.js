var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
describe('CodeGenerator', function () {
  it('Many functions and function calls', function () {
    Kernel.create(function main(a = []) {
      return test(a);
    }, function test(a = []) {
      return test2(a);
    }, function test2(a = []) {
      return a[this.thread.x];
    }).setOutput([2, 1])([1.0, 2.0]);
    //assert.fail('expected exception not thrown'); // this throws an AssertionError
  });
 
});
