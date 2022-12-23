"use strict";

var _util = require("../util");
describe("getBoolString", function () {
  it("returns true or false", function () {
    expect((0, _util.getBoolString)(true)).toBe("true");
    expect((0, _util.getBoolString)(false)).toBe("false");
    expect((0, _util.getBoolString)(1)).toBe("true");
    expect((0, _util.getBoolString)(null)).toBe("false");
  });
});
describe("isFunction", function () {
  it("returns a boolean", function () {
    expect((0, _util.isFunction)(_util.isInt)).toBe(true);
    expect((0, _util.isFunction)("isInt")).toBe(false);
  });
});
describe("isInt", function () {
  it("returns a boolean", function () {
    expect((0, _util.isInt)(10)).toBe(true);
    expect((0, _util.isInt)(0)).toBe(true);
    expect((0, _util.isInt)(-1)).toBe(true);
    expect((0, _util.isInt)("1")).toBe(false);
    expect((0, _util.isInt)(null)).toBe(false);
  });
});