"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodeRecordWithChildren = void 0;
const isNodeRecordWithChildren = data => typeof data === "object" && "children" in data && data["children"] instanceof Array;
exports.isNodeRecordWithChildren = isNodeRecordWithChildren;