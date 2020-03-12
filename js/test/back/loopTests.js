const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady } = require('../modules/browserready.js');
const { TextureFactory } = require('./../modules/texturefactory.js');

browserReady();
describe('Test loops and iterations', function () {
  after(function () {
    if (TextureFactory.getReferenceCount() !== 0) {
      throw 'Expected reference count to be zero'
    }
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
    test([0.05, 0.1], [[0.15, 0.25], [0.2, 0.3]], 2, [0.3499999940395355, 0.3499999940395355]).result();
    test.delete();
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

  it('Test iterating 2d array', function () {
    let test = Kernel.create(function main(y = [[]]) {
      return y[this.thread.y][this.thread.x];
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result(), [[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]);
    test.delete();
  });

  it('Test iterating 1d array', function () {
    let test = Kernel.create(function main(y = []) {
      return y[this.thread.x];
    }).setOutput([5, 1]);

    TestUtil.compare1DArray(test([1., 2., 3., 4., 5.]).result(), [1., 2., 3., 4., 5.]);
    test.delete();
  });

  it('Test iteration using a float parameter', function () {
    let test = Kernel.create(function main(i = 0.) {
      return i;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test(1.0).result(), [[1., 1., 1., 1., 1.], [1., 1., 1., 1., 1.]]);
    test.delete();
  });

  it('Test iteration using an int parameter', function () {
    let test = Kernel.create(function main(i = 0) {
      return i;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test(1).result(), [[1., 1., 1., 1., 1.], [1., 1., 1., 1., 1.]]);
    test.delete();
  });

  it('Test iterating 2 arrays', function () {
    let test = Kernel.create(function main(a = [[]], b = [[]]) {
      return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]], [[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result(), [[2., 4., 6., 8., 10.], [2., 4., 6., 8., 10.]]);
    test.delete();
  });

  it('Test iterating this.thread.x', function () {
    let test = Kernel.create(function main() {
      return this.thread.y;
    }).setOutput([5, 2]);

    TestUtil.compare2DArray(test().result(), [[0., 0., 0., 0., 0.], [1., 1., 1., 1., 1.]]);
    test.delete();
  });

  it('Test iterating vertical 1d array', function () {
    let test = Kernel.create(function main(y = [[]]) {
      return y[this.thread.y][this.thread.x];
    }).setOutput([1, 5]);

    TestUtil.compare2DArray(test([[1.], [2.], [3.], [4.], [5.]]).result(), [[1.], [2.], [3.], [4.], [5.]]);
    test.delete();
  });
});
