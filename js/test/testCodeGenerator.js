var assert = require('assert');
const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { FunctionBuilder } = require(__dirname + '\\..\\modules\\kernel.js');

describe('CodeGenerator', function () {
  
  it('test created options using 2d array', function () {
    Kernel.create(function main(y=[[]]) {
      return y[this.thread.x][this.thread.y];
    }).setOutput([10, 10])([[1.,2.],[3.,4.]]);
  });

  /*
  it('test created options using array', function () {
    Kernel.create(function main(y=[]) {
      return y[this.thread.x][this.thread.y];
    }).setOutput([1, 1])([1.,2.,3.]);
  });
  
  it('test created options using float parameter', function () {
    Kernel.create(function main(i = 0.) {
    }).setOutput([1, 1])(1, 1);
  });

  
 it('test created options using int parameter', function () {
    Kernel.create(function main(i = 0;) {
    }).setOutput([1, 1])(1, 1);
  });

  it('test created options using array parameter', function () {
    Kernel.create(function main(y = []) {
      
    }).setOutput([1, 1])(1, 1);
  });

  it('should throw an exception since x is used but not declared', function () {
    try {
      Kernel.create(function main(y = []) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, "[30,34]:x undefined");
    }
  });

  it('should throw an exception since x is used but not declared', function () {
    try {
      Kernel.create(function main(y = []) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, "[30,34]:x undefined");
    }
  });

  it('should throw an exception since y is used but not declared', function () {
    try {
      Kernel.create(function main(x = 0) {
        y[x];
      }).setOutput([1, 1])(1, 1);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, "[31,36]:y undefined");
    }
  });

  it('should throw an exception since y is not an array', function () {
    try {
      Kernel.create(function main(y = 0, x = 0, z = 0) {
        y[x][z];
      }).setOutput([1, 2])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, '[46,54]:y is of type int but must be array type');
    }
  });

  it('should throw an exception since variable is not initialized', function () {

    try {
      Kernel.create(function main() {
        let x;
      }).setOutput([1, 1])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, '[31,32]:Variable declarator must be initialized');
    }
  });
  it('should not throw an exception since variable type has been specified', function () {
    Kernel.create(function main() {
      let x = 0;
    }).setOutput([1, 1])([1.0, 2.0], 2);

  });



  it('should translate variable declaration with initialization ', function () {
    Kernel.create(function main() {
      let a = 0;
      let b = 0;
      let c = 0;
      for (let a = 0; a < 10; ++a) {
        console.log(a, b);
      }
      if (a < 10) {
        myfunction(a++);
      } else if (a > 10) {
        myotherfunction(a, b, c);
      } else {
        mylastfunction();
      }

      while (a < 10) {
        a++;
      }

      let x = y[a][b];
    }).setOutput([1, 1])([1.0, 2.0], 2);
  });

  it('should throw an exception since not all function parameters have a default value assigned', function () {
    try {
      Kernel.create(function a(b = 0, c) {
        let x = 0;
      }).setOutput([1, 1])([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, '[15,16]:function parameters need to have default values assigned');
    }
  });

  it('should build a kernel', function () {
    let kernel = Kernel.create(function a() { });
  });


  it('should create the propper parameter types', function () {
    Kernel.create(function a(a = [], b = 0) {
      let c = a[this.thread.x];
    }).setOutput([1, 2])([1.0, 2.0], 2);
  });

  it('should create the propper parameter types', function () {
    Kernel.create(function a(a = [], b = 0) {
      let c = a[this.thread.x][this.thread.y];
    }).setOutput([1, 2])([1.0, 2.0], 2);
  });


  it('should throw an exception since kernel has not output dimensions specified', function () {
    try {
      Kernel.create(function a(a = [], b = 0) {
        let c = a[this.thread.x][this.thread.y];
      })([1.0, 2.0], 2);
      assert.fail('expected exception not thrown'); // this throws an AssertionError
    } catch (e) {
      assert.equal(e, 'kernel has no dimensions specified. Use setOutput([x,y]) to specify kernel output dimensions');
    }
  });



  it('should throw an exception since kernel has not output dimensions specified', function () {
    Kernel.create(function main(a = [[]], b = 0) {
      let c = a[this.thread.x];
    }).setOutput([1, 2])([1.0, 2.0], 2);
  });


  it('should throw an exception since kernel has not output dimensions specified', function () {
    let kernel = Kernel.create(function b() {
      let a = 0;
    }, function main() {
      let c = 0;
    }).setOutput([1, 2])([1.0, 2.0], 2);
  });


  it('should throw an exception since kernel has not output dimensions specified', function () {
    let kernel = Kernel.create(function main(a = [[]]) {
      let b = a[this.thread.x][this.thread.y];
      a[this.thread.x][this.thread.y];
      return b;
    }).setOutput([1, 2])([1.0, 2.0], 2);
  });


*/
});
