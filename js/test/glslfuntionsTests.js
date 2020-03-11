const { Kernel } = require('../modules/kernel.js');
const { TestUtil } = require('../modules/testutil.js');
const { browserReady} = require('../modules/browserready.js');
const { TextureFactory} = require('./../modules/texturefactory.js');

browserReady();
describe('Test GLSL build in functions', function () {
  
  after(function () {
    if (TextureFactory.getReferenceCount() !== 0) {
      throw 'Expected reference count to be zero'
    }
  });

  it('Test GLSL build in radians function', function () {
    let test = Kernel.create(function main(i = 0.0) {
       return test(i);
    }, function test(a = 0.0) {
      return sin(a);
    }
    ).setOutput([5, 1]);
    TestUtil.compare1DArray(test(1).result(), [0.8414709568,0.8414709568,0.8414709568,0.8414709568,0.8414709568]);
    test.delete();
  });

  it('Test GLSL build in sine function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return sin(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(10).result(), [-0.5440428, -0.5440428, -0.5440428]);
    test.delete();
  });

  it('Test GLSL build in cosine function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return cos(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(10).result(), [-0.83909773, -0.83909773, -0.83909773]);
    test.delete();
  });

  it('Test GLSL build in tan function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return tan(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(10).result(), [0.6483665, 0.6483665, 0.6483665]);
    test.delete();
  });

  it('Test GLSL build in arcsine function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return asin(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(0.5).result(), [0.5236450, 0.5236450, 0.5236450]);
    test.delete();
  });

  it('Test GLSL build in arcosine function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return acos(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(0.5).result(), [1.0471513271331787, 1.0471513271331787, 1.0471513271331787]);
    test.delete();
  });

  it('Test GLSL build in arctangent function', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return atan(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(0.5).result(), [0.46365055441856384, 0.46365055441856384, 0.46365055441856384]);
    test.delete();
  });

  it('Test GLSL build in arctangent function - 2 parameters', function () {
    let test = Kernel.create(function main(i = 0.0, j = 0.0) {
      return test(i, j);
    }, function test(a = 0.0, b = 0.0) {
      return atan(a, b);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(0.5, 0.5).result(), [0.7854096293449402, 0.7854096293449402, 0.7854096293449402]);
    test.delete();
  });

  it('Test GLSL build in pow function ', function () {
    let test = Kernel.create(function main(i = 0.0, j = 0.0) {
      return test(i, j);
    }, function test(a = 0.0, b = 0.0) {
      return pow(a, b);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(2, 8).result(), [256, 256, 256]);
    test.delete();
  });

  it('Test GLSL build in exponential function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return exp(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(), [148.4131622314453, 148.4131622314453, 148.4131622314453]);
    test.delete();
  });

  it('Test GLSL build in natural logarithm function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return log(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(), [1.6094378232955933, 1.6094378232955933, 1.6094378232955933]);
    test.delete();
  });

  it('Test GLSL build in exponential function (base 2) function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return exp2(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(), [32, 32, 32]);
    test.delete();
  });

  it('Test GLSL build in logarithm (base 2) function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return log2(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(),[ 2.321928024291992, 2.321928024291992, 2.321928024291992 ]);
    test.delete();
  });

  it('Test GLSL build in square root function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return sqrt(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(),[ 2.2360680103302, 2.2360680103302, 2.2360680103302 ]);
    test.delete();
  });

  it('Test GLSL build in inverse sqaure root function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return inversesqrt(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(),[ 0.4472135901451111, 0.4472135901451111, 0.4472135901451111 ]);
    test.delete();
  });

  it('Test GLSL build in abs function ', function () {
    let test = Kernel.create(function main(i = 0.0) {
      return test(i);
    }, function test(a = 0.0) {
      return abs(a);
    }
    ).setOutput([3, 1]);
    TestUtil.compare1DArray(test(5).result(),[ 5, 5, 5 ]);
    test.delete();
  });
});

