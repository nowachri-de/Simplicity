const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');

describe('Test loops', function () {
  it('Test if while loop gets translated to glsl syntax propperly', function () {
    let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      while (b < a) {
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(),[ [ 10, 10 ], [ 10, 10 ] ]);
    test.delete();
  });

  it('Test if while loop gets translated to glsl propperly', function () {
   let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      for (let i = 0; i < a; i++) {
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(),[ [ 20, 20 ], [ 20, 20 ] ]);
    test.delete();
  });

});