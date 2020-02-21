const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserready.js');

browserReady();
describe('Test loops', function () {
  /*it('Test if while loop gets translated to glsl syntax propperly', function () {
    let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      while (b < 2048) {
        if (b >= a){
          break;
        }
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(),[ [ 10, 10 ], [ 10, 10 ] ]);
    test.delete();
  });*/

  it('Test if while loop gets translated to glsl propperly', function () {
   let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      for (let i = 0; i < 2048; i++) {
        if (b >= a){
          break;
        }
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(),[ [ 10, 10 ], [ 10, 10 ] ]);
    test.delete();
  });

});
