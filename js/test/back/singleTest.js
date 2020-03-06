const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady } = require('../modules/browserready.js');

browserReady();
function sigmoidActivation(i = 0.) {
  return 1 / (1 + pow(2.71828182845904523536, -i));
}
function derivativeSigmoid(i = 0.) {
  return i - pow(i, 2.);
}
//will be executed on CPU as javascript function
function derivativeSigmoidJS(out) {
  return out - Math.pow(out, 2);
}

//will be executed on CPU as javascript function
function sigmoidActivationJS(i) {
  return 1 / (1 + Math.pow(Math.E, -i));
}

describe('SingleTest', function () {

 

});
