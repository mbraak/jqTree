import { getBoolString, htmlEscape, isFunction, isInt } from "../src/util";

describe("getBoolString", () => {
    test("returns true or false", () => {
        expect(getBoolString(true)).toBe("true");
        expect(getBoolString(false)).toBe("false");
        expect(getBoolString(1)).toBe("true");
        expect(getBoolString(null)).toBe("false");
    });
});

describe("htmlEscape", () => {
    test("escapes text in html", () => {
        expect(htmlEscape("")).toBe("");
        expect(htmlEscape("test")).toBe("test");
        expect(htmlEscape("a&b")).toBe("a&amp;b");
    });
});

describe("isFunction", () => {
    test("returns a boolean", () => {
        expect(isFunction(isInt)).toBe(true);
        expect(isFunction("isInt")).toBe(false);
    });
});

describe("isInt", () => {
    test("returns a boolean", () => {
        expect(isInt(10)).toBe(true);
        expect(isInt(0)).toBe(true);
        expect(isInt(-1)).toBe(true);
        expect(isInt("1")).toBe(false);
        expect(isInt(null)).toBe(false);
    });
});
