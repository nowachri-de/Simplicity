"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');

browserReady();

describe('Matt Mazure Test', function () {
    it('Test M', function () {
        Kernel.addFunction(function test(e = 0.0) {
            return 1 / (1 + exp(e));
        });
        let test = Kernel.create(function main(out = 0.0) {
            return 1 / (1 + exp(out));
        }

        ).setOutput([3, 1]);
        console.log(test.fragmentShaderCode);
        TestUtil.compare1DArray(test(5).result(), [0.006692850962281227, 0.006692850962281227, 0.006692850962281227]);
        test.delete();
    });

    /* it('It should create backPropOutput Kernel', function () {
         const backPropOutput = Kernel.create(
             function main(weights = [[]], dEtot2dOut = [], dOut2dNet= [], prevOutput= [], learningRate = 0.) {
                 //X,Y   W    dETot2dOut  dNet2dWeight
                 //0,0  0,0        0           0
                 //1,0  0,1        1           1
                 //0,1  1,0        0           0
                 //1,1  1,1        1           1
                 //0,2  2,0        0           0
                 //1,2  2,1        1           1
         
                 let weight = weights[this.thread.y][this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
                 let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
                 let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
                 let dNet2dWeight = prevOutput[this.thread.x];  //this is dNetOut2dWeight
                 return weight - (learningRate * (dETot2dOut * dOut2dNet_ * dNet2dWeight)); //updated weight
             }
         );
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
     });*/
});
