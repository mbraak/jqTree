import { isNodeRecordWithChildren } from "htmlTree/nodeUtils";

describe("isNodeRecordWithChildren", () => {
    it("returns true when the data is an object with the children attribute of type array", () => {
        const data = {
            children: [],
        };

        expect(isNodeRecordWithChildren(data)).toBeTrue();
    });

    it("returns when the data is an object without the children attribute", () => {
        const data = { name: "test" };

        expect(isNodeRecordWithChildren(data)).toBeFalse();
    });

    it("returns when the data is a string", () => {
        expect(isNodeRecordWithChildren("test")).toBeFalse();
    });
});
