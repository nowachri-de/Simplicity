var headlessGL = require('gl');
const {Kernel} = require('./kernel.js');

function randomNumbersAtScale1D(length, divisor) {
    let matrix = [];
    for (let i = 0; i < length; i++) {
        for (var j = 0; j < length; j++) { // i++ needs to be j++
            matrix[j] = (Math.random() / divisor);
        }
    }
    return matrix;
}

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

function sigmoidActivation(i = 0.) {
    return 1. / (1. + pow(2.71828182845904523536, -i));
}
function derivativeSigmoid(i = 0.) {
    return i - pow(i, 2.);
}
function dOut2dNet(outt=0.) {
    return derivativeSigmoid(outt);
}

class TextureUtil{
    static data2Texture2D(data, dimensionX, dimensionY, gl) {
        const kernelData2Texture2D = Kernel.create(
            function main(dataIn = [[]]) {
                return dataIn[this.thread.y][this.thread.x];
            }
        );

        kernelData2Texture2D.setGL(gl);
        kernelData2Texture2D.setOutput([dimensionX, dimensionY]);
        let rawResult = kernelData2Texture2D(data).rawResult();
        kernelData2Texture2D.delete();
        return rawResult;
    }

    static data2Texture1D(data, length, gl) {
        const kernelData2Texture1D = Kernel.create(
            function main(dataIn = []) {
                return dataIn[this.thread.x];
            }
        ).setOutput([length]).setGL(gl);

        let rawResult = kernelData2Texture1D(data).rawResult();
        kernelData2Texture1D.delete();
        return rawResult;
    }

    static randomBias(length,divisor,gl){
        return TextureUtil.data2Texture1D(randomNumbersAtScale1D(length, divisor), length, gl);
    }
    
    static  randomWeights(x, y, divisor,gl) {
        return TextureUtil.data2Texture2D(randomNumbersAtScale2D(x, y, divisor), x, y, gl);
    }

    static createGL(){
        let gl = headlessGL(10, 10, {
			premultipliedAlpha: false,
			preserveDrawingBuffer: false
		});

		if (gl === undefined)
			throw "webgl is not supported.";
		// must support float texture
		let ext;
		try {
			ext = gl.getExtension("OES_texture_float");
		} catch (e) { }

		if (!ext) {
			console.log("Your browser does not support OES_texture_float extension.");
		}

		return gl;
    }

    static getTotalError(error, length) {
        return errorTot(error, length).result();
    }
    
    static computeError(result, target, numNeurons) {
        error.setOutput([numNeurons]);
        return error(result, target);
    }
    
    static randomNumbersAtScale2D(x, y, divisor) {
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
    
    static feedForward(dataIn, weights, biasWeights, numberOfNeurons) {
        KernelFeedForward.setOutput([numberOfNeurons]);
        return KernelFeedForward(dataIn, weights, numberOfNeurons, biasWeights);
    }
    static backpropagateOutput(numberOfNeurons, numberOfInputNeurons, weights, biasWeights, dEtot2dOut, dOut2dNet, input, learningRate) {
        backPropOutput.setOutput([numberOfNeurons, numberOfInputNeurons]);
        updateBias.setOutput([numberOfNeurons]);
    
        //will return updated bias weights
        return {
            weights: backPropOutput(weights, dEtot2dOut, dOut2dNet, input, learningRate),
            biasWeights: updateBias(biasWeights, dEtot2dOut, dOut2dNet, learningRate),
        }
    }
    
    static backpropagateHidden(numInputNeurons, numNeurons, dEtot2dOut, dOut2dNet, input, weights, biasWeights, learningRate) {
    
        backPropHidden.setOutput([numNeurons, numInputNeurons]); //[target neurons, input neurons]
        computeDerivatives.setOutput([numNeurons, numInputNeurons]); //[target neurons, input neurons]
        sumUp.setOutput([numInputNeurons]); //number input neurons
    
        /**
         * Sum all dEtot2dOut_ * dOut2dNet_ * dNet2dOprev_ per neuron
        */
        let sumU = sumUp(computeDerivatives(weights, dEtot2dOut, dOut2dNet).result(), numNeurons); //second parameter is the number of target neurons
    
        return {
            weights: backPropHidden(sumU.result(), dOut2dNet, input, weights, learningRate),
            biasWeights: updateBias(biasWeights, sumU.result(), dOut2dNet, learningRate),
        }
    }
    
    static updateBiasWeights(length, bias, dEtot2dOut, dOut2dNet, learningRate) {
        updateBias.setOutput([length]);
    
        //will return updated bias weights
        return updateBias(bias, dEtot2dOut, dOut2dNet, learningRate);
    }
    
    static readObject(fileName) {
        return JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }
    
    static readAsTexture2D(file, d1, d2) {
        return data2Texture2D(readObject(file), d1, d2);
    }
    
    static readAsTexture1D(file, dimensions) {
        return data2Texture1D(readObject(file), dimensions);
    }
    
    static writeArray(file,array){
        var filestr = fs.createWriteStream(file);
        filestr.on('error', function(err) { /* error handling */ });
        filestr.write('[');
        array.forEach(function(v) { filestr.write(v+","); });
        filestr.write(']');
        filestr.end();
    }
}
const sharedGL = TextureUtil.createGL();

const backPropOutput = Kernel.create(
    function main(weights = [[]], dEtot2dOut = [], dOut2dNet = [], prevOutput = [], learningRate = 0.) {
        //X,Y   W    dETot2dOut  dNet2dWeight
        //0,0  0,0        0           0
        //1,0  0,1        1           1
        //0,1  1,0        0           0
        //1,1  1,1        1           1
        //0,2  2,0        0           0
        //1,2  2,1        1           1

        let weight = weights[this.thread.y][this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
        let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
        let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
        let dNet2dWeight = prevOutput[this.thread.x];  //this is dNetOut2dWeight
        return weight - (learningRate * (dETot2dOut * dOut2dNet_ * dNet2dWeight)); //updated weight
    }
).setGL(sharedGL);//[num output neurons, num output neurons + 1 bias]

const KernelFeedForward = Kernel.create(
    [derivativeSigmoid,sigmoidActivation],
    function dOut2dNet(outt = 0.) {
        return derivativeSigmoid(outt);
    },
    function main(dataIn=[], weights=[[]], numInputs = 0, bias=[]) {
        let sum = 0.;
        let max = numInputs;
        let i = 0;
        sum += dataIn[i] * weights[i][this.thread.x];
        for (let i = 0; i < 4096; i++) {
            if (i >= max){break;}
            sum += dataIn[i] * weights[i][this.thread.x];
        }
        let outt = sigmoidActivation(sum + bias[this.thread.x]);
        dOut2dNet(outt); //store for later use in backpropagation
        return outt;
    }
).setGL(sharedGL);


const error = Kernel.create(
    function dEtot2dOut(outt =0., target=0.) {
        return -(target - outt);
    },
    function main(outputs=[], targets=[]) {
        dEtot2dOut(outputs[this.thread.x], targets[this.thread.x]);
        return pow(targets[this.thread.x] - outputs[this.thread.x], 2.0) * 0.5;
    }
).setGL(sharedGL);

const errorTot = Kernel.create(
    function main (dError=[], length = 0) {
        let total = 0.;
        for (let index = 0; index < 4096; index++) {
            if (index >= length){break;}
            total += dError[index];
        }
        return total;
    }
).setOutput([1]).setGL(sharedGL);; //single value

const updateBias = Kernel.create(
    function main(bias=[], dEtot2dOut=[], dOut2dNet=[], learningRate=0.) {
        //X,Y  O   W    Err
        //0,0  0  0,0    0
        //1,0  1  0,1    1
        //0,1  0  1,0    0
        //1,1  1  1,1    1
        //0,2  0  2,0    0
        //1,2  1  2,1    1

        let biasWeight = bias[this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
        let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
        let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
        return biasWeight - (learningRate * (dETot2dOut * dOut2dNet_ * 1.0)); //updated bias
    }
).setGL(sharedGL); //num Bias

const backPropHidden = Kernel.create(
    function main(sums=[], dOut2dNet=[], prevOutput=[], weights=[[]], learningRate=0.) {
    //X,Y   W       dETot     dOut2dNet     prevOutput
    //0,0  0,0        0           0             0
    //1,0  0,1        0           0             0
    //0,1  1,0        1           1             1
    //1,1  1,1        1           1             1
    //0,2  2,0        2           2             2
    //1,2  2,1        2           2             2

    let dETot = sums[this.thread.y];
    let dETot2dOutPre = dETot * dOut2dNet[this.thread.y] * prevOutput[this.thread.y];
    let updatedWeight = weights[this.thread.y][this.thread.x] - (learningRate * dETot2dOutPre);
    return updatedWeight;
}).setGL(sharedGL);

const computeDerivatives = Kernel.create(
    function main(weights=[[]], dEtot2dOut=[], dOut2dNet=[]) {
        //X,Y  O   W    Err
        //0,0  0  0,0    0         
        //1,0  1  0,1    1
        //0,1  0  1,0    0
        //1,1  1  1,1    1
        //0,2  0  2,0    0
        //1,2  1  2,1    1

        /*let dEtot2dOut_ = dEtot2dOut[this.thread.x];
        let dOut2dNet_ = dOut2dNet[this.thread.x];
        let dNet2dOprev_ = weights[this.thread.y][this.thread.x];*/

        return dEtot2dOut[this.thread.x] * dOut2dNet[this.thread.x] * weights[this.thread.y][this.thread.x];
    }
).setGL(sharedGL); //[num output neurons, num output neurons + 1 bias] 

const sumUp = Kernel.create(
    function main(derivatives=[[]], numTargets = 0) {
        let sum = 0.;
        for (let i = 0; i < 4096; ++i) {
            if (i >= numTargets){break;}
            sum += derivatives[this.thread.x][i];
        }
        return sum;
    }
).setGL(sharedGL); //num neurons in current layer

module.exports = {
    Util : TextureUtil
}