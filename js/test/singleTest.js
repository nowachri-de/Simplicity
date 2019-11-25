var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
describe('CodeGenerator', function () {
  it('', function () {
    let test = Kernel.create(function main(a = []) {
      return a[this.thread.x];}).setOutput([2, 1]);
    test([1.0, 2.0]);
    console.log(test.getResult());
    test.delete();
    //assert.fail('expected exception not thrown'); // this throws an AssertionError
  });
 
});
