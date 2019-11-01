const beautify = require('js-beautify')
 
class Formatter {
    constructor() {
        this.INDENTSIZE = 4;
    }
   
    format(code) {
        code = beautify(code, { indent_size: 2, space_in_empty_paren: true })
        return code;
    }
}
module.exports.Formatter = Formatter;