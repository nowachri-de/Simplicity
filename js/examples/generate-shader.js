const { ShaderCode } = require(__dirname + "\\..\\modules\\ShaderCode.js");

let samplers = [];
samplers.push({ name: 'input', width: '100', height: '100' });
samplers.push({ name: 'bias', width: '100', height: '1' });

let options = {
    samplers: samplers,
    main: 'Hello World'
}

console.log(ShaderCode.generateFragmentShader(options));
