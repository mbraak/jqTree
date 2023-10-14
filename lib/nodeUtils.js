"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodeRecordWithChildren = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var isNodeRecordWithChildren = function isNodeRecordWithChildren(data) {
  return _typeof(data) === "object" && "children" in data && data["children"] instanceof Array;
};
exports.isNodeRecordWithChildren = isNodeRecordWithChildren;