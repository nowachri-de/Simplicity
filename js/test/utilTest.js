var assert = require('assert');
const { TestUtil } = require(__dirname + '\\..\\modules\\testutil.js');


describe('Test TestUtil - Verify that comparison functions work as expected', function () {
  it('Test compare2DArray', function () {
    TestUtil.compare2DArray([[1,2,3,4,5],[1,2,3,4,5]],[[1,2,3,4,5],[1,2,3,4,5]]);
  });

  it('Test compare1DArray', function () {
    TestUtil.compare1DArray([1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]);
  });

  it('Verify that exception is thrown compare2Darray - mismatch', function () {
    try {
      TestUtil.compare2DArray([[1,2,3,4,5],[1,2,3,4,5]],[[1,2,3,4,5],[1,2,3,4,6]]);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes("array mistmatch 5 6"));
    }
  });

  it('Verify that exception is thrown compare1Darray  - mismatch', function () {
    try {
      TestUtil.compare1DArray([1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,7,9,10]);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes("array mistmatch 8 7"));
    }
  });

});
