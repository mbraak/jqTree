"use strict";
exports.__esModule = true;
exports.isInt = function (n) { return typeof n === "number" && n % 1 === 0; };
exports.isFunction = function (v) { return typeof v === "function"; };
// Escape a string for HTML interpolation; copied from underscore js
exports.htmlEscape = function (text) {
    return ("" + text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};
exports.getBoolString = function (value) { return (value ? "true" : "false"); };
