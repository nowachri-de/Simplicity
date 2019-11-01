const { ShaderCode } = require(__dirname + "\\..\\modules\\ShaderCode.js");

let samplers = [];
samplers.push({ name: 'input', width: '100', height: '100' });
samplers.push({ name: 'bias', width: '100', height: '1' });

let functions = [];

//functions.push({ returnType: 'void', name: 'test', parameters:[{name:'a', type:'int',length:2},{name:'b', type:'int',length:2}]} );
functions.push({code:'float test(int a, int b){ return a < < < b}\r\n'} );
let options = {
    samplers: samplers,
    integers: [],
    functions: functions,
    main: 'Hello World'
}

console.log(ShaderCode.generateFragmentShader(options));
