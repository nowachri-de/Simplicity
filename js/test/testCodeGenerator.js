var assert = require('assert');
const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');

describe('CodeGenerator', function () {
  it('should translate variable declaration ', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(`function a(){
    let sum = 0;
    for (let i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;}`));
  });

  /*it('should translate variable declaration with initialization ', function () {
    let codeGen = new CodeGenerator();
    console.log(codeGen.translate(
      ` let a = 0;
        let b; 
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
  });*/

});
