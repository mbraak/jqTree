import { getBoolString, isInt } from "htmlTree/util";

describe("getBoolString", () => {
    it("returns true or false", () => {
        expect(getBoolString(true)).toBe("true");
        expect(getBoolString(false)).toBe("false");
        expect(getBoolString(1)).toBe("true");
        expect(getBoolString(null)).toBe("false");
    });
});

describe("isInt", () => {
    it("returns a boolean", () => {
        expect(isInt(10)).toBeTrue();
        expect(isInt(0)).toBeTrue();
        expect(isInt(-1)).toBeTrue();
        expect(isInt("1")).toBeFalse();
        expect(isInt(null)).toBeFalse();
    });
});
