"use strict";
const { GPU, input, Input } = require('gpu.js');
const gpu = new GPU({
    mode : 'headlessgl'
});

function sigmoidActivation(i) {
    return 1 / (1 + Math.pow(Math.E, -i));
}

function derivativeSigmoid(out) {
    return out - Math.pow(out, 2);
}

function update(oldweight, derivative, learningRate) {
    return oldweight - (derivative * learningRate);
}

function addBias(a, b) {
    return a + b[this.thread.y][this.thread.x];
}

function matMul(input, weights, numRows) {
    let sum = 0;
    for (let i = 0; i < numRows; i++) {
        sum += input[this.thread.y][i] * weights[i][this.thread.x];
    }
    return sum;
}

gpu.addFunction(matMul);
gpu.addFunction(addBias);
gpu.addFunction(sigmoidActivation);
gpu.addFunction(derivativeSigmoid);

const softmax = gpu.createKernel(function (a) {
    let sum = 0;
    for (let i = 0; i < this.constants.outputSize; i++) {
        sum += Math.exp(a[i]);
    }
    return Math.exp(a[this.thread.x]) / sum;
}, {
        constants: {
            outputSize: 3
        }
    }
).setOutput([2]);


const feedForward = gpu.createKernelMap({
    net: function mul(dataIn,weights,numRows,bias) {
        let sum = 0;
        for (let i = 0; i < numRows; i++) {
            sum += dataIn[this.thread.y][i] * weights[i][this.thread.x];
        }
        return sum + bias[this.thread.y][this.thread.x];
    },
    dOut2dNet: function derivative(out){
       return derivativeSigmoid(out);
    }

},function (dataIn,weights,bias) {
    
    let net = mul(dataIn,weights,this.constants.numRows,bias);
    let out = sigmoidActivation(net);
    let derivative = derivative(out);
    return out;
    
}, {
        constants: {
            numRows: 2,
        }
    }
).setOutput([2,1]);

const error = gpu.createKernelMap({
    dEtot2dOut : function derivative(out,target){
        return -(target-out);
    }
},function (outputs, targets) {
   
    let out = Math.pow(targets[this.thread.y][this.thread.x] - outputs[this.thread.y][this.thread.x],2) * 0.5;
    derivative(outputs[this.thread.y][this.thread.x],targets[this.thread.y][this.thread.x]); 
    return out;
}
).setOutput([2,1]);

const errorTot = gpu.createKernel(function (dError,lenght) {
    let total = 0;
    for (let index = 0; index < lenght; index++) {
        total +=dError[index];
    }
    return total;
}).setOutput([1]);

const backPropOutput = gpu.createKernel(function(weights,dEtot2dOut,dOut2dNet,prevLayer,learningRate) {
    let weight = weights[this.thread.x][this.thread.y]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let error  = dEtot2dOut[this.thread.y]; //this is EOut2dOut
    let dOdN   = dOut2dNet[this.thread.y];  //this is dOut2dNet
    let pOut   = prevLayer[this.thread.y];  //this is dNetOut2dWeight
 
    return weight-(learningRate*(error*dOdN*pOut));
}).setOutput([2,2]);

const backPropOutputBias = gpu.createKernel(function(bias,dEtot2dOut,dOut2dNet,learningRate) {
    let weight = bias[this.thread.x][this.thread.y]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let error  = dEtot2dOut[this.thread.y]; //this is EOut2dOut
    let dOdN   = dOut2dNet[this.thread.y];  //this is dOut2dNet
    let pOut   = 1  //this is dNetOut2dWeight
 
    return weight-(learningRate*(error*dOdN*pOut));
}).setOutput([2,2]);

const backPropHidden = gpu.createKernel(function(weights,dEtot2dOut,dOut2dNet) {
    let weight = weights[this.thread.x][this.thread.y];
    let error  = dEtot2dOut[this.thread.y];
    let dOdN   = dOut2dNet[this.thread.y];
    //let pOut   = prevLayer[this.thread.y];
 
    return error*dOdN*weight;
}).setOutput([2,2]);

const backPropHiddenBias = gpu.createKernel(function(bias,dEtot2dOut,dOut2dNet,learningRate) {
    let weight = bias[this.thread.x][this.thread.y]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let error  = dEtot2dOut[this.thread.y]; //this is EOut2dOut
    let dOdN   = dOut2dNet[this.thread.y];  //this is dOut2dNet
    let pOut   = 1  //this is dNetOut2dWeight
 
    return weight-(learningRate*error*dOdN*weight);
}).setOutput([2,2]);

const sumUp = gpu.createKernel(function(matrix,dOut2dNet,input,weights,learningRate) {
    let a = matrix[this.thread.y][this.thread.x];
    let b = matrix[(this.thread.y + 1)%2][this.thread.x];
    let result = (a+b)*dOut2dNet[this.thread.y]*input[this.thread.y];
    result = weights[this.thread.x][this.thread.y]  - (learningRate * result); //update weight
    return  result;
}).setOutput([2,2]);

let learningRate = .5;
let w1 = [[.15, .25], [.20, .30]];
let w2 = [[.4, .5], [.45, .55]];

let w = [w1, w2];
let b1 = [.35, .35];
let b2 = [.60, .60];
let b = [b1, b2];
let dataIn = [[.05, .10]];  
let target = [[.01,.99]];

var e;
var l1ff;
var l2ff
for (let j=0; j < 100;++j){
    for (let i=0; i < 100;++i){
        l1ff = feedForward(dataIn,w1,b1);
        l2ff = feedForward(l1ff.result,w2,b2);
        e    = error(l2ff.result,target);
        //console.log(errorTot(e.result,2));
        //console.log(l2ff.result);
        w2=backPropOutput(w2,e.dEtot2dOut,l2ff.dOut2dNet,l1ff.result,learningRate);
        //b2=backPropOutputBias([b2,b2],e.dEtot2dOut,l2ff.dOut2dNet,learningRate)[0];
        w1=sumUp(backPropHidden(w2,e.dEtot2dOut,l2ff.dOut2dNet),l1ff.dOut2dNet,dataIn,w1,learningRate);
        //b1=backPropHiddenBias([b1,b1],e.dEtot2dOut,l2ff.dOut2dNet,learningRate)[0];
        
    }
    console.log((j+1)*100 +' ' +l2ff.result);
    console.log(errorTot(e.result,2));
    
}


//console.log(e);
/*
//console.log(e);
//console.log(e.dEtot2dOut);
//console.log(r2.dOut2dNet);
//console.log(r1.result);

//console.log(r1);
//console.log(r2);
//console.log(e);

//console.log('-----------------------------');
//console.log(e.dEtot2dOut[0][0]);
//console.log(r2.dOut2dNet[0][0]);
//console.log(r1.result[0][0]);
//console.log(w2[0][0]);
console.log(w2[0][0]-(0.5*(e.dEtot2dOut[0][0]*l2ff.dOut2dNet[0][0]*l1ff.result[0][0])));

//console.log('-----------------------------');
//console.log(e.dEtot2dOut[0][0]);
//console.log(r2.dOut2dNet[0][0]);
//console.log(r1.result[0][0]);
//console.log(w2[1][0]);
console.log(w2[1][0]-(0.5*(e.dEtot2dOut[0][0]*l2ff.dOut2dNet[0][0]*l1ff.result[0][0])));

//console.log('-----------------------------');
//console.log('-----------------------------');
//console.log(e.dEtot2dOut[0][1]);
//console.log(r2.dOut2dNet[0][1]);
//console.log(r1.result[0][1]);
//console.log(w2[0][1]);
console.log(w2[0][1]-(0.5*(e.dEtot2dOut[0][1]*l2ff.dOut2dNet[0][1]*l1ff.result[0][1])));

//console.log('-----------------------------');
//console.log(e.dEtot2dOut[0][1]);
//console.log(r2.dOut2dNet[0][1]);
//console.log(r1.result[0][1]);
//console.log(w2[1][1]);
console.log(w2[1][1]-(0.5*(e.dEtot2dOut[0][1]*l2ff.dOut2dNet[0][1]*l1ff.result[0][1])));


//console.log(w2);
console.log(backPropOutput(w2,e.dEtot2dOut,l2ff.dOut2dNet,l1ff.result,2,.5));
console.log('error');
console.log(e);
console.log('l1ff');
console.log(l1ff);
console.log('l2ff');
console.log(l2ff);
console.log('hidden');
console.log(backPropHidden(w2,e.dEtot2dOut,l2ff.dOut2dNet));
console.log('sumUp');
console.log(sumUp(backPropHidden(w2,e.dEtot2dOut,l2ff.dOut2dNet),l1ff.dOut2dNet,dataIn,w1));
*/
softmax.destroy();
feedForward.destroy();
backPropOutput.destroy();
backPropHidden.destroy();
errorTot.destroy();
error.destroy();