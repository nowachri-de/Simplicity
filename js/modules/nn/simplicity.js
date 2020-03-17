"use strict";

const TextureUtils = require( '../textureUtil.js');
let Util = TextureUtils.Util;

function checkType(obj, type2check) {
    if (typeof obj.result !== 'undefined') {
        return true;
    }
    if (typeof obj.constructor != 'undefined' && obj.constructor.name === type2check) {
        return true;
    }
    return false;
}

function isTexture(obj) {
    return checkType(obj, 'Texture');
}

module.exports.Layer = function (numberOfInputNeurons,numberOfNeurons, activation,gl) {
    let activation_ = activation;
    this.layerIndex = 0;
    this.gl = gl;
    this.activation = activation_;
    this.numberOfNeurons = numberOfNeurons;
    this.numberOfInputNeurons = numberOfInputNeurons;
    this.biasWeights = null;
    this.scale = 100;
    this.output = null;
    this.weights = null;
    this.prevLayer = null;
    this.nextLayer = null;
    this.isCompiled = false;
    this.dataIn = null; // only used for input layer
    
    
    this.setWeights = function (weights) {
        if (!isGLTextureFloat2D(weights)){
            throw 'setWeight argument is not of type texture'
        }
        this.weights = weights;
    }

    this.getWeights = function () {
        return weights;
    }

    this.setBiasWeights = function (biasWeights) {
        if (!isGLTextureFloat1D(biasWeights)){
            this.biasWeights = Util.data2Texture1D(biasWeights,biasWeights.length);
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
            this.biasWeights = Util.randomBias(this.numberOfNeurons, this.scale,this.gl);
        } 

        if (this.weights === null) {
            this.weights = Util.randomWeights(this.numberOfNeurons, this.numberOfInputNeurons, this.scale,this.gl);
        } 

        return "layer " + this.layerIndex + ":  #inputs: " + this.numberOfInputNeurons + " #neurons: " + this.numberOfNeurons + " activation: " + this.activation + " weights: " + this.weights + "\r\n";
    };
    
    this.backPropagate = function (error, learningRate) {
        let input = null;
        if (this.prevLayer !== null) {
            input = this.prevLayer.output.rawResult();
        } else {
            input = this.dataIn;
        }

        //output layer
        if (this.nextLayer === null) {
            this.feedForwardResult = Util.backpropagateOutput(this.numberOfNeurons, this.numberOfInputNeurons, this.weights, this.biasWeights, error.rawResult('dEtot2dOut'), this.output.rawResult('dOut2dNet'), input, learningRate);
        } else {
            this.feedForwardResult = Util.backpropagateHidden(this.numberOfInputNeurons, this.numberOfNeurons, error.rawResult('dEtot2dOut'), this.output.rawResult('dOut2dNet'), input, this.weights, this.biasWeights, learningRate);
        }
        
        if (this.prevLayer !== null){
            this.prevLayer.backPropagate(error,learningRate);
        }
        
    }

    this.updateWeights = function(){
        this.weights = this.feedForwardResult.weights.rawResult();
        this.biasWeights = this.feedForwardResult.biasWeights.rawResult();

        if (this.prevLayer !== null){
            this.prevLayer.updateWeights();
        }
    }

    this.feedForward = function (dataIn) {
        isTexture(dataIn);
        verifyInputDimension(dataIn, this);
        verifyWeightDimension(this.weights, this);
        //save the input data in case this is the input (first) layer
        if (this.prevLayer === null) {
            this.dataIn = dataIn;
        }

        this.output = Util.feedForward(dataIn, this.weights, this.biasWeights, this.numberOfNeurons);
       
        if (this.nextLayer !== null ) {
            return this.nextLayer.feedForward(this.output.rawResult());
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

        if (dataIn.width != reference.numberOfInputNeurons) {
            throw "input data length does not match expected length. expected: " + reference.numberOfInputNeurons + " actual: " + dataIn.length;
        }

        if (dataIn.height > 1) {
            throw "input data must not have a y dimension but it has";
        }
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

function target2Texture(target, length,gl) {
    return Util.data2Texture1D(target, length,gl);
}

module.exports.Network = function (gl) {
    this.layers = [];
    this.isCompiled = false;
    this.error = null;
    this.feedForwardResult = null;
    this.target = null;
    this.gl = gl;

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
        this.target = target;
        this.error = Util.computeError(this.feedForwardResult.rawResult(), target, lastLayer.numberOfNeurons);
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
        return Util.getTotalError(this.error.rawResult(),this.error.rawResult().width);
    }

}