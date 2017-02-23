const { module, test } = QUnit;

import { Position, getPositionName, getPosition } from "../src/node";

module("util");

test("getPositionName", (assert: Assert) => {
    assert.equal(getPositionName(Position.Before), "before");
    assert.equal(getPositionName(Position.After), "after");
    assert.equal(getPositionName(Position.Inside), "inside");
    assert.equal(getPositionName(Position.None), "none");
});

test("getPosition", (assert: Assert) => {
    assert.equal(getPosition("inside"), Position.Inside);
});
