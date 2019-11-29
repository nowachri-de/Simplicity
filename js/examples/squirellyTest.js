/* eslint-env mocha */
var assert = require('assert');
var Sqrl = require('squirrelly');
// This is a mocha test file containing a couple of tests to make sure Squirrelly isn't broken.
// The code at the bottom tests that when you render simpleTemplate with options, it equals simpleTemplateResult.
// It also tests that bigTemplate, rendered, equals bigTemplateResult.

var simpleTemplate = `
{{title}}
`

var bigTemplate = `
Hi
{{log("Hope you like Squirrelly!")/}}
{{htmlstuff}}
{{foreach(options.obj)}}
Reversed value: {{@this|reverse}}, Key: {{@key}}
{{if(@key==="thirdchild")}}
{{each(options.obj[@key])}}
Salutations. Index: {{@index}}
Old key: {{@../key}}
{{/each}}
{{/if}}
{{/foreach}}
{{customhelper()}}
{{#cabbage}}
Cabbages taste good
{{#pineapple}}
As do pineapples
{{/customhelper}}
This is a partial: {{include("mypartial")/}}
{{tags(--,--)/}}
Custom delimeters!
--arr--
`



var data = {
  htmlstuff: "htmlstuff",
  arr: ['Hey', '<p>Malicious XSS</p>', 'Hey', 3, 3 * 4],
  obj: {
    firstchild: 'HI',
    secondchild: 'HEY',
    thirdchild: [3, 6, 3, 2, 5, 4]
  },
  title: 'Squirrelly Tests'
}

Sqrl.defineFilter("reverse", function (str) {
  var out = ''
  for (var i = str.length - 1; i >= 0; i--) {
    out += String(str).charAt(i)
  }
  return out || str
})

Sqrl.defineHelper("customhelper", function (args, content, blocks, options) {
  var returnStr = ''
  for (var key in blocks) {
      console.log("---------"+ blocks[key]);
    if (typeof blocks[key] === 'function') {
      returnStr += "--------- Block found named " + key + ", with value: " + blocks[key]()
    }
  }
  return returnStr
})

Sqrl.definePartial("mypartial", "Partial content: the value of arr is {{arr}}")

console.log(Sqrl.Render(bigTemplate, data));

