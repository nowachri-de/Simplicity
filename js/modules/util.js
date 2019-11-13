const {TextureFactory} = require(__dirname + "\\texturefactory.js");
const {FrameBufferFactory} = require(__dirname + "\\framebufferfactory.js");

class Util {
    static isArray(value) {
        if (Util.is2DArray(value)){
            return false;
        }
        return value.includes("[]");
    }

    static is2DArray(value) {
        return value.includes("[][]");
    }

    static isInteger(argument) {
        return argument === 'int';
    }

    static isFloat(argument) {
        return argument === 'float';
    }

    static data2Texel(width,height,data,component){
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
                        result[cnt - 4] = data[row][col];
                        break;
                    //G component of RGBA color
                    case 'G':
                        result[cnt - 3] = data[row][col];
                        break;
                    //B component of RGBA color
                    case 'B':
                        result[cnt - 2] = data[row][col];
                        break;
                    //A component of RGBA color
                    case 'A':
                        result[cnt - 1] = data[row][col];
                        break;
                    default:
                        throw "getTexels: component " + component + " unknown";
                }
            }
        }

        return result;
    }

    static createTexture(gl,name,width,height,data){
        return TextureFactory.createTextureByDimension(gl, name, height, width, Util.data2Texel(width,height,data,'R'));
    }

    static createReadableTexture(gl,name,width,height){
        return TextureFactory.createReadableTexture(gl, name, {width:width,height:height});
    }

    static createFrameBuffer(gl,texture){
        return FrameBufferFactory.createFrameBuffer(gl,texture);
    }
    
}
module.exports.Util = Util;
