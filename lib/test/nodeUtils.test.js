"use strict";

var _nodeUtils = require("../nodeUtils");
describe("isNodeRecordWithChildren", function () {
  it("returns true when the data is an object with the children attribute of type array", function () {
    var data = {
      children: []
    };
    expect((0, _nodeUtils.isNodeRecordWithChildren)(data)).toBe(true);
  });
  it("returns when the data is an object without the children attribute", function () {
    var data = {
      name: "test"
    };
    expect((0, _nodeUtils.isNodeRecordWithChildren)(data)).toBe(false);
  });
  it("returns when the data is a string", function () {
    expect((0, _nodeUtils.isNodeRecordWithChildren)("test")).toBe(false);
  });
});