"use strict";
const { GPU } = require('gpu.js');
const fs = require("fs");

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
        sum += dataIn[i] * weights[i][this.thread.x];
    }
    let out = sigmoidActivation(sum + bias[this.thread.x]);
    dOut2dNet(out); //store for later use in backpropagation
    return out;
})
GPUFeedForward.setDynamicOutput(true);
GPUFeedForward.setDynamicArguments(true);
GPUFeedForward.setPipeline(true);



function data2Texture1D(data, length) {
    kernelData2Texture1D.setOutput([length]);
    return kernelData2Texture1D(data);
}

const kernelData2Texture2D = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

kernelData2Texture2D.setDynamicArguments(true);
kernelData2Texture2D.setDynamicOutput(true);
kernelData2Texture2D.setPipeline(true);

const kernelData2Texture1D = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.x];
});
kernelData2Texture1D.setDynamicArguments(true);
kernelData2Texture1D.setDynamicOutput(true);
kernelData2Texture1D.setPipeline(true);



const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.x], targets[this.thread.x]);
    return Math.pow(targets[this.thread.x] - outputs[this.thread.x], 2) * 0.5;
}
); //num output neurons
error.setDynamicArguments(true);
error.setDynamicOutput(true);
error.setPipeline(true);

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += dError[index];
    }
    return total;
}).setOutput([1]); //single value
errorTot.setDynamicArguments(true);
errorTot.setDynamicOutput(true);

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
        return biasWeight - (learningRate * (dETot2dOut * dOut2dNet_ * 1)); //updated bias
    }) //num Bias
updateBias.setDynamicOutput(true);
updateBias.setDynamicArguments(true);
updateBias.setPipeline(true);

const backPropHidden = gpu.createKernel(function (sums, dOut2dNet, prevOutput, weights, learningRate) {
    //X,Y   W       dETot     dOut2dNet     prevOutput
    //0,0  0,0        0           0             0
    //1,0  0,1        0           0             0
    //0,1  1,0        1           1             1
    //1,1  1,1        1           1             1
    //0,2  2,0        2           2             2
    //1,2  2,1        2           2             2

let dETot = sums[this.thread.y];
let dETot2dOutPre = dETot * dOut2dNet[this.thread.y] * prevOutput[this.thread.y]; 
let updatedWeight = weights[this.thread.y][this.thread.x] - (learningRate * dETot2dOutPre);
return updatedWeight;
});
backPropHidden.setDynamicOutput(true);
backPropHidden.setDynamicArguments(true);
backPropHidden.setPipeline(true);
 

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
}); //[num output neurons, num output neurons + 1 bias] 
computeDerivatives.setDynamicOutput(true);
computeDerivatives.setDynamicArguments(true);
computeDerivatives.setPipeline(true);

const sumUp = gpu.createKernel(function (derivatives, numTargets) {
    let sum = 0;
    for (let i = 0; i < numTargets; ++i) {
        sum += derivatives[this.thread.x][i];
    }
    return sum;
}); //num neurons in current layer
sumUp.setDynamicOutput(true);
sumUp.setDynamicArguments(true);
sumUp.setPipeline(true);

function getTotalError(error,length){
    return errorTot(error, length);
}

function computeError(result, target, numNeurons) {
    error.setOutput([numNeurons]);
    return error(result, target);
}

function data2Texture2D(data, x, y) {
    kernelData2Texture2D.setOutput([x, y]);
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

function randomBias(length, divisor) {
    return data2Texture1D(randomNumbersAtScale1D(length, divisor), length);
}

function randomWeights(x, y, divisor) {
    return data2Texture2D(randomNumbersAtScale2D(x, y, divisor), x, y);
}
function feedForward(dataIn,weights,biasWeights,numberOfNeurons){
    GPUFeedForward.setOutput([numberOfNeurons]);
    return GPUFeedForward(dataIn,weights, numberOfNeurons, biasWeights);
}
function backpropagateOutput(numberOfNeurons, numberOfInputNeurons, weights, biasWeights,dEtot2dOut, dOut2dNet, input, learningRate) {
    backPropOutput.setOutput([numberOfNeurons, numberOfInputNeurons]);
    updateBias.setOutput([numberOfNeurons]);
    
    //will return updated bias weights
    return{
        weights: backPropOutput(weights, dEtot2dOut, dOut2dNet, input, learningRate),
        biasWeights: updateBias(biasWeights, dEtot2dOut, dOut2dNet, learningRate),
    } 
}

function backpropagateHidden(numInputNeurons, numNeurons, dEtot2dOut, dOut2dNet, input, weights, biasWeights, learningRate) {

    backPropHidden.setOutput([numNeurons, numInputNeurons]); //[target neurons, input neurons]
    computeDerivatives.setOutput([numNeurons, numInputNeurons]); //[target neurons, input neurons]
    sumUp.setOutput([numInputNeurons]); //number input neurons

    /**
     * Sum all dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_ per neuron
    */
    let sumU = sumUp(computeDerivatives(weights, dEtot2dOut, dOut2dNet), numNeurons); //second parameter is the number of target neurons

    return {
        weights: backPropHidden(sumU, dOut2dNet, input, weights, learningRate),
        biasWeights: updateBias(biasWeights, sumU, dOut2dNet, learningRate),
    }
}

function updateBiasWeights(length, bias, dEtot2dOut, dOut2dNet, learningRate) {
    updateBias.setOutput([length]);

    //will return updated bias weights
    return updateBias(bias, dEtot2dOut, dOut2dNet, learningRate);
}

function readObject(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

function readAsTexture2D(file, d1, d2) {
    return data2Texture2D(readObject(file), d1,d2);
}

function readAsTexture1D(file, dimensions) {
    return data2Texture1D(readObject(file), dimensions);
}

module.exports.data2Texture1D = data2Texture1D;
module.exports.data2Texture2D = data2Texture2D;
module.exports.feedForward = feedForward;
module.exports.randomBias = randomBias;
module.exports.randomWeights = randomWeights;
module.exports.computeError = computeError;
module.exports.backpropagateOutput = backpropagateOutput;
module.exports.backpropagateHidden = backpropagateHidden;
module.exports.updateBiasWeights = updateBiasWeights;
module.exports.getTotalError = getTotalError;
module.exports.readAsTexture1D = readAsTexture1D;
module.exports.readAsTexture2D = readAsTexture2D;

module.exports.GPU = gpu;