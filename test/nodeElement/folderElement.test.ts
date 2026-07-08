import { vi } from "vitest";

import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";
import BorderDropHint from "app/nodeElement/borderDropHint";
import FolderElement from "app/nodeElement/folderElement";
import GhostDropHint from "app/nodeElement/ghostDropHint";

import { togglerLink } from "../support/testUtil";

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
        $element: jQuery(treeElement),
        autoEscape: true,
        buttonLeft: false,
        dragAndDrop: false,
        getTree: () => tree,
        isNodeSelected: () => false,
        showEmptyFolder: false,
    });
    renderer.renderFromRoot();

    const triggerEvent = vi.fn();

    const folderElement = new FolderElement({
        closedIconElement,
        getScrollLeft: () => 0,
        node: folderNode,
        openedIconElement,
        treeElement,
        triggerEvent,
    });

    const element = folderNode.element as HTMLElement;

    return { element, folderElement, folderNode, treeElement, triggerEvent };
};

const getButton = (element: HTMLElement) => togglerLink(element);

const getUl = (element: HTMLElement) =>
    element.querySelector(":scope > ul") as HTMLUListElement;

const getTitleSpan = (element: HTMLElement) =>
    element.querySelector(
        ":scope > .jqtree-element > span.jqtree-title",
    ) as HTMLSpanElement;

describe("close", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("closes an open node without animation", () => {
        const { element, folderElement, folderNode } = createFolderElement({
            isOpen: true,
        });

        folderElement.close(false, 0);

        const collapsed = "false";

        expect(folderNode.is_open).toBeFalse();
        expect(element).toBeClosedTreeNode();
        expect(getButton(element)).toHaveClass("jqtree-closed");
        expect(getUl(element)).not.toBeVisible();
        expect(getTitleSpan(element)).toHaveAttribute("aria-expanded", collapsed);
    });

    it("triggers the tree.close event", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement({
            isOpen: true,
        });

        folderElement.close(false, 0);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.close", {
            node: folderNode,
        });
    });

    it("does nothing when the node is already closed", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement({
            isOpen: false,
        });

        folderElement.close(false, 0);

        expect(folderNode.is_open).toBeFalse();
        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("renders the closed icon in the button", () => {
        const closedIconElement = document.createElement("span");
        closedIconElement.classList.add("closed-icon");

        const { element, folderElement } = createFolderElement({
            closedIconElement,
            isOpen: true,
        });

        folderElement.close(false, 0);
        const button = getButton(element);

        expect(button.children).toHaveLength(1);
        expect(button.children[0]).toHaveClass("closed-icon");
        expect(button.children[0]).not.toBe(closedIconElement);
    });

    it("closes the node with animation", () => {
        const slideUp = vi
            .spyOn(jQuery.fn, "slideUp")
            .mockImplementation(function (this: JQuery, ...callArgs: unknown[]) {
                (callArgs[1] as () => void)();
                return this;
            });

        const { element, folderElement } = createFolderElement({ isOpen: true });

        folderElement.close(true, 123);

        expect(slideUp).toHaveBeenCalledExactlyOnceWith(123, expect.any(Function));
        expect(element).toBeClosedTreeNode();

        slideUp.mockRestore();
    });
});

describe("open", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("opens a closed node without animation", () => {
        const { element, folderElement, folderNode } = createFolderElement({
            isOpen: false,
        });

        folderElement.open(undefined, false, 0);

        const expanded = "true";

        expect(folderNode.is_open).toBeTrue();
        expect(element).toBeOpenTreeNode();
        expect(getButton(element)).not.toHaveClass("jqtree-closed");
        expect(getUl(element)).toBeVisible();
        expect(getTitleSpan(element)).toHaveAttribute("aria-expanded", expanded);
    });

    it("triggers the tree.open event", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement({
            isOpen: false,
        });

        folderElement.open(undefined, false, 0);

        expect(triggerEvent).toHaveBeenCalledExactlyOnceWith("tree.open", {
            node: folderNode,
        });
    });

    it("does nothing when the node is already open", () => {
        const { folderElement, folderNode, triggerEvent } = createFolderElement({
            isOpen: true,
        });

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

        const { element, folderElement } = createFolderElement({
            isOpen: false,
            openedIconElement,
        });

        folderElement.open(undefined, false, 0);
        const button = getButton(element);

        expect(button.children).toHaveLength(1);
        expect(button.children[0]).toHaveClass("opened-icon");
        expect(button.children[0]).not.toBe(openedIconElement);
    });

    it("opens the node with animation", () => {
        const slideDown = vi
            .spyOn(jQuery.fn, "slideDown")
            .mockImplementation(function (this: JQuery, ...callArgs: unknown[]) {
                (callArgs[1] as () => void)();
                return this;
            });

        const { element, folderElement } = createFolderElement({
            isOpen: false,
        });

        folderElement.open(undefined, true, 456);

        expect(slideDown).toHaveBeenCalledExactlyOnceWith(
            456,
            expect.any(Function),
        );
        expect(element).toBeOpenTreeNode();

        slideDown.mockRestore();
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

        expect(folderElement.addDropHint("after")).toBeInstanceOf(GhostDropHint);
    });
});
