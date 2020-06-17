import { expect } from "chai";
import { getPosition, getPositionName, Position } from "../src/node";

describe("getPosition", () => {
    it("returns the position", () => {
        expect(getPosition("inside")).to.eq(Position.Inside);
    });
});

describe("getPositionName", () => {
    it("returns the name of the position", () => {
        expect(getPositionName(Position.After)).to.eq("after");
        expect(getPositionName(Position.Before)).to.eq("before");
        expect(getPositionName(Position.Inside)).to.eq("inside");
        expect(getPositionName(Position.None)).to.eq("none");
    });
});
