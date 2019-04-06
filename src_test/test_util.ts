const { module, test } = QUnit;

import { isInt, isFunction, htmlEscape, getBoolString } from "../src/util";

module("util");

test("isInt", (assert: Assert) => {
    assert.ok(isInt(10));
    assert.ok(isInt(0));
    assert.ok(isInt(-1));
    assert.notOk(isInt("1"));
    assert.notOk(null);
});

test("isFunction", (assert: Assert) => {
    assert.ok(isFunction(isInt));
    assert.notOk(isFunction("test"));
});

test("htmlEscape", (assert: Assert) => {
    assert.equal(htmlEscape(""), "");
    assert.equal(htmlEscape("test"), "test");
    assert.equal(htmlEscape("a&b"), "a&amp;b");
});

test("getBoolString", (assert: Assert) => {
    assert.equal(getBoolString(true), "true");
    assert.equal(getBoolString(false), "false");
    assert.equal(getBoolString(1), "true");
    assert.equal(getBoolString(null), "false");
});
