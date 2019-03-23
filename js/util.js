
function mathJSPrint(matrixA,matrixB,numDigits){
	/*
	Compare the result of the GPU matrix multiplication
	With the result of a matrix multiplication on CPU
	*/
	var mat1 = math.matrix(matrixA.as2DArray());
	var mat2 = math.matrix(matrixB.as2DArray());
	var resultDimensions = matrixA.getOutputDimensions(matrixB);

	var result2 = math.multiply(mat1,mat2);
	console.log("JS MatMul ---------------------");
	for (var row = 0; row < resultDimensions.numRows; row++) {
		var tmp = "";
		for (var col = 0; col < resultDimensions.numColumns; col++) {
			 tmp += (result2.subset(math.index(row, col))).toFixed(numDigits) + " ; ";
		}
		console.log(tmp);
	}	
}

function logTime(matrixA,matrixB,t1,t0){
	
	console.log("GPU time for matmul A(" + matrixA.numColumns + "x" + matrixA.numRows+") X (" + matrixB.numColumns + "x" + matrixB.numRows+") " + (t1 - t0) + " milliseconds.");
	return t1 - t0;
}