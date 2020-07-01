"use strict";
exports.__esModule = true;
var util_1 = require("../util");
describe("getBoolString", function () {
    test("returns true or false", function () {
        expect(util_1.getBoolString(true)).toBe("true");
        expect(util_1.getBoolString(false)).toBe("false");
        expect(util_1.getBoolString(1)).toBe("true");
        expect(util_1.getBoolString(null)).toBe("false");
    });
});
describe("htmlEscape", function () {
    test("escapes text in html", function () {
        expect(util_1.htmlEscape("")).toBe("");
        expect(util_1.htmlEscape("test")).toBe("test");
        expect(util_1.htmlEscape("a&b")).toBe("a&amp;b");
    });
});
describe("isFunction", function () {
    test("returns a boolean", function () {
        expect(util_1.isFunction(util_1.isInt)).toBe(true);
        expect(util_1.isFunction("isInt")).toBe(false);
    });
});
describe("isInt", function () {
    test("returns a boolean", function () {
        expect(util_1.isInt(10)).toBe(true);
        expect(util_1.isInt(0)).toBe(true);
        expect(util_1.isInt(-1)).toBe(true);
        expect(util_1.isInt("1")).toBe(false);
        expect(util_1.isInt(null)).toBe(false);
    });
});
