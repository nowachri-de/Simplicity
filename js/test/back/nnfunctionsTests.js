"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
//const { Simplicity } = require('../modules/nn/simplicity.js');

browserReady();

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}
function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}
describe('Neuronal Network Tests', function () {


    it('Test sigmoidActivation function', function () {
        let test = Kernel.create(
            [function sigmoidActivation(i = 0.) {
                return 1 / (1 + pow(2.71828182845904523536, -i));
            }],
            function main(i=[]) {
              return sigmoidActivation(i[this.thread.x]);
            }
        ).setOutput([3, 1]);
        
        let jsResult = [];
        for(let i=1; i <= 3;i++){
            jsResult.push(sigmoidActivation(i))
        }
        TestUtil.compare1DArray(test([1,2,3]).result(), [0.7310585975646973, 0.8807970285415649, 0.9525741934776306]);
        TestUtil.compare1DArray(jsResult, [0.7310585975646973, 0.8807970285415649, 0.9525741934776306]);
        test.delete();
    });
    
    it('Test derivativeSigmoid function', function () {
        let test = Kernel.create(
            [ function derivativeSigmoid(i = 0.) {
                return i - pow(i, 2.);
            }],
            function main(i=[]) {
              return derivativeSigmoid(i[this.thread.x]);
            }
        ).setOutput([3, 1]);

        let jsResult = [];
        for(let i=1; i <= 3;i++){
            jsResult.push(derivativeSigmoid(i))
        }

        TestUtil.compare1DArray(test([1,2,3]).result(), [0 ,-2, -6]);
        TestUtil.compare1DArray(jsResult, [0 ,-2, -6]);
        test.delete();
    });
   
});
