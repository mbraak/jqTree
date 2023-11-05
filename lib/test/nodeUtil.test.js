"use strict";

var _node = require("../node");
const context = describe;
describe("getPosition", () => {
  it("returns the position", () => {
    expect((0, _node.getPosition)("inside")).toBe(_node.Position.Inside);
  });
  context("with an unknown position", () => {
    it("returns undefined", () => {
      expect((0, _node.getPosition)("unknown")).toBeUndefined();
    });
  });
});
describe("getPositionName", () => {
  it("returns the name of the position", () => {
    expect((0, _node.getPositionName)(_node.Position.After)).toBe("after");
    expect((0, _node.getPositionName)(_node.Position.Before)).toBe("before");
    expect((0, _node.getPositionName)(_node.Position.Inside)).toBe("inside");
    expect((0, _node.getPositionName)(_node.Position.None)).toBe("none");
  });
  context("with an unknown position", () => {
    it("returns an empty string", () => {
      expect((0, _node.getPositionName)(10)).toBe("");
    });
  });
});