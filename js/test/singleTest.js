var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');

describe('CodeGenerator', function () {
    it('Test mixed input function parameters. Use parameters in simple math operation', function () {
       let test = Kernel.create(function main(a = [[]], b = 0, c = 0.) {
          return a[this.thread.x][this.thread.y] + b + c;
        }).setOutput([3, 3])([[1, 1, 1], [2, 2, 2], [3, 3, 3]], 10, 11).delete();
      });
});
