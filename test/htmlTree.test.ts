import type { TriggerEventProvider } from "app/htmlTree";
import type { JQTreeOptions } from "app/jqtreeOptions";

import HtmlTree from "app/htmlTree";
import { Node } from "app/node";

interface CreateHtmlTreeParams {
    getNodeIdToBeSelected?: () => NodeId | null;
    options?: Partial<JQTreeOptions>;
    overrideTriggerEvent?: TriggerEventProvider;
    refreshElements?: (fromNode: Node | null) => void;
}

const createHtmlTree = ({
    getNodeIdToBeSelected = () => null,
    options = {},
    overrideTriggerEvent,
    refreshElements = () => null,
}: CreateHtmlTreeParams = {}) => {
    const htmlElement = document.createElement("div");
    document.body.append(htmlElement);

    return new HtmlTree({
        getNodeIdToBeSelected,
        htmlElement,
        options,
        overrideTriggerEventProvider: overrideTriggerEvent,
        refreshElements,
    });
};

describe("HtmlTree", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("constructor", () => {
        it("stores the html element and options", () => {
            const htmlElement = document.createElement("div");
            const getNodeIdToBeSelected = vi.fn();

            const htmlTree = new HtmlTree({
                getNodeIdToBeSelected,
                htmlElement,
                options: { tabIndex: 5 },
                refreshElements: vi.fn(),
            });

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

    describe("addNodeAfter", () => {
        it("adds a node after the existing node and returns it", () => {
            const htmlTree = createHtmlTree();

            const node1 = new Node({ id: 1, name: "node1" });
            const node2 = new Node({ id: 2, name: "node2" });
            htmlTree.tree.addChild(node1);
            htmlTree.tree.addChild(node2);

            const newNode = htmlTree.addNodeAfter({ name: "new-node" }, node1);

            expect(newNode).toBeInstanceOf(Node);
            expect(htmlTree.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "new-node" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });

        it("calls refreshElements with the parent of the existing node", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const node = new Node({ id: 1, name: "node1" });
            htmlTree.tree.addChild(node);

            htmlTree.addNodeAfter({ name: "new-node" }, node);

            expect(refreshElements).toHaveBeenCalledWith(htmlTree.tree);
        });

        it("returns null when the existing node has no parent", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const newNode = htmlTree.addNodeAfter(
                { name: "new-node" },
                htmlTree.tree,
            );

            expect(newNode).toBeNull();
            expect(refreshElements).not.toHaveBeenCalled();
        });
    });

    describe("addNodeBefore", () => {
        it("adds a node before the existing node and returns it", () => {
            const htmlTree = createHtmlTree();

            const node1 = new Node({ id: 1, name: "node1" });
            const node2 = new Node({ id: 2, name: "node2" });
            htmlTree.tree.addChild(node1);
            htmlTree.tree.addChild(node2);

            const newNode = htmlTree.addNodeBefore({ name: "new-node" }, node2);

            expect(newNode).toBeInstanceOf(Node);
            expect(htmlTree.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "new-node" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });

        it("calls refreshElements with the parent of the existing node", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const node = new Node({ id: 1, name: "node1" });
            htmlTree.tree.addChild(node);

            htmlTree.addNodeBefore({ name: "new-node" }, node);

            expect(refreshElements).toHaveBeenCalledWith(htmlTree.tree);
        });

        it("returns null when the existing node has no parent", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const newNode = htmlTree.addNodeBefore(
                { name: "new-node" },
                htmlTree.tree,
            );

            expect(newNode).toBeNull();
            expect(refreshElements).not.toHaveBeenCalled();
        });
    });

    describe("addParentNode", () => {
        it("adds a parent above the existing node and returns it", () => {
            const htmlTree = createHtmlTree();

            const node = new Node({ id: 1, name: "node1" });
            htmlTree.tree.addChild(node);

            const newNode = htmlTree.addParentNode(
                { name: "new-parent" },
                node,
            );

            expect(newNode).toBeInstanceOf(Node);
            expect(htmlTree.tree).toMatchObject({
                children: [
                    expect.objectContaining({
                        children: [expect.objectContaining({ name: "node1" })],
                        name: "new-parent",
                    }),
                ],
            });
        });

        it("calls refreshElements with the parent of the new node", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const node = new Node({ id: 1, name: "node1" });
            htmlTree.tree.addChild(node);

            htmlTree.addParentNode({ name: "new-parent" }, node);

            expect(refreshElements).toHaveBeenCalledWith(htmlTree.tree);
        });

        it("returns null when the existing node has no parent", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const newNode = htmlTree.addParentNode(
                { name: "new-parent" },
                htmlTree.tree,
            );

            expect(newNode).toBeNull();
            expect(refreshElements).not.toHaveBeenCalled();
        });
    });

    describe("createRequestUrl", () => {
        it("returns null when there is no data url", () => {
            const htmlTree = createHtmlTree();

            expect(htmlTree.createRequestUrl(null)).toBeNull();
        });

        it("creates a url based on the dataUrl option", () => {
            const htmlTree = createHtmlTree({
                options: { dataUrl: "/tree/" },
            });

            expect(htmlTree.createRequestUrl(null)?.toString()).toBe("/tree/");
        });

        it("creates a url based on the data-url attribute of the html element", () => {
            const htmlTree = createHtmlTree();
            htmlTree.htmlElement.dataset.url = "/tree/";

            expect(htmlTree.createRequestUrl(null)?.toString()).toBe("/tree/");
        });

        it("calls the dataUrl option when it is a function", () => {
            const dataUrl = vi.fn().mockReturnValue("/tree/");
            const htmlTree = createHtmlTree({ options: { dataUrl } });

            expect(htmlTree.createRequestUrl(null)?.toString()).toBe("/tree/");
            expect(dataUrl).toHaveBeenCalledWith(null);
        });

        it("returns null when the dataUrl function doesn't return a url", () => {
            const dataUrl = vi.fn().mockReturnValue("");
            const htmlTree = createHtmlTree({ options: { dataUrl } });

            expect(htmlTree.createRequestUrl(null)).toBeNull();
        });

        it("adds a node parameter when a node is loaded on demand", () => {
            const htmlTree = createHtmlTree({
                options: { dataUrl: "/tree/" },
            });
            const node = new Node({ id: 123, name: "node1" });

            expect(htmlTree.createRequestUrl(node)?.toString()).toBe(
                "/tree/?node=123",
            );
        });

        it("adds a selected_node parameter when a node must be selected", () => {
            const htmlTree = createHtmlTree({
                getNodeIdToBeSelected: () => 123,
                options: { dataUrl: "/tree/" },
            });

            expect(htmlTree.createRequestUrl(null)?.toString()).toBe(
                "/tree/?selected_node=123",
            );
        });

        it("doesn't add a selected_node parameter when loading on demand", () => {
            const htmlTree = createHtmlTree({
                getNodeIdToBeSelected: () => 123,
                options: { dataUrl: "/tree/" },
            });
            const node = new Node({ id: 456, name: "node1" });

            expect(htmlTree.createRequestUrl(node)?.toString()).toBe(
                "/tree/?node=456",
            );
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

    describe("moveNode", () => {
        it("moves the node relative to the target node", () => {
            const htmlTree = createHtmlTree();

            const node1 = new Node({ id: 1, name: "node1" });
            const node2 = new Node({ id: 2, name: "node2" });
            htmlTree.tree.addChild(node1);
            htmlTree.tree.addChild(node2);

            htmlTree.moveNode(node1, node2, "inside");

            expect(htmlTree.tree).toMatchObject({
                children: [
                    expect.objectContaining({
                        children: [expect.objectContaining({ name: "node1" })],
                        name: "node2",
                    }),
                ],
            });
        });

        it("calls refreshElements", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const node1 = new Node({ id: 1, name: "node1" });
            const node2 = new Node({ id: 2, name: "node2" });
            htmlTree.tree.addChild(node1);
            htmlTree.tree.addChild(node2);

            htmlTree.moveNode(node1, node2, "after");

            expect(refreshElements).toHaveBeenCalledWith(null);
        });
    });

    describe("prependNode", () => {
        it("prepends a node to the parent node and returns it", () => {
            const htmlTree = createHtmlTree();

            const parentNode = new Node({ id: 1, name: "parent" });
            htmlTree.tree.addChild(parentNode);
            parentNode.append("child1");

            const node = htmlTree.prependNode({ name: "new-node" }, parentNode);

            expect(node).toBeInstanceOf(Node);
            expect(parentNode).toMatchObject({
                children: [
                    expect.objectContaining({ name: "new-node" }),
                    expect.objectContaining({ name: "child1" }),
                ],
            });
        });

        it("calls refreshElements with the parent node", () => {
            const refreshElements = vi.fn();
            const htmlTree = createHtmlTree({ refreshElements });

            const parentNode = new Node({ id: 1, name: "parent" });
            htmlTree.tree.addChild(parentNode);

            htmlTree.prependNode({ name: "new-node" }, parentNode);

            expect(refreshElements).toHaveBeenCalledWith(parentNode);
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
            const htmlTree = createHtmlTree({ overrideTriggerEvent });

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
