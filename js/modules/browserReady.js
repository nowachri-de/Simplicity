module.exports.browserReady = function (msg) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (typeof window.testFunctions === 'undefined') {
            window.testFunctions = [];
            window.testCounter = 0;
            window.numTests = 0;
            //required to handle call of function timout in it function
            window.timeout = function (param) { }
            window.executeTests = function () {
                for (let i = 0; i < window.numTests; ++i) {
                    window.testFunctions[i]();
                }
            }

            describe = function (description, fnct) {
                console.log("Added to testfunctions: " + description);
                window.testFunctions.push(fnct);
                window.numTests++;
            }

            it = function (description, fnct) {
                console.log(description);
                fnct();
            }

            if (typeof console != "undefined")
                if (typeof console.log != 'undefined')
                    console.olog = console.log;
                else
                    console.olog = function () { };

            console.log = function (message) {
                console.olog(message);
                var p = document.createElement("P");                 // Create a <li> node
                var textnode = document.createTextNode(message);         // Create a text node
                p.appendChild(textnode);

                document.getElementById("log").appendChild(p);
            };
            console.error = console.debug = console.info = console.log
        }

    }
};