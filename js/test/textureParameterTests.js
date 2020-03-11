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
            TextureFactory.logReferenceCount();
            throw 'Expected reference count to be zero'
        }
    });
    it('Call kernel with 2D texture as argument - 1', function () {
        let texture = Util.data2Texture2D([[5, 5], [5, 5]], 2, 2);

        let textureKernel = Kernel.create(function main(a = [[]]) {
            let b = a[1][2];
            return b;
        }).setOutput([2, 2]).setGL(texture.gl);

        //check texture
        TestUtil.compare2DArray(Util.texture2array(texture.gl, texture, 0), [[5, 5], [5, 5]]);
        //check kernel result
        TestUtil.compare2DArray(textureKernel(texture).result(), [[5, 5], [5, 5]]);

        textureKernel.delete();
        texture.delete();

    });

    it('Call kernel with two 2D textures as argument', function () {
        let texture1 = Util.data2Texture2D([[1, 2], [3, 4]], 2, 2);
        let texture2 = Util.data2Texture2D([[5, 6], [7, 8]], 2, 2, texture1.gl);

        let textureKernel = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
        }).setOutput([2, 2]).setGL(texture1.gl);

        //check texture1
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture1, 0), [[1, 2], [3, 4]]);
        //check texture2
        TestUtil.compare2DArray(Util.texture2array(texture2.gl, texture2, 0), [[5, 6], [7, 8]]);

        //check kernel result
        TestUtil.compare2DArray(textureKernel(texture1, texture2).result(), [[5, 12], [21, 32]]);

        textureKernel.delete();
        texture1.delete();
        texture2.delete();

    });

    it('Call kernel multiple times with two 2D textures as argument ', function () {
        this.timeout(0);//disable timeout
        let texture1 = Util.data2Texture2D([[1, 2], [3, 4]], 2, 2);
        let texture2 = Util.data2Texture2D([[5, 6], [7, 8]], 2, 2, texture1.gl);

        let textureKernel = Kernel.create(function main(a = [[]], b = [[]]) {
            return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
        }).setOutput([2, 2]).setGL(texture1.gl);

        //check texture1
        TestUtil.compare2DArray(Util.texture2array(texture1.gl, texture1, 0), [[1, 2], [3, 4]]);
        //check texture2
        TestUtil.compare2DArray(Util.texture2array(texture2.gl, texture2, 0), [[5, 6], [7, 8]]);

        //check kernel call multiple times

        for (let i = 0; i < 10; ++i) {
            TestUtil.compare2DArray(textureKernel(texture1, texture2).result(), [[5, 12], [21, 32]]);
        }

        textureKernel.delete();
        texture1.delete();
        texture2.delete();

    });

    it('Call kernel with 2D texture as argument - texture coming from shader', function () {
        let sharedGL = Program.createGl(1, 1);

        let test = Kernel.create(function main(a = [[]]) {
            return a[this.thread.x][this.thread.y];
        }).setOutput([2, 2]).setGL(sharedGL);

        let textureKernel = Kernel.create(function main(a = [[]]) {
            let b = a[1][2];
            return b;
        }).setOutput([2, 2]).setGL(sharedGL);

        let texture = test([[5, 5], [5, 5]]).rawResult();
        TestUtil.compare2DArray(test.result(), [[5, 5], [5, 5]]);
        TestUtil.compare2DArray(textureKernel(texture).result(), [[5, 5], [5, 5]]);

        test.delete();
        textureKernel.delete();
        texture.delete();

    });

});
