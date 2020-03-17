"use strict";
const { browserReady } = require('../modules/browserready.js');
const simplicity = require('../modules/nn/simplicity.js');
const {vector1D128} = require('./data/vector1D128.js');
const {Util} = require('./../modules/textureUtil.js');

browserReady();

describe('Simplicity Test', function () {

    it('Test Autoencoder', function () {

        let gl = Util.createGL();
        let nN = 128; //each layer has 128 neurons
        let nZ = 10;  //latent vector has 10 neurons
        
        let w1 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\w1", nN, nN,gl);
        let w2 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\w2", nN, nN,gl);
        let w3 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\w3", nN, nN,gl);
        let w4 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\w4", nN, nN,gl);

        let b1 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\b1", nN, nN,gl);
        let b2 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\b2", nN, nN,gl);
        let b3 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\b3", nN, nN,gl);
        let b4 = Util.read2DDataFromFile(process.cwd() + "\\..\\gpujs\\data\\b4", nN, nN,gl);

        //writeArray('C:/nowak/development/git/Simplicity/js/test/data/vector1D128',randomNumbersAtScale1D(128,100));
        let dataIn = vector1D128;
        dataIn = Util.data2Texture1D(dataIn,dataIn.length,gl)
        let target = dataIn;

        Util.data2Texture2D(weights,weights[0].length,weights.length,this.gl);

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
