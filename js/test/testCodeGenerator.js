var assert = require('assert');
const { CodeGenerator } = require(__dirname + '\\..\\modules\\codegenerator.js');

describe('CodeGenerator', function () {
  let codeGen = new CodeGenerator();
  console.log(codeGen.translate("let a;"));
});
