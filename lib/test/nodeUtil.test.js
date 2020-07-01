"use strict";
exports.__esModule = true;
var node_1 = require("../node");
var context = describe;
describe("getPosition", function () {
    test("returns the position", function () {
        expect(node_1.getPosition("inside")).toBe(node_1.Position.Inside);
    });
    context("with an unknown position", function () {
        test("returns undefined", function () {
            expect(node_1.getPosition("unknown")).toBeUndefined();
        });
    });
});
describe("getPositionName", function () {
    test("returns the name of the position", function () {
        expect(node_1.getPositionName(node_1.Position.After)).toBe("after");
        expect(node_1.getPositionName(node_1.Position.Before)).toBe("before");
        expect(node_1.getPositionName(node_1.Position.Inside)).toBe("inside");
        expect(node_1.getPositionName(node_1.Position.None)).toBe("none");
    });
    context("with an unknown position", function () {
        test("returns an empty string", function () {
            expect(node_1.getPositionName(10)).toBe("");
        });
    });
});
