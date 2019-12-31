"use strict";
exports.__esModule = true;
var module = QUnit.module, test = QUnit.test;
var util_1 = require("../src/util");
module("util");
test("isInt", function (assert) {
    assert.ok(util_1.isInt(10));
    assert.ok(util_1.isInt(0));
    assert.ok(util_1.isInt(-1));
    assert.notOk(util_1.isInt("1"));
    assert.notOk(null);
});
test("isFunction", function (assert) {
    assert.ok(util_1.isFunction(util_1.isInt));
    assert.notOk(util_1.isFunction("test"));
});
test("htmlEscape", function (assert) {
    assert.equal(util_1.htmlEscape(""), "");
    assert.equal(util_1.htmlEscape("test"), "test");
    assert.equal(util_1.htmlEscape("a&b"), "a&amp;b");
});
test("getBoolString", function (assert) {
    assert.equal(util_1.getBoolString(true), "true");
    assert.equal(util_1.getBoolString(false), "false");
    assert.equal(util_1.getBoolString(1), "true");
    assert.equal(util_1.getBoolString(null), "false");
});
