// #if babel
import myThing from './my-thing.js';
import duh from './duh.js';
import hey from './hey.js';
// #endif
// #if !babel
var myThing = require('./my-thing');
var duh = require('./duh');
var hey = require('./hey');
// #endif
