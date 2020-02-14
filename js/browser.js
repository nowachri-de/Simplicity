const { Matrix } = require('./modules/matrix');
const assert = require('assert');

window.test =function test(){
    var matrixA = new Matrix(2, 2);
    matrixA.insertColumn(0, [0, 0]);
    matrixA.insertColumn(1, [1, 1]);
    let col0 = matrixA.getColumn(0);
    let col1 = matrixA.getColumn(1);
    let row0 = matrixA.getRow(0);
    let row1 = matrixA.getRow(1);

    assert.equal(col0[0], 0);
    assert.equal(col0[1], 0);
    assert.equal(col1[0], 1);
    assert.equal(col1[1], 1);

    assert.equal(row0[0], 0);
    assert.equal(row0[1], 1);
    assert.equal(row1[0], 0);
    assert.equal(row1[1], 1);
    console.log(matrixA.print(3));
}
test();