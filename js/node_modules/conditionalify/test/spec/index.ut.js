var conditionalify = require('../../index');
var browserify = require('browserify');
var Bluebird = require('bluebird');
var resolvePath = require('path').resolve;

Bluebird.config({ longStackTraces: true });

describe('conditionalify()', function() {
    function compile(path, options) {
        return new Bluebird(function(resolve, reject) {
            var absPath = resolvePath(__dirname, path);

            return browserify([absPath], {
                ignoreMissing: true
            }).transform(conditionalify, options)
            .bundle(function(error, buffer) {
                if (error) { reject(error); } else { resolve(buffer.toString()); }
            });
        });
    }

    describe('with no context', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example.js').then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should keep the parts of the file not surrounded by conditional comments', function() {
            expect(result).toContain('\'THIS WILL BE INCLUDED\';');
            expect(result).toContain('\n\'THIS WILL BE HERE\';\n');
        });

        it('should remove the parts of the file for which the expression evaluated false', function() {
            expect(result).not.toContain('\'THIS WILL NOT BE INCLUDED\';\n\'OR THIS\';');
        });

        it('should keep the parts of the file for which the expression evaluated true', function() {
            expect(result).toContain('\'THIS IS TRUE!\';');
        });
    });

    describe('with context', function() {
        var context;
        var result;

        beforeEach(function() {
            context = {
                someProp: null
            };
        });

        describe('that makes the expression truthy', function() {
            beforeEach(function(done) {
                context.someProp = 'foo';

                compile('../helpers/example.js', { context: context }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
            });

            it('should keep the code', function() {
                expect(result).toContain('\'HERE BASED ON CONTEXT\';');
            });
        });

        describe('that makes the expression falsy', function() {
            beforeEach(function(done) {
                context.someProp = 'bar';

                compile('../helpers/example.js', { context: context }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
            });

            it('should remove the code', function() {
                expect(result).not.toContain('\'HERE BASED ON CONTEXT\';');
            });
        });
    });

    describe('with a custom marker', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--custom-marker.js', {
                context: { names: ['Ren M.', 'Zach P.'] },
                marker: '@'
            }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should use the marker to find directives', function() {
            expect(result).not.toContain('\'THIS WILL NOT BE INCLUDED!\';');
            expect(result).toContain('\'THIS WILL BE INCLUDED!\';');
        });
    });

    describe('with nested directives', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--nested.js', { marker: '@' }).catch(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should fail', function() {
            expect(result.message).toContain('Expected "@endif" but saw "@if names.indexOf(\'Ren M.\') > -1"');
        });
    });

    describe('with a missing end directive', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--missing-end.js', { marker: '@' }).catch(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should fail', function() {
            expect(result.message).toContain('Expected "@endif" before the end of the file');
        });
    });

    describe('with ES6', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--es2015.js', { ecmaVersion: 6 }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should work', function() {
            expect(result).not.toContain('import');
            expect(result).toContain('require(');
        });
    });

    describe('with exts', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--require.js', {
                exts: ['js', 'es6'],
                context: {
                    include: false
                }
            }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should only transform files that match the ext', function() {
            expect(result).not.toContain('EXT JS');
            expect(result).not.toContain('EXT ES6');
            expect(result).toContain('EXT CUSTOM');
        });
    });

    describe('without exts', function() {
        var result;

        beforeEach(function(done) {
            compile('../helpers/example--require.js', {
                context: {
                    include: false
                }
            }).then(function(/*result*/) { result = arguments[0]; }).then(done, done.fail);
        });

        it('should only transform .js files', function() {
            expect(result).not.toContain('EXT JS');
            expect(result).toContain('EXT ES6');
            expect(result).toContain('EXT CUSTOM');
        });
    });
});
