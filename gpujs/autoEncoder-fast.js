"use strict";
const { GPU } = require('gpu.js');
const fs = require("fs");

const gpu = new GPU({
    mode: 'headlessgl'
});

let nN = 32;
let nZ = 2;

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
const dataInToTexture = gpu.createKernel(function(dataIn){
    return dataIn[this.thread.y][this.thread.x];
});

dataInToTexture.setDynamicArguments(true);
dataInToTexture.setDynamicOutput(true);
dataInToTexture.setPipeline(true);

const feedForward = gpu.createKernelMap({
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
}).setOutput([1, nN]);//[always 1, num target neurons]
feedForward.setDynamicOutput(true);
feedForward.setDynamicArguments(true);
feedForward.setPipeline(true);

const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.y][this.thread.x], targets[this.thread.y][this.thread.x]);
    return Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x], 2) * 0.5;
}
).setOutput([nN]); //num output neurons + 1 bias (bias error = 0;)
error.setDynamicOutput(true);
error.setDynamicArguments(true);

const flatten = gpu.createKernel(function (dETotSum) {
    return dETotSum[this.thread.x][0];
}).setOutput([nN]); //[num neurons + 1 bias]
flatten.setDynamicOutput(true);
flatten.setDynamicArguments(true);

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
    }).setOutput([nN, nN]); //[num output neurons, num output neurons + 1 bias]
backPropOutput.setDynamicOutput(true);
backPropOutput.setDynamicArguments(true);
backPropOutput.setPipeline(true);

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
    }).setOutput([nN]); //num Bias
updateBias.setDynamicOutput(true);
updateBias.setDynamicArguments(true);
updateBias.setPipeline(true);
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
}).setOutput([nN, nN]); //[num output neurons, num output neurons + 1 bias] 
computeDerivatives.setDynamicOutput(true);
computeDerivatives.setDynamicArguments(true);
computeDerivatives.setPipeline(true);

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
}).setOutput([nN, nN]); //[num output neurons, num output neurons + 1 bias] 
backPropHidden.setDynamicOutput(true);
backPropHidden.setDynamicArguments(true);
backPropHidden.setPipeline(true);

const errorTot = gpu.createKernel(function (dError, lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total += Math.sqrt(Math.pow(dError[index], 2));
    }
    return total;
}).setOutput([1]); //single value

function randomNumbers(x, y) {
    var matrix = []; // Initialize array
    var i;
    for (i = 0; i < y; i++) {
        matrix[i] = []; // Initialize inner array
        for (var j = 0; j < x; j++) { // i++ needs to be j++
            matrix[i][j] = (Math.random()/1000.0);
        }
    }
    return matrix;
}
function randomNumbersAtScale(x, y,divisor) {
    var matrix = []; // Initialize array
    var i;
    for (i = 0; i < y; i++) {
        matrix[i] = []; // Initialize inner array
        for (var j = 0; j < x; j++) { // i++ needs to be j++
            matrix[i][j] = (Math.random()/divisor);
        }
    }
    return matrix;
}

function saveObject(fileName, obj){
    
    fs.writeFileSync(fileName, JSON.stringify(obj));
}
/*
let w1 = randomNumbers(nN, nN);
saveObject("./w1",w1);
let b1 = randomNumbers(nN, 1);
saveObject("./b1",b1);
let w2 = randomNumbers(nN, nN);
saveObject("./w2",w2);
let b2 = randomNumbers(nN, 1);
saveObject("./b2",b2);
//let w3 = randomNumbers(nN, nN);
//let b3 = randomNumbers(nN, 1);

let w3 = randomNumbers(nZ, nN);
saveObject("./w3",w3);
let b3 = randomNumbers(nZ, 1);
saveObject("./b3",b3);

let w4 = randomNumbers(nN, nZ);
saveObject("./w4",w4);
let b4 = randomNumbers(nN, 1);
saveObject("./b4",b4);

let w5 = randomNumbers(nN, nN);
saveObject("./w5",w4);
let b5 = randomNumbers(nN, 1);
saveObject("./b5",w4);

let dataIn = randomNumbersAtScale(nN, 1,100);
saveObject("./dataIn",dataIn);
dataInToTexture.setOutput([nN,1]);
dataIn = dataInToTexture(dataIn);
let target = dataIn;*/

function readObject(fileName){
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}
let w1 = readObject("./w1");
let b1 = readObject("./b1");

let w2 = readObject("./w2");
let b2 = readObject("./b2");
//let w3 = randomNumbers(nN, nN);
//let b3 = randomNumbers(nN, 1);

//let w3 = randomNumbers(nZ, nN);
//let b3 = randomNumbers(nZ, 1);
let w3 = readObject("./w3");
let b3 = readObject("./b3");

//let w4 = randomNumbers(nN, nZ);
//let b4 = randomNumbers(nN, 1);
let w4 = readObject("./w4");
let b4 = readObject("./b4");

//let w5 = randomNumbers(nN, nN);
//let b5 = randomNumbers(nN, 1);
let w5 = readObject("./w5");
let b5 = readObject("./b5");


//let dataIn = randomNumbersAtScale(nN, 1,100);
let dataIn = readObject("./dataIn");

dataInToTexture.setOutput([nN,1]);
dataIn =  dataInToTexture(dataIn);
let target = dataIn;

gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);
gpu.addFunction(matrixmul);

let e, l1Out, l2Out, l3Out, l4Out, l5Out;
let learningRate = .5;


for (let j = 0; j < 100; ++j) {
    for (let i = 0; i < 100; ++i) {
        feedForward.setOutput([1, nN]);
        l1Out = feedForward(dataIn, w1, nN, b1);
        feedForward.setOutput([1, nN]);
        l2Out = feedForward(l1Out.result, w2, nN, b2);
        feedForward.setOutput([1, nZ]);
        l3Out = feedForward(l2Out.result, w3, nN, b3);
        feedForward.setOutput([1, nN]);
        l4Out = feedForward(l3Out.result, w4, nZ, b4);
        feedForward.setOutput([1, nN]);
        l5Out = feedForward(l4Out.result, w5, nN, b5);

        e = error(l5Out.result, target);

        backPropOutput.setOutput([nN,nN]);
        let w5t = backPropOutput(w5, e.dEtot2dOut, l5Out.dOut2dNet, l4Out.result, learningRate);
        updateBias.setOutput([nN]);
        backPropHidden.setOutput([nN,nN]);
        computeDerivatives.setOutput([nN,nN]);
        flatten.setOutput([nN]);

        b5 = updateBias(b5, e.dEtot2dOut, l5Out.dOut2dNet, learningRate);
        
        //let w4 = randomNumbers(256, 3);
        //let b4 = randomNumbers(nN, 1);
        backPropHidden.setOutput([nN, nZ]);
        let w4t = backPropHidden(computeDerivatives(w4, e.dEtot2dOut, l4Out.dOut2dNet), l4Out.dOut2dNet, l3Out.result, w4, learningRate);
        b4 = updateBias(b4, flatten(w4t.dETotSum), l4Out.dOut2dNet, learningRate);

        //let w3 = randomNumbers(3, 256);
        //let b3 = randomNumbers(3, 1);
        backPropHidden.setOutput([nZ, nN]);
        updateBias.setOutput([nZ]);
        flatten.setOutput([nZ]);
        computeDerivatives.setOutput([nZ,nZ]);
        let w3t = backPropHidden(computeDerivatives(w3, flatten(w4t.dETotSum), l3Out.dOut2dNet), l3Out.dOut2dNet, l2Out.result, w3, learningRate);
        b3 = updateBias(b3, flatten(w3t.dETotSum), l3Out.dOut2dNet, learningRate);

        backPropHidden.setOutput([nN,nN]);
        updateBias.setOutput([nN]);
        
        computeDerivatives.setOutput([nN,nN]);
        flatten.setOutput([nN]);
        
        let w2t = backPropHidden(computeDerivatives(w2, flatten(w3t.dETotSum), l2Out.dOut2dNet), l2Out.dOut2dNet, l1Out.result, w2, learningRate);
        b2 = updateBias(b2, flatten(w2t.dETotSum), l2Out.dOut2dNet, learningRate);
        
        let w1t = backPropHidden(computeDerivatives(w1, flatten(w2t.dETotSum), l1Out.dOut2dNet), l1Out.dOut2dNet,  dataIn, w1, learningRate);
        b1 = updateBias(b1, flatten(w1t.dETotSum), l1Out.dOut2dNet, learningRate);

        w5 = w5t;
        w4 = w4t.result;
        w3 = w3t.result;
        w2 = w2t.result;
        w1 = w1t.result;
        //w1 = w2t.result;
    }

    console.log(errorTot(e.result, 2));
    //console.log(dataIn);
    //console.log(l5Out.result);

}