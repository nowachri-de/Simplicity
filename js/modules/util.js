const { TextureFactory,Texture } = require( "./texturefactory.js");
const { FrameBufferFactory } = require("./framebufferfactory.js");
const { ResultReader } = require("./resultreader.js");

class Util {

    static isTexture(value) {
        if (value instanceof Texture) {
            return true;
        }
        return false;
    }

    static isArray(value) {
        if (Util.is2DArray(value)) {
            return false;
        }
        return value.includes("[]");
    }

    static is2DArray(value) {
        return value.includes("[][]");
    }

    static isArgumentInteger(argument) {
        if (Number.isInteger(argument) && !argument.toString().includes('.')) {
            return true;
        }
        return false;
    }

    static isArgumentFloat(argument) {
        if (!Number.isInteger(argument) && argument.toString().includes('.')) {
            return true;
        }
        return false;
    }

    static isInteger(argument) {
        return argument === 'int';
    }

    static isFloat(argument) {
        return argument === 'float';
    }

    static data2Texel(width, height, data, component) {
        let result = new Float32Array(4 * height * width);
        let cnt = 0;

        if (component === undefined) {
            component = "R";
        }


        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;
                result[cnt++] = 0.;

                switch (component) {
                    //R component of RGBA color
                    case 'R':
                        result[cnt - 4] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = Array.isArray(data[0]) ? data[row][col] : data[col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }


    static createReadableTexture(gl, name, width, height) {
        return TextureFactory.createReadableTexture(gl, name, { width: width, height: height });
    }

    static createFrameBuffer(gl, texture) {
        return FrameBufferFactory.createFrameBuffer(gl, texture);
    }

    /**
    * converts the given texture to an array
    * 
    * @param {gl} gl -   WebGL context
    * @param {Texture} texture -   Texture to read  values from
    * @return {Integer} sourceIndex - The component index (R,G,B,A) to read the values from
   */
    static texture2array(gl, texture, sourceIndex) {
        let dimension = { width: texture.width, height: texture.height };
        let readableTexture = TextureFactory.createReadableTexture(gl, 'readableTexture', dimension);
        let resultReader = new ResultReader(gl, texture.width, texture.height);
        let result = resultReader.readResult2Array(texture, readableTexture, dimension, sourceIndex);
        let finalResult = [];

        for (let row = 0; row < texture.height; row++) {
            finalResult[row] = [];
            for (let col = 0; col < texture.width; col++) {
                finalResult[row].push(result[(row * texture.width)+col]);
            }
        }

        if (texture.height === 1){
            finalResult = finalResult[0];
        }

        readableTexture.delete();
        return finalResult;
    }

    static setActiveTexture(texture){
        TextureFactory.setActiveTexture(texture);
    }

}
module.exports.Util = Util;
