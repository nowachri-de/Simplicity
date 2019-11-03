var assert = require('assert');
const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
const { FunctionBuilder } = require(__dirname + '\\..\\modules\\kernel.js');




describe('CodeGenerator', function () {
  /*it('test Memberdeclaration', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(`y[x];`));
  });

  it('should translate variable declaration ', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(`function a(){
    let sum = 0;
    for (let i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;}`));
  });

  it('should throw an exception since variable is not initialized', function () {
    let codeGen = new CodeGenerator();
    assert.throws(() => codeGen.translate(`let sum;`));
  });

  it('should not throw an exception since variable type has been specified', function () {
    let codeGen = new CodeGenerator();
    codeGen.setVariableType('sum','int');
    codeGen.translate(`let sum;`);
  });

  it('should translate variable declaration with initialization ', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(
      ` let a = 0;
        for(let a=0; a < 10;++a){
          console.log(a,b);
        }
        if (a < 10){
          myfunction(a++);
        }else if(a > 10){
          myotherfunction(a,b,c);
        }else{
          mylastfunction();
        }

        while (a < 10){
          a++;
        }

        let x = y[a][b];
      `));
  });
  it('should translate a function', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(`function x(a,b){}`));
  });
  
  it('should build a kernel', function () {
    let kernel = Kernel.create(function a(){});
  });
  

  it('should create the propper parameter types', function () {
    Kernel.create(function a(a = [],b = 0){
      let c = a[this.thread.x];
    }).setOutput([1,2])([1.0,2.0],2);
  });

 

  it('should throw an exception since no output dimensions are specified', function () {
    assert.throws(() =>{ Kernel.create(function a(a = [],b = 0){
     
    })([1.0,2.0],2);});
   
  });
  it('should throw an exception since empty array is passed', function () {
    assert.throws(() =>{ Kernel.create(function a(a = [],b = 0){
     
    })([],2);});
   
  });
  it('should generate float[][] for first function parameter', function () {
    Kernel.create(function a(a = [[]],b = 0){
      let c = a[this.thread.x];
    }).setOutput([1,2])([1.0,2.0],2);
  })
  it('should generate float[] for first function parameter', function () {
    Kernel.create(function a(a = [],b = 0){
      a[this.thread.x][this.thread.y+2];
    }).setOutput([1,2])([1.0,2.0],2);
  });;
  it('should generate float[] for first function parameter', function () {
    Kernel.create(function a(){
      b[this.thread.x][this.thread.y];
      c[this.thread.x][this.thread.y];
    }).setOutput([1,2])([1.0,2.0],2);
  })
  it('should generate float[] for first function parameter', function () {
    Kernel.create(function a(){
      let c= a+b;
      c[this.thread.x][this.thread.y];
    }).setOutput([1,2])([1.0,2.0],2);
  })
  */
 it('should generate float[] for first function parameter', function () {
  Kernel.create(function a(){
    let c= 0.;
    let d= c + 5;
  }).setOutput([1,2])([1.0,2.0],2);
})
});
