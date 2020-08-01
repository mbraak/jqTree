import { getPosition, getPositionName, Position } from "../node";

const context = describe;

describe("getPosition", () => {
    it("returns the position", () => {
        expect(getPosition("inside")).toBe(Position.Inside);
    });

    context("with an unknown position", () => {
        it("returns undefined", () => {
            expect(getPosition("unknown")).toBeUndefined();
        });
    });
});

describe("getPositionName", () => {
    it("returns the name of the position", () => {
        expect(getPositionName(Position.After)).toBe("after");
        expect(getPositionName(Position.Before)).toBe("before");
        expect(getPositionName(Position.Inside)).toBe("inside");
        expect(getPositionName(Position.None)).toBe("none");
    });

    context("with an unknown position", () => {
        it("returns an empty string", () => {
            expect(getPositionName(10)).toBe("");
        });
    });
});
