import { screen } from "@testing-library/dom";
import { vi } from "vitest";

import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";
import BorderDropHint from "app/nodeElement/borderDropHint";
import FolderElement from "app/nodeElement/folderElement";
import GhostDropHint from "app/nodeElement/ghostDropHint";

import { getTreeButton, getTreeListElement } from "../support/queries";

interface CreateFolderElementParams {
    closedIconElement?: HTMLElement | Text;
    isOpen?: boolean;
    openedIconElement?: HTMLElement | Text;
}

const createFolderElement = ({
    closedIconElement,
    isOpen = false,
    openedIconElement,
}: CreateFolderElementParams = {}) => {
    const tree = new Node().loadFromData([
        { children: [{ id: 2, name: "child1" }], id: 1, name: "node1" },
    ]);

    const folderNode = tree.children[0] as Node;
    folderNode.is_open = isOpen;

    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const renderer = new ElementsRenderer({
        autoEscape: true,
        buttonLeft: false,
        dragAndDrop: false,
        getTree: () => tree,
        htmlElement: treeElement,
        isNodeSelected: () => false,
        showEmptyFolder: false,
    });
    renderer.renderFromRoot();

    if (!isOpen) {
        // eslint-disable-next-line testing-library/no-node-access
        const ul = (folderNode.element as HTMLElement).querySelector(":scope > ul") as HTMLElement;
        ul.style.display = "none";
    }

    const triggerEvent = vi.fn();

    const folderElement = new FolderElement({
        closedIconElement,
        getScrollLeft: () => 0,
        node: folderNode,
        openedIconElement,
        treeElement,
        triggerEvent,
    });

    return { folderElement, folderNode, triggerEvent };
};

describe("close", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("closes an open node without animation", () => {
        const { folderElement, folderNode } = createFolderElement({
            isOpen: true,
        });
        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toBeAriaExpanded();

        folderElement.close(false, 0);

        expect(folderNode.is_open).toBeFalse();
        expect(treeItem).not.toBeAriaExpanded();
        expect(getTreeButton(treeItem)).toHaveClass("jqtree-closed");

        const treeListElement = getTreeListElement(treeItem);

        // eslint-disable-next-line testing-library/no-node-access
        expect(treeListElement.querySelector("ul")).not.toBeVisible();

        // eslint-disable-next-line vitest/max-expects
        expect(treeItem).toHaveAttribute("aria-expanded", "false");
    });

    it("triggers the tree.close event", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement(
            {
                isOpen: true,
            },
        );

        folderElement.close(false, 0);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.close", {
            node: folderNode,
        });
    });

    it("does nothing when the node is already closed", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement(
            {
                isOpen: false,
            },
        );

        folderElement.close(false, 0);

        expect(folderNode.is_open).toBeFalse();
        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("renders the closed icon in the button", () => {
        const closedIconElement = document.createElement("span");
        closedIconElement.classList.add("closed-icon");

        const { folderElement } = createFolderElement({
            closedIconElement,
            isOpen: true,
        });
        folderElement.close(false, 0);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        const button = getTreeButton(treeItem)

        expect(button.children[0]).toHaveClass("closed-icon");
        expect(button.children[0]).not.toBe(closedIconElement);
    });

    it("closes the node with animation", async () => {
        const { folderElement } = createFolderElement({
            isOpen: true,
        });
        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        // eslint-disable-next-line testing-library/no-node-access
        const ul = getTreeListElement(treeItem).querySelector(":scope > ul[role=group]") as HTMLElement;
        const animate = vi.spyOn(ul, "animate");

        folderElement.close(true, 123);

        expect(animate).toHaveBeenCalledExactlyOnceWith(expect.any(Array), {
            duration: 123,
        });

        await ul.getAnimations()[0]?.finished;

        expect(treeItem).not.toBeAriaExpanded();
        expect(ul).not.toBeVisible();
    });
});

describe("open", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("opens a closed node without animation", () => {
        const { folderElement, folderNode } = createFolderElement({
            isOpen: false,
        });
        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toBeAriaExpanded();

        folderElement.open(undefined, false, 0);

        expect(folderNode.is_open).toBeTrue();
        expect(treeItem).toBeAriaExpanded();

        const button = getTreeButton(treeItem);

        expect(button).not.toHaveClass("jqtree-closed");

        // eslint-disable-next-line testing-library/no-node-access
        const ul = getTreeListElement(treeItem).querySelector(":scope > ul[role=group]") as HTMLElement;

        expect(ul).toBeVisible();
        // eslint-disable-next-line vitest/max-expects
        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("triggers the tree.open event", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement(
            {
                isOpen: false,
            },
        );

        folderElement.open(undefined, false, 0);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.open", {
            node: folderNode,
        });
    });

    it("does nothing when the node is already open", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement(
            {
                isOpen: true,
            },
        );

        folderElement.open(undefined, false, 0);

        expect(folderNode.is_open).toBeTrue();
        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("calls onFinished with the node", () => {
        const { folderElement, folderNode } = createFolderElement({
            isOpen: false,
        });

        const onFinished = vi.fn();
        folderElement.open(onFinished, false, 0);

        expect(onFinished).toHaveBeenCalledExactlyOnceWith(folderNode);
    });

    it("renders the opened icon in the button", () => {
        const openedIconElement = document.createElement("span");
        openedIconElement.classList.add("opened-icon");

        const { folderElement } = createFolderElement({
            isOpen: false,
            openedIconElement,
        });

        folderElement.open(undefined, false, 0);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });
        const button = getTreeButton(treeItem);

        // eslint-disable-next-line testing-library/no-node-access
        expect(button.children).toHaveLength(1);
        expect(button.children[0]).toHaveClass("opened-icon");
        expect(button.children[0]).not.toBe(openedIconElement);
    });

    it("opens the node with animation", async () => {
        const { folderElement } = createFolderElement({
            isOpen: false,
        });
        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        // eslint-disable-next-line testing-library/no-node-access
        const ul = getTreeListElement(treeItem).querySelector(":scope > ul[role=group]") as HTMLElement;
        const animate = vi.spyOn(ul, "animate");

        folderElement.open(undefined, true, 456);

        expect(animate).toHaveBeenCalledExactlyOnceWith(expect.any(Array), {
            duration: 456,
        });
        expect(ul).toBeVisible();

        await ul.getAnimations()[0]?.finished;

        expect(treeItem).toBeAriaExpanded();
    });
});

describe("addDropHint", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("returns a border drop hint for a closed node and position inside", () => {
        const { folderElement } = createFolderElement({ isOpen: false });

        expect(folderElement.addDropHint("inside")).toBeInstanceOf(
            BorderDropHint,
        );
    });

    it("returns a ghost drop hint for an open node and position inside", () => {
        const { folderElement } = createFolderElement({ isOpen: true });

        expect(folderElement.addDropHint("inside")).toBeInstanceOf(
            GhostDropHint,
        );
    });

    it("returns a ghost drop hint for a closed node and position after", () => {
        const { folderElement } = createFolderElement({ isOpen: false });

        expect(folderElement.addDropHint("after")).toBeInstanceOf(
            GhostDropHint,
        );
    });
});
