const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady } = require('../modules/browserready.js');
const { TextureFactory } = require('./../modules/texturefactory.js');

browserReady();
describe('Test loops', function () {
  after(function () {
    TextureFactory.logReferenceCount();
  });
  it('Test if while loop gets translated to glsl syntax propperly', function () {
    const test = Kernel.create(
      function dOut2dNet(outt = 0.) {
        return 1.0;//derivativeSigmoid(outt);
      },
      function main(dataIn = [], weights = [[]], numInputs = 0, bias = []) {
        let sum = 0.;
        let max = numInputs;
        let i = 0;


        for (let i = 0; i < 2048; i++) {
          dataIn[i];

        }/*
          let outt = sigmoidActivation(sum + bias[this.thread.x]);
          dOut2dNet(outt); //store for later use in backpropagation
          return outt;*/
        let a = dataIn[this.thread.x];
        let b = weights[this.thread.y][this.thread.x];
        let c = numInputs;
        let d = bias[this.thread.x];
        return sum;
      }


    );
    test.setOutput([2, 1]);
    //console.log(test.fragmentShaderCode);
    test([0.05, 0.1], [[0.15, 0.25], [0.2, 0.3]], 2, [0.3499999940395355, 0.3499999940395355]).result()
    console.log();
  })

  it('Test if for loop gets translated to glsl propperly', function () {
    let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      for (let i = 0; i < 2048; i++) {
        if (b >= a) {
          break;
        }
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(), [[10, 10], [10, 10]]);
    test.delete();
  });

  it('Test if for loop works with parameter', function () {
    let test = Kernel.create(function main() {
      let a = 10;
      let b = 0;
      for (let i = 0; i < 2048; i++) {
        if (b >= a) {
          break;
        }
        b += 2;
      }
      return b;
    }).setOutput([2, 2])();

    TestUtil.compare2DArray(test.result(), [[10, 10], [10, 10]]);
    test.delete();
  });

});
