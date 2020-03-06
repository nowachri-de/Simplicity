"use strict";
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const { writeArray,randomNumbersAtScale1D } = require('../modules/nn/datautils.js');
const simplicity = require('../modules/nn/simplicity.js');


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
        let nN = 128; //each layer has 128 neurons
        let nZ = 10;  //latent vector has 10 neurons

        writeArray('./data/vector1D128.js',randomNumbersAtScale1D(128,100));
        let dataIn = vector1D128;
        let target = dataIn;

        let l1 = new simplicity.Layer(nN, 'sigmoid');
        let l2 = new simplicity.Layer(nN, 'sigmoid');
        let l3 = new simplicity.Layer(nZ, 'sigmoid');
        let l4 = new simplicity.Layer(nN, 'sigmoid');
        let l5 = new simplicity.Layer(nN, 'sigmoid');

        let network = new simplicity.Network();
        network.addLayer(l1).addLayer(l2).addLayer(l3).addLayer(l4).addLayer(l5);

        for (let j = 0; j < 100; ++j) {
            for (let i = 0; i < 50; ++i) {
                result = network.feedForward(dataIn, target).feedForwardResult;
                network.backPropagate(0.5);
            }
            /*console.log("target");
            console.log(dataIn.toArray());
        
            console.log("result");
            console.log(l5.output.result.toArray());
            console.log("l1.weights");
            console.log(l1.weights.toArray());
            console.log("l1.bias");
            console.log(l1.biasWeights.toArray());*/
            //console.log(dataIn.toArray()[122] + "," + dataIn.toArray()[127]);
            //console.log(result.toArray()[122] + "," + result.toArray()[127]);
            //console.log(l1.biasWeights.toArray()[5]);
            console.log(network.getTotalError());
        }
    });
});
