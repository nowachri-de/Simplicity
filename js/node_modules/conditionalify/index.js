'use strict';

var through = require('through2');
var acorn = require('acorn');
var expressions = require('angular-expressions');
var escapeStringRegexp = require('escape-string-regexp');
var PassThrough = require('stream').PassThrough;
var extname = require('path').extname;

function getComments(code, ecmaVersion) {
    var comments = [];

    acorn.parse(code, {
        onComment: comments,
        locations: true,
        ecmaVersion: ecmaVersion,
        sourceType: 'module'
    });

    return comments;
}

function numbersBetween(start, end) {
    var counter = start;
    var result = [];

    while (++counter < end) {
        result.push(counter);
    }

    return result;
}

module.exports = function conditionalify(file, options) {
    var context = options.context || {};
    var marker = escapeStringRegexp(options.marker || '#');
    var ecmaVersion = options.ecmaVersion;
    var exts = (options.exts || ['js']).map(function(ext) { return '.' + ext; });

    var directiveMatcher = new RegExp('^' + marker + '(end)?if');
    var directiveStartMatcher = new RegExp('^' + marker + 'if');
    var directiveEndMatcher = new RegExp('^' + marker + 'endif');

    function isStartDirective(value) {
        return directiveStartMatcher.test(value.trim());
    }

    function isEndDirective(value) {
        return directiveEndMatcher.test(value.trim());
    }

    if (exts.indexOf(extname(file)) < 0) {
        return new PassThrough();
    }

    return through(function transform(buffer, encoding, next) {
        var stream = this;
        var text = buffer.toString();
        var lines = text.split(/\r?\n/);
        var directives = getComments(text, ecmaVersion).filter(function(comment) {
            return directiveMatcher.test(comment.value.trim());
        });
        var results = directives.reduce(function(results, directive, index, array) {
            var next = array[index + 1];
            var value = directive.value.trim();
            var isStart = isStartDirective(value);
            var start, end, code;

            if (isStart) {
                if (!next) {
                    stream.emit('error', new Error(
                        'Expected "' + marker + 'endif" before the end of the file'
                    ));

                    return results;
                }

                if (!isEndDirective(next.value)) {
                    stream.emit('error', new Error(
                        'Expected "' + marker + 'endif" but saw "' + next.value.trim() + '"'
                    ));

                    return results;
                }

                start = directive.loc.end.line;
                end = next.loc.start.line;
                code = value.replace(directiveStartMatcher, '').trim();

                results.push({
                    start: start,
                    end: end,
                    lines: numbersBetween(start, end),
                    include: !!expressions.compile(code)(context)
                });
            }

            return results;
        }, []);
        var omittedLines = Array.prototype.concat.apply([], results.filter(function(result) {
            return !result.include;
        }).map(function(result) {
            return result.lines;
        }));

        this.push(lines.filter(function(line, index) {
            var lineNumber = index + 1;

            return omittedLines.indexOf(lineNumber) < 0;
        }).join('\n'));

        next();
    });
};
