function gpuPrint(program,resultTexture,readableTexture,targetIndex){
	var resultReader = new ResultReader(program.gl,"canvas");
	var result = resultReader.read(resultTexture,readableTexture,targetIndex);
	result.print(5);
}

function mathJSPrint(matrixA,matrixB,numDigits){
	var result = jsMatMul(matrixA,matrixB);
	var resultDimensions = matrixA.getResultMatrixDimensions(matrixB);
	for (var row = 0; row < resultDimensions.height; row++) {
		var tmp = "";
		for (var col = 0; col < resultDimensions.width; col++) {
			 tmp += (result.subset(math.index(row, col))).toFixed(numDigits) + " ; ";
		}
		console.log(tmp);
	}	
}

function getSimpleMatrixInfo(matrixA,matrixB){
	return "A(" + matrixA.width + "x" + matrixA.height+") x B(" + matrixB.width + "x" + matrixB.height+")";
}

function logTime(matrixA,matrixB,matrixResult){
	var message = "GPU: Time for matrix multiplication on GPU for A(" + matrixA.width + "x" + matrixA.height+") x B(" + matrixB.width + "x" + matrixB.height+") took " +matrixResult.duration.toFixed(5) + " milliseconds (" + (matrixResult.duration / 1000.0).toFixed(5) + " seconds)."
	console.log(message);
	return message;
}

function jsMatMul(matrixA,matrixB){
	var mat1 = math.matrix(matrixA.as2DArray());
	var mat2 = math.matrix(matrixB.as2DArray());
	var resultDimensions = matrixA.getResultMatrixDimensions(matrixB);

	var result = math.multiply(mat1,mat2);
	return result;
}

function validateMultiplicationResult(matrixA,matrixB,result){
	var outputDimensions = matrixA.getResultMatrixDimensions(matrixB);
	var TOLERANCE = 0.0003;
	if (outputDimensions.height != result.height){
		throw "result row dimension " + "does not match expected dimension";
	}
	var jsResult = jsMatMul(matrixA,matrixB);
	for (var row = 0; row < result.height; ++row) {
		for (var column = 0; column < result.width; ++column) {
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
	for (var row = 0; row < matrix.height; ++row) {
		var p = document.createElement("p");
		var textContent = "";
		for (var column = 0; column < matrix.width; ++column) {
			textContent += matrix.getValue(row,column).toFixed(numberDigits);
			textContent += " ; ";
		}
		var t = document.createTextNode(textContent);
		p.appendChild(t);
		document.getElementById(elementID).appendChild(p);  
	}
}