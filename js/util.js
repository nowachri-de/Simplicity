function gpuPrint(program,textureResult,textureReadable,targetIndex){
	var resultReader = new ResultReader(program.gl,"canvas");
	var result = resultReader.read(textureResult,textureReadable,targetIndex);
	result.print(5);
}

function mathJSPrint(matrixA,matrixB,numDigits){
	var result = jsMatMul(matrixA,matrixB);
	var resultDimensions = matrixA.getOutputDimensions(matrixB);
	for (var row = 0; row < resultDimensions.numRows; row++) {
		var tmp = "";
		for (var col = 0; col < resultDimensions.numColumns; col++) {
			 tmp += (result.subset(math.index(row, col))).toFixed(numDigits) + " ; ";
		}
		console.log(tmp);
	}	
}

function getSimpleMatrixInfo(matrixA,matrixB){
	return "A(" + matrixA.numColumns + "x" + matrixA.numRows+") x B(" + matrixB.numColumns + "x" + matrixB.numRows+")";
}

function logTime(matrixA,matrixB,matrixResult){
	var message = "GPU: Time for matrix multiplication on GPU for A(" + matrixA.numColumns + "x" + matrixA.numRows+") x B(" + matrixB.numColumns + "x" + matrixB.numRows+") took " +matrixResult.duration.toFixed(5) + " milliseconds (" + (matrixResult.duration / 1000.0).toFixed(5) + " seconds)."
	console.log(message);
	return message;
}

function jsMatMul(matrixA,matrixB){
	var mat1 = math.matrix(matrixA.as2DArray());
	var mat2 = math.matrix(matrixB.as2DArray());
	var resultDimensions = matrixA.getOutputDimensions(matrixB);

	var result = math.multiply(mat1,mat2);
	return result;
}

function validateMultiplicationResult(matrixA,matrixB,result){
	var outputDimensions = matrixA.getOutputDimensions(matrixB);
	var TOLERANCE = 0.0003;
	if (outputDimensions.numRows != result.numRows){
		throw "result row dimension " + "does not match expected dimension";
	}
	var jsResult = jsMatMul(matrixA,matrixB);
	for (var row = 0; row < result.numRows; ++row) {
		for (var column = 0; column < result.numColumns; ++column) {
			var jsValue = jsResult.subset(math.index(row, column));
			var value   = result.getValue(row,column);
			
			if (Math.abs(jsValue - value) > TOLERANCE){
				throw "matrix multiplication result is wrong " + value + " does not match math.js matric multiplication value of " + jsValue;
			}
		}
	}
}

function displayMessage(elementID,text){
	var p = document.createElement("p");
	var t = document.createTextNode(text);
	p.appendChild(t);
	document.getElementById(elementID).appendChild(p);  
}

function displayMatrix(elementID,matrix,numberDigits){
	for (var row = 0; row < matrix.numRows; ++row) {
		var p = document.createElement("p");
		var textContent = "";
		for (var column = 0; column < matrix.numColumns; ++column) {
			textContent += matrix.getValue(row,column).toFixed(numberDigits);
			textContent += " ; ";
		}
		var t = document.createTextNode(textContent);
		p.appendChild(t);
		document.getElementById(elementID).appendChild(p);  
	}
}