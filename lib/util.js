"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInt = exports.isFunction = exports.getBoolString = void 0;
const isInt = n => typeof n === "number" && n % 1 === 0;
exports.isInt = isInt;
const isFunction = v => typeof v === "function";
exports.isFunction = isFunction;
const getBoolString = value => value ? "true" : "false";
exports.getBoolString = getBoolString;