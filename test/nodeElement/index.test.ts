import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";
import NodeElement from "app/nodeElement";
import BorderDropHint from "app/nodeElement/borderDropHint";
import GhostDropHint from "app/nodeElement/ghostDropHint";

import { titleSpan } from "../support/testUtil";

interface CreateNodeElementParams {
    tabIndex?: number;
}

const createNodeElement = ({ tabIndex }: CreateNodeElementParams = {}) => {
    const tree = new Node().loadFromData([{ id: 1, name: "node1" }]);
    const node = tree.children[0] as Node;

    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const renderer = new ElementsRenderer({
        $element: jQuery(treeElement),
        autoEscape: true,
        buttonLeft: false,
        dragAndDrop: false,
        getTree: () => tree,
        isNodeSelected: () => false,
        showEmptyFolder: false,
    });
    renderer.renderFromRoot();

    const nodeElement = new NodeElement({
        getScrollLeft: () => 0,
        node,
        tabIndex,
        treeElement,
    });

    const element = node.element as HTMLElement;

    return { element, node, nodeElement, treeElement };
};

describe("init", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("sets the element to the element of the node", () => {
        const treeElement = document.createElement("div");
        document.body.append(treeElement);

        const element = document.createElement("div");
        document.body.append(element);

        const node = new Node();
        node.element = element;

        const getScrollLeft = () => 0;

        const nodeElement = new NodeElement({
            getScrollLeft,
            node,
            treeElement,
        });

        expect(nodeElement.element).toStrictEqual(element);
    });

    it("sets the element to the tree element when the node doesn't have an element", () => {
        const treeElement = document.createElement("div");
        document.body.append(treeElement);

        const node = new Node();
        const getScrollLeft = () => 0;

        const nodeElement = new NodeElement({
            getScrollLeft,
            node,
            treeElement,
        });

        expect(nodeElement.element).toStrictEqual(treeElement);
    });

    it("assigns the node to the node element", () => {
        const treeElement = document.createElement("div");
        document.body.append(treeElement);

        const node = new Node();

        const nodeElement = new NodeElement({
            getScrollLeft: () => 0,
            node,
            treeElement,
        });

        expect(nodeElement.node).toBe(node);
    });
});

describe("addDropHint", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("returns a border drop hint for position inside", () => {
        const { nodeElement } = createNodeElement();

        expect(nodeElement.addDropHint("inside")).toBeInstanceOf(
            BorderDropHint,
        );
    });

    it("returns a ghost drop hint for position after", () => {
        const { nodeElement } = createNodeElement();

        expect(nodeElement.addDropHint("after")).toBeInstanceOf(GhostDropHint);
    });

    it("returns a ghost drop hint for position before", () => {
        const { nodeElement } = createNodeElement();

        expect(nodeElement.addDropHint("before")).toBeInstanceOf(GhostDropHint);
    });
});

describe("select", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("adds the selected class to the element", () => {
        const { element, nodeElement } = createNodeElement();

        nodeElement.select(false);

        expect(element).toHaveClass("jqtree-selected");
    });

    it("sets aria-selected to true on the title span", () => {
        const { element, nodeElement } = createNodeElement();

        nodeElement.select(false);

        const selected = "true";

        expect(titleSpan(element)).toHaveAttribute("aria-selected", selected);
    });

    it("sets the tabindex on the title span when a tabIndex is given", () => {
        const { element, nodeElement } = createNodeElement({ tabIndex: 0 });

        nodeElement.select(false);

        const tabIndex = "0";

        expect(titleSpan(element)).toHaveAttribute("tabindex", tabIndex);
    });

    it("doesn't set the tabindex on the title span when no tabIndex is given", () => {
        const { element, nodeElement } = createNodeElement();

        nodeElement.select(false);

        expect(titleSpan(element)).not.toHaveAttribute("tabindex");
    });

    it("focuses the title span when mustSetFocus is true", () => {
        const { element, nodeElement } = createNodeElement({ tabIndex: 0 });

        nodeElement.select(true);

        expect(titleSpan(element)).toHaveFocus();
    });

    it("doesn't focus the title span when mustSetFocus is false", () => {
        const { element, nodeElement } = createNodeElement({ tabIndex: 0 });

        nodeElement.select(false);

        expect(titleSpan(element)).not.toHaveFocus();
    });
});

describe("deselect", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("removes the selected class from the element", () => {
        const { element, nodeElement } = createNodeElement();

        nodeElement.select(false);
        nodeElement.deselect();

        expect(element).not.toHaveClass("jqtree-selected");
    });

    it("sets aria-selected to false on the title span", () => {
        const { element, nodeElement } = createNodeElement();

        nodeElement.select(false);
        nodeElement.deselect();

        const deselected = "false";

        expect(titleSpan(element)).toHaveAttribute("aria-selected", deselected);
    });

    it("removes the tabindex from the title span", () => {
        const { element, nodeElement } = createNodeElement({ tabIndex: 0 });

        nodeElement.select(false);
        nodeElement.deselect();

        expect(titleSpan(element)).not.toHaveAttribute("tabindex");
    });

    it("blurs the title span", () => {
        const { element, nodeElement } = createNodeElement({ tabIndex: 0 });

        const blur = vi.spyOn(titleSpan(element), "blur");

        nodeElement.select(true);
        nodeElement.deselect();

        expect(blur).toHaveBeenCalledExactlyOnceWith();
    });
});
