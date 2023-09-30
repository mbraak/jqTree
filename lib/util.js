"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInt = exports.isFunction = exports.getOffsetTop = exports.getBoolString = void 0;
var isInt = function isInt(n) {
  return typeof n === "number" && n % 1 === 0;
};
exports.isInt = isInt;
var isFunction = function isFunction(v) {
  return typeof v === "function";
};
exports.isFunction = isFunction;
var getBoolString = function getBoolString(value) {
  return value ? "true" : "false";
};
exports.getBoolString = getBoolString;
var getOffsetTop = function getOffsetTop(element) {
  return element.getBoundingClientRect().y + window.scrollY;
};
exports.getOffsetTop = getOffsetTop;