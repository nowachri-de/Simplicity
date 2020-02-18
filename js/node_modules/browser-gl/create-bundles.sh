#!/bin/sh
rm -rf ./../bundles
browserify ./../test/functionalTests.js > ./bundles/functionalTests-bundle.js
browserify ./../test/glslfuntionsTests.js > ./bundles/glslfuntionsTests-bundle.js
browserify ./../test/iterationTests.js > ./bundles/iterationTests-bundle.js
browserify ./../test/loopTests.js > ./bundles/loopTests-bundle.js
browserify ./../test/multiplefunctionsTests.js > ./bundles/multiplefunctionsTests-bundle.js
browserify ./../test/operatorTests.js > ./bundles/operatorTests-bundle.js
browserify ./../test/parameterAndArgumentTests.js > ./bundles/parameterAndArgumentTests-bundle.js
browserify ./../test/matrixTests.js > ./bundles/matrixTests-bundle.js
browserify ./../test/utilTests.js > ./bundles/utilTests-bundle.js

 
 