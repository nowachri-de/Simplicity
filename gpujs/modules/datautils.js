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

gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);

const backPropOutput = gpu.createKernel(
    function (weights, dEtot2dOut, dOut2dNet, prevOutput, learningRate) {
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
    })//[num output neurons, num output neurons + 1 bias]
backPropOutput.setDynamicOutput(true);
backPropOutput.setDynamicArguments(true);
backPropOutput.setPipeline(true);

const GPUFeedForward = gpu.createKernelMap({
    dOut2dNet: function dOut2dNet(out) {
        return derivativeSigmoid(out);
    }
}, function (dataIn, weights, numInputs, bias) {
    let sum = 0;
    for (let i = 0; i < numInputs; i++) {
        sum += dataIn[i] * weights[i][this.thread.y];
    }
    let out = sigmoidActivation(sum + bias[this.thread.y]);
    dOut2dNet(out); //store for later use in backpropagation
    return out;
})
GPUFeedForward.setDynamicOutput(true);
GPUFeedForward.setDynamicArguments(true);
GPUFeedForward.setPipeline(true);

const kernelData2Texture1D = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.x];
});
kernelData2Texture1D.setDynamicArguments(true);
kernelData2Texture1D.setDynamicOutput(true);
kernelData2Texture1D.setPipeline(true);

function data2Texture1D(data,length){
    kernelData2Texture1D.setOutput([length]);
    return kernelData2Texture1D(data);
}

const kernelData2Texture2D = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

kernelData2Texture2D.setDynamicArguments(true);
kernelData2Texture2D.setDynamicOutput(true);
kernelData2Texture2D.setPipeline(true);


const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.y][this.thread.x], targets[this.thread.y][this.thread.x]);
    return Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x], 2) * 0.5;
}
); //num output neurons
error.setDynamicArguments(true);
error.setDynamicOutput(true);
error.setPipeline(true);

function computeError(result,target,numNeurons){
    error.setOutput([numNeurons]);
    return error(result,target);
}

function data2Texture2D(data,x,y){
    kernelData2Texture2D.setOutput([x,y]);
    return kernelData2Texture2D(data);
}

function randomNumbersAtScale1D(length, divisor) {
    let matrix = [];
    for (let i = 0; i < length; i++) {
        for (var j = 0; j < length; j++) { // i++ needs to be j++
            matrix[j] = (Math.random() / divisor);
        }
    }
    return matrix;
}

function randomNumbersAtScale2D(x, y, divisor) {
    var matrix = []; // Initialize array
    var i;
    for (i = 0; i < y; i++) {
        matrix[i] = []; // Initialize inner array
        for (var j = 0; j < x; j++) { // i++ needs to be j++
            matrix[i][j] = (Math.random() / divisor);
        }
    }
    return matrix;
}

function randomBias(length,divisor){
    return data2Texture1D(randomNumbersAtScale1D(length,divisor),length);
}

function randomWeights(x,y,divisor){
    return data2Texture2D(randomNumbersAtScale2D(x,y,divisor),x,y);
}

function backpropagateOutput(numberOfNeurons,numberOfInputNeurons,weights,dEtot2dOut,dOut2dNet,input,learningRate){
    backPropOutput.setOutput([numberOfNeurons, numberOfInputNeurons]);

    //will return updated weights
    return backPropOutput(weights, dEtot2dOut, dOut2dNet, input, learningRate);
}
module.exports.GPUFeedForward   = GPUFeedForward;
module.exports.data2Texture1D   = data2Texture1D;
module.exports.data2Texture2D   = data2Texture2D;
module.exports.randomBias       = randomBias;
module.exports.randomWeights    = randomWeights;
module.exports.computeError     = computeError;
module.exports.backpropagateOutput = backpropagateOutput;
module.exports.GPU = gpu;