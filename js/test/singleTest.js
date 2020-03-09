"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const { TextureFactory} = require('./../modules/texturefactory.js');

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

describe('', function () {
  after(function() {
    TextureFactory.logReferenceCount();
  });
  it('', function () {
    let test = Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] / y[this.thread.x][this.thread.y];
    }).setOutput([2, 2]);
    
    TestUtil.compare2DArray(test([[3., 5.], [3., 5.]], [[3., 5.], [3., 5.]]).result(), [[1, 1], [1, 1]]);
    TextureFactory.logReferenceCount();
    test.delete();
    TextureFactory.logReferenceCount();
  });
});
