"use strict";
const simplicity = require('./modules/simplicity.js');
const { GPU } = require('gpu.js');

const gpu = new GPU({
    mode: 'headlessgl'
});

let inputLayer = new simplicity.Layer(2,'sigmoid');
inputLayer.setWeights([[.15, .25], [.20, .30]]);
inputLayer.setBiasWeights([[.35, .35]]);

let hiddenLayer = new simplicity.Layer(2,'sigmoid');
hiddenLayer.setWeights( [[.40, .50], [.45, .55]]);
hiddenLayer.setBiasWeights([[.60, .60]]);

let outputLayer = new simplicity.Layer(2,'sigmoid');

let network = new simplicity.Network();
network.addLayer(inputLayer).addLayer(hiddenLayer).addLayer(outputLayer);
console.log(network.feedForward([.05,.10]).result.toArray());

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

/*const dataToTexture = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

dataToTexture.setDynamicArguments(true);
dataToTexture.setDynamicOutput(true);
dataToTexture.setPipeline(true);

dataToTexture.setOutput([100,1]);
let t1 = dataToTexture(randomNumbersAtScale(100,1,this.scale));
dataToTexture(t1);

dataToTexture.setOutput([1000,3]);
let t2 = dataToTexture(randomNumbersAtScale(100,1,this.scale));
dataToTexture(t2);*/