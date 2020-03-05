"use strict";
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const simplicity = require('../modules/nn/simplicity.js');

browserReady();

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}
function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}

describe('Simplicity Test', function () {
    it('It should test Simplicity', function () {
        let inputLayer = new simplicity.Layer(2, 'sigmoid');
        inputLayer.setWeights([[.15, .25], [.20, .30]]);
        inputLayer.setBiasWeights([.35, .35]);

        let outputLayer = new simplicity.Layer(2, 'sigmoid');
        outputLayer.setWeights([[.40, .50], [.45, .55]]);
        outputLayer.setBiasWeights([.60, .60]);

        let network = new simplicity.Network();
        network.addLayer(inputLayer).addLayer(outputLayer);

        network.feedForward([.05, .10], [0.01, 0.99]);
       // network.backPropagate(0.5);

        console.log(inputLayer.weights);
        network.clear();
    });
});
