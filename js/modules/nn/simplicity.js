"use strict";
const UTILS = require( './datautils.js');

function checkType(obj, type2check) {
    if (typeof obj.result !== 'undefined') {
        return true;
    }
    if (typeof obj.constructor != 'undefined' && obj.constructor.name === type2check) {
        return true;
    }
    return false;
}

function isGLTextureFloat(obj) {
    return checkType(obj, 'GLTextureFloat');
}

function isGLTextureFloat2D(obj) {
    return checkType(obj, 'GLTextureFloat2D');
}

function isGLTextureFloat1D(obj) {
    return checkType(obj, 'GLTextureFloat');
}

module.exports.Layer = function (numberOfNeurons, activation, numInputValues) {
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
    this.weights = null;
    this.prevLayer = null;
    this.nextLayer = null;
    this.isCompiled = false;
    this.dataIn = null; // only used for input layer

    this.setWeights = function (weights) {
        /*if (!isGLTextureFloat2D(weights)){
            this.weights = UTILS.data2Texture2D(weights,weights[0].length,weights.length);
        }else{
            this.weights = weights;
        }*/
        this.weights = weights;
        
    }

    this.getWeights = function () {
        return weights;
    }

    this.setBiasWeights = function (biasWeights) {
        if (!isGLTextureFloat1D(biasWeights)){
            this.biasWeights = UTILS.data2Texture1D(biasWeights,biasWeights.length);
        }else{
            this.biasWeights = biasWeights;
        }
    }

    this.getBiasWeights = function () {
        return this.biasWeights;
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

    this.getweights = function () {
        return this.weights;
    }

    this.compile = function () {
        //for the input layer
        if (this.numberOfInputNeurons === null || typeof this.numberOfInputNeurons === 'undefined') {
            this.numberOfInputNeurons = this.numberOfNeurons;
        }

        if (this.biasWeights === null) {
            this.biasWeights = UTILS.randomBias(this.numberOfNeurons, this.scale);
        } 

        if (this.weights === null) {
            this.weights = UTILS.randomWeights(this.numberOfNeurons, this.numberOfInputNeurons, this.scale);
        } 

        return "layer " + this.layerIndex + ":  #inputs: " + this.numberOfInputNeurons + " #neurons: " + this.numberOfNeurons + " activation: " + this.activation + " weights: " + this.weights + "\r\n";
    };
    
    this.backPropagate = function (error, learningRate) {
        let input = null;
        if (this.prevLayer !== null) {
            input = this.prevLayer.output.result();
        } else {
            input = this.dataIn;
        }

        //output layer
        if (this.nextLayer === null) {
            this.feedForwardResult = UTILS.backpropagateOutput(this.numberOfNeurons, this.numberOfInputNeurons, this.weights, this.biasWeights, error.result('dEtot2dOut'), this.output.result('dOut2dNet'), input, learningRate);
        } else {
            this.feedForwardResult = UTILS.backpropagateHidden(this.numberOfInputNeurons, this.numberOfNeurons, error.result('dEtot2dOut'), this.output.result('dOut2dNet'), input, this.weights, this.biasWeights, learningRate);
        }
        
        if (this.prevLayer !== null){
            this.prevLayer.backPropagate(error,learningRate);
        }
        
    }

    this.updateWeights = function(){
        this.weights = this.feedForwardResult.weights.result();
        this.biasWeights = this.feedForwardResult.biasWeights.result();

        if (this.prevLayer !== null){
            this.prevLayer.updateWeights();
        }
    }

    this.feedForward = function (dataIn) {

        verifyInputDimension(dataIn, this);
        verifyWeightDimension(this.weights, this);
        //save the input data in case this is the input (first) layer
        if (this.prevLayer === null) {
            this.dataIn = dataIn;
        }

        this.output = UTILS.feedForward(dataIn, this.weights, this.biasWeights, this.numberOfNeurons);
       
        if (this.nextLayer !== null ) {
            return this.nextLayer.feedForward(this.output.result());
        } else {
            return this.output;
        }
    };


    function verifyGLTextureFloat2D(obj) {
        /*if (!isGLTextureFloat2D(obj)) {
            throw "object not of type GLTextureFloat2D";
        }*/
    }

    function verifyGLTextureFloat(obj) {
        if (!isGLTextureFloat(obj)) {
            throw "object not of type GLTextureFloat";
        }
    }




    function verifyInputDimension(dataIn, reference) {
        //verifyGLTextureFloat(dataIn);

        if (dataIn.length != reference.numberOfInputNeurons) {
            throw "input data length does not match expected length. expected: " + reference.numberOfInputNeurons + " actual: " + dataIn.length;
        }

        /*if (typeof dataIn.output[1] !== 'undefined') {
            throw "input data must not have a y dimension but it has";
        }*/
    };

    function verifyWeightDimension(weights, reference) {
        /*verifyGLTextureFloat2D(weights);
        let dimensions = weights.output;

        if (dimensions[0] != reference.numberOfNeurons) {
            throw "weights x dimension mismatch. Should be equal to this number of neurons. Expected: " + reference.numberOfNeurons + " actual: " + dimensions.x;
        }

        if (dimensions[1] != reference.numberOfInputNeurons) {
            throw "weights y dimension mismatch. Should be equal to this number of input neurons. Expected: " + reference.numberOfInputNeurons + " actual: " + dimensions.y;
        }*/
    }
}

function target2Texture(target, length) {
    return UTILS.data2Texture1D(target, length);
}

module.exports.Network = function () {
    this.layers = [];
    this.isCompiled = false;
    this.error = null;
    this.feedForwardResult = null;
    this.target = null;

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
        let layerIndex = 0;
        this.layers.forEach(layer => {
            if (prevLayer === null) {
                layer.layerIndex = layerIndex;
                info += layer.compile();
                prevLayer = layer;
            } else {
                layer.setNumberOfInputNeurons(prevLayer.getNumberOfNeurons());
                layer.prevLayer = prevLayer;
                layer.layerIndex = layerIndex;
                prevLayer.nextLayer = layer;
                info += layer.compile();
                prevLayer = layer;
            }
            layerIndex ++;
        });
        this.isCompiled = true;
        return info;
    }

    this.getNumberOfLayers = function () {
        return this.layers.length;
    }

    this.feedForward = function (dataIn, target) {
        if (this.isCompiled !== true) {
            this.compile();
        }

        let lastLayer = this.layers[this.layers.length - 1];
        this.feedForwardResult = this.layers[0].feedForward(dataIn);
        this.target = target2Texture(target, lastLayer.numberOfNeurons);
        this.error = UTILS.computeError(this.feedForwardResult.result(), target, lastLayer.numberOfNeurons);
        return {
            feedForwardResult: this.feedForwardResult,
            error: this.error,
        }
    }

    this.backPropagate = function (learningRate) {
        let lastLayer = this.layers[this.layers.length - 1];
        lastLayer.backPropagate(this.error, learningRate);
        lastLayer.updateWeights();
    }

    this.getTotalError = function(){
        return UTILS.getTotalError(this.error.result,this.error.result.output[0]);
    }

}