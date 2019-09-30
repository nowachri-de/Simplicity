var mnist = require('mnist'); // this line is not needed in the browser

var set = mnist.set(8000, 2000);

var trainingSet = set.training;
var testSet = set.test;

console.log(trainingSet[0].input.length);