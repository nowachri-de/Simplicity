"use strict";
const { GPU } = require('gpu.js');
const gpu = new GPU({
    mode: 'headlessgl'
});

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}

function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}
function matrixmul(dataIn, weights, numInputs) {
    let sum = 0;
    for (let i = 0; i < numInputs; i++) {
        sum += dataIn[i] * weights[i][this.thread.y];
    }
    return sum;
}
const feedForward = gpu.createKernelMap({
    dOut2dNet: function dOut2dNet(out) {
        return derivativeSigmoid(out);
    }
}, function (dataIn, weights, numInputs, bias) {
    let out = sigmoidActivation(matrixmul(dataIn, weights, numInputs) + bias[this.thread.y]);
    dOut2dNet(out); //store for later use in backpropagation
    return out;
}).setOutput([1, 2]);//[always 1, num target neurons]

const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.y][this.thread.x], targets[this.thread.y][this.thread.x]);
    return Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x], 2) * 0.5;
}
).setOutput([3]); //num output neurons + 1 bias (bias error = 0;)

const flatten = gpu.createKernel(function (dETotSum) {
    return dETotSum[this.thread.x][0];
}).setOutput([2]); //[num neurons + 1 bias]
flatten.setDynamicOutput(true);


const backPropOutput = gpu.createKernel(
    function (weights, dEtot2dOut, dOut2dNet, prevOutput, learningRate) {
        //X,Y  O   W    Err
        //0,0  0  0,0    0
        //1,0  1  0,1    1
        //0,1  0  1,0    0
        //1,1  1  1,1    1
        //0,2  0  2,0    0
        //1,2  1  2,1    1

        let weight = weights[this.thread.y][this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
        let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
        let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
        let dNet2dWeight = prevOutput[this.thread.x];  //this is dNetOut2dWeight
        return weight - (learningRate * (dETot2dOut * dOut2dNet_ * dNet2dWeight)); //updated weight
    }).setOutput([2, 2]); //[num output neurons, num output neurons + 1 bias]

const updateBias = gpu.createKernel(
    function (bias, dEtot2dOut, dOut2dNet, learningRate) {
        //X,Y  O   W    Err
        //0,0  0  0,0    0
        //1,0  1  0,1    1
        //0,1  0  1,0    0
        //1,1  1  1,1    1
        //0,2  0  2,0    0
        //1,2  1  2,1    1

        let biasWeight = bias[this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
        let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
        let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
        return biasWeight - (learningRate * (dETot2dOut * dOut2dNet_)); //updated bias
    }).setOutput([2]); //num Bias
const computeDerivatives = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet) {
    //X,Y  O   W    Err
    //0,0  0  0,0    0         
    //1,0  1  0,1    1
    //0,1  0  1,0    0
    //1,1  1  1,1    1
    //0,2  0  2,0    0
    //1,2  1  2,1    1

    let dEtot2dOut_ = dEtot2dOut[this.thread.x];
    let dOut2dNet_ = dOut2dNet[this.thread.x];
    let dNet2dOprev_ = weights[this.thread.y][this.thread.x];

    return dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_;
}).setOutput([2, 2]); //[num output neurons, num output neurons + 1 bias] 
const backPropHidden = gpu.createKernelMap({
    dETotSum: function sum(derivatives) {
        let sum = 0;
        for (let i = 0; i < this.output.x; ++i) {
            sum += derivatives[this.thread.y][i];
        }
        return sum;
    },
    dEtot2dWeight: function dEtot2dWeight(dETot, dOut2dNet, input) {
        return dETot * dOut2dNet[this.thread.y] * input[this.thread.y];
    }
}, function (derivatives, dOut2dNet, input, weights, learningRate) {
    let dETot = sum(derivatives);
    let dETot2dOutPre = dEtot2dWeight(dETot, dOut2dNet, input);
    let updatedWeight = weights[this.thread.y][this.thread.x] - (learningRate * dETot2dOutPre);
    return updatedWeight;
}).setOutput([2, 2]); //[num output neurons, num output neurons + 1 bias] 

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += Math.sqrt(Math.pow(dError[index], 2));
    }
    return total;
}).setOutput([1]); //single value
let w1 = [[.15, .25], [.20, .30]];
let b1 = [[.35, .35]];

let w2 = [[.15, .25], [.20, .30]];
let b2 = [[.60, .60]];

let w3 = [[.4, .5]];
let b3 = [[.2]];

let w4 = [[.4, .5],[.45, .55]];
let b4 = [[.60, .60]];


let w5 = [[.4, .5],[.45, .55]];
let b5 = [[.60, .60]];

let dataIn = [[.05, .10]];
let target = dataIn;

gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);
gpu.addFunction(matrixmul);

let e, l1Out, l2Out, l3Out, l4Out,l5Out;
let learningRate = .5;
for (let j = 0; j < 100; ++j) {
    for (let i = 0; i < 100; ++i) {
        feedForward.setOutput([1, 2]);
        l1Out = feedForward(dataIn, w1, 2, b1);
        feedForward.setOutput([1, 2]);
        l2Out = feedForward(l1Out.result, w2, 2, b2);
        feedForward.setOutput([1, 1]);
        l3Out = feedForward(l2Out.result, w3, 2, b3);
        feedForward.setOutput([1, 2]);
        l4Out = feedForward(l3Out.result, w4, 1, b4);
        feedForward.setOutput([1, 2]);
        l5Out = feedForward(l4Out.result, w5, 2, b5);

        e = error(l5Out.result, target);

        let w5t = backPropOutput(w5, e.dEtot2dOut, l5Out.dOut2dNet, l4Out.result, learningRate);
        b5 = updateBias(b5, e.dEtot2dOut, l5Out.dOut2dNet, learningRate);

        let w4t = backPropHidden(computeDerivatives(w4, e.dEtot2dOut, l4Out.dOut2dNet), l4Out.dOut2dNet, l3Out.result, w4, learningRate);
        b4 = updateBias(b4, flatten(w4t.dETotSum), l4Out.dOut2dNet, learningRate);

        let w3t = backPropHidden(computeDerivatives(w3, flatten(w4t.dETotSum), l3Out.dOut2dNet), l3Out.dOut2dNet, l2Out.result, w3, learningRate);
        b3 = updateBias(b3, flatten(w3t.dETotSum), l3Out.dOut2dNet, learningRate);

        let w2t = backPropHidden(computeDerivatives(w2, flatten(w3t.dETotSum), l2Out.dOut2dNet), l2Out.dOut2dNet, l1Out.result, w2, learningRate);
        b2 = updateBias(b2, flatten(w2t.dETotSum), l2Out.dOut2dNet, learningRate);

        let w1t = backPropHidden(computeDerivatives(w1, flatten(w2t.dETotSum), l1Out.dOut2dNet), l1Out.dOut2dNet, dataIn, w1, learningRate);
        b1 = updateBias(b1, flatten(w1t.dETotSum), l1Out.dOut2dNet, learningRate);

        w5 = w5t;
        w4 = w4t.result;
        w3 = w3t.result;
        w2 = w2t.result;
        w1 = w1t.result;
        //w1 = w2t.result;
    }
    console.log(j * 100);
    console.log(errorTot(e.result, 2));
    console.log(l5Out.result);

}