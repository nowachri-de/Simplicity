"use strict";
const simplicity = require('./modules/simplicity.js');
const UTILS = require(__dirname + '/modules/datautils.js');

const fs = require("fs");
const { GPU } = require('gpu.js');

const gpu = new GPU({
    mode: 'headlessgl'
});

let nN = 2;
let nZ = 2;

function readObject(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}


function readAsTexture2D(file, d1, d2) {
    return UTILS.data2Texture2D(readObject(file), d1,d2);
}

function readAsTexture1D(file, dimensions) {
    return UTILS.data2Texture1D(readObject(file), dimensions);
}

let w1 = readAsTexture2D(__dirname+"/data/w1", nN, nN);
let b1 = readAsTexture1D(__dirname+"/data/b1", nN);

let w2 = readAsTexture2D(__dirname+"/data/w2", nN, nN);
let b2 = readAsTexture1D(__dirname+"/data/b2", nN);

//let w3 = randomNumbers(nZ, nN);
//let b3 = randomNumbers(nZ, 1);
let w3 = readAsTexture2D(__dirname+"/data/w3", nZ, nN);
let b3 = readAsTexture1D(__dirname+"/data/b3", nZ);

//let w4 = randomNumbers(nN, nZ);
//let b4 = randomNumbers(nN, 1);
let w4 = readAsTexture2D(__dirname+"/data/w4", nN, nZ);
let b4 = readAsTexture1D(__dirname+"/data/b4",  nN);

let w5 = readAsTexture2D(__dirname+"/data/w5", nN, nN);
let b5 = readAsTexture1D(__dirname+"/data/b5",  nN);

let dataIn = readAsTexture1D(__dirname+"/data/dataIn", nN);
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

let network = new simplicity.Network();
network.addLayer(l1).addLayer(l2).addLayer(l3).addLayer(l4).addLayer(l5);

for(let j=0; j < 100;++j){
    for(let i=0; i < 100;++i){
        network.feedForward(dataIn,target);
        network.backPropagate(0.5);
        //console.log(l2.biasWeights.toArray());
    }
    console.log("target");
    console.log(dataIn.toArray());

    console.log("result");
    console.log(l5.output.result.toArray());
   
    //console.log(network.getTotalError() + " " +l1.getBiasWeights().toArray());
}
