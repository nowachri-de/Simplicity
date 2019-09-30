

function computeSigmoid(netValue){
	return 1/(1+ Math.exp(-netValue));
}

function errorTotal(outMatrix,targetMatrix){
	var totalError = 0;
	for (var i=0; i < outMatrix.numRows;++i){
		totalError += 0.5 * Math.pow(targetMatrix.getValue(i,0) - outMatrix.getValue(i,0),2);
	}
	return totalError;
}

function newWeight(weight,target,out,prevOut,learningRate){
	return weight - learningRate * dEtotal_dWeight(target,out,prevOut)
}

function dEtotal_dWeight(target,out,prevOut){
	return dEtotal_dOut(out,target) * dOut_dNet(out) * dNet_dWeight(prevOut);
}

function dEtotal_dOut(out,target){
	return (out-target);
}

//derivative of logistic function is simple
function dOut_dNet(out){
	return out*(1-out);
}

function dNet_dWeight(prevOut){
	return prevOut;
}

function getMattMazureValues(){
	var weightMatrixLayer1 = new Matrix(2,2);
	var weightMatrixLayer2 = new Matrix(2,2);
	var inputMatrix        = new Matrix(2,1);
	
	
	//weights are organized in rows
	weightMatrixLayer1.setValue(0,0,.15);
	weightMatrixLayer1.setValue(0,1,.20);	
	weightMatrixLayer1.setValue(1,0,.25);
	weightMatrixLayer1.setValue(1,1,.30);
	
	
	//weights are organized in rows
	weightMatrixLayer2.setValue(0,0,.40);
	weightMatrixLayer2.setValue(0,1,.45);	
	weightMatrixLayer2.setValue(1,0,.50);
	weightMatrixLayer2.setValue(1,1,.55);
	
	inputMatrix.setValue(0,0,.05);
	inputMatrix.setValue(1,0,.10);
	inputMatrix.setValue(2,0,1);
	
	return{
		inputValues: inputMatrix,
		layer1Weights: weightMatrixLayer1,
		layer2Weights: weightMatrixLayer2,
		layer1Bias: .35,
		layer2Bias: .60,
		learningRate: .5
	}
}