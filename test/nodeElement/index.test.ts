import { screen } from "@testing-library/dom";

import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";
import NodeElement from "app/nodeElement";
import BorderDropHint from "app/nodeElement/borderDropHint";
import GhostDropHint from "app/nodeElement/ghostDropHint";

import { getTreeListElement } from "../support/queries";

interface CreateNodeElementParams {
    tabIndex?: number;
}

const createNodeElement = ({ tabIndex }: CreateNodeElementParams = {}) => {
    const tree = new Node().loadFromData([{ id: 1, name: "node1" }]);
    const node = tree.children[0] as Node;

    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const setNodeElement = vi.fn();

    const renderer = new ElementsRenderer({
        autoEscape: true,
        buttonLeft: false,
        dragAndDrop: false,
        getTree: () => tree,
        htmlElement: treeElement,
        isNodeSelected: () => false,
        setNodeElement,
        showEmptyFolder: false,
    });
    renderer.renderFromRoot();

    const nodeElement = new NodeElement({
        getScrollLeft: () => 0,
        node,
        tabIndex,
        treeElement,
    });

    return { node, nodeElement };
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
        const { nodeElement } = createNodeElement();
        nodeElement.select(false);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        const listElement = getTreeListElement(treeItem);

        expect(listElement).toHaveClass("jqtree-selected");
    });

    it("sets aria-selected to true on the title span", () => {
        const { nodeElement } = createNodeElement();
        nodeElement.select(false);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toBeAriaSelected();
    });

    it("sets the tabindex on the title span when a tabIndex is given", () => {
        const { nodeElement } = createNodeElement({ tabIndex: 0 });
        nodeElement.select(false);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toHaveAttribute("tabindex", "0");
    });

    it("doesn't set the tabindex on the title span when no tabIndex is given", () => {
        const { nodeElement } = createNodeElement();
        nodeElement.select(false);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toHaveAttribute("tabindex");
    });

    it("focuses the title span when mustSetFocus is true", () => {
        const { nodeElement } = createNodeElement({ tabIndex: 0 });
        nodeElement.select(true);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toHaveFocus();
    });

    it("doesn't focus the title span when mustSetFocus is false", () => {
        const { nodeElement } = createNodeElement({ tabIndex: 0 });
        nodeElement.select(false);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toHaveFocus();
    });
});

describe("deselect", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("removes the selected class from the element", () => {
        const { nodeElement } = createNodeElement();
        nodeElement.select(false);
        nodeElement.deselect();

        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        const listElement = getTreeListElement(treeItem);

        expect(listElement).not.toHaveClass("jqtree-selected");
    });

    it("sets aria-selected to false on the title span", () => {
        const { nodeElement } = createNodeElement();

        nodeElement.select(false);
        nodeElement.deselect();

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toHaveAttribute("aria-selected", "false");
    });

    it("removes the tabindex from the title span", () => {
        const { nodeElement } = createNodeElement({ tabIndex: 0 });

        nodeElement.select(false);
        nodeElement.deselect();

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toHaveAttribute("tabindex");
    });

    it("blurs the title span", () => {
        const { nodeElement } = createNodeElement({ tabIndex: 0 });
        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        const blur = vi.spyOn(treeItem, "blur");

        nodeElement.select(true);
        nodeElement.deselect();

        expect(blur).toHaveBeenCalledExactlyOnceWith();
    });
});
