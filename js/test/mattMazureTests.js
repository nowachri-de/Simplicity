"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');

browserReady();

describe('Matt Mazure Test', function () {
    it('Test sigmoidActivation function', function () {
        Kernel.addFunction(
            function sigmoidActivation(i = 0.) {
                return 1 / (1 + pow(2.71828182845904523536, -i));
            }
        );
        let test = Kernel.create(
            function main(i = 0.0) {
              return sigmoidActivation(i);
            }
        ).setOutput([3, 1]);
        //console.log(test.fragmentShaderCode);
        TestUtil.compare1DArray(test(5).result(), [0.9933071136474609, 0.9933071136474609, 0.9933071136474609]);
        test.delete();
    });
    
    it('Test derivativeSigmoid function', function () {
        Kernel.addFunction(
            function derivativeSigmoid(i = 0.) {
                return i - pow(i, 2.);
            }
        );
        let test = Kernel.create(
            function main(i = 0.0) {
              return derivativeSigmoid(i);
            }
        ).setOutput([3, 1]);
        TestUtil.compare1DArray(test(5).result(), [-20 ,-20, -20]);
        test.delete();
    });
 
     it('It should create feed forward Kernel', function () {
         const KernelFeedForward = Kernel.create(
             function dOut2dNet(out = 0.) {
                 return derivativeSigmoid(out);
             },
             function main (dataIn=[], weights=[[]], numInputs = 0, bias = 0.) {
                 let sum = 0;
                 for (let i = 0; i < numInputs; i++) {
                     sum += dataIn[i] * weights[i][this.thread.x];
                 }
                 let out = sigmoidActivation(sum + bias[this.thread.x]);
                 dOut2dNet(out); //store for later use in backpropagation
                 return out;
             }
         );
     });
});
