"use strict";

const fs = require("fs");


function randomNumbers(x, y) {
    var matrix = []; // Initialize array
    var i;
    for (i = 0; i < y; i++) {
        matrix[i] = []; // Initialize inner array
        for (var j = 0; j < x; j++) { // i++ needs to be j++
            matrix[i][j] = (Math.random() / 1000.0);
        }
    }
    return matrix;
}
function randomNumbersAtScale1D(dimensions, divisor) {
    var matrix = []; // Initialize array

    for (var j = 0; j < dimensions; j++) { // i++ needs to be j++
        matrix[j] = (Math.random() / divisor);
    }

    return matrix;
}
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

function saveObject(fileName, obj) {

    fs.writeFileSync(fileName, JSON.stringify(obj));
}
let nN = 128;
let nZ = 10;

let w1 = randomNumbers(nN, nN);
saveObject("./data/w1", w1);
let b1 = randomNumbersAtScale1D(nN, 1);
saveObject("./data/b1", b1);
let w2 = randomNumbers(nN, nN);
saveObject("./data/w2", w2);
let b2 = randomNumbersAtScale1D(nN, 1);
saveObject("./data/b2", b2);
//let w3 = randomNumbers(nN, nN);
//let b3 = randomNumbers(nN, 1);

let w3 = randomNumbers(nZ, nN);
saveObject("./data/w3", w3);
let b3 = randomNumbersAtScale1D(nZ, 1);
saveObject("./data/b3", b3);

let w4 = randomNumbers(nN, nZ);
saveObject("./data/w4", w4);
let b4 = randomNumbersAtScale1D(nN, 1);
saveObject("./data/b4", b4);

let w5 = randomNumbers(nN, nN);
saveObject("./data/w5", w5);
let b5 = randomNumbersAtScale1D(nN, 1);
saveObject("./data/b5", b5);

let dataIn = randomNumbersAtScale1D(nN, 1);
saveObject("./data/dataIn", dataIn);
