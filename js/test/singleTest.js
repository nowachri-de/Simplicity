var assert = require('assert');
const { Kernel } = require(__dirname + '\\..\\modules\\kernel.js');
describe('CodeGenerator', function () {
    it('', function () {
        Kernel.create(function main(a =[]) {
          return test(a);
        },function test(b = []){
          return b[this.thread.x];
        }
        ).setOutput([2, 2])([1,2]);
    });

    it('', function () {
      Kernel.create(function main(a =[[]]) {
        return test(a);
      },function test(b = [[]]){
        return b[this.thread.x][this.thread.y];
      }
      ).setOutput([2, 2])([[1,2],[1,2]]);
  });

  it('', function () {
    Kernel.create(function main(a =[[]]) {
      return test(a,a,1.0);
    },function test(b = [[]],c=[[]],x=0.){
      return b[this.thread.x][this.thread.y] + c[this.thread.x][this.thread.y];
    }
    ).setOutput([2, 2])([[1,2],[1,2]]);
});
});
