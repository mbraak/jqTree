import type { TriggerEventProvider } from "app/htmlTree";
import type { HtmlTreeOptions } from "app/htmlTree/options";

import HtmlTree from "app/htmlTree";
import { Node } from "app/node";
import version from "app/version";

interface CreateHtmlTreeParams {
    options?: Partial<HtmlTreeOptions>;
    overrideTriggerEvent?: TriggerEventProvider;
}

const createHtmlTree = ({
    options = {},
    overrideTriggerEvent,
}: CreateHtmlTreeParams = {}) => {
    const htmlElement = document.createElement("div");
    document.body.append(htmlElement);

    const htmlTree = new HtmlTree({
        htmlElement,
        options,
        overrideTriggerEventProvider: overrideTriggerEvent,
    });

    return { htmlElement, htmlTree };
};

describe("HtmlTree", () => {
    describe("constructor", () => {
        it("creates a root node", () => {
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.tree).toBeInstanceOf(Node);
            expect(htmlTree.tree.tree).toBe(htmlTree.tree);
        });
    });

    describe("addNodeAfter", () => {
        it("adds a node after the existing node and returns it", () => {
            const { htmlTree } = createHtmlTree();

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
    });

    describe("addNodeBefore", () => {
        it("adds a node before the existing node and returns it", () => {
            const { htmlTree } = createHtmlTree();

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
    });

    describe("addParentNode", () => {
        it("adds a parent above the existing node and returns it", () => {
            const { htmlTree } = createHtmlTree();

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

        it("returns null when the existing node has no parent", () => {
            const { htmlTree } = createHtmlTree();

            const newNode = htmlTree.addParentNode(
                { name: "new-parent" },
                htmlTree.tree,
            );

            expect(newNode).toBeNull();
        });
    });

    describe("appendNode", () => {
        it("appends a node to the parent node and returns it", () => {
            const { htmlTree } = createHtmlTree();

            const parentNode = new Node({ id: 1, name: "parent" });
            htmlTree.tree.addChild(parentNode);
            parentNode.append("child1");

            const node = htmlTree.appendNode({ name: "new-node" }, parentNode);

            expect(node).toBeInstanceOf(Node);
            expect(parentNode).toMatchObject({
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "new-node" }),
                ],
            });
        });
    });

    describe("deselectNodes", () => {
        it("deselects selected nodes under the parent node", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.loadData(
                [
                    {
                        children: [
                            { id: 2, name: "child1" },
                            { id: 3, name: "child2" },
                        ],
                        id: 1,
                        name: "node1",
                    }
                ],
            )
            const parentNode = htmlTree.tree.children[0] as Node;
            htmlTree.addToSelection(
                parentNode.children[0] as Node,
            );
            htmlTree.addToSelection(
                parentNode.children[1] as Node,
            );

            htmlTree.deselectNodes(parentNode);

            expect(htmlTree.getSelectedNodes()).toHaveLength(
                0,
            );
        });

        it("keeps the selection of nodes outside the parent node", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.loadData(
                [
                    {
                        children: [{ id: 2, name: "child1" }],
                        id: 1,
                        name: "node1",
                    },
                    { id: 3, name: "node2" },
                ]
            );
            const parentNode = htmlTree.tree.children[0] as Node;
            const otherNode = htmlTree.tree.children[1] as Node;
            htmlTree.addToSelection(
                parentNode.children[0] as Node,
            );
            htmlTree.addToSelection(otherNode);

            htmlTree.deselectNodes(parentNode);

            expect(htmlTree.getSelectedNodes()).toStrictEqual(
                [otherNode],
            );
        });
    });

    describe("getNode", () => {
        it("returns the node for the closest jqtree li element", () => {
            const { htmlTree } = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");
            const spanElement = document.createElement("span");
            liElement.append(spanElement);

            const node = new Node();
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.getNode(spanElement)).toBe(node);
        });

        it("returns null when there is no jqtree li element", () => {
            const { htmlTree } = createHtmlTree();
            const element = document.createElement("span");

            expect(htmlTree.getNode(element)).toBeNull();
        });

        it("returns null when the li element is not in the node map", () => {
            const { htmlTree } = createHtmlTree();
            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            expect(htmlTree.getNode(liElement)).toBeNull();
        });
    });

    describe("getNodeById", () => {
        it("returns the node with the id", () => {
            const { htmlTree } = createHtmlTree();

            const node = new Node({ id: 123, name: "node1" });
            htmlTree.tree.addChild(node);

            expect(htmlTree.getNodeById(123)).toBe(node);
        });

        it("returns null when there is no node with the id", () => {
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.getNodeById(123)).toBeNull();
        });
    });

    describe("getSelectedNode", () => {
        it("returns the selected node", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.loadData([
                { id: 123, name: "node1" }
            ]);
            const node = htmlTree.getNodeByName("node1") as Node;
            htmlTree.addToSelection(node);

            expect(htmlTree.getSelectedNode()).toBe(node);
        });

        it("returns false when no node is selected", () => {
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.getSelectedNode()).toBeFalse();
        });
    });

    describe("getVersion", () => {
        it("returns the version", () => {
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.getVersion()).toBe(version);
        });
    });

    describe("containsElement", () => {
        it("returns true when the element belongs to the tree", () => {
            const { htmlTree } = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            const node = new Node();
            htmlTree.tree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.containsElement(liElement)).toBeTrue();
        });

        it("returns false when the element belongs to another tree", () => {
            const { htmlTree } = createHtmlTree();

            const liElement = document.createElement("li");
            liElement.classList.add("jqtree_common");

            const otherTree = new Node({}, true);
            const node = new Node();
            otherTree.addChild(node);
            htmlTree.setNodeElement(liElement, node);

            expect(htmlTree.containsElement(liElement)).toBeFalse();
        });

        it("returns false when the element is not part of any tree", () => {
            const { htmlTree } = createHtmlTree();
            const element = document.createElement("span");

            expect(htmlTree.containsElement(element)).toBeFalse();
        });
    });

    describe("isFocusOnTree", () => {
        it("returns true when a span of the tree has the focus", () => {
            const { htmlTree } = createHtmlTree();

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
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.isFocusOnTree()).toBeFalse();
        });

        it("returns false when the focused element is not a span", () => {
            const { htmlTree } = createHtmlTree();

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
            const { htmlTree } = createHtmlTree();

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
    });

    describe("prependNode", () => {
        it("prepends a node to the parent node and returns it", () => {
            const { htmlTree } = createHtmlTree();

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
    });

    describe("removeNode", () => {
        it("removes the node and its children from the tree", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.tree.loadFromData([
                {
                    children: [{ id: 2, name: "child1" }],
                    id: 1,
                    name: "node1",
                },
                { id: 3, name: "node2" },
            ]);
            const node = htmlTree.tree.children[0] as Node;

            htmlTree.removeNode(node);

            expect(htmlTree.tree).toMatchObject({
                children: [expect.objectContaining({ name: "node2" })],
            });
            expect(htmlTree.getNodeById(1)).toBeNull();
            expect(htmlTree.getNodeById(2)).toBeNull();
        });

        it("removes the node from the selection", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.loadData([{ id: 1, name: "node1" }]);
            const node = htmlTree.tree.children[0] as Node;
            htmlTree.addToSelection(node);

            htmlTree.removeNode(node);

            expect(htmlTree.isNodeSelected(node)).toBeFalse();
        });

        it("removes selected children of the node from the selection", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.loadData([
                {
                    children: [{ id: 2, name: "child1" }],
                    id: 1,
                    name: "node1",
                },
            ]);
            const node = htmlTree.tree.children[0] as Node;
            const childNode = node.children[0] as Node;
            htmlTree.addToSelection(childNode);

            htmlTree.removeNode(node);

            expect(htmlTree.getSelectedNodes()).toHaveLength(
                0,
            );
        });
    });

    describe("toJson", () => {
        it("returns the tree as a json string", () => {
            const { htmlTree } = createHtmlTree();

            htmlTree.tree.loadFromData([
                {
                    children: [{ id: 2, name: "child1" }],
                    id: 1,
                    name: "node1",
                },
                { id: 3, name: "node2" },
            ]);

            expect(htmlTree.toJson()).toBe(
                '[{"id":1,"name":"node1","children":[{"id":2,"name":"child1"}]},{"id":3,"name":"node2"}]',
            );
        });

        it("returns an empty array for an empty tree", () => {
            const { htmlTree } = createHtmlTree();

            expect(htmlTree.toJson()).toBe("[]");
        });
    });

    describe("triggerEvent", () => {
        it("dispatches a custom event on the html element by default", () => {
            const { htmlElement, htmlTree } = createHtmlTree();
            const listener = vi.fn();
            htmlElement.addEventListener("tree.test", listener);

            const result = htmlTree.triggerEvent("tree.test", { a: 1 });

            expect(listener).toHaveBeenCalledOnce(); // eslint-disable-line vitest/prefer-called-with
            expect(result).toBeTrue();
        });

        it("uses the override trigger event when provided", () => {
            const overrideTriggerEvent = vi.fn().mockReturnValue(false);
            const { htmlElement, htmlTree } = createHtmlTree({ overrideTriggerEvent });

            const result = htmlTree.triggerEvent("tree.test", { a: 1 });

            expect(overrideTriggerEvent).toHaveBeenCalledWith(
                htmlElement,
                "tree.test",
                { a: 1 },
            );
            expect(result).toBeFalse();
        });
    });

    describe("updateNode", () => {
        it("updates the data of the node", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.tree.loadFromData([{ id: 1, name: "node1" }]);
            const node = htmlTree.tree.children[0] as Node;

            htmlTree.updateNode(node, { color: "green", name: "new-name" });

            expect(node.name).toBe("new-name");
            expect(node.color).toBe("green");
        });

        it("updates the id index when the id is changed", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.tree.loadFromData([{ id: 1, name: "node1" }]);
            const node = htmlTree.tree.children[0] as Node;

            htmlTree.updateNode(node, { id: 2, name: "node1" });

            expect(node.id).toBe(2);
            expect(htmlTree.getNodeById(2)).toBe(node);
            expect(htmlTree.getNodeById(1)).toBeNull();
        });

        it("replaces the children when the data contains children", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.tree.loadFromData([
                {
                    children: [{ id: 2, name: "old-child" }],
                    id: 1,
                    name: "node1",
                },
            ]);
            const node = htmlTree.tree.children[0] as Node;

            htmlTree.updateNode(node, {
                children: [{ id: 3, name: "new-child" }],
                name: "node1",
            });

            expect(node.children).toStrictEqual([
                expect.objectContaining({ id: 3, name: "new-child" }),
            ]);
        });

        it("removes the children when the data contains an empty children array", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.tree.loadFromData([
                {
                    children: [{ id: 2, name: "child1" }],
                    id: 1,
                    name: "node1",
                },
            ]);
            const node = htmlTree.tree.children[0] as Node;

            htmlTree.updateNode(node, { children: [], name: "node1" });

            expect(node.children).toHaveLength(0);
        });
    });

    describe("getAutoOpenMaxLevel", () => {
        it("returns -1 when the autoOpen option is true", () => {
            const { htmlTree } = createHtmlTree({ options: { autoOpen: true } });

            expect(htmlTree.getAutoOpenMaxLevel()).toBe(-1);
        });

        it("returns the autoOpen option when it is a number", () => {
            const { htmlTree } = createHtmlTree({ options: { autoOpen: 2 } });

            expect(htmlTree.getAutoOpenMaxLevel()).toBe(2);
        });

        it("parses the autoOpen option when it is a string", () => {
            const { htmlTree } = createHtmlTree();
            htmlTree.setOption("autoOpen", "3");

            expect(htmlTree.getAutoOpenMaxLevel()).toBe(3);
        });

        it("returns 0 when the autoOpen option is false", () => {
            const { htmlTree } = createHtmlTree({ options: { autoOpen: false } });

            expect(htmlTree.getAutoOpenMaxLevel()).toBe(0);
        });
    });
});
