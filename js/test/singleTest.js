var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
describe('CodeGenerator', function () {
  it('should throw an exception since variable is not initialized', function () {

    try {
      Kernel.create(function main() {
        let x;
      }).setOutput([1, 1])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(':Variable declarator must be initialized'));
    }
  });
 
});
