"use strict";

var _node = require("../node");

var context = describe;
describe("getPosition", function () {
  it("returns the position", function () {
    expect((0, _node.getPosition)("inside")).toBe(_node.Position.Inside);
  });
  context("with an unknown position", function () {
    it("returns undefined", function () {
      expect((0, _node.getPosition)("unknown")).toBeUndefined();
    });
  });
});
describe("getPositionName", function () {
  it("returns the name of the position", function () {
    expect((0, _node.getPositionName)(_node.Position.After)).toBe("after");
    expect((0, _node.getPositionName)(_node.Position.Before)).toBe("before");
    expect((0, _node.getPositionName)(_node.Position.Inside)).toBe("inside");
    expect((0, _node.getPositionName)(_node.Position.None)).toBe("none");
  });
  context("with an unknown position", function () {
    it("returns an empty string", function () {
      expect((0, _node.getPositionName)(10)).toBe("");
    });
  });
});