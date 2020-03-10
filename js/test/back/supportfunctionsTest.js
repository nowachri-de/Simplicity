"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const { TextureFactory} = require('./../modules/texturefactory.js');
//const { Simplicity } = require('../modules/nn/simplicity.js');

browserReady();

//will be executed on CPU as javascript function
function sigmoidActivationJS(i) {
  return 1 / (1 + Math.pow(Math.E, -i));
}

//will be executed on GPU as javascript function
function sigmoidActivation(i = 0.) {
  return 1. / (1. + pow(2.71828182845904523536, -i));
}

//will be executed on CPU as javascript function
function derivativeSigmoidJS(out) {
  return out - Math.pow(out, 2);
}

//will be executed on GPU as javascript function
function derivativeSigmoid(i = 0.) {
  return i - pow(i, 2.);
}

describe('Support Functions Tests', function () {
  after(function () {
    if (TextureFactory.getReferenceCount() !== 0) {
      throw 'Expected reference count to be zero'
    }
  });
  it('Test sigmoidActivation support function passed as function reference', function () {
    let test = Kernel.create([sigmoidActivation],
      function main(i = []) {
        return sigmoidActivation(i[this.thread.x]);
      }
    ).setOutput([3, 1]);

    let jsResult = [];
    for (let i = 1; i <= 3; i++) {
      jsResult.push(sigmoidActivationJS(i))
    }
    TestUtil.compare1DArray(test([1, 2, 3]).result(), [0.7310585975646973, 0.8807970285415649, 0.9525741934776306]);
    TestUtil.compare1DArray(jsResult, [0.7310585975646973, 0.8807970285415649, 0.9525741934776306]);
    test.delete();
  });

  it('Test derivativeSigmoid support function passed as function reference', function () {
    let test = Kernel.create([derivativeSigmoid],
      function main(i = []) {
        return derivativeSigmoid(i[this.thread.x]);
      }
    ).setOutput([3, 1]);

    let jsResult = [];
    for (let i = 1; i <= 3; i++) {
      jsResult.push(derivativeSigmoidJS(i))
    }

    TestUtil.compare1DArray(test([1, 2, 3]).result(), [0, -2, -6]);
    TestUtil.compare1DArray(jsResult, [0, -2, -6]);
    test.delete();
  });

  it('Test passing multiple support function references ', function () {
    let test = Kernel.create([derivativeSigmoid, sigmoidActivation],
      function main(i = []) {
        return derivativeSigmoid(i[this.thread.x]) + sigmoidActivation(i[this.thread.x]);;
      }
    ).setOutput([3, 1]);

    let jsResult = [];
    for (let i = 1; i <= 3; i++) {
      jsResult.push(derivativeSigmoidJS(i) + sigmoidActivationJS(i));
    }

    TestUtil.compare1DArray(test([1, 2, 3]).result(), [0.7310585786300049, -1.1192029220221178, -5.047425873177567]);
    TestUtil.compare1DArray(jsResult, [0.7310585786300049, -1.1192029220221178, -5.047425873177567]);
    test.delete();
  });

  it('Test mix function, functionReference, function, functionReference ', function () {
    let test = Kernel.create(
      function test(a = 0.) {
        return a;
      },
      [derivativeSigmoid],
      function test2(a = 0.) {
        return a;
      },
      [sigmoidActivation],
      function main(i = []) {
        let a = derivativeSigmoid(i[this.thread.x]);
        let b = sigmoidActivation(i[this.thread.x]);
        let c = test(b);
        let d = test2(c);
        return a + b + c + d;
      }
    ).setOutput([3, 1]);

    let jsResult = [];
    for (let i = 1; i <= 3; i++) {
      let a = derivativeSigmoidJS(i);
      let b = sigmoidActivationJS(i);
      jsResult.push(a + b + b + b);
    }

    TestUtil.compare1DArray(test([1, 2, 3]).result(), [2.193175792694092, 0.6423912644386292, -3.142277717590332]);
    TestUtil.compare1DArray(jsResult, [2.193175792694092, 0.6423912644386292, -3.142277717590332]);
    test.delete();
  });

});
