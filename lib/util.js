"use strict";
exports.__esModule = true;
function isInt(n) {
    return typeof n === "number" && n % 1 === 0;
}
exports.isInt = isInt;
function isFunction(v) {
    return typeof v === "function";
}
exports.isFunction = isFunction;
// Escape a string for HTML interpolation; copied from underscore js
function html_escape(text) {
    return ("" + text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}
exports.html_escape = html_escape;
function getBoolString(value) {
    if (value) {
        return "true";
    }
    else {
        return "false";
    }
}
exports.getBoolString = getBoolString;
