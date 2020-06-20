"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var node_1 = require("../src/node");
describe("getPosition", function () {
    it("returns the position", function () {
        chai_1.expect(node_1.getPosition("inside")).to.eq(node_1.Position.Inside);
    });
});
describe("getPositionName", function () {
    it("returns the name of the position", function () {
        chai_1.expect(node_1.getPositionName(node_1.Position.After)).to.eq("after");
        chai_1.expect(node_1.getPositionName(node_1.Position.Before)).to.eq("before");
        chai_1.expect(node_1.getPositionName(node_1.Position.Inside)).to.eq("inside");
        chai_1.expect(node_1.getPositionName(node_1.Position.None)).to.eq("none");
    });
    context("with an unknown position", function () {
        it("returns an empty string", function () {
            chai_1.expect(node_1.getPositionName(10)).to.eq("");
        });
    });
});
