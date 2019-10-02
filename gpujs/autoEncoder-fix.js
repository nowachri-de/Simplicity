"use strict";
const { GPU } = require('gpu.js');
const fs = require("fs");
var mnist = require('mnist'); // this line is not needed in the browser

const gpu = new GPU({
    mode: 'headlessgl'
});

let nN = 2;
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
const dataToTexture = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

dataToTexture.setDynamicArguments(true);
dataToTexture.setDynamicOutput(true);
dataToTexture.setPipeline(true);

const feedForward = gpu.createKernelMap({
    dOut2dNet: function dOut2dNet(out) {
        return derivativeSigmoid(out);
    }
}, function (dataIn, weights, numInputs, bias) {
    /*let sum = 0;
    for (let i = 0; i < numInputs; i++) {
        sum += dataIn[i] * weights[i][this.thread.x];
    }*/
    let out = sigmoidActivation(bias[this.thread.x]);
    dOut2dNet(out); //store for later use in backpropagation
    return bias[this.thread.x];
}).setOutput([nN]);//[always 1, num target neurons]
feedForward.setDynamicOutput(true);
feedForward.setDynamicArguments(true);
feedForward.setPipeline(true);

/**
 * 
 * 
 */
const error = gpu.createKernelMap({
    dEtot2dOut: function derivative(out, target) {
        return -(target - out);
    }
}, function (outputs, targets) {
    derivative(outputs[this.thread.x], targets[this.thread.x]);
    return Math.pow(targets[this.thread.x] - outputs[this.thread.x], 2) * 0.5;
}
).setOutput([nN]); //num output neurons
error.setDynamicOutput(true);
error.setDynamicArguments(true);
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
    }).setOutput([nN, nN]); //[num output neurons, num output neurons + 1 bias]
backPropOutput.setDynamicOutput(true);
backPropOutput.setDynamicArguments(true);
backPropOutput.setPipeline(true);

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
}).setOutput([nN, nN]);
backPropHidden.setDynamicOutput(true);
backPropHidden.setDynamicArguments(true);
backPropHidden.setPipeline(true);

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

const sumUp = gpu.createKernel(function (derivatives, numTargets) {
    let sum = 0;
    for (let i = 0; i < numTargets; ++i) {
        sum += derivatives[this.thread.x][i];
    }
    return sum;
}).setOutput([nN]); //num neurons in current layer
sumUp.setDynamicOutput(true);
sumUp.setDynamicArguments(true);
sumUp.setPipeline(true);

function randomNumbersAtScale(x, y, divisor) {
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

function saveObject(fileName, obj) {
    fs.writeFileSync(fileName, JSON.stringify(obj));
}

function readObject(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

function readAsTexture1D(file, dimensions) {
    let obj = readObject(file);
    dataToTexture.setOutput([dimensions]);
    return dataToTexture(obj);
}

function readAsTexture(file, d1, d2) {
    let obj = readObject(file);
    dataToTexture.setOutput([d1, d2]);
    return dataToTexture(obj);
}
console.log(__dirname);
let w1 = readAsTexture(__dirname+"/data/w1", nN, nN);
let b1 = readAsTexture1D(__dirname+"/data/b1", nN);

let w2 = readAsTexture(__dirname+"/data/w2", nN, nN);
let b2 = readAsTexture1D(__dirname+"/data/b2", nN);

//let w3 = randomNumbers(nZ, nN);
//let b3 = randomNumbers(nZ, 1);
let w3 = readAsTexture(__dirname+"/data/w3", nZ, nN);
let b3 = readAsTexture1D(__dirname+"/data/b3", nZ);

//let w4 = randomNumbers(nN, nZ);
//let b4 = randomNumbers(nN, 1);
let w4 = readAsTexture(__dirname+"/data/w4", nN, nZ);
let b4 = readAsTexture1D(__dirname+"/data/b4",  nN);

let w5 = readAsTexture(__dirname+"/data/w5", nN, nN);
let b5 = readAsTexture1D(__dirname+"/data/b5",  nN);

let dataIn = readAsTexture1D(__dirname+"/data/dataIn", nN);
let target = dataIn;

gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);
gpu.addFunction(matrixmul);

let e, l1Out, l2Out, l3Out, l4Out, l5Out, derivatives, sumU, w1t, w2t, w3t, w4t, w5t;
let learningRate = .5;

/*  This is a dummy call. It is needed since there is a bug in gpu.js
    Any kernel with dynamic arguments has to be called initially (the first time)
    with the largest arument dimensions. 
    The kernel can be called again with arguments that have the same size or are smaller.
    However the arguments may not be larger in size when calling the kernel the second time.
*/
updateBias.setOutput([nN]); //set maximum outputsize
updateBias(b1, w1, b1, learningRate); //The arguments have been choosen because they have the largest dimenions possible

/*  This is a dummy call. It is needed since there is a bug in gpu.js
    Any kernel with dynamic arguments has to be called initially (the first time)
    with the largest arument dimensions. 
    The kernel can be called again with arguments that have the same size or are smaller.
    However the arguments may not be larger in size when calling the kernel the second time.
*/
computeDerivatives.setOutput([nN, nN]);//set maximum outputsize
computeDerivatives(w1, b1, w1); //The arguments have been choosen because they have the largest dimenions possible

defaultTest();
for (let j = 0; j < 100; ++j) {
    for (let i = 0; i < 100; ++i) {
        feedForward.setOutput([nN]); //dimension l1 = nN
        l1Out = feedForward(dataIn, w1, nN, b1); // num inputs (3rd argument) = nN
       
        feedForward.setOutput([nN]); //dimension l2 = nN
        l2Out = feedForward(l1Out.result, w2, nN, b2); // num inputs (3rd argument) = nN

        feedForward.setOutput([nZ]); //dimension l3 = nZ
        l3Out = feedForward(l2Out.result, w3, nN, b3); // num inputs (3rd argument) = nN

        feedForward.setOutput([nN]); //dimension l4 = nZ
        l4Out = feedForward(l3Out.result, w4, nZ, b4); // num inputs (3rd argument) = nZ

        feedForward.setOutput([nN]); //dimension l5 = nZ
        l5Out = feedForward(l4Out.result, w5, nN, b5); // num inputs (3rd argument) = nN

        e = error(l5Out.result, target);

        /*
        ------------------------------------------------------------
        OUTPUT LAYER L5 - update of w5 matrix
        ------------------------------------------------------------
        */

        backPropOutput.setOutput([nN, nN]);
        w5t = backPropOutput(w5, e.dEtot2dOut, l5Out.dOut2dNet, l4Out.result, learningRate);

        updateBias.setOutput([nN]);
        b5 = updateBias(b5, e.dEtot2dOut, l5Out.dOut2dNet, learningRate);

        /*
        ------------------------------------------------------------
        OUTPUT LAYER L4 - update of w4 matrix
        ------------------------------------------------------------
        */

        //nZ input neurons and nN target neurons
        //let w4 = randomNumbers(nN, nZ);
        //let b4 = randomNumbers(nN, 1);
        backPropHidden.setOutput([nN, nZ]); //[target neurons, input neurons]
        computeDerivatives.setOutput([nN, nZ]); //[target neurons, input neurons]
        sumUp.setOutput([nZ]); //number input neurons

        /**
         * For every neuron of layer compute 
         * dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_
        */
        derivatives = computeDerivatives(w4, e.dEtot2dOut, l4Out.dOut2dNet);

        /**
         * Sum all dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_ per neuron
        */
        sumU = sumUp(derivatives, nN); //second parameter is the number of target neurons

        w4t = backPropHidden(sumU, l4Out.dOut2dNet, l3Out.result, w4, learningRate);
        b4 = updateBias(b4, sumU, l4Out.dOut2dNet, learningRate);

        /*
       ------------------------------------------------------------
       OUTPUT LAYER L3 - update of w3 matrix
       ------------------------------------------------------------
       */

        //let w3 = randomNumbers(nZ, nN);
        //let b3 = randomNumbers(nZ, 1);
        backPropHidden.setOutput([nZ, nN]);
        updateBias.setOutput([nZ]);
        computeDerivatives.setOutput([nN, nZ]);
        sumUp.setOutput([nN]);
        sumU = sumUp(derivatives, nZ);

        /**
         * For every neuron of layer compute 
         * dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_
        */
        derivatives = computeDerivatives(w3, sumU, l3Out.dOut2dNet);


        w3t = backPropHidden(sumU, l3Out.dOut2dNet, l2Out.result, w3, learningRate);
        b3 = updateBias(b3, sumU, l3Out.dOut2dNet, learningRate);

        /*
       ------------------------------------------------------------
       OUTPUT LAYER L2 - update of w2 matrix
       ------------------------------------------------------------
       */

        backPropHidden.setOutput([nN, nN]);
        updateBias.setOutput([nN]);
        computeDerivatives.setOutput([nN, nN]);
        sumUp.setOutput([nN]);

        sumU = sumUp(derivatives, nN);
        derivatives = computeDerivatives(w2, sumU, l2Out.dOut2dNet);
        w2t = backPropHidden(sumU, l2Out.dOut2dNet, l1Out.result, w2, learningRate);
        b2 = updateBias(b2, sumU, l2Out.dOut2dNet, learningRate);

        /*
       ------------------------------------------------------------
       OUTPUT LAYER L1 - update of w1 matrix
       ------------------------------------------------------------
       */

        sumUp.setOutput([nN]);
        sumU = sumUp(derivatives, nN);
        derivatives = computeDerivatives(w1, sumU, l1Out.dOut2dNet);

        w1t = backPropHidden(derivatives, l1Out.dOut2dNet, dataIn, w1, learningRate);
        b1 = updateBias(b1, sumU, l1Out.dOut2dNet, learningRate);

        w5 = w5t;
        w4 = w4t;
        w3 = w3t;
        w2 = w2t;
        w1 = w1t;
    }

    console.log(errorTot(e.result, 2));
}

function defaultTest() {
    let nN = 2;

    let w1 = [[.15, .25], [.20, .30]];
    let b1 = [[.35, .35]];

    let w2 = [[.15, .25], [.20, .30]];
    let b2 = [[.60, .60]];

    let dataIn = [[.05, .10]];
    let target = [[0.01, 0.99]];

    w1 = asTexture(w1, nN, nN);
    b1 = asTexture(b1, 2, 1);

    w2 = asTexture(w2, nN, nN);
    b2 = asTexture(b2, 2, 1);

    dataIn = asTexture(dataIn, 2, 1);
    target = asTexture(target, 2, 1);

    let l1Out, l2Out;
   

    feedForward.setOutput([nN]);
    l1Out = feedForward(dataIn, w1, nN, b1);

    feedForward.setOutput([nN]);
    l2Out = feedForward(l1Out.result, w2, nN, b2);

    e = error(l2Out.result, target);
    console.log(e.result.toArray());
    backPropOutput.setOutput([nN, nN]);
    w2 = backPropOutput(w2, e.dEtot2dOut, l2Out.dOut2dNet, l1Out.result, learningRate);

    updateBias.setOutput([nN]);
    b2 = updateBias(b2, e.dEtot2dOut, l2Out.dOut2dNet, learningRate);


    backPropHidden.setOutput([nN, nN]); //[target neurons, input neurons]
    computeDerivatives.setOutput([nN, nN]); //[target neurons, input neurons]
    sumUp.setOutput([nN]); //number input neurons

    derivatives = computeDerivatives(w1, e.dEtot2dOut, l1Out.dOut2dNet);
    sumU = sumUp(derivatives, nN);

    w1 = backPropHidden(sumU, l1Out.dOut2dNet, dataIn, w1, learningRate);
    b1 = updateBias(b1, sumU, l1Out.dOut2dNet, learningRate);

    console.log(w1.toArray());
}

function asTexture(obj, d1, d2) {
    dataToTexture.setOutput([d1, d2]);
    return dataToTexture(obj);
}

function getMnistImage(){
    var set = mnist.set(1, 1);
    return set.training[0];
}