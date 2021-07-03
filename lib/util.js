"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBoolString = exports.isFunction = exports.isInt = void 0;

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