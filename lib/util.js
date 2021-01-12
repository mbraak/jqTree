"use strict";
exports.__esModule = true;
exports.getBoolString = exports.isFunction = exports.isInt = void 0;
var isInt = function (n) {
    return typeof n === "number" && n % 1 === 0;
};
exports.isInt = isInt;
var isFunction = function (v) { return typeof v === "function"; };
exports.isFunction = isFunction;
var getBoolString = function (value) {
    return value ? "true" : "false";
};
exports.getBoolString = getBoolString;
