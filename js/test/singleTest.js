var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\TestUtil.js');

describe('Single Test', function () {
  it('Validate individual function result', function () {
    let test = Kernel.create(
      function main() {
        return test(3.0) + 1;
      },
      function test(a = 0.) {
        return a;
      }
    ).setOutput([5, 5]);

    console.log(test().result('test'));
    //TestUtil.compare2DArray(test().result('test'), [[3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3], [3, 3, 3, 3, 3]]);
    //TestUtil.compare2DArray(test().result('main'), [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4]]);
    test.delete();
  });
});