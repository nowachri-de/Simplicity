const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserready.js');

browserReady();

describe('Test iterations', function () {
    it('Test iterating 2d array', function () {
        let test = Kernel.create(function main(y = [[]]) {
            return y[this.thread.y][this.thread.x];
        }).setOutput([5, 2]);

        TestUtil.compare2DArray(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result(), [[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]);
        test.delete();
    });

    it('Test iterating 1d array', function () {
        let test = Kernel.create(function main(y = []) {
            return y[this.thread.x];
        }).setOutput([5, 1]);

        TestUtil.compare1DArray(test([1., 2., 3., 4., 5.]).result(), [1., 2., 3., 4., 5.]);
        test.delete();
    });

    it('Test iteration using a float parameter', function () {
        let test = Kernel.create(function main(i = 0.) {
            return i;
        }).setOutput([5, 2]);

        TestUtil.compare2DArray(test(1.0).result(), [[1., 1., 1., 1., 1.], [1., 1., 1., 1., 1.]]);
        test.delete();
    });

    it('Test iteration using an int parameter', function () {
        let test = Kernel.create(function main(i = 0) {
            return i;
        }).setOutput([5, 2]);

        TestUtil.compare2DArray(test(1).result(), [[1., 1., 1., 1., 1.], [1., 1., 1., 1., 1.]]);
        test.delete();
    });

    it('Test iterating 2 arrays', function () {
        let test = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
        }).setOutput([5, 2]);

        TestUtil.compare2DArray(test([[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]], [[1., 2., 3., 4., 5.], [1., 2., 3., 4., 5.]]).result(), [[2., 4., 6., 8., 10.], [2., 4., 6., 8., 10.]]);
        test.delete();
    });

    it('Test iterating this.thread.x', function () {
        let test = Kernel.create(function main() {
            return this.thread.y;
        }).setOutput([5, 2]);

        TestUtil.compare2DArray(test().result(), [[0.,0.,0.,0.,0.], [1.,1.,1.,1.,1.]]);
        test.delete();
    });

    it('Test iterating vertical 1d array', function () {
        let test = Kernel.create(function main(y = [[]]) {
            return y[this.thread.y][this.thread.x];
        }).setOutput([1, 5]);

        TestUtil.compare2DArray(test([[1.],[2.],[3.],[4.],[5.]]).result(), [[1.],[2.],[3.],[4.],[5.]]);
        test.delete();
    });
});
