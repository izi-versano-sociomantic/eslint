/**
 * @fileoverview Abstraction of JavaScript source code.
 * @author Nicholas C. Zakas
 * @copyright 2015 Nicholas C. Zakas. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    sinon = require("sinon"),
    eslint = require("../../../lib/eslint"),
    SourceCode = require("../../../lib/util/source-code");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/* eslint-disable indent*/
// let foo = bar;
var AST = {
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "foo",
            "range": [
              4,
              7
            ],
            "loc": {
              "start": {
                "line": 1,
                "column": 4
              },
              "end": {
                "line": 1,
                "column": 7
              }
            }
          },
          "init": {
            "type": "Identifier",
            "name": "bar",
            "range": [
              10,
              13
            ],
            "loc": {
              "start": {
                "line": 1,
                "column": 10
              },
              "end": {
                "line": 1,
                "column": 13
              }
            }
          },
          "range": [
            4,
            13
          ],
          "loc": {
            "start": {
              "line": 1,
              "column": 4
            },
            "end": {
              "line": 1,
              "column": 13
            }
          }
        }
      ],
      "kind": "let",
      "range": [
        0,
        14
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 14
        }
      }
    }
  ],
  "sourceType": "module",
  "range": [
    0,
    14
  ],
  "loc": {
    "start": {
      "line": 1,
      "column": 0
    },
    "end": {
      "line": 1,
      "column": 14
    }
  },
  "tokens": [
    {
      "type": "Keyword",
      "value": "let",
      "range": [
        0,
        3
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 3
        }
      }
    },
    {
      "type": "Identifier",
      "value": "foo",
      "range": [
        4,
        7
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 4
        },
        "end": {
          "line": 1,
          "column": 7
        }
      }
    },
    {
      "type": "Punctuator",
      "value": "=",
      "range": [
        8,
        9
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 8
        },
        "end": {
          "line": 1,
          "column": 9
        }
      }
    },
    {
      "type": "Identifier",
      "value": "bar",
      "range": [
        10,
        13
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 10
        },
        "end": {
          "line": 1,
          "column": 13
        }
      }
    },
    {
      "type": "Punctuator",
      "value": ";",
      "range": [
        13,
        14
      ],
      "loc": {
        "start": {
          "line": 1,
          "column": 13
        },
        "end": {
          "line": 1,
          "column": 14
        }
      }
    }
  ],
  "comments": []
};
/* eslint-enable indent */

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("SourceCode", function() {

    describe("new SourceCode()", function() {

        it("should create a new instance when called with valid data", function() {
            var ast = { comments: [], tokens: [], loc: {}, range: [] };
            var sourceCode = new SourceCode("foo;", ast);

            assert.isObject(sourceCode);
            assert.equal(sourceCode.text, "foo;");
            assert.equal(sourceCode.ast, ast);
        });

        it("should split text into lines when called with valid data", function() {
            var ast = { comments: [], tokens: [], loc: {}, range: [] };
            var sourceCode = new SourceCode("foo;\nbar;", ast);

            assert.isObject(sourceCode);
            assert.equal(sourceCode.lines.length, 2);
            assert.equal(sourceCode.lines[0], "foo;");
            assert.equal(sourceCode.lines[1], "bar;");
        });

        /* eslint-disable no-new */

        it("should throw an error when called with an AST that's missing tokens", function() {

            assert.throws(function() {
                new SourceCode("foo;", { comments: [], loc: {}, range: [] });
            }, /missing the tokens array/);

        });

        it("should throw an error when called with an AST that's missing comments", function() {

            assert.throws(function() {
                new SourceCode("foo;", { tokens: [], loc: {}, range: [] });
            }, /missing the comments array/);

        });

        it("should throw an error when called with an AST that's missing comments", function() {

            assert.throws(function() {
                new SourceCode("foo;", { comments: [], tokens: [], range: [] });
            }, /missing location information/);

        });

        it("should throw an error when called with an AST that's missing comments", function() {

            assert.throws(function() {
                new SourceCode("foo;", { comments: [], tokens: [], loc: {} });
            }, /missing range information/);
        });


    });

    describe("getJSDocComment()", function() {

        var sandbox = sinon.sandbox.create(),
            filename = "foo.js";

        beforeEach(function() {
            eslint.reset();
        });

        afterEach(function() {
            sandbox.verifyAndRestore();
        });

        it("should not take a JSDoc comment from a FunctionDeclaration parent node when the node is a FunctionExpression", function() {

            var code = [
                "/** Desc*/",
                "function Foo(){var t = function(){}}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc, null);
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });

        it("should not take a JSDoc comment from a FunctionExpression parent node when the node is a FunctionExpression", function() {

            var code = [
                "/** Desc*/",
                "var f = function(){var t = function(arg){}}"
            ].join("\n");

            function assertJSDoc(node) {
                if (node.params.length === 1) {
                    var sourceCode = eslint.getSourceCode();
                    var jsdoc = sourceCode.getJSDocComment(node);
                    assert.equal(jsdoc, null);
                }
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledTwice, "Event handler should be called twice.");

        });

        it("should get JSDoc comment for node when the node is a FunctionDeclaration", function() {

            var code = [
                "/** Desc*/",
                "function Foo(){}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });

        it("should get JSDoc comment for node when the node is a FunctionDeclaration but its parent is an export", function() {

            var code = [
                "/** Desc*/",
                "export function Foo(){}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { ecmaFeatures: { modules: true }, rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });


        it("should get JSDoc comment for node when the node is a FunctionDeclaration but not the first statement", function() {

            var code = [
                "'use strict';",
                "/** Desc*/",
                "function Foo(){}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });


        it("should not get JSDoc comment for node when the node is a FunctionDeclaration inside of an IIFE without a JSDoc comment", function() {

            var code = [
                "/** Desc*/",
                "(function(){",
                "function Foo(){}",
                "}())"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.isNull(jsdoc);
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });

        it("should get JSDoc comment for node when the node is a FunctionDeclaration and there are multiple comments", function() {

            var code = [
                "/* Code is good */",
                "/** Desc*/",
                "function Foo(){}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");

        });

        it("should get JSDoc comment for node when the node is a FunctionDeclaration inside of an IIFE", function() {

            var code = [
                "/** Code is good */",
                "(function() {",
                "/** Desc*/",
                "function Foo(){}",
                "}())"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionDeclaration", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");
        });

        it("should get JSDoc comment for node when the node is a FunctionExpression inside of an object literal", function() {

            var code = [
                "/** Code is good */",
                "var o = {",
                "/** Desc*/",
                "foo: function(){}",
                "};"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");
        });

        it("should get JSDoc comment for node when the node is a ArrowFunctionExpression inside of an object literal", function() {

            var code = [
                "/** Code is good */",
                "var o = {",
                "/** Desc*/",
                "foo: () => {}",
                "};"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("ArrowFunctionExpression", spy);
            eslint.verify(code, { ecmaFeatures: { arrowFunctions: true }, rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");
        });

        it("should get JSDoc comment for node when the node is a FunctionExpression in an assignment", function() {

            var code = [
                "/** Code is good */",
                "/** Desc*/",
                "Foo.bar = function(){}"
            ].join("\n");

            function assertJSDoc(node) {
                var sourceCode = eslint.getSourceCode();
                var jsdoc = sourceCode.getJSDocComment(node);
                assert.equal(jsdoc.type, "Block");
                assert.equal(jsdoc.value, "* Desc");
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");
        });

        it("should get JSDoc comment for node when the node is a FunctionExpression in an assignment inside an IIFE", function() {

            var code = [
                "/** Code is good */",
                "(function iife() {",
                "/** Desc*/",
                "Foo.bar = function(){}",
                "}());"
            ].join("\n");

            function assertJSDoc(node) {
                if (!node.id) {
                    var sourceCode = eslint.getSourceCode();
                    var jsdoc = sourceCode.getJSDocComment(node);
                    assert.equal(jsdoc.type, "Block");
                    assert.equal(jsdoc.value, "* Desc");
                }
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledTwice, "Event handler should be called.");
        });

        it("should not get JSDoc comment for node when the node is a FunctionExpression in an assignment inside an IIFE without a JSDoc comment", function() {

            var code = [
                "/** Code is good */",
                "(function iife() {",
                "//* whatever",
                "Foo.bar = function(){}",
                "}());"
            ].join("\n");

            function assertJSDoc(node) {
                if (!node.id) {
                    var sourceCode = eslint.getSourceCode();
                    var jsdoc = sourceCode.getJSDocComment(node);
                    assert.isNull(jsdoc);
                }
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledTwice, "Event handler should be called.");
        });

        it("should not get JSDoc comment for node when the node is a FunctionExpression inside of a CallExpression", function() {

            var code = [
                "/** Code is good */",
                "module.exports = (function() {",
                "}());"
            ].join("\n");

            function assertJSDoc(node) {
                if (!node.id) {
                    var sourceCode = eslint.getSourceCode();
                    var jsdoc = sourceCode.getJSDocComment(node);
                    assert.isNull(jsdoc);
                }
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledOnce, "Event handler should be called.");
        });

        it("should not get JSDoc comment for node when the node is a FunctionExpression in an assignment inside an IIFE without a JSDoc comment", function() {

            var code = [
                "/**",
                " * Merges two objects together.",
                " * @param {Object} target of the cloning operation",
                " * @param {Object} [source] object",
                " * @returns {void}",
                " */",
                "exports.mixin = function(target, source) {",
                "    Object.keys(source).forEach(function forEach(key) {",
                "        target[key] = source[key];",
                "    });",
                "};"
            ].join("\n");

            function assertJSDoc(node) {
                if (node.id) {
                    var sourceCode = eslint.getSourceCode();
                    var jsdoc = sourceCode.getJSDocComment(node);
                    assert.isNull(jsdoc);
                }
            }

            var spy = sandbox.spy(assertJSDoc);

            eslint.on("FunctionExpression", spy);
            eslint.verify(code, { rules: {}}, filename, true);
            assert.isTrue(spy.calledTwice, "Event handler should be called.");
        });

    });

    describe("getComments()", function() {
        var code = [
            "// my line comment",
            "var a = 42;",
            "/* my block comment */"
        ].join("\n");

        it("should attach them to all nodes", function() {
            function assertCommentCount(leading, trailing) {
                return function(node) {
                    var sourceCode = eslint.getSourceCode();
                    var comments = sourceCode.getComments(node);
                    assert.equal(comments.leading.length, leading);
                    assert.equal(comments.trailing.length, trailing);
                };
            }

            var config = { rules: {} };

            eslint.reset();
            eslint.on("Program", assertCommentCount(0, 0));
            eslint.on("VariableDeclaration", assertCommentCount(1, 1));
            eslint.on("VariableDeclarator", assertCommentCount(0, 0));
            eslint.on("Identifier", assertCommentCount(0, 0));
            eslint.on("Literal", assertCommentCount(0, 0));

            eslint.verify(code, config, "", true);
        });

    });

    describe("eslint.verify()", function() {

        var CONFIG = {
            ecmaFeatures: {
                blockBindings: true
            }
        };

        it("should work when passed a SourceCode object", function() {
            var sourceCode = new SourceCode("let foo = bar;", AST),
                messages = eslint.verify(sourceCode, CONFIG);

            assert.equal(messages.length, 0);
        });

        it("should report an error when blockBindings is false", function() {
            var sourceCode = new SourceCode("let foo = bar;", AST),
                messages = eslint.verify(sourceCode, {
                    ecmaFeatures: { blockBindings: true },
                    rules: { "no-unused-vars": 2 }
                });

            assert.equal(messages.length, 1);
            assert.equal(messages[0].message, "foo is defined but never used");
        });
    });
});
