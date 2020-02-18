class TestUtil {
    static compare1DArray(a1, a2) {
        let FIXED = 4;
        if (a1.length !== a2.length) {
            throw 'array length mistmatch ' + a1.length + ' ' + a2.length;
        }
        for (let i = 0; i < a1.length; ++i) {
            if (Math.abs(a1[i].toFixed(FIXED)) - Math.abs(a2[i].toFixed(FIXED)) !== 0 ) {
                throw 'array mistmatch ' + a1[i] + ' ' + a2[i];
            }
        }
    }

    static compare2DArray(a1, a2) {
        let FIXED = 4;
        let height = a1.length;
        let width = a1[0].length;

        if (a1.length !== a2.length) {
            throw 'array length mistmatch. Height not the same <a,b> ' + a1.length + ' ' + a2.length;
        }
        if (a1[0].length !== a2[0].length) {
            throw 'array length mistmatch. Width not the same <a,b>  ' + a1[0].length + ' ' + a2[0].length;
        }

        for (let i = 0; i < height; ++i) {
            for (let j = 0; j < width; ++j) {
                if (Math.abs(a1[i][j].toFixed(FIXED)) - Math.abs(a2[i][j].toFixed(FIXED)) !== 0) {
                    throw 'array mistmatch ' + a1[i][j] + ' ' + a2[i][j];
                }
            }
        }
    }
}
module.exports.TestUtil = TestUtil;