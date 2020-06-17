import { expect } from "chai";

import { getBoolString, htmlEscape, isFunction, isInt } from "../src/util";

describe("getBoolString", () => {
    it("returns true or false", () => {
        expect(getBoolString(true)).to.eq("true");
        expect(getBoolString(false)).to.eq("false");
        expect(getBoolString(1)).to.eq("true");
        expect(getBoolString(null)).to.eq("false");
    });
});

describe("htmlEscape", () => {
    it("escapes text in html", () => {
        expect(htmlEscape("")).to.eq("");
        expect(htmlEscape("test")).to.eq("test");
        expect(htmlEscape("a&b")).to.eq("a&amp;b");
    });
});

describe("isFunction", () => {
    it("returns a boolean", () => {
        expect(isFunction(isInt)).to.eq(true);
        expect(isFunction("isInt")).to.eq(false);
    });
});

describe("isInt", () => {
    it("returns a boolean", () => {
        expect(isInt(10)).to.eq(true);
        expect(isInt(0)).to.eq(true);
        expect(isInt(-1)).to.eq(true);
        expect(isInt("1")).to.eq(false);
        expect(isInt(null)).to.eq(false);
    });
});
