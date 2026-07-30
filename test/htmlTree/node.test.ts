import "jest-extended";

import { Node } from "htmlTree/node";

import exampleData from "../support/exampleData";

describe("addAfter", () => {
    it("returns the new node when moving after node1", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");

        expect(node1.addAfter("new node")).toMatchObject({
            name: "new node",
        });
    });

    it("adds after the node when moving after node1", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");

        node1.addAfter("new node");

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "new node" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });

    it("returns null when moving after the root node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.addAfter("new node")).toBeNull();
    });

    it("doesn't add anything when moving after the root node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });

    it("adds the children when adding a node with children", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");

        node1.addAfter({
            children: ["newchild1", "newchild2"],
            name: "new node",
        });

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "newchild1" }),
                        expect.objectContaining({ name: "newchild2" }),
                    ],
                    name: "new node",
                }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("addBefore", () => {
    it("returns the new node", () => {
        const tree = new Node().loadFromData(exampleData);
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.addBefore("new node")).toMatchObject({
            name: "new node",
        });
    });

    it("adds before the node", () => {
        const tree = new Node().loadFromData(exampleData);
        const node2 = tree.getNodeByNameMustExist("node2");

        node2.addBefore("new node");

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "new node" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });

    it("returns null with a root node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.addBefore("new node")).toBeNull();
    });

    it("does nothing with a root node", () => {
        const tree = new Node().loadFromData(exampleData);

        tree.addBefore("new node");

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });

    it("adds the children when adding a node with children", () => {
        const tree = new Node().loadFromData(exampleData);
        const node2 = tree.getNodeByNameMustExist("node2");

        node2.addBefore({
            children: ["newchild1", "newchild2"],
            name: "new node",
        });

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "newchild1" }),
                        expect.objectContaining({ name: "newchild2" }),
                    ],
                    name: "new node",
                }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("addChild", () => {
    it("adds the child", () => {
        const node = new Node();
        node.addChild(new Node({ id: 100, name: "child1" }));

        expect(node.children).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 100, name: "child1" }),
            ]),
        );
    });

    it("sets the parent of the child", () => {
        const node = new Node();
        node.addChild(new Node({ id: 100, name: "child1" }));

        expect(node.children[0]?.parent).toStrictEqual(node);
    });
});

describe("addChildAtPosition", () => {
    it("adds at the start with index 0", () => {
        const child = new Node("new");
        const node = new Node("new").loadFromData(["child1", "child2"]);
        node.addChildAtPosition(child, 0);

        expect(node.children).toStrictEqual([
            expect.objectContaining({ name: "new" }),
            expect.objectContaining({ name: "child1" }),
            expect.objectContaining({ name: "child2" }),
        ]);
    });

    it("inserts at index 1", () => {
        const child = new Node("new");
        const node = new Node("new").loadFromData(["child1", "child2"]);
        node.addChildAtPosition(child, 1);

        expect(node.children).toStrictEqual([
            expect.objectContaining({ name: "child1" }),
            expect.objectContaining({ name: "new" }),
            expect.objectContaining({ name: "child2" }),
        ]);
    });

    it("adds at the end with a non existing index", () => {
        const child = new Node("new");
        const node = new Node("new").loadFromData(["child1", "child2"]);
        node.addChildAtPosition(child, 99);

        expect(node.children).toStrictEqual([
            expect.objectContaining({ name: "child1" }),
            expect.objectContaining({ name: "child2" }),
            expect.objectContaining({ name: "new" }),
        ]);
    });
});

describe("addParent", () => {
    it("adds a parent node", () => {
        const node1 = new Node("node1");
        const tree = new Node({}, true);
        tree.addChild(node1);
        node1.append("child1");

        node1.addParent("parent1");

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({ name: "child1" }),
                            ],
                            name: "node1",
                        }),
                    ],
                    name: "parent1",
                }),
            ],
            name: "",
        });
    });

    it("returns the new node", () => {
        const node1 = new Node("node1");
        const tree = new Node({}, true);
        tree.addChild(node1);
        node1.append("child1");

        expect(node1.addParent("parent1")).toMatchObject({
            name: "parent1",
        });
    });

    it("returns null with a root node", () => {
        const node1 = new Node("node1");
        const tree = new Node({}, true);
        tree.addChild(node1);
        node1.append("child1");

        expect(tree.addParent("parent1")).toBeNull();
    });
});

describe("append", () => {
    it("appends a node", () => {
        const node = new Node("node1");
        node.append("child1");
        node.append("child2");

        expect(node).toMatchObject({
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ],
            name: "node1",
        });
    });

    it("returns the new node", () => {
        const node = new Node("node1");

        expect(node.append("child1")).toMatchObject({ name: "child1" });
    });

    it("adds the children when adding a node with children", () => {
        const node = new Node("node1");
        node.append({
            children: ["newchild1", "newchild2"],
            name: "new node",
        });

        expect(node).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "newchild1" }),
                        expect.objectContaining({ name: "newchild2" }),
                    ],
                    name: "new node",
                }),
            ],
        });
    });
});

describe("constructor", () => {
    it("creates a node without parameters", () => {
        const node = new Node();

        expect(node.name).toBe("");
        expect(node.id).toBeUndefined();
    });

    it("creates a node with a string", () => {
        const node = new Node("n1");

        expect(node).toMatchObject({
            children: [],
            name: "n1",
            parent: null,
        });
        expect(node.id).toBeUndefined();
    });

    it("sets isEmptyFolder to false with a string", () => {
        const node = new Node("n1");

        expect(node.isEmptyFolder).toBeFalse();
    });

    it("creates a node with an object with a name property", () => {
        const node = new Node({
            id: 123,
            name: "n1",
        });

        expect(node).toMatchObject({
            id: 123,
            name: "n1",
        });
    });

    it("sets the name to an empty string when the name property is null", () => {
        const node = new Node({
            name: null,
        });

        expect(node.name).toBe("");
    });

    it("creates a node with an object with more properties", () => {
        const node = new Node({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc",
        });

        expect(node).toMatchObject({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc",
        });
    });

    it("creates a node with an object with a label property", () => {
        const node = new Node({
            id: 123,
            label: "n1",
            url: "/",
        });

        expect(node).toMatchObject({
            id: 123,
            name: "n1",
            url: "/",
        });
        expect(node).not.toHaveProperty("label");
        expect(node.children).toHaveLength(0);
        expect(node.parent).toBeNull();
    });

    it("doesn't set the parent with an object with a parent", () => {
        const node = new Node({
            name: "n1",
            parent: "abc",
        });

        expect(node.name).toBe("n1");
        expect(node.parent).toBeNull();
    });

    it("doesn't set the children with an object with children", () => {
        const node = new Node({
            children: ["c"],
            name: "n1",
        });

        expect(node.name).toBe("n1");
        expect(node.children).toHaveLength(0);
    });

    it("sets isEmptyFolder to false with an object with children", () => {
        const node = new Node({
            children: ["c"],
            name: "n1",
        });

        expect(node.isEmptyFolder).toBeFalse();
    });

    it("sets isEmptyFolder to true when the data contains an empty children attribute", () => {
        const node = new Node({
            children: [],
            name: "n1",
        });

        expect(node.isEmptyFolder).toBeTrue();
    });
});

describe("getChildIndex", () => {
    it("returns the index when a child exists", () => {
        const child2 = new Node("child2");
        const node = new Node();
        node.addChild(new Node("child1"));
        node.addChild(child2);
        node.addChild(new Node("child3"));

        expect(node.getChildIndex(child2)).toBe(1);
    });

    it("returns -1 when a child doesn't exist", () => {
        const node = new Node();
        node.addChild(new Node("child1"));
        node.addChild(new Node("child2"));
        node.addChild(new Node("child3"));

        const nonExistingChild = new Node("non-existing");

        expect(node.getChildIndex(nonExistingChild)).toBe(-1);
    });
});

describe("getData", () => {
    it("returns the tree data", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getData()).toStrictEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ],
                name: "node1",
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("doesn't include internal attributes", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getData()[0]).not.toContainAnyKeys([
            "element",
            "isEmptyFolder",
            "parent",
        ]);
    });

    it("returns the tree data including the node itself with includeParent parameter", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getData(true)).toStrictEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            }),
        ]);
    });
});

describe("getLastChild", () => {
    it("returns null when a node has no children", () => {
        const node = new Node();

        expect(node.getLastChild()).toBeNull();
    });

    it("returns the last child when a node has children", () => {
        const node = new Node();
        node.append("child1");
        node.append("child2");

        expect(node.getLastChild()).toMatchObject({ name: "child2" });
    });

    it("returns the last child of that child when the last child is open and has children", () => {
        const node = new Node();
        node.append("child1");
        node.append("child2");

        const child2 = node.children[1] as Node;
        child2.append("child2a");
        child2.append("child2b");
        child2.is_open = true;

        expect(node.getLastChild()).toMatchObject({
            name: "child2b",
        });
    });

    it("returns the last child when the last child is closed and has children", () => {
        const node = new Node();
        node.append("child1");
        node.append("child2");

        const child2 = node.children[1] as Node;
        child2.append("child2a");
        child2.append("child2b");

        expect(node.getLastChild()).toMatchObject({
            name: "child2",
        });
    });
});

describe("getNextNode", () => {
    it("returns the first child when the parent node is closed", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("node1");

        expect(fromNode.getNextNode()).toMatchObject({
            name: "child1",
        });
    });

    it("returns the first child when the parent node is open", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("node1");
        fromNode.is_open = true;

        expect(fromNode.getNextNode()).toMatchObject({
            name: "child1",
        });
    });

    it("returns the next sibling of the parent when the node is the last child", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("child2");

        expect(fromNode.getNextNode()).toMatchObject({
            name: "node2",
        });
    });

    it("returns the next sibling with includeChildren false and an open parent node", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("node1");
        fromNode.is_open = true;

        expect(fromNode.getNextNode(false)).toMatchObject({
            name: "node2",
        });
    });
});

describe("getNextVisibleNode", () => {
    it("returns the next sibling when the parent node is closed", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("node1");

        expect(fromNode.getNextVisibleNode()).toMatchObject({
            name: "node2",
        });
    });

    it("returns the first child when the parent node is open", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("node1");
        fromNode.is_open = true;

        expect(fromNode.getNextVisibleNode()).toMatchObject({
            name: "child1",
        });
    });

    it("returns the next sibling of the parent when the node is the last child", () => {
        const tree = new Node().loadFromData(exampleData);
        const fromNode = tree.getNodeByNameMustExist("child2");

        expect(fromNode.getNextVisibleNode()).toMatchObject({
            name: "node2",
        });
    });

    it("returns null with the tree node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNextVisibleNode()).toBeNull();
    });
});

describe("getNextSibling", () => {
    it("returns null with a tree", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNextSibling()).toBeNull();
    });

    it("returns null when the node is the last child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getNextSibling()).toBeNull();
    });

    it("returns the second child when the node is the first child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node1.getNextSibling()).toBe(node2);
    });
});

describe("getNodeByCallback", () => {
    it("returns the node when a matching node exists", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(
            tree.getNodeByCallback((node) => node.name.startsWith("chi")),
        ).toMatchObject({
            name: "child1",
        });
    });

    it("returns null when no matching node exists", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNodeByCallback(() => false)).toBeNull();
    });
});

describe("getNodeByName", () => {
    it("returns the node when the node exists", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNodeByName("child1")).toMatchObject({
            id: 125,
            name: "child1",
        });
    });

    it("returns null when the node doesn't exist", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNodeByName("non-existing")).toBeNull();
    });
});

describe("getNodeByNameMustExist", () => {
    it("returns the node when the node exists", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getNodeByNameMustExist("child1")).toMatchObject({
            id: 125,
            name: "child1",
        });
    });

    it("throws an exception when the node doesn't exist", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(() => tree.getNodeByNameMustExist("non-existing")).toThrow(
            "Node with name non-existing not found",
        );
    });
});

describe("getParent", () => {
    it("returns null with a tree", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getParent()).toBeNull();
    });

    it("returns null with a node on the first level", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");

        expect(node1.getParent()).toBeNull();
    });

    it("returns the parent with a node on the second level", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");

        expect(child1.getParent()).toMatchObject({
            name: "node1",
        });
    });
});

describe("getPreviousNode", () => {
    it("returns null with a tree node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getPreviousNode()).toBeNull();
    });

    it("returns the last child of the previous sibling when the previous node is closed and has children", () => {
        const tree = new Node().loadFromData(exampleData);
        tree.getNodeByNameMustExist("node2").is_open = false;
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getPreviousNode()).toMatchObject({
            name: "child2",
        });
    });

    it("returns the last child of the previous sibling when the previous node is open and has children", () => {
        const tree = new Node().loadFromData(exampleData);
        tree.getNodeByNameMustExist("node2").is_open = true;
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getPreviousNode()).toMatchObject({
            name: "child2",
        });
    });

    it("returns the first child if a node is the second child", () => {
        const tree = new Node().loadFromData(exampleData);
        const child2 = tree.getNodeByNameMustExist("child2");

        expect(child2.getPreviousNode()).toMatchObject({
            name: "child1",
        });
    });

    it("returns the parent with a node that is the first child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node3 = tree.getNodeByNameMustExist("node3");

        expect(node3.getPreviousNode()).toMatchObject({
            name: "node2",
        });
    });
});

describe("getPreviousVisibleNode", () => {
    it("returns null with a tree node", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getPreviousVisibleNode()).toBeNull();
    });

    it("returns the previous sibling when the previous sibling is closed and has children", () => {
        const tree = new Node().loadFromData(exampleData);
        tree.getNodeByNameMustExist("node2").is_open = false;
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getPreviousVisibleNode()).toMatchObject({
            name: "node1",
        });
    });

    it("returns the last child of the previous sibling when the previous sibling is open and has children", () => {
        const tree = new Node().loadFromData(exampleData);
        tree.getNodeByNameMustExist("node1").is_open = true;
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getPreviousVisibleNode()).toMatchObject({
            name: "child2",
        });
    });

    it("returns the first child if a node is the second child", () => {
        const tree = new Node().loadFromData(exampleData);
        const child2 = tree.getNodeByNameMustExist("child2");

        expect(child2.getPreviousVisibleNode()).toMatchObject({
            name: "child1",
        });
    });

    it("returns the parent when a node is the first child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node3 = tree.getNodeByNameMustExist("node3");

        expect(node3.getPreviousVisibleNode()).toMatchObject({
            name: "node2",
        });
    });
});

describe("getPreviousSibling", () => {
    it("returns null with a tree", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.getPreviousSibling()).toBeNull();
    });

    it("returns null when the node is the first child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");

        expect(node1.getPreviousSibling()).toBeNull();
    });

    it("returns the first child when the node is the second child", () => {
        const tree = new Node().loadFromData(exampleData);
        const node1 = tree.getNodeByNameMustExist("node1");
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(node2.getPreviousSibling()).toBe(node1);
    });
});

describe("hasChildren", () => {
    it("returns true when a node has children", () => {
        const node = new Node();
        node.addChild(new Node("child1"));

        expect(node.hasChildren()).toBeTrue();
    });

    it("returns false when a node doesn't have children", () => {
        const node = new Node();

        expect(node.hasChildren()).toBeFalse();
    });
});

describe("initFromData", () => {
    it("loads the data", () => {
        const tree = new Node();
        tree.initFromData({
            children: [
                { id: 2, name: "child1" },
                { id: 3, name: "child2" },
            ],
            id: 1,
            name: "node1",
        });

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({ id: 2, name: "child1" }),
                expect.objectContaining({ id: 3, name: "child2" }),
            ],
            id: 1,
            name: "node1",
        });
    });
});

describe("isFolder", () => {
    it("returns false when the node has no children", () => {
        const node = new Node();

        expect(node.isFolder()).toBeFalse();
    });

    it("returns true when the node has no children and is loaded on demand", () => {
        const node = new Node();
        node.load_on_demand = true;

        expect(node.isFolder()).toBeTrue();
    });

    it("returns true when the node has a child", () => {
        const node = new Node();
        node.append("child1");

        expect(node.isFolder()).toBeTrue();
    });
});

describe("iterate", () => {
    it("visits all nodes when the visitor function returns true", () => {
        const tree = new Node().loadFromData(exampleData);
        const visited: [string, number][] = [];

        tree.iterate((node, level) => {
            visited.push([node.name, level]);
            return true;
        });

        expect(visited).toStrictEqual([
            ["node1", 0],
            ["child1", 1],
            ["child2", 1],
            ["node2", 0],
            ["node3", 1],
            ["child3", 2],
        ]);
    });

    it("stops the iteration for the current node when the visitor function returns false", () => {
        const tree = new Node().loadFromData(exampleData);
        const visited: [string, number][] = [];

        tree.iterate((node, level) => {
            visited.push([node.name, level]);
            return false;
        });

        expect(visited).toStrictEqual([
            ["node1", 0],
            ["node2", 0],
        ]);
    });
});

describe("loadFromData", () => {
    it("creates a tree", () => {
        const tree = new Node().loadFromData(exampleData);

        expect(tree.children).toStrictEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ id: 125, name: "child1" }),
                    expect.objectContaining({ id: 126, name: "child2" }),
                ],
                id: 123,
                intProperty: 1,
                name: "node1",
                strProperty: "1",
            }),
            expect.objectContaining({
                children: [expect.objectContaining({ id: 127, name: "node3" })],
                id: 124,
                intProperty: 3,
                name: "node2",
                strProperty: "3",
            }),
        ]);
    });

    it("sets isEmptyFolder to true for a node when it is has an empty children attribute", () => {
        const data = [
            {
                children: [],
                name: "test1",
            },
        ];
        const tree = new Node().loadFromData(data);

        expect((tree.children[0] as Node).isEmptyFolder).toBeTrue();
    });

    it("sets isEmptyFolder to false for a node when it doesn't have a children attribute", () => {
        const data = [
            {
                name: "test1",
            },
        ];
        const tree = new Node().loadFromData(data);

        expect((tree.children[0] as Node).isEmptyFolder).toBeFalse();
    });

    it("sets isEmptyFolder to false for a node when it has a children attribute that is not empty", () => {
        const data = [
            {
                children: ["child1"],
                name: "test1",
            },
        ];
        const tree = new Node().loadFromData(data);

        expect((tree.children[0] as Node).isEmptyFolder).toBeFalse();
    });
});

describe("moveNode", () => {
    it("moves the node when moving after a node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child2 = tree.getNodeByNameMustExist("child2");
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(tree.moveNode(child2, node2, "after")).toBeTrue();

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child1" })],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "child2" }),
            ],
            name: "",
        });
    });

    it("returns false when moving after a node and the target is the root node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child2 = tree.getNodeByNameMustExist("child2");

        expect(tree.moveNode(child2, tree, "after")).toBeFalse();
    });

    it("moves the node when moving inside a node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");
        const node2 = tree.getNodeByNameMustExist("node2");

        expect(tree.moveNode(child1, node2, "inside")).toBeTrue();

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child2" })],
                    name: "node1",
                }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "node3" }),
                    ],
                    name: "node2",
                }),
            ],
            name: "",
        });
    });

    it("moves the node when moving before a node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");
        const child2 = tree.getNodeByNameMustExist("child2");

        expect(tree.moveNode(child2, child1, "before")).toBeTrue();

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child2" }),
                        expect.objectContaining({ name: "child1" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ],
            name: "",
        });
    });

    it("returns false when moving before a node and the target is the root node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child2 = tree.getNodeByNameMustExist("child2");

        expect(tree.moveNode(child2, tree, "before")).toBeFalse();
    });

    it("doesn't move the node when the moved node is a parent of the target node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");
        const node1 = tree.getNodeByNameMustExist("node1");

        expect(tree.moveNode(node1, child1, "before")).toBeFalse();

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("prepend", () => {
    it("prepends a node", () => {
        const node = new Node("node1");
        node.prepend("child2");
        node.prepend("child1");

        expect(node).toMatchObject({
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ],
            name: "node1",
        });
    });

    it("adds the children when prepending a node with children", () => {
        const node = new Node("node1");
        node.prepend({
            children: ["newchild1", "newchild2"],
            name: "new node",
        });

        expect(node).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "newchild1" }),
                        expect.objectContaining({ name: "newchild2" }),
                    ],
                    name: "new node",
                }),
            ],
        });
    });

    it("sets the isEmptyFolder attribute to true when the node data has empty children", () => {
        const node = new Node("node1");
        node.prepend({
            children: [],
            name: "test1",
        });

        expect((node.children[0] as Node).isEmptyFolder).toBeTrue();
    });
});

describe("remove", () => {
    it("removes the node", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");
        child1.remove();

        expect(tree).toMatchObject({
            children: [
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child2" })],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("removeChild", () => {
    it("removes the child", () => {
        const tree = new Node().loadFromData(exampleData);
        const child1 = tree.getNodeByNameMustExist("child1");
        const node1 = tree.getNodeByNameMustExist("node1");
        node1.removeChild(child1);

        expect(node1.children).toStrictEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
