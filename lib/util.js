"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInt = exports.isFunction = exports.getBoolString = void 0;
var isInt = exports.isInt = function isInt(n) {
  return typeof n === "number" && n % 1 === 0;
};
var isFunction = exports.isFunction = function isFunction(v) {
  return typeof v === "function";
};
var getBoolString = exports.getBoolString = function getBoolString(value) {
  return value ? "true" : "false";
};