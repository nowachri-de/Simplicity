const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserready.js');
const { TextureFactory} = require('./../modules/texturefactory.js');

browserReady();
describe('Test mathematical operators', function () {
  after(function () {
    if (TextureFactory.getReferenceCount() !== 0) {
      throw 'Expected reference count to be zero'
    }
  });
  
  it('Validate division', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.y][this.thread.x] / 3.0;
    }).setOutput([3, 3]);

    TestUtil.compare2DArray(test([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result(), [[0.3333333432674408, 0.6666666865348816, 1],
    [1.3333333730697632, 1.6666667461395264, 2],
    [2.3333334922790527, 2.6666667461395264, 3]]);
    test.delete();
  });

  it('Validate summation', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.y][this.thread.x] + a[this.thread.y][this.thread.x];
    }).setOutput([3, 3]);

    TestUtil.compare2DArray(test([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result(), [[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
    test.delete();
  });

  it('Validate substraction', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.x][this.thread.y] - a[this.thread.x][this.thread.y];
    }).setOutput([3, 3]);

    TestUtil.compare2DArray(test([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result(), [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    test.delete();
  });

  it('Validate modulo', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.x][this.thread.y] % 2;
    }).setOutput([3, 3]);

    TestUtil.compare2DArray(test([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result(), [[1, 0, 1], [0, 1, 0], [1, 0, 1]]);
    test.delete();
  });

  it('Validate substraction - result < 0', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.y][this.thread.x] - 2 * a[this.thread.y][this.thread.x];
    }).setOutput([3, 3]);

    TestUtil.compare2DArray(test([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result(), [[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]]);
    test.delete();
  });

  it('Validate summation - large results', function () {
    let test = Kernel.create(function main(a = [[]]) {
      return a[this.thread.y][this.thread.x] + a[this.thread.y][this.thread.x];
    }).setOutput([3, 3]);
    TestUtil.compare2DArray(test([[500000, 500000, 500000], [500000, 500000, 500000], [500000, 500000, 500000]]).result(), [[1000000, 1000000, 1000000],
    [1000000, 1000000, 1000000],
    [1000000, 1000000, 1000000]]);
    test.delete();
  });

  it('Result must be 7. This did not work propperly before the readable shader fix', function () {
    let test = Kernel.create(function main(x = [[]]) {
      let a = 2.0;
      return x[this.thread.x][this.thread.y] + a;
    }).setOutput([2, 2]);

    TestUtil.compare2DArray(test([[5, 5], [5, 5]]).result(), [[7, 7], [7, 7]]);
    test.delete();
  });

  it('Test binary division expression using 2D arrays as left hand and right hand operator', function () {
    let test = Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] / y[this.thread.x][this.thread.y];
    }).setOutput([2, 2]);
    
    TestUtil.compare2DArray(test([[3., 5.], [3., 5.]], [[3., 5.], [3., 5.]]).result(), [[1, 1], [1, 1]]);
    test.delete();
  });

  it('Test binary modulo expression using 2D arrays as left hand and right hand operator', function () {
    let test = Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] % y[this.thread.x][this.thread.y];
    }).setOutput([2, 2]);

    TestUtil.compare2DArray(test([[3., 5.], [3., 5.]], [[2., 2.], [2., 2.]]).result(), [[1, 1], [1, 1]]);
    test.delete();
  });

  it('Test binary substraction expression using 2D arrays as left hand and right hand operator', function () {
    let test = Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] - y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])
    
    TestUtil.compare2DArray(test ([[1., 2.], [3., 4.]], [[4., 5.], [6., 7.]]).result(), [[-3, -3], [-3, -3]]);
    test.delete();
  });

  it('Test multiple substraction expression using 2D arrays as left hand and right hand operator', function () {
    let test = Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] - y[this.thread.x][this.thread.y] - y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]], [[4., 5.], [6., 7.]]).delete();
  });

  it('Test self multiplication', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] * x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]).delete();
  });

  it('Test self summation using 2D array', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] + x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]).delete();
  });

  it('Test self summation using 1D array', function () {
    Kernel.create(function main(x = []) {
      return x[this.thread.x] + x[this.thread.x];
    }).setOutput([2, 2])([1., 2.]).delete();
  });

  it('Test self substraction 2D array', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] - x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]).delete();
  });
});
