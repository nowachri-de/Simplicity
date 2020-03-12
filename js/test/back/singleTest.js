"use strict";

const { Kernel } = require('../modules/kernel.js');
const { browserReady } = require('../modules/browserready.js');
const { TestUtil } = require('../modules/testutil.js');
const { TextureFactory } = require('./../modules/texturefactory.js');
const { Util } = require('./../modules/util.js');
const { Program } = require('./../modules/program.js');

browserReady();


describe('', function () {
    after(function () {
        if (TextureFactory.getReferenceCount() !== 0) {
          throw 'Expected reference count to be zero'
        }
      });
      
    
});
