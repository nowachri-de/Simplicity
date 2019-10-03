"use strict";
const simplicity = require('./modules/simplicity.js');
const UTILS = require(__dirname + '/modules/datautils.js');

const fs = require("fs");
const { GPU } = require('gpu.js');

const gpu = new GPU({
    mode: 'headlessgl'
});

let nN = 10;
let nZ = 2;



let w1 = UTILS.readAsTexture2D(__dirname+"/data/w1", nN, nN);
let b1 = UTILS.readAsTexture1D(__dirname+"/data/b1", nN);

let w2 = UTILS.readAsTexture2D(__dirname+"/data/w2", nN, nN);
let b2 = UTILS.readAsTexture1D(__dirname+"/data/b2", nN);

//let w3 = randomNumbers(nZ, nN);
//let b3 = randomNumbers(nZ, 1);
let w3 = UTILS.readAsTexture2D(__dirname+"/data/w3", nZ, nN);
let b3 = UTILS.readAsTexture1D(__dirname+"/data/b3", nZ);

//let w4 = randomNumbers(nN, nZ);
//let b4 = randomNumbers(nN, 1);
let w4 = UTILS.readAsTexture2D(__dirname+"/data/w4", nN, nZ);
let b4 = UTILS.readAsTexture1D(__dirname+"/data/b4",  nN);

let w5 = UTILS.readAsTexture2D(__dirname+"/data/w5", nN, nN);
let b5 = UTILS.readAsTexture1D(__dirname+"/data/b5",  nN);

let dataIn = UTILS.readAsTexture1D(__dirname+"/data/dataIn", nN);
let target = dataIn;

let l1 = new simplicity.Layer(nN,'sigmoid');
let l2 = new simplicity.Layer(nN,'sigmoid');
let l3 = new simplicity.Layer(nZ,'sigmoid');
let l4 = new simplicity.Layer(nN,'sigmoid');
let l5 = new simplicity.Layer(nN,'sigmoid');

l1.setWeights(w1);
l1.setBiasWeights(b1);

l2.setWeights(w2);
l2.setBiasWeights(b2);

l3.setWeights(w3);
l3.setBiasWeights(b3);

l4.setWeights(w4);
l4.setBiasWeights(b4);

l5.setWeights(w5);
l5.setBiasWeights(b5);

let result = null;
let network = new simplicity.Network();
network.addLayer(l1).addLayer(l2).addLayer(l3).addLayer(l4).addLayer(l5);

for(let j=0; j < 100;++j){
    for(let i=0; i < 50;++i){
        result = network.feedForward(dataIn,target).feedForwardResult;
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
