var assert = require('assert');
const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { FunctionBuilder } = require(__dirname + '\\..\\modules\\kernel.js');

describe('CodeGenerator', function () {

/*
it('', function () {
  //
  Kernel.create(function main(weights=[[]], dEtot2dOut=[], dOut2dNet=[], prevOutput=[], learningRate = 0.) {
    //X,Y  O   W    Err
    //0,0  0  0,0    0
    //1,0  1  0,1    1
    //0,1  0  1,0    0
    //1,1  1  1,1    1
    //0,2  0  2,0    0
    //1,2  1  2,1    1

    let weight = weights[this.thread.y][this.thread.x]; //this is the weight betwenn output layer neuron and hidden layer neuron
    let dETot2dOut = dEtot2dOut[this.thread.x]; //this is dEOut2dOut
    let dOut2dNet_ = dOut2dNet[this.thread.x];  //this is dOut2dNet
    let dNet2dWeight = prevOutput[this.thread.x];  //this is dNetOut2dWeight
    return weight - (learningRate * (dETot2dOut * dOut2dNet_ * dNet2dWeight)); //updated weight
}).setOutput([2, 2])([[1,2],[1,2]],[1,2],[1,2],[1,2],0.5);
});

  it('', function () {
    //
    Kernel.create(function main(a = [[]], b = 0, c = 0.) {
      return a[this.thread.x][this.thread.y] + b + c;
    }).setOutput([3, 3])([[1, 1, 1], [2, 2, 2], [3, 3, 3]], 10, 11);
  });
  it('', function () {
    //
    Kernel.create(function main(a = [[]], b = []) {
      return a[this.thread.x][this.thread.y] + b[this.thread.x];
    }).setOutput([3, 3])([[1, 1, 1], [2, 2, 2], [3, 3, 3]], [1, 1, 1]);
  });

  it('', function () {
    //
    Kernel.create(function main(a = []) {
      return a[this.thread.x];
    }).setOutput([10, 1])([6., 7., 7., 5., 7., 7., 7., 7., 7., 7.]);
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 10;
      let b = 0;
      while (b < a) {
        b += 2;
      }

      return b;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 10;
      let b = 0;
      for (let i = 0; i < a; i++) {
        b += 2;
      }

      return b;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = (2. * 3. * 4.) / 120.0;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120.0;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = (2 * 3 * 4) / 120;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 2 * 3 * 4;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 2.0 * 3 * 4.0;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 2.0 * 3.0 * 4.0;

      return a;
    }).setOutput([2, 2])();
  });
  it('', function () {
    //
    Kernel.create(function main() {
      let a = 2.0 * 3.0;

      return a;
    }).setOutput([2, 2])();
  });
  it('Should throw exception since no parameters specified but function is called using parameters', function () {
    try {
      Kernel.create(function main() {
        let a = 2.0 * 3.0;
        return a;
      }).setOutput([2, 2])([[5, 5], [5, 5]]);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, 'Mismatch between number of declared function parameters and number of actually passed arguments');
    }
  });


  it('Result must be 7. This did not work propperly before the readable shader fix', function () {
    //
    Kernel.create(function main(x = [[]]) {
      let a = 2.0;
      return x[this.thread.x][this.thread.y] + a;
    }).setOutput([2, 2])([[5, 5], [5, 5]]);
  });

  it('', function () {
    Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] / y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[3., 5.], [3., 5.]], [[2., 2.], [2., 2.]]);
  });

  it('', function () {
    Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] % y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[3., 5.], [3., 5.]], [[2., 2.], [2., 2.]]);
  });
  it('', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] * x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]);
  });
  it('', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] + x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]);
  });

  it('', function () {
    Kernel.create(function main(x = [[]]) {
      return x[this.thread.x][this.thread.y] - x[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]);
  });
  it('', function () {
    Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] - y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]], [[4., 5.], [6., 7.]]);
  });

  it('', function () {
    Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] - y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]], [[1., 2.], [3., 4.]]);
  });
  it('', function () {
    Kernel.create(function main(x = [[]], y = [[]]) {
      return x[this.thread.x][this.thread.y] + y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]], [[1., 2.], [3., 4.]]);
  });

  it('test created options using 2d array', function () {
    Kernel.create(function main(y = [[]]) {
      return y[this.thread.x][this.thread.y];
    }).setOutput([2, 2])([[1., 2.], [3., 4.]]);
  });

  it('test created options using array', function () {
    Kernel.create(function main(y = []) {
      return y[this.thread.x];
    }).setOutput([1, 1])([1., 2., 3.]);
  });


  it('test created options using float parameter', function () {
    Kernel.create(function main(i = 0.) {
      return i;
    }).setOutput([1, 1])(1.0);
  });


  it('test created options using int parameter', function () {
    Kernel.create(function main(i = 0) {
      return i;
    }).setOutput([1, 1])(1);
  });

  it('test created options using array parameter', function () {
    Kernel.create(function main(y = []) {
      return y[this.thread.x];
    }).setOutput([1, 1])([1, 1]);
  });

  it('should throw an exception since x is used but not declared', function () {
    try {
      Kernel.create(function main(y = []) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(":x undefined"));
    }
  });

  it('should throw an exception since x is used but not declared', function () {
    try {
      Kernel.create(function main(y = []) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(":x undefined"));
    }
  });

  it('should throw an exception since y is used but not declared', function () {
    try {
      Kernel.create(function main(x = 0) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(":y undefined"));
    }
  });

  it('should throw an exception since y is not an array', function () {
    try {
      Kernel.create(function main(y = 0, x = 0, z = 0) {
        y[x][z];
      }).setOutput([1, 2])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(':y is of type int but must be array type'));
    }
  });

  it('should throw an exception since variable is not initialized', function () {

    try {
      Kernel.create(function main() {
        let x;
      }).setOutput([1, 1])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(true, e.includes(':Variable declarator must be initialized'));
    }
  });
*/
  it('test multiple functions', function () {
    Kernel.create(function main(a=[[]]) {
      return  a[this.thread.x][this.thread.y];
    }
    ).setOutput([2,2])([[1,2],[1,2]]);
  });


});
