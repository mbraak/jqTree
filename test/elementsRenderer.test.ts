import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";

describe("renderFromNode", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a node without an element", () => {
        const element = document.createElement("div");
        const node = new Node();
        const setNodeElement = vi.fn();

        const elementsRenderer = new ElementsRenderer({
            $element: jQuery(element),
            autoEscape: true,
            buttonLeft: false,
            dragAndDrop: false,
            getTree: () => node,
            isNodeSelected: () => false,
            setNodeElement,
            showEmptyFolder: false,
        });

        elementsRenderer.renderFromNode(node);

        expect(element.children).toBeEmpty();
    });
});
