import { getAnimationDuration, getBoolString, isInt } from "app/util";

describe("getAnimationDuration", () => {
    it("returns a number unchanged", () => {
        expect(getAnimationDuration(456)).toBe(456);
    });

    it("returns 200 for 'fast'", () => {
        expect(getAnimationDuration("fast")).toBe(200);
    });

    it("returns 600 for 'slow'", () => {
        expect(getAnimationDuration("slow")).toBe(600);
    });
});

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
