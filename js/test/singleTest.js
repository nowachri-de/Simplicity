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

  it('Test mix function, functionReference, function, functionReference ', function () {
    let test = Kernel.create(
      function test(a = 0.){
        return a;
      },
      [derivativeSigmoid],
      function test2(a = 0.){
        return a;
      },
      [sigmoidActivation],
      function main(i = []) {
        let a = derivativeSigmoid(i[this.thread.x]);
        let b = sigmoidActivation(i[this.thread.x]);
        let c = test(b); 
        let d = test2(c);
        return a+b+c+d;
      }
    ).setOutput([3, 1]);

    let jsResult = [];
    for (let i = 1; i <= 3; i++) {
      let a = derivativeSigmoidJS(i);
      let b = sigmoidActivationJS(i);
      jsResult.push(a+b+b+b); 
    }

    TestUtil.compare1DArray(test([1, 2, 3]).result(), [2.193175792694092, 0.6423912644386292, -3.142277717590332]);
    TestUtil.compare1DArray(jsResult, [2.193175792694092, 0.6423912644386292, -3.142277717590332]);
    test.delete();
  });
});
