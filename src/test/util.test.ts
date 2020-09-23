import { getBoolString, isFunction, isInt } from "../util";

describe("getBoolString", () => {
    it("returns true or false", () => {
        expect(getBoolString(true)).toBe("true");
        expect(getBoolString(false)).toBe("false");
        expect(getBoolString(1)).toBe("true");
        expect(getBoolString(null)).toBe("false");
    });
});

describe("isFunction", () => {
    it("returns a boolean", () => {
        expect(isFunction(isInt)).toBe(true);
        expect(isFunction("isInt")).toBe(false);
    });
});

describe("isInt", () => {
    it("returns a boolean", () => {
        expect(isInt(10)).toBe(true);
        expect(isInt(0)).toBe(true);
        expect(isInt(-1)).toBe(true);
        expect(isInt("1")).toBe(false);
        expect(isInt(null)).toBe(false);
    });
});
