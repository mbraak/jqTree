import ElementsRenderer from "../elementsRenderer";
import { Node } from "../node";

describe("renderFromNode", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("handles a node without an element", () => {
        const element = document.createElement("div");
        const node = new Node();

        const elementsRenderer = new ElementsRenderer({
            $element: jQuery(element),
            autoEscape: true,
            buttonLeft: false,
            dragAndDrop: false,
            getTree: () => node,
            isNodeSelected: () => false,
            showEmptyFolder: false,
        });

        elementsRenderer.renderFromNode(node);

        expect(element.children).toBeEmpty();
    });
});
