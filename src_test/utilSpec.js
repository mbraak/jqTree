"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var util_1 = require("../src/util");
describe("getBoolString", function () {
    it("returns true or false", function () {
        chai_1.expect(util_1.getBoolString(true)).to.eq("true");
        chai_1.expect(util_1.getBoolString(false)).to.eq("false");
        chai_1.expect(util_1.getBoolString(1)).to.eq("true");
        chai_1.expect(util_1.getBoolString(null)).to.eq("false");
    });
});
describe("htmlEscape", function () {
    it("escapes text in html", function () {
        chai_1.expect(util_1.htmlEscape("")).to.eq("");
        chai_1.expect(util_1.htmlEscape("test")).to.eq("test");
        chai_1.expect(util_1.htmlEscape("a&b")).to.eq("a&amp;b");
    });
});
describe("isFunction", function () {
    it("returns a boolean", function () {
        chai_1.expect(util_1.isFunction(util_1.isInt)).to.eq(true);
        chai_1.expect(util_1.isFunction("isInt")).to.eq(false);
    });
});
describe("isInt", function () {
    it("returns a boolean", function () {
        chai_1.expect(util_1.isInt(10)).to.eq(true);
        chai_1.expect(util_1.isInt(0)).to.eq(true);
        chai_1.expect(util_1.isInt(-1)).to.eq(true);
        chai_1.expect(util_1.isInt("1")).to.eq(false);
        chai_1.expect(util_1.isInt(null)).to.eq(false);
    });
});
