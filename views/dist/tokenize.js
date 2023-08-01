var window;
(window ||= {}).tokenizer = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var require_stdin = __commonJS({
    "<stdin>"(exports, module) {
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define([], factory);
        } else if (typeof module === "object" && module.exports) {
          module.exports = factory();
        }
      })(exports, function() {
        "use strict";
        function peg$subclass(child, parent) {
          function ctor() {
            this.constructor = child;
          }
          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
        }
        function peg$SyntaxError(message, expected, found, location) {
          this.message = message;
          this.expected = expected;
          this.found = found;
          this.location = location;
          this.name = "SyntaxError";
          if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, peg$SyntaxError);
          }
        }
        peg$subclass(peg$SyntaxError, Error);
        peg$SyntaxError.buildMessage = function(expected, found) {
          var DESCRIBE_EXPECTATION_FNS = {
            literal: function(expectation) {
              return '"' + literalEscape(expectation.text) + '"';
            },
            "class": function(expectation) {
              var escapedParts = "", i;
              for (i = 0; i < expectation.parts.length; i++) {
                escapedParts += expectation.parts[i] instanceof Array ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1]) : classEscape(expectation.parts[i]);
              }
              return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
            },
            any: function(expectation) {
              return "any character";
            },
            end: function(expectation) {
              return "end of input";
            },
            other: function(expectation) {
              return expectation.description;
            }
          };
          function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
          }
          function literalEscape(s) {
            return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
              return "\\x0" + hex(ch);
            }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
              return "\\x" + hex(ch);
            });
          }
          function classEscape(s) {
            return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
              return "\\x0" + hex(ch);
            }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
              return "\\x" + hex(ch);
            });
          }
          function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
          }
          function describeExpected(expected2) {
            var descriptions = new Array(expected2.length), i, j;
            for (i = 0; i < expected2.length; i++) {
              descriptions[i] = describeExpectation(expected2[i]);
            }
            descriptions.sort();
            if (descriptions.length > 0) {
              for (i = 1, j = 1; i < descriptions.length; i++) {
                if (descriptions[i - 1] !== descriptions[i]) {
                  descriptions[j] = descriptions[i];
                  j++;
                }
              }
              descriptions.length = j;
            }
            switch (descriptions.length) {
              case 1:
                return descriptions[0];
              case 2:
                return descriptions[0] + " or " + descriptions[1];
              default:
                return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
            }
          }
          function describeFound(found2) {
            return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
          }
          return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
        };
        function peg$parse(input, options) {
          options = options !== void 0 ? options : {};
          var peg$FAILED = {}, peg$startRuleFunctions = { tokens: peg$parsetokens }, peg$startRuleFunction = peg$parsetokens, peg$c0 = /^[{}[\]()]/, peg$c1 = peg$classExpectation(["{", "}", "[", "]", "(", ")"], false, false), peg$c2 = function(bracketCharacter) {
            return { type: "bracketCharacter", isToken: true, children: [bracketCharacter] };
          }, peg$c3 = "<->", peg$c4 = peg$literalExpectation("<->", false), peg$c5 = "<-", peg$c6 = peg$literalExpectation("<-", false), peg$c7 = "->", peg$c8 = peg$literalExpectation("->", false), peg$c9 = function(arrow) {
            return { type: "arrow", isToken: true, children: [arrow] };
          }, peg$c10 = "=", peg$c11 = peg$literalExpectation("=", false), peg$c12 = function(key, value) {
            return { type: "keyValuePair", isToken: true, key: key.delimited, value: value.delimited, children: ['"', key.children[0], '"="', value.children[0], '"'] };
          }, peg$c13 = '"', peg$c14 = peg$literalExpectation('"', false), peg$c15 = function(string) {
            return { type: "string", delimited: string[1].delimited, children: [string[1].children[0]] };
          }, peg$c16 = function(stringCharacters) {
            return { type: "stringCharacters", delimited: stringCharacters.reduce((accumulator, currentValue) => {
              return accumulator += currentValue.delimited;
            }, ""), children: [stringCharacters.reduce((accumulator, currentValue) => {
              return accumulator += currentValue.children[0];
            }, "")] };
          }, peg$c17 = '\\"', peg$c18 = peg$literalExpectation('\\"', false), peg$c19 = function(delimitedEnd) {
            return { type: "delimiter", delimited: '"', children: [delimitedEnd] };
          }, peg$c20 = "\\\\", peg$c21 = peg$literalExpectation("\\\\", false), peg$c22 = function(delimitedBackslash) {
            return { type: "delimiter", delimited: "\\", children: [delimitedBackslash] };
          }, peg$c23 = "\\", peg$c24 = peg$literalExpectation("\\", false), peg$c25 = function(backslash) {
            return { type: "delimiter", delimited: "", children: [backslash] };
          }, peg$c26 = /^[^"]/, peg$c27 = peg$classExpectation(['"'], true, false), peg$c28 = function(stringCharacter) {
            return { type: "stringCharacter", delimited: stringCharacter, children: [stringCharacter] };
          }, peg$c29 = /^[ \t\n]/, peg$c30 = peg$classExpectation([" ", "	", "\n"], false, false), peg$c31 = function(ignoredCharacter) {
            return { type: "ignoredCharacter", children: [ignoredCharacter] };
          }, peg$c32 = peg$anyExpectation(), peg$c33 = function(errorCharacter) {
            return { type: "errorCharacter", isToken: true, children: [errorCharacter] };
          }, peg$currPos = 0, peg$savedPos = 0, peg$posDetailsCache = [{ line: 1, column: 1 }], peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$resultsCache = {}, peg$result;
          if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
              throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
          }
          function text() {
            return input.substring(peg$savedPos, peg$currPos);
          }
          function location() {
            return peg$computeLocation(peg$savedPos, peg$currPos);
          }
          function expected(description, location2) {
            location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
            throw peg$buildStructuredError(
              [peg$otherExpectation(description)],
              input.substring(peg$savedPos, peg$currPos),
              location2
            );
          }
          function error(message, location2) {
            location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
            throw peg$buildSimpleError(message, location2);
          }
          function peg$literalExpectation(text2, ignoreCase) {
            return { type: "literal", text: text2, ignoreCase };
          }
          function peg$classExpectation(parts, inverted, ignoreCase) {
            return { type: "class", parts, inverted, ignoreCase };
          }
          function peg$anyExpectation() {
            return { type: "any" };
          }
          function peg$endExpectation() {
            return { type: "end" };
          }
          function peg$otherExpectation(description) {
            return { type: "other", description };
          }
          function peg$computePosDetails(pos) {
            var details = peg$posDetailsCache[pos], p;
            if (details) {
              return details;
            } else {
              p = pos - 1;
              while (!peg$posDetailsCache[p]) {
                p--;
              }
              details = peg$posDetailsCache[p];
              details = {
                line: details.line,
                column: details.column
              };
              while (p < pos) {
                if (input.charCodeAt(p) === 10) {
                  details.line++;
                  details.column = 1;
                } else {
                  details.column++;
                }
                p++;
              }
              peg$posDetailsCache[pos] = details;
              return details;
            }
          }
          function peg$computeLocation(startPos, endPos) {
            var startPosDetails = peg$computePosDetails(startPos), endPosDetails = peg$computePosDetails(endPos);
            return {
              start: {
                offset: startPos,
                line: startPosDetails.line,
                column: startPosDetails.column
              },
              end: {
                offset: endPos,
                line: endPosDetails.line,
                column: endPosDetails.column
              }
            };
          }
          function peg$fail(expected2) {
            if (peg$currPos < peg$maxFailPos) {
              return;
            }
            if (peg$currPos > peg$maxFailPos) {
              peg$maxFailPos = peg$currPos;
              peg$maxFailExpected = [];
            }
            peg$maxFailExpected.push(expected2);
          }
          function peg$buildSimpleError(message, location2) {
            return new peg$SyntaxError(message, null, null, location2);
          }
          function peg$buildStructuredError(expected2, found, location2) {
            return new peg$SyntaxError(
              peg$SyntaxError.buildMessage(expected2, found),
              expected2,
              found,
              location2
            );
          }
          function peg$parsetokens() {
            var s0, s1;
            var key = peg$currPos * 12 + 0, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = [];
            s1 = peg$parsebracketCharacter();
            if (s1 === peg$FAILED) {
              s1 = peg$parsearrow();
              if (s1 === peg$FAILED) {
                s1 = peg$parsekeyValuePair();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseignoredCharacter();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseerrorCharacter();
                  }
                }
              }
            }
            while (s1 !== peg$FAILED) {
              s0.push(s1);
              s1 = peg$parsebracketCharacter();
              if (s1 === peg$FAILED) {
                s1 = peg$parsearrow();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsekeyValuePair();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseignoredCharacter();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseerrorCharacter();
                    }
                  }
                }
              }
            }
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsebracketCharacter() {
            var s0, s1;
            var key = peg$currPos * 12 + 1, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (peg$c0.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c1);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c2(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsearrow() {
            var s0, s1;
            var key = peg$currPos * 12 + 2, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c3) {
              s1 = peg$c3;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c4);
              }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c5) {
                s1 = peg$c5;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }
              if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c7) {
                  s1 = peg$c7;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c8);
                  }
                }
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c9(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsekeyValuePair() {
            var s0, s1, s2, s3;
            var key = peg$currPos * 12 + 3, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$parsestring();
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s2 = peg$c10;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c11);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsestring();
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c12(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsestring() {
            var s0, s1, s2, s3, s4;
            var key = peg$currPos * 12 + 4, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 34) {
              s2 = peg$c13;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c14);
              }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsestringCharacters();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                  s4 = peg$c13;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c14);
                  }
                }
                if (s4 !== peg$FAILED) {
                  s2 = [s2, s3, s4];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c15(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsestringCharacters() {
            var s0, s1, s2;
            var key = peg$currPos * 12 + 5, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsedelimitedEnd();
            if (s2 === peg$FAILED) {
              s2 = peg$parsedelimitedBackslash();
              if (s2 === peg$FAILED) {
                s2 = peg$parsebackslash();
                if (s2 === peg$FAILED) {
                  s2 = peg$parsestringCharacter();
                }
              }
            }
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsedelimitedEnd();
              if (s2 === peg$FAILED) {
                s2 = peg$parsedelimitedBackslash();
                if (s2 === peg$FAILED) {
                  s2 = peg$parsebackslash();
                  if (s2 === peg$FAILED) {
                    s2 = peg$parsestringCharacter();
                  }
                }
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c16(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedelimitedEnd() {
            var s0, s1;
            var key = peg$currPos * 12 + 6, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c17) {
              s1 = peg$c17;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c18);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c19(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsedelimitedBackslash() {
            var s0, s1;
            var key = peg$currPos * 12 + 7, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c20) {
              s1 = peg$c20;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c21);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c22(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsebackslash() {
            var s0, s1;
            var key = peg$currPos * 12 + 8, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s1 = peg$c23;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c24);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c25(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parsestringCharacter() {
            var s0, s1;
            var key = peg$currPos * 12 + 9, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (peg$c26.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c27);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c28(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseignoredCharacter() {
            var s0, s1;
            var key = peg$currPos * 12 + 10, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (peg$c29.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c30);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c31(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          function peg$parseerrorCharacter() {
            var s0, s1;
            var key = peg$currPos * 12 + 11, cached = peg$resultsCache[key];
            if (cached) {
              peg$currPos = cached.nextPos;
              return cached.result;
            }
            s0 = peg$currPos;
            if (input.length > peg$currPos) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c32);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c33(s1);
            }
            s0 = s1;
            peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };
            return s0;
          }
          peg$result = peg$startRuleFunction();
          if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
          } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
              peg$fail(peg$endExpectation());
            }
            throw peg$buildStructuredError(
              peg$maxFailExpected,
              peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
              peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
            );
          }
        }
        return {
          SyntaxError: peg$SyntaxError,
          parse: peg$parse
        };
      });
    }
  });
  return require_stdin();
})();
