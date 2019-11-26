var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('CodeGenerator', function () {
  it('Test iterating 2d array', function () {
    let test = Kernel.create(function main(y = [[]]) {
        return y[this.thread.x][this.thread.y];
    }).setOutput([5, 2]);
    console.log(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result());
    TestUtil.compare2DArray(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result(), [[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]);
    test.delete();
});
});
