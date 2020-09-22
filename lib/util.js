"use strict";
exports.__esModule = true;
exports.getBoolString = exports.isFunction = exports.isInt = void 0;
exports.isInt = function (n) {
    return typeof n === "number" && n % 1 === 0;
};
exports.isFunction = function (v) { return typeof v === "function"; };
exports.getBoolString = function (value) {
    return value ? "true" : "false";
};
