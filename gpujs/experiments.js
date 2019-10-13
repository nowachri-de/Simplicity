"use strict";
const { GPU } = require('gpu.js');
const gpu = new GPU();

//Dimensions of matrices
let D = 2;

//Standard matrix multiplication
const multiplyMatrix = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.size; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
}, {
    constants: { size: D },
    loopMaxIterations: D,
});
multiplyMatrix.setDynamicArguments(true);
multiplyMatrix.setOutput([D, D]);
multiplyMatrix.setPipeline(true);
multiplyMatrix.setImmutable(true);

//Generate Random Numbers
function randomNumbersAtScale2D(x, y, divisor) {
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

//convert 2D array to texture
const matrix2Texture = gpu.createKernel(function (dataIn) {
    return dataIn[this.thread.y][this.thread.x];
});

matrix2Texture.setDynamicArguments(true);
matrix2Texture.setDynamicOutput(true);
matrix2Texture.setPipeline(true);
matrix2Texture.setOutput([D, D]);

//create 2D matrix with D dimensions
let a = randomNumbersAtScale2D(D, D, 1);

//create 2D matrix with D dimensions
let b = randomNumbersAtScale2D(D, D, 1);

//test matrix2Texture --> values of a must be the same as values of matrix2Texture(a).toArray()
//rounding errors are O.K
console.log(a);
console.log(matrix2Texture(a).toArray());

//!!!!!!!!!!!! THIS gives a wrong result !!!!!!!!!!!!!!!!!!!!
console.log(multiplyMatrix(matrix2Texture(a), matrix2Texture(b)).toArray());

//!!!!!!!!!!! THIS throws an exception
console.log(multiplyMatrix(a,b).toArray());