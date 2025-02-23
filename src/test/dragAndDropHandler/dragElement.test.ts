import DragElement from "../../dragAndDropHandler/dragElement";

describe("DragElement", () => {
    it("creates an element with autoEscape is true", () => {
        const treeElement = document.createElement("div");

        new DragElement({
            autoEscape: true,
            nodeName: "abc &amp; def",
            offsetX: 0,
            offsetY: 0,
            treeElement,
        });

        expect(treeElement.children).toHaveLength(1);

        const childElement = treeElement.children[0];

        expect(childElement).toHaveClass("jqtree-title");
        expect(childElement).toHaveClass("jqtree-dragging");
        expect(childElement).toHaveTextContent("abc &amp; def");
    });

    it("creates an element with autoEscape is false", () => {
        const treeElement = document.createElement("div");

        new DragElement({
            autoEscape: false,
            nodeName: "abc &amp; def",
            offsetX: 0,
            offsetY: 0,
            treeElement,
        });

        expect(treeElement.children).toHaveLength(1);

        const childElement = treeElement.children[0];

        expect(childElement).toHaveTextContent("abc & def");
    });
});
