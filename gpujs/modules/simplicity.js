"use strict";
const { GPU } = require('gpu.js');

const gpu = new GPU({
    mode: 'headlessgl'
});

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

const dataToTexture = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

dataToTexture.setDynamicArguments(true);
dataToTexture.setDynamicOutput(true);
dataToTexture.setPipeline(true);

module.exports.Layer = function (numberOfNeurons, activation) {
    let activation_ = activation;
    if (activation_ === null || activation_ === 'undefined'){
        activation_ = 'sigmoid';
    }
    this.activation = activation_;
    this.numberOfNeurons = numberOfNeurons;
    this.numberOfInputNeurons = 0;
    this.numberOfTargetNeurons = 0;
    this.biasWeights = null;
    this.scale = 100;
    this.output = null;
    this.inputWeights = null;
    this.prevLayer = null;
    this.nextLayer = null;

    this.setInputWeight = function (weights) {
        this.inputWeights = weights;
    }

    this.getInputWeight = function () {
        return inputWeights;
    }

    this.setScale = function (scale) {
        this.scale = scale;
    }

    this.getScale = function () {
        return this.scale;
    }

    this.setActivation = function (activation) {
        this.activation = activation;
    };
    this.getActivation = function () {
        return this.activation;
    };
    this.setNumberOfNeurons = function (number) {
        this.numberOfNeurons = number;
    };
    this.getNumberOfNeurons = function () {
        return this.numberOfNeurons;
    };
    this.setNumberOfInputNeurons = function (number) {
        this.numberOfInputNeurons = number;
    };
    this.getNumberOfInputNeurons = function () {
        return this.numberOfInputNeurons;
    };
    this.setNumberOfTargetNeurons = function (number) {
        this.numberOfTargetNeurons = number;
    };
    this.getNumberOfTargetNeurons = function () {
        return this.numberOfTargetNeurons;
    };

    this.compile = function () {
        if (this.biasWeights !== null) {
            dataToTexture.setOutput([this.numberOfNeurons, 1]);
            this.biasWeights = dataToTexture(randomNumbersAtScale(this.numberOfNeurons, 1, this.scale));
        }

        if (this.inputWeights !== null){
            dataToTexture.setOutput([this.numberOfTargetNeurons, this.numberOfNeurons]);
            this.weights = dataToTexture(randomNumbersAtScale(this.numberOfTargetNeurons, this.numberOfNeurons, this.scale));
        }
    };

    this.feedForward = function (dataIn) {
        feedForward.setOutput([1, this.numberOfNeurons]);
        this.output = feedForward(dataIn, this.weights, this.numberOfNeurons, this.biasWeights);
    }
}

module.exports.Network = function () {
    this.layers = [];

    this.addLayer = function (layer) {
        this.layers.push(layer);
    };

    this.compile = function () {
        let prevLayer = null;
        this.layers.forEach(layer => {
            if (prevLayer === null) {
                layer.compile();
                prevLayer = layer;
            } else {
                layer.setNumberOfInputNeurons(prevLayer.getNumberOfNeurons());
                layer.prevLayer = prevLayer;

                prevLayer.setNumberOfTargetNeurons(layer.getNumberOfNeurons());
                prevLayer.nextLayer = layer;
                
                prevLayer = layer;
                layer.compile();
            }
        });
    }

    this.getNumberOfLayers = function () {
        return this.layers.length;
    }

}