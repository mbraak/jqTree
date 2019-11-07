"use strict";
exports.__esModule = true;
var module = QUnit.module, test = QUnit.test;
var node_1 = require("../src/node");
module("node_util");
test("getPositionName", function (assert) {
    assert.equal(node_1.getPositionName(node_1.Position.Before), "before");
    assert.equal(node_1.getPositionName(node_1.Position.After), "after");
    assert.equal(node_1.getPositionName(node_1.Position.Inside), "inside");
    assert.equal(node_1.getPositionName(node_1.Position.None), "none");
});
test("getPosition", function (assert) {
    assert.equal(node_1.getPosition("inside"), node_1.Position.Inside);
});
