"use strict";
const { GPU } = require('gpu.js');
const gpu = new GPU({
    mode: 'headlessgl'
});

function weightIndexY(x, y, numInputNeurons, numTargetNeurons) {
    //return Math.floor(((y*2)+x))%3;
    return Math.floor(((y * numInputNeurons) + x)) % numTargetNeurons;
}

function neuronIndexY(x, y, numInputNeurons, numTargetNeurons) {
    //nx = y*2+x;
    //nx = Math.floor((y*2+x)/3);
    let nx = Math.floor((y * numInputNeurons + x) / numTargetNeurons);
    return nx;
}

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}

function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}

const feedForward = gpu.createKernelMap({
    net: function mul(dataIn, weights, numInputs) {
        let sum = 0;
        for (let i = 0; i < numInputs; i++) {
            sum += dataIn[i] * weights[i][this.thread.y];
        }
        return sum;
    },
    dOut2dNet: function derivative(out) {
        return derivativeSigmoid(out);
    }

}, function (dataIn, weights, numInputs) {
    let net = mul(dataIn, weights, numInputs);
    let out = sigmoidActivation(net);
    derivative(out); //store for later use in backpropagation
    if (this.thread.y >= (numInputs - 1)) return 1.0; //last output is one for bias
    return out;
}).setOutput([1, 3]);

const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.y][this.thread.x], targets[this.thread.y][this.thread.x]);
    return Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x], 2) * 0.5;
}
).setOutput([3]);


const backPropOutput = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet, prevOutput, learningRate) {
    //X,Y  O   W    Err
    //0,0  0  0,0    0
    //1,0  1  0,1    1
    //0,1  0  1,0    0
    //1,1  1  1,1    1
    //0,2  0  2,0    0
    //1,2  1  2,1    1

    let weight = weights[this.thread.y][this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let dEOut2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
    let dOdN = dOut2dNet[this.thread.x];  //this is dOut2dNet
    let pOut = prevOutput[this.thread.x];  //this is dNetOut2dWeight

    return weight - (learningRate * (dEOut2dOut * dOdN * pOut)); //updated weight
}).setOutput([2, 3]); //[num weights per input neuron, num target neurons + 1 bias]

const computeDerivatives = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet) {
    //X,Y  O   W    Err
    //0,0  0  0,0    0         
    //1,0  1  0,1    1
    //0,1  0  1,0    0
    //1,1  1  1,1    1
    //0,2  0  2,0    0
    //1,2  1  2,1    1

    let dEtot2dOut_   = dEtot2dOut[this.thread.x];
    let dOut2dNet_    = dOut2dNet[this.thread.x];
    let dNet2dOprev_  = weights[this.thread.y][this.thread.x];
    //let pOut   = prevLayer[this.thread.y];

    return dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_;
}).setOutput([2, 3]);



const backPropHidden = gpu.createKernelMap({
    dETotSum: function sum(matrix) {
        let sum = 0;
        for (let i = 0; i < this.output.x; ++i) {
            sum += matrix[this.thread.y][i];
        }
        return sum;
    },
    dEtot2dOutPrev: function dETot2dOutPrev(dETot,dOut2dNet,input){
        return dETot * dOut2dNet[this.thread.y] * input[this.thread.y];
    } 
}, function (matrix, dOut2dNet, input, weights, learningRate) {
    let dETot = sum(matrix);
    let dETot2dOutPre = dETot2dOutPrev(dETot,dOut2dNet, input); 
    let updatedWeight = weights[this.thread.y][this.thread.x] - (learningRate * dETot2dOutPre);
    return updatedWeight;
}).setOutput([2, 3]);

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += Math.sqrt(Math.pow(dError[index],2));
    }
    return total;
}).setOutput([1]);

gpu.addFunction(weightIndexY);
gpu.addFunction(neuronIndexY);
gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);

let learningRate = .5;
let w1 = [  [.15, .25],
            [.20, .30],
            [.35, .35]]; //last row are biases

let w2 = [  [.4, .5],
            [.45, .55],
            [.60, .60]];   //last row are biases

let w3 = [  [.2, .35],
            [.35, .45],
            [.20, .20]];   //last row are biases

let dataIn = [[.05, .10, 1.0]];
//let target = [[.01, .99,1]];
//let target = [[0.01, 0.99, 1]];
let target = [[0.9, 0.5, 1]];

var e;
var l1ff;
var l2ff;
var l3ff;
var bpO;
var bpH1;
var bpH0;


l1ff = feedForward(dataIn, w1, 3);
l2ff = feedForward(l1ff.result, w2, 3);
l3ff = feedForward(l2ff.result, w3, 3);

e = error(l3ff.result, target);
bpO = backPropOutput(w3, e.dEtot2dOut, l3ff.dOut2dNet, l2ff.result, learningRate);
bpH0 = backPropHidden(computeDerivatives(w3, e.dEtot2dOut, l3ff.dOut2dNet), l2ff.dOut2dNet, l2ff.result, w2, learningRate);
bpH1 = backPropHidden(computeDerivatives(w2, e.dEtot2dOut, l2ff.dOut2dNet), l1ff.dOut2dNet, dataIn, w1, learningRate);
console.log(bpH1);

console.log("l1ff");
console.log(l1ff);
console.log("l2ff");
console.log(l2ff);
console.log("error");
console.log(e);
console.log("bpO");
console.log(bpO);
console.log("bpH:");
console.log(bpH1);
//process.exit();
let wt1,wt2,wt3;

for (let j = 0; j < 100; ++j) {
    for (let i = 0; i < 100; ++i) {
        l1ff = feedForward(dataIn, w1, 3);
        l2ff = feedForward(l1ff.result, w2, 3);
        l3ff = feedForward(l2ff.result, w3, 3);
        e = error(l3ff.result, target);
        wt3 = backPropOutput(w3, e.dEtot2dOut, l3ff.dOut2dNet, l2ff.result, learningRate);
        wt2 = backPropHidden(computeDerivatives(w3, e.dEtot2dOut, l3ff.dOut2dNet), l2ff.dOut2dNet, l1ff.result, w2, learningRate);
        wt1 = backPropHidden(computeDerivatives(w2, e.dEtot2dOut, l2ff.dOut2dNet), l1ff.dOut2dNet, dataIn, w1, learningRate);

        //console.log(wt2);
        w3 = wt3;
        w2 = wt2.result;
        w1 = wt1.result;
    }
    console.log((j + 1) * 100 + ' ' + l3ff.result);
    console.log(errorTot(e.result, 2));
}