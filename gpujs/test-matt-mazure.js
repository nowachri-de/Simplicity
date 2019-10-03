"use strict";
const simplicity = require('./modules/simplicity.js');
const { GPU } = require('gpu.js');

const gpu = new GPU({
    mode: 'headlessgl'
});

let inputLayer = new simplicity.Layer(2,'sigmoid');
inputLayer.setWeights([[.15, .25], [.20, .30]]);
inputLayer.setBiasWeights([.35, .35]);

let outputLayer = new simplicity.Layer(2,'sigmoid');
outputLayer.setWeights( [[.40, .50], [.45, .55]]);
outputLayer.setBiasWeights([.60, .60]);

let network = new simplicity.Network();
network.addLayer(inputLayer).addLayer(outputLayer);

console.log(network.feedForward([.05,.10],[0.01,0.99]).result.toArray());
network.backPropagate(0.5);

console.log(inputLayer.weights.toArray());
