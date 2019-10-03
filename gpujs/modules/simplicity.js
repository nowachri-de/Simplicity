"use strict";
const UTILS = require(__dirname + '/datautils.js');



function debugLog(dataIn, weights, biasWeights) {
    console.log("Input data");
    if (typeof dataIn.result === 'undefined')
        console.log(dataIn.toArray());
    else
        console.log(dataIn.result.toArray());

    console.log("Weights");
    if (typeof weights.result === 'undefined')
        console.log(weights.toArray());
    else
        console.log(weights.result.toArray());

    console.log("biasWeights");
    if (typeof biasWeights.result === 'undefined')
        console.log(biasWeights.toArray());
    else
        console.log(biasWeights.result.toArray());
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
        this.weights = weights;
    }

    this.getWeights = function () {
        return weights;
    }

    this.setBiasWeights = function (biasWeights) {
        this.biasWeights = biasWeights;
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
        } else if (this.biasWeights !== null && !isGLTextureFloat(this.biasWeights)) {
            this.biasWeights = UTILS.data2Texture1D(this.biasWeights, this.numberOfNeurons);
        } else {
            this.biasWeights = UTILS.randomBias(this.numberOfNeurons, this.scale);
        }

        if (this.weights === null) {
            this.weights = UTILS.randomWeights(this.numberOfNeurons, this.numberOfInputNeurons, this.scale);
        } else if (this.weights !== null && !isGLTextureFloat2D(this.weights)) {
            this.weights = UTILS.data2Texture2D(this.weights, this.numberOfNeurons, this.numberOfInputNeurons);
        } else {
            this.weights = UTILS.randomWeights(this.numberOfNeurons, this.numberOfInputNeurons, this.scale);
        }

        return "layer " + this.layerIndex + ":  #inputs: " + this.numberOfInputNeurons + " #neurons: " + this.numberOfNeurons + " activation: " + this.activation + " weights: " + this.weights.output + "\r\n";
    };
    this.backPropagate = function () {

    }

    this.backPropagate = function (error, learningRate) {
        let input = null;
        if (this.prevLayer !== null) {
            input = this.prevLayer.output.result;
        } else {
            input = this.dataIn;
        }

        //output layer
        if (this.nextLayer === null) {
            let result = UTILS.backpropagateOutput(this.numberOfNeurons, this.numberOfInputNeurons, this.weights, this.biasWeights, error.dEtot2dOut, this.output.dOut2dNet, input, learningRate)
            this.weights = result.weights;
            this.biasWeights = result.biasWeights;
        } else {
            let result = UTILS.backpropagateHidden(this.numberOfInputNeurons, this.numberOfNeurons, error.dEtot2dOut, this.output.dOut2dNet, input, this.weights, this.biasWeights, learningRate);
            this.weights = result.weights;
            this.biasWeights = result.biasWeights;
        }
        if (this.prevLayer !== null){
            this.prevLayer.backPropagate(error,learningRate);
        }
        
    }

    this.feedForward = function (dataIn) {

        if (!isGLTextureFloat(dataIn)) {
            dataIn = UTILS.data2Texture1D(dataIn, this.numberOfNeurons);
        }

        //save the input data in case this is the input (first) layer
        if (this.prevLayer === null) {
            this.dataIn = dataIn;
        }

        verifyInputDimension(dataIn, this);
        verifyWeightDimension(this.weights, this);

        this.output = UTILS.feedForward(dataIn, this.weights, this.biasWeights, this.numberOfNeurons);

        if (this.nextLayer !== null && typeof this.nextLayer != 'undefined') {
            return this.nextLayer.feedForward(this.output.result);
        } else {
            return this.output;
        }
    };


    function verifyGLTextureFloat2D(obj) {
        if (!isGLTextureFloat2D(obj)) {
            throw "object not of type GLTextureFloat2D";
        }
    }

    function verifyGLTextureFloat(obj) {
        if (!isGLTextureFloat(obj)) {
            throw "object not of type GLTextureFloat";
        }
    }


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

    function verifyInputDimension(dataIn, reference) {
        verifyGLTextureFloat(dataIn);

        if (dataIn.output[0] != reference.numberOfInputNeurons) {
            throw "input data length does not match expected length. expected: " + reference.numberOfInputNeurons + " actual: " + dataIn.output[0];
        }

        if (typeof dataIn.output[1] != 'undefined') {
            throw "input data must not have a y dimension but it has";
        }
    };

    function verifyWeightDimension(weights, reference) {
        verifyGLTextureFloat2D(weights);
        let dimensions = weights.output;

        if (dimensions[0] != reference.numberOfNeurons) {
            throw "weights x dimension mismatch. Should be equal to this number of neurons. Expected: " + reference.numberOfNeurons + " actual: " + dimensions.x;
        }

        if (dimensions[1] != reference.numberOfInputNeurons) {
            throw "weights y dimension mismatch. Should be equal to this number of input neurons. Expected: " + reference.numberOfInputNeurons + " actual: " + dimensions.y;
        }
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
        this.isCompiled = true;
        return info;
    }

    this.getNumberOfLayers = function () {
        return this.layers.length;
    }

    this.feedForward = function (dataIn, target) {
        if (this.isCompiled !== true) {
            console.log("Feedforward on the fly compilation");
            console.log(this.compile());
        }

        let lastLayer = this.layers[this.layers.length - 1];
        this.feedForwardResult = this.layers[0].feedForward(dataIn);
        this.target = target2Texture(target, lastLayer.numberOfNeurons);
        this.error = UTILS.computeError(this.feedForwardResult.result, target, lastLayer.numberOfNeurons);
        return {
            result: this.feedForwardResult.result,
            error: this.error,
        }
    }

    this.backPropagate = function (learningRate) {
        let lastLayer = this.layers[this.layers.length - 1];
        lastLayer.backPropagate(this.error, this.target.output[0]);
    }

    this.getTotalError = function(){
        return UTILS.getTotalError(this.error.result,this.error.result.output[0]);
    }
}