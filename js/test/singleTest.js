var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
describe('CodeGenerator', function () {
    it('Test self summation using 1D array', function () {
        Kernel.create(function main(x = []) {
          return x[this.thread.x] + x[this.thread.x];
        }).setOutput([2, 2])([1., 2.]);
      });
});
