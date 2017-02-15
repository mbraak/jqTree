declare var QUnit: any;
const { module, test } = QUnit;

import { Position } from "../src/node";

module("util");

test("Position.getName", assert => {
    assert.equal(Position.getName(Position.BEFORE), "before");
    assert.equal(Position.getName(Position.AFTER), "after");
    assert.equal(Position.getName(Position.INSIDE), "inside");
    assert.equal(Position.getName(Position.NONE), "none");
});

test("Position.nameToIndex", assert => {
    assert.equal(Position.nameToIndex("before"), Position.BEFORE);
    assert.equal(Position.nameToIndex("after"), Position.AFTER);
    assert.equal(Position.nameToIndex(""), 0);
});
