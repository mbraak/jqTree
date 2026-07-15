import type { TriggerEventProvider } from "app/htmlTree";
import type { JQTreeOptions } from "app/jqtreeOptions";

import HtmlTree from "app/htmlTree";
import { Node } from "app/node";

const createHtmlTree = (
    options: Partial<JQTreeOptions> = {},
    overrideTriggerEvent?: TriggerEventProvider,
) => {
    const htmlElement = document.createElement("div");
    document.body.append(htmlElement);

    return new HtmlTree(htmlElement, options, overrideTriggerEvent);
};

describe("HtmlTree", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("constructor", () => {
        it("stores the html element and options", () => {
            const htmlElement = document.createElement("div");

            const htmlTree = new HtmlTree(htmlElement, { tabIndex: 5 });

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

        it("creates a select node handler that resolves nodes from the tree", () => {
            const htmlTree = createHtmlTree();

            const node = new Node({ id: 123, name: "node1" });
            htmlTree.tree.addChild(node);
            htmlTree.selectNodeHandler.addToSelection(node);

            expect(htmlTree.selectNodeHandler.getSelectedNode()).toBe(node);
        });

        it("sets the default options", () => {
            const htmlTree = createHtmlTree({});

            expect(htmlTree.options).toMatchObject({
                autoEscape: true,
                closedIcon: "&#x25ba;",
                nodeClass: Node,
                rtl: false,
                tabIndex: 0,
            });
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

    describe("getNodeById", () => {
        it("returns the node with the id", () => {
            const htmlTree = createHtmlTree();

            const node = new Node({ id: 123, name: "node1" });
            htmlTree.tree.addChild(node);

            expect(htmlTree.getNodeById(123)).toBe(node);
        });

        it("returns null when there is no node with the id", () => {
            const htmlTree = createHtmlTree();

            expect(htmlTree.getNodeById(123)).toBeNull();
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
