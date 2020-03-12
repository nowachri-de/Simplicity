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
    it('Call kernel with texture as argument', function () {
        let sharedGL = Program.createGl(1,1);
        
        let test = Kernel.create(function main(a = [[]]) {
            return a[this.thread.x][this.thread.y];
        }).setOutput([2, 2]).setGL(sharedGL);

        let textureKernel = Kernel.create(function main(a = [[]]) {
            let b = a[1][2]; 
            return b;
        }).setOutput([2, 2]).setGL(sharedGL);

        let texture = test([[5, 5], [5, 5]]).rawResult();
        TestUtil.compare2DArray(test.result(), [[5, 5],[5,5]]);
        TestUtil.compare2DArray(textureKernel(texture).result(), [[5, 5],[5,5]]);

        test.delete();
        textureKernel.delete();
        texture.delete();

    });
    
});
