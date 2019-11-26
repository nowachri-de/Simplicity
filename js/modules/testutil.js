class TestUtil {
    static compare1DArray(a1, a2) {
        if (a1.length !== a2.length) {
            throw 'array length mistmatch ' + a1.length + ' ' + a2.length;
        }
        for (let i = 0; i < a1.length; ++i) {
            if (a1[i] !== a2[i]) {
                throw 'array mistmatch ' + a1[i] + ' ' + a2[i];
            }
        }
    }

    static compare2DArray(a1, a2) {

        if (a1.length !== a2.length) {
            throw 'array length mistmatch ' + a1.length + ' ' + a2.length;
        }
        if (a1[0].length !== a2[0].length) {
            throw 'array length mistmatch ' + a1[0].length + ' ' + a2[0].length;
        }

        for (let i = 0; i < a1.length; ++i) {

            for (let j = 0; j < a2.length; ++j) {
                if (a1[i][j] !== a2[i][j]) {
                    throw 'array mistmatch ' + a1[i][j] + ' ' + a2[i][j];
                }
            }
        }
    }
}
module.exports.TestUtil = TestUtil;