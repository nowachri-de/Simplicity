class Util {
    static isArray(value) {
        return value.includes("[]");
    }

    static isInteger(argument) {
        return argument === 'int';
    }

    static isFloat(argument) {
        return argument === 'float';
    }

}
module.exports.Util = Util;
