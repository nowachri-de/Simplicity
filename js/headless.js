var headlessGL = require('gl');
const Matrix = require(__dirname + "\\modules\\matrix.js");

let m1 = new Matrix.Matrix(12,12);
let m2 = new Matrix.Matrix(12,12);

m1.randomInitialize();
m2.randomInitialize();

let mGL = new Matrix.MatrixGL('',m1,m2);
console.log(mGL.compute());




