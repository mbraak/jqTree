import { expect } from "chai";
import { getPositionName, Position } from "../src/node";

describe("getPositionName", () => {
    it("returns the name of the position", () => {
        expect(getPositionName(Position.After)).to.eq("after");
        expect(getPositionName(Position.Before)).to.eq("before");
        expect(getPositionName(Position.Inside)).to.eq("inside");
        expect(getPositionName(Position.None)).to.eq("none");
    });
});
