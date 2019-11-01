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

function reluActivation(i) {
    if (i > 0.0) return i;
    return 0;
}

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}

function derivativeSigmoid(i) {
    return i - Math.pow(i, 2);
}
function derivativeRelu(i) {
    if (i > 0) return 1;
    return 0;
}

const feedForward = gpu.createKernelMap({
    net: function mul(dataIn, weights, numInputs) {
        let sum = 0;
        for (let i = 0; i < numInputs; i++) {
            sum += dataIn[i] * weights[i][this.thread.y];
        }
        return sum;
    },
    dOut2dNet: function derivative(i, activationType) {
        if (activationType == 0)
            return derivativeSigmoid(i);

        if (activationType == 1)
            return derivativeRelu(i);

        if (activationType == 2)
            return i;

        return activationType;
    }

}, function (dataIn, weights, numInputs, activationType) {
    let net = mul(dataIn, weights, numInputs);
    let out = 0;
    if (activationType == 0)
        out = sigmoidActivation(net);

    if (activationType == 1)
        out = reluActivation(net);

    if (activationType == 2)
        out = net;

    derivative(out, activationType); //store for later use in backpropagation
    if (this.thread.y >= (numInputs - 1)) return 1.0; //last output is one for bias
    return out;
}).setOutput([1, 4]);

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

const testIndices = gpu.createKernelMap({
    weightYIndex: function wY(x, y, numInputNeurons, numTargetNeurons) {
        return weightIndexY(x, y, numInputNeurons, numTargetNeurons);
    },
    neuronIndexY: function nY(x, y, numInputNeurons, numTargetNeurons) {
        return neuronIndexY(x, y, numInputNeurons, numTargetNeurons);
    }

}, function (numInputNeurons, numTargetNeurons) {
    wY(this.thread.x, this.thread.y, numInputNeurons, numTargetNeurons);
    nY(this.thread.x, this.thread.y, numInputNeurons, numTargetNeurons);
    return this.thread.x;
}, {
        tactic: 'precision',
    });

/*const backPropOutput = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet, prevOutput, learningRate) {
    let wIY = weightIndexY(this.thread.x,this.thread.y,this.output.x,this.output.y);
    let nIY = neuronIndexY(this.thread.x,this.thread.y,this.output.x,this.output.y);

    let weight = weights[wIY][nIY]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let dEOut2dOut = dEtot2dOut[nIY]; //this is dEOut2dOut
    let dOdN = dOut2dNet[nIY];  //this is dOut2dNet
    let pOut = prevOutput[nIY];  //this is dNetOut2dWeight
    
    //return weights[wIY][nIY]
    return weight - (learningRate * (dEOut2dOut * dOdN * pOut)); //updated weight
}).setOutput([2, 3]); //[num weights per input neuron, num target neurons + 1 bias]*/

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

const backPropHidden = gpu.createKernel(function (weights, dEtot2dOut, dOut2dNet) {
    //X,Y  O   W    Err
    //0,0  0  0,0    0
    //1,0  1  0,1    1
    //0,1  0  1,0    0
    //1,1  1  1,1    1
    //0,2  0  2,0    0
    //1,2  1  2,1    1

    let weight = weights[this.thread.y][this.thread.x]; //column wise matrix iteration
    let error = dEtot2dOut[this.thread.x];
    let dOdN = dOut2dNet[this.thread.x];
    //let pOut   = prevLayer[this.thread.y];

    return error * dOdN * weight;
}).setOutput([2, 3]);


/*const sumUp = gpu.createKernel(function(matrix,dOut2dNet,input,weights,learningRate) {
    let a = matrix[this.thread.y][this.thread.x];
    let b = matrix[(this.thread.y + 1)%2][this.thread.x];
    let result = (a+b)*dOut2dNet[this.thread.y]*input[this.thread.y];
    result = weights[this.thread.y][this.thread.x]  - (learningRate * result); //update weight
    return  result;
}).setOutput([2,3]);*/

const sumUp = gpu.createKernel(function (matrix, dOut2dNet, input, weights, learningRate) {
    let sum = matrix[this.thread.y][this.thread.x];
    for (let i = 1; i < this.output.y; ++i) {
        sum += matrix[(this.thread.y + i) % this.output.y][this.thread.x];
    }

    let result = sum * dOut2dNet[this.thread.y] * input[this.thread.y];
    result = weights[this.thread.y][this.thread.x] - (learningRate * result);
    return result;
}).setOutput([2, 3]);

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += dError[index];
    }
    return total;
}).setOutput([1]);

const softmax = gpu.createKernel(function (a,numOutputs) {
    let sum = 0;
    for (let i = 0; i < numOutputs; i++) {
        sum += Math.exp(a[i]);
    }
    return Math.exp(a[this.thread.x]) / sum;
}).setOutput([3]);

gpu.addFunction(weightIndexY);
gpu.addFunction(neuronIndexY);
gpu.addFunction(sigmoidActivation);
gpu.addFunction(reluActivation);
gpu.addFunction(derivativeSigmoid);
gpu.addFunction(derivativeRelu);

let learningRate = .5;
let w1 = [[.1, .2, .3],
[.3, .2, .7],
[.4, .3, .9],
[1, 1, 1]]; //last row are biases

let w2 = [[.2, .3, .5],
[.3, .5, .7],
[.6, .4, .8],
[1, 1, 1]]; //last row are biases

let w3 = [[.1, .4, .8],
[.3, .7, .2],
[.5, .2, .9],
[1, 1, 1]]; //last row are biases

let dataIn = [[.1, .2, .7, 1.0]]; //last value is 1 for bias             
//let target = [[.01, .99,1]];
let target = [[0.01, 0.99, 1]];

var e;
var l1ff;
var l2ff;
var l3ff;
var bpO;
var bpH;

l1ff = feedForward(dataIn, w1, 4, 1);
l2ff = feedForward(l1ff.result, w2, 4, 0);
//l3ff = softmax(feedForward(l2ff.result, w3, 4, 2).result,3);
l3ff = feedForward(l2ff.result, w3, 4, 2);
console.log("l1ff");
console.log(l1ff);
console.log("l2ff");
console.log(l2ff);
console.log("l3ff");
console.log(l3ff);
//console.log("bpO");
//console.log(bpO);
//console.log("bpH:");
//console.log(bpH);

process.exit();