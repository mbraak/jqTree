"use strict";

var _nodeUtils = require("../nodeUtils");
describe("isNodeRecordWithChildren", () => {
  it("returns true when the data is an object with the children attribute of type array", () => {
    const data = {
      children: []
    };
    expect((0, _nodeUtils.isNodeRecordWithChildren)(data)).toBe(true);
  });
  it("returns when the data is an object without the children attribute", () => {
    const data = {
      name: "test"
    };
    expect((0, _nodeUtils.isNodeRecordWithChildren)(data)).toBe(false);
  });
  it("returns when the data is a string", () => {
    expect((0, _nodeUtils.isNodeRecordWithChildren)("test")).toBe(false);
  });
});