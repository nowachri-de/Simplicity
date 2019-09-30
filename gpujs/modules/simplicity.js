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

module.exports.Layer = function (numberOfNeurons, activation,numInputValues) {
    let activation_ = activation;
    if (activation_ === null || typeof activation_ === 'undefined') {
        activation_ = 'sigmoid';
    }
    this.layerIndex = 0;
    this.activation = activation_;
    this.numberOfNeurons = numberOfNeurons;
    this.numberOfInputNeurons = numInputValues;
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

    this.getInputWeights = function(){
        return this.inputWeights;
    }

    this.compile = function () {
        //for the input layer
        if (this.numberOfInputNeurons === null || typeof this.numberOfInputNeurons === 'undefined') {
            this.numberOfInputNeurons = this.numberOfNeurons;
        }

        if (this.biasWeights === null) {
            dataToTexture.setOutput([this.numberOfNeurons, 1]);
            this.biasWeights = dataToTexture(randomNumbersAtScale(this.numberOfNeurons, 1, this.scale));
        }

        if (this.inputWeights === null) {
            dataToTexture.setOutput([this.numberOfNeurons, this.numberOfInputNeurons]);
            this.inputWeights = dataToTexture(randomNumbersAtScale(this.numberOfNeurons, this.numberOfInputNeurons, this.scale));
        }

        return "layer "+ this.layerIndex+ ":  #inputs: " + this.numberOfInputNeurons + " #neurons: " + this.numberOfNeurons + " activation: " + this.activation + "\r\n" ; 
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
        return this;
    };

    this.compile = function () {
        if (this.layers.length <= 1) {
            throw "A network must consist at least of 2 layers. " + " However this network consists of " + this.layers.length + " layers.";
        }
        let info = '';
        let prevLayer = null;
        this.layers.forEach(layer => {
            if (prevLayer === null) {
                info += layer.compile();
                prevLayer = layer;
            } else {
                layer.setNumberOfInputNeurons(prevLayer.getNumberOfNeurons());
                layer.prevLayer = prevLayer;
                layer.layerIndex = prevLayer.layerIndex + 1;
                info += layer.compile();
                
                prevLayer.nextLayer = layer;
                prevLayer = layer;
            }
            
        });
       
        return info;
    }

    this.getNumberOfLayers = function () {
        return this.layers.length;
    }

}