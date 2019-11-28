var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('Single Test', function () {
    it('Validate division', function () {
        let test = Kernel.create(function main(a = []) {
          return int(a[this.thread.x]) / int(3);
        }).setOutput([10, 1]);
    
        console.log(test([1, 2, 3, 4,5,6,7,8,9,10]).result());
        
        test.delete();
      });
});