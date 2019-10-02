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

module.exports.GPUFeedForward   = GPUFeedForward;
module.exports.data2Texture1D   = data2Texture1D;
module.exports.data2Texture2D   = data2Texture2D;
module.exports.randomBias       = randomBias;
module.exports.randomWeights    = randomWeights;

module.exports.GPU = gpu;