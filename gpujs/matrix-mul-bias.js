"use strict";
const { GPU, input, Input } = require('gpu.js');
const gpu = new GPU({
    mode: 'headlessgl'
});

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}

function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}

function update(oldweight, derivative, learningRate) {
    return oldweight - (derivative * learningRate);
}

function addBias(a, b) {
    return a + b[this.thread.y][this.thread.x];
}

function matMul(input, weights, height) {
    let sum = 0;
    for (let i = 0; i < height; i++) {
        sum += input[this.thread.y][i] * weights[i][this.thread.x];
    }
    return sum;
}

gpu.addFunction(matMul);
gpu.addFunction(addBias);
gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);

const softmax = gpu.createKernel(function (a) {
    let sum = 0;
    for (let i = 0; i < this.constants.outputSize; i++) {
        sum += Math.exp(a[i]);
    }
    return Math.exp(a[this.thread.x]) / sum;
}, {
        constants: {
            outputSize: 3
        }
    }
).setOutput([2]);


const feedForward = gpu.createKernelMap({
    net: function mul(dataIn, weights, numInputs) {
        let sum = 0;
        for (let i = 0; i < numInputs; i++) {
            sum += dataIn[i] * weights[i][this.thread.y];
        }
        return sum ;
    },
    dOut2dNet: function derivative(out) {
        return derivativeSigmoid(out);
    }

}, function (dataIn, weights, numInputs) {

    
    let net = mul(dataIn, weights, numInputs);
    let out = sigmoidActivation(net);
    derivative(out); //store for later use in backpropagation
    if (this.thread.y >= (numInputs-1) ) return 1.0;
    return out;
}).setOutput([1, 3]);

const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {

    let out = Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x], 2) * 0.5;
    derivative(outputs[this.thread.y][this.thread.x], targets[this.thread.y][this.thread.x]);
    return out;
}
).setOutput([3]);

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += dError[index];
    }
    return total;
}).setOutput([1]);



const backPropOutput = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet, prevOutput, learningRate) {
    let mod = Math.floor(((this.thread.x + (this.thread.y *3)) / 3));
    let weight = weights[this.thread.x][this.thread.y]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let dEOut2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
    let dOdN = dOut2dNet[this.thread.x];  //this is dOut2dNet
    let pOut = prevOutput[this.thread.x];  //this is dNetOut2dWeight
    
    return mod;
    //return weight - (learningRate * (dEOut2dOut * dOdN * pOut)); //updated weight
}).setOutput([2, 3]); //[num weights per input neuron, num target neurons + 1 bias]

const backPropHidden = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet) {
    let weight = weights[this.thread.x][this.thread.y]; //this is column wise matrix iteration
    let error = dEtot2dOut[this.thread.y];
    let dOdN = dOut2dNet[this.thread.y];
    //let pOut   = prevLayer[this.thread.y];

    return error * dOdN * weight;
}).setOutput([2, 3]);


const sumUp = gpu.createKernel(function (matrix, dOut2dNet, input, weights, learningRate, height) {
    let sum = matrix[this.thread.y][this.thread.x];
    for (let i = 1; i < height; ++i) {
        sum += matrix[(this.thread.y + i) % height][this.thread.x];
    }

    let result = sum * dOut2dNet[this.thread.y] * input[this.thread.y];
    result = weights[this.thread.x][this.thread.y] - (learningRate * result);
    return result;
}).setOutput([2, 3]);

let learningRate = .5;
let w1 = [  [.15, .25], 
            [.20, .30], 
            [.35, .35]]; //last row are biases
let w2 = [  [.4, .5], 
            [.45, .55], 
            [.60, .60]];   //last row are biases

let dataIn = [[.05, .10, 1.0]];             
let target = [[.01, .99,1]];

var e;
var l1ff;
var l2ff
var bpO;

l1ff = feedForward(dataIn, w1,3);
l2ff = feedForward(l1ff.result, w2,3);
e = error(l2ff.result, target);
bpO = backPropOutput(w2,e.dEtot2dOut,l2ff.dOut2dNet,l1ff.result,learningRate);
bph =sumUp(backPropHidden(w2,e.dEtot2dOut,l2ff.dOut2dNet),l1ff.dOut2dNet,dataIn,w1,learningRate);

console.log("l1ff:");
console.log(l1ff);

console.log("l2ff:");
console.log(l2ff);

console.log("error:");
console.log(e);

console.log("bpO:");
console.log(bpO);



softmax.destroy();
feedForward.destroy();
backPropOutput.destroy();
backPropHidden.destroy();
errorTot.destroy();
error.destroy();