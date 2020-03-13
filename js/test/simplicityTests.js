"use strict";
const { browserReady } = require('../modules/browserready.js');
const simplicity = require('../modules/nn/simplicity.js');
const {vector1D128} = require('./data/vector1D128.js');
const {Util} = require('./../modules/textureUtil.js');

browserReady();

describe('Simplicity Test', function () {
  /*  it('Test Matt Mazure values', function () {
        let inputLayer = new simplicity.Layer(2, 'sigmoid');
        inputLayer.setWeights([[.15, .25], [.20, .30]]);
        inputLayer.setBiasWeights([.35, .35]);

        let outputLayer = new simplicity.Layer(2, 'sigmoid');
        outputLayer.setWeights([[.40, .50], [.45, .55]]);
        outputLayer.setBiasWeights([.60, .60]);

        let network = new simplicity.Network();
        network.addLayer(inputLayer).addLayer(outputLayer);

        network.feedForward([.05, .10], [0.01, 0.99]);
        TestUtil.compare2DArray(inputLayer.weights, [[0.15, 0.25], [0.2, 0.3]]);
    });*/

    it('Test Autoencoder', function () {

        let gl = Util.createGL();
        let nN = 128; //each layer has 128 neurons
        let nZ = 10;  //latent vector has 10 neurons

        //writeArray('C:/nowak/development/git/Simplicity/js/test/data/vector1D128',randomNumbersAtScale1D(128,100));
        let dataIn = vector1D128;
        dataIn = Util.data2Texture1D(dataIn,dataIn.length,gl)
        let target = dataIn;

        let l1 = new simplicity.Layer(nN,nN, 'sigmoid', gl);
        let l2 = new simplicity.Layer(nN,nN, 'sigmoid', gl);
        let l3 = new simplicity.Layer(nN,nZ, 'sigmoid', gl);
        let l4 = new simplicity.Layer(nZ,nN, 'sigmoid', gl);
        let l5 = new simplicity.Layer(nN,nN, 'sigmoid', gl);

        let network = new simplicity.Network(gl);
        network.addLayer(l1).addLayer(l2).addLayer(l3).addLayer(l4).addLayer(l5);

        for (let j = 0; j < 100; ++j) {
            for (let i = 0; i < 50; ++i) {
                network.feedForward(dataIn, target);
                console.log("backpropagate");
                network.backPropagate(0.5);
                console.log(network.getTotalError());
            }
            
        }
    });
});
