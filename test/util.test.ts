import { getBoolString, isFunction, isInt, setQueryParameter } from "app/util";

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
        expect(isFunction(isInt)).toBeTrue();
        expect(isFunction("isInt")).toBeFalse();
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

describe("setQueryParameter", () => {
    it("adds a query parameter to a relative url", () => {
        expect(setQueryParameter('/data', 'node', '123')).toBe('/data?node=123')
    });

    it("adds a query parameter to an absolute url", () => {
        expect(setQueryParameter('https://myserver/data', 'node', '123')).toBe('https://myserver/data?node=123')
    });

    it("adds a query parameter when the url already has a query parameter", () => {
        expect(setQueryParameter('/data?param1=xyz', 'node', '123')).toBe('/data?param1=xyz&node=123')
    });

    it("todo encode", () => {
        expect(setQueryParameter('/data', 'node', '?')).toBe('/data?node=%3F')
    });
});