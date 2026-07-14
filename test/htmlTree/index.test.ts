import type { TriggerEvent } from "app/jqtreeMethodTypes";
import type { JQTreeOptions } from "app/jqtreeOptions";

import HtmlTree from "app/htmlTree";
import { Node } from "app/node";

const defaultOptions: JQTreeOptions = {
    animationSpeed: "fast",
    autoEscape: true,
    autoOpen: false,
    buttonLeft: true,
    dragAndDrop: false,
    keyboardSupport: true,
    nodeClass: Node,
    openedIcon: "&#x25bc;",
    openFolderDelay: 500,
    saveState: false,
    selectable: true,
    showEmptyFolder: false,
    slide: true,
    startDndDelay: 300,
    tabIndex: 0,
    useContextMenu: true,
};

const createHtmlTree = (
    inputOptions: Partial<JQTreeOptions> = {},
    overrideTriggerEvent?: TriggerEvent,
) => {
    const htmlElement = document.createElement("div");
    document.body.append(htmlElement);

    const options = { ...defaultOptions, ...inputOptions };

    return new HtmlTree(htmlElement, options, overrideTriggerEvent);
};

describe("HtmlTree", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("constructor", () => {
        it("stores the html element and options", () => {
            const htmlElement = document.createElement("div");

            const htmlTree = new HtmlTree(htmlElement, { ...defaultOptions, tabIndex: 5 });

            expect(htmlTree.htmlElement).toBe(htmlElement);
            expect(htmlTree.options.tabIndex).toBe(5);
        });

        it("is not initialized", () => {
            expect(createHtmlTree().isInitialized).toBeFalse();
        });

        it("creates a root node", () => {
            const htmlTree = createHtmlTree();

            expect(htmlTree.tree).toBeInstanceOf(Node);
            expect(htmlTree.tree.tree).toBe(htmlTree.tree);
        });

        it("sets the default options", () => {
            const htmlTree = createHtmlTree({});

            expect(htmlTree.options.closedIcon).toBe("&#x25ba;");
            expect(htmlTree.options.rtl).toBeFalse();
        });
    });

    describe("setNodeElement", () => {
        it("maps the element to the node", () => {
            const htmlTree = createHtmlTree();
            const element = document.createElement("li");
            const node = new Node();

            htmlTree.setNodeElement(element, node);

            expect(htmlTree.nodeMap.get(element)).toBe(node);
        });
    });

    describe("getNode", () => {
        it("returns the node for the closest jqtree li element", () => {
            const htmlTree = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");
            const spanElement = document.createElement("span");
            liElement.append(spanElement);

            const node = new Node();
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.getNode(spanElement)).toBe(node);
        });

        it("returns null when there is no jqtree li element", () => {
            const htmlTree = createHtmlTree();
            const element = document.createElement("span");

            expect(htmlTree.getNode(element)).toBeNull();
        });

        it("returns null when the li element is not in the node map", () => {
            const htmlTree = createHtmlTree();
            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            expect(htmlTree.getNode(liElement)).toBeNull();
        });
    });

    describe("containsElement", () => {
        it("returns true when the element belongs to the tree", () => {
            const htmlTree = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            const node = new Node();
            htmlTree.tree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.containsElement(liElement)).toBeTrue();
        });

        it("returns false when the element belongs to another tree", () => {
            const htmlTree = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            const otherTree = new Node({}, true);
            const node = new Node();
            otherTree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.containsElement(liElement)).toBeFalse();
        });

        it("returns false when the element is not part of any tree", () => {
            const htmlTree = createHtmlTree();
            const element = document.createElement("span");

            expect(htmlTree.containsElement(element)).toBeFalse();
        });
    });

    describe("isFocusOnTree", () => {
        it("returns true when a span of the tree has the focus", () => {
            const htmlTree = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");
            const spanElement = document.createElement("span");
            spanElement.tabIndex = 0;
            liElement.append(spanElement);
            document.body.append(liElement);

            const node = new Node();
            htmlTree.tree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            spanElement.focus();

            expect(htmlTree.isFocusOnTree()).toBeTrue();
        });

        it("returns false when nothing of the tree has the focus", () => {
            const htmlTree = createHtmlTree();

            expect(htmlTree.isFocusOnTree()).toBeFalse();
        });

        it("returns false when the focused element is not a span", () => {
            const htmlTree = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");
            liElement.tabIndex = 0;
            document.body.append(liElement);

            const node = new Node();
            htmlTree.tree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            liElement.focus();

            expect(htmlTree.isFocusOnTree()).toBeFalse();
        });
    });

    describe("triggerEvent", () => {
        it("dispatches a custom event on the html element by default", () => {
            const htmlTree = createHtmlTree();
            const listener = vi.fn();
            htmlTree.htmlElement.addEventListener("tree.test", listener);

            const result = htmlTree.triggerEvent("tree.test", { a: 1 });

            expect(listener).toHaveBeenCalledOnce(); // eslint-disable-line vitest/prefer-called-with
            expect(result).toBeTrue();
        });

        it("uses the override trigger event when provided", () => {
            const overrideTriggerEvent = vi.fn().mockReturnValue(false);
            const htmlTree = createHtmlTree({}, overrideTriggerEvent);

            const result = htmlTree.triggerEvent("tree.test", { a: 1 });

            expect(overrideTriggerEvent).toHaveBeenCalledWith(
                htmlTree.htmlElement,
                "tree.test",
                { a: 1 },
            );
            expect(result).toBeFalse();
        });
    });
});
