import { isNodeRecordWithChildren } from "../nodeUtils";

describe("isNodeRecordWithChildren", () => {
    it("returns true when the data is an object with the children attribute of type array", () => {
        const data = {
            children: [],
        };

        expect(isNodeRecordWithChildren(data)).toBe(true);
    });

    it("returns when the data is an object without the children attribute", () => {
        const data = { name: "test" };

        expect(isNodeRecordWithChildren(data)).toBe(false);
    });

    it("returns when the data is a string", () => {
        expect(isNodeRecordWithChildren("test")).toBe(false);
    });
});
