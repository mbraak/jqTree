import getGiven from "givens";
import { Node, Position } from "../node";
import exampleData from "./support/exampleData";
import "jest-extended";

const context = describe;

describe("addAfter", () => {
    interface Vars {
        node1: Node;
        tree: Node;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("when moving after node1", () => {
        it("returns the new node", () => {
            expect(given.node1.addAfter("new node")).toMatchObject({
                name: "new node",
            });
        });

        it("adds after the node", () => {
            given.node1.addAfter("new node");

            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "new node" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    context("when moving after the root node", () => {
        it("returns null", () => {
            expect(given.tree.addAfter("new node")).toBeNull();
        });

        it("doesn't add anything", () => {
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    context("when adding a node with children", () => {
        it("adds the children", () => {
            given.node1.addAfter({
                name: "new node",
                children: ["newchild1", "newchild2"],
            });

            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ],
                    }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });
});

describe("addBefore", () => {
    interface Vars {
        node2: Node;
        tree: Node;
    }

    const given = getGiven<Vars>();
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("tree", () => new Node().loadFromData(exampleData));

    it("returns the new node", () => {
        expect(given.node2.addBefore("new node")).toMatchObject({
            name: "new node",
        });
    });

    it("adds before the node", () => {
        given.node2.addBefore("new node");

        expect(given.tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "new node" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });

    context("with a root node", () => {
        it("returns null", () => {
            expect(given.tree.addBefore("new node")).toBeNull();
        });

        it("does nothing", () => {
            given.tree.addBefore("new node");

            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    context("when adding a node with children", () => {
        it("adds the children", () => {
            given.node2.addBefore({
                name: "new node",
                children: ["newchild1", "newchild2"],
            });

            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ],
                    }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });
});

describe("addChild", () => {
    interface Vars {
        node: Node;
    }

    const given = getGiven<Vars>();
    given("node", () => new Node());

    beforeEach(() => {
        given.node.addChild(new Node({ id: 100, name: "child1" }));
    });

    it("adds the child", () => {
        expect(given.node.children).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 100, name: "child1" }),
            ])
        );
    });

    it("sets the parent of the child", () => {
        expect(given.node.children[0].parent).toEqual(given.node);
    });
});

describe("addChildAtPosition", () => {
    interface Vars {
        child: Node;
        index: number;
        node: Node;
    }

    const given = getGiven<Vars>();

    given("child", () => new Node("new"));
    given("node", () => new Node("new").loadFromData(["child1", "child2"]));

    beforeEach(() => {
        given.node.addChildAtPosition(given.child, given.index);
    });

    context("with index 0", () => {
        given("index", () => 0);

        it("adds at the start", () => {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]);

            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });

    context("with index 1", () => {
        given("index", () => 1);

        it("inserts at index 1", () => {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });

    context("with non existing index", () => {
        given("index", () => 99);

        it("adds add the end", () => {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
                expect.objectContaining({ name: "new" }),
            ]);
        });
    });
});

describe("addParent", () => {
    interface Vars {
        tree: Node;
        node1: Node;
    }
    const given = getGiven<Vars>();
    given("node1", () => new Node("node1"));
    given("tree", () => new Node({}, true));

    beforeEach(() => {
        given.tree.addChild(given.node1);
        given.node1.append("child1");
    });

    it("adds a parent node", () => {
        given.node1.addParent("parent1");

        expect(given.tree).toMatchObject({
            name: "",
            children: [
                expect.objectContaining({
                    name: "parent1",
                    children: [
                        expect.objectContaining({
                            name: "node1",
                            children: [
                                expect.objectContaining({ name: "child1" }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    });

    it("returns the new node", () => {
        expect(given.node1.addParent("parent1")).toMatchObject({
            name: "parent1",
        });
    });

    context("with a root node", () => {
        it("returns null", () => {
            expect(given.tree.addParent("parent1")).toBeNull();
        });
    });
});

describe("append", () => {
    interface Vars {
        node: Node;
    }
    const given = getGiven<Vars>();
    given("node", () => new Node("node1"));

    it("appends a node", () => {
        given.node.append("child1");
        given.node.append("child2");

        expect(given.node).toMatchObject({
            name: "node1",
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ],
        });
    });

    it("returns the new node", () => {
        expect(given.node.append("child1")).toMatchObject({ name: "child1" });
    });

    context("when adding a node with children", () => {
        it("adds the children", () => {
            given.node.append({
                name: "new node",
                children: ["newchild1", "newchild2"],
            });

            expect(given.node).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ],
                    }),
                ],
            });
        });
    });
});

describe("constructor", () => {
    interface Vars {
        node: Node;
        params: NodeData | undefined;
    }

    const given = getGiven<Vars>();

    given("node", () =>
        given.params === undefined ? new Node() : new Node(given.params)
    );

    context("without parameters", () => {
        it("creates a node", () => {
            expect(given.node.name).toBe("");
            expect(given.node.id).toBeUndefined();
        });
    });

    context("with a string", () => {
        given("params", () => "n1");

        it("creates a node", () => {
            expect(given.node).toMatchObject({
                name: "n1",
                children: [],
                parent: null,
            });
            expect(given.node).not.toHaveProperty("id");
        });
    });

    context("with an object with a name property", () => {
        given("params", () => ({
            id: 123,
            name: "n1",
        }));

        it("creates a node", () => {
            expect(given.node).toMatchObject({
                id: 123,
                name: "n1",
            });
        });
    });

    context("when the name property is null", () => {
        given("params", () => ({
            name: null,
        }));

        it("sets the name to an empty string", () => {
            expect(given.node.name).toBe("");
        });
    });

    context("with an object with more properties", () => {
        given("params", () => ({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc",
        }));

        it("creates a node", () => {
            expect(given.node).toMatchObject({
                color: "green",
                id: 123,
                name: "n1",
                url: "/abc",
            });
        });
    });

    context("with an object with a label property", () => {
        given("params", () => ({
            id: 123,
            label: "n1",
            url: "/",
        }));

        it("creates a node", () => {
            expect(given.node).toMatchObject({
                id: 123,
                name: "n1",
                url: "/",
            });
            // todo: match object?
            expect(given.node).not.toHaveProperty("label");
            expect(given.node.children).toHaveLength(0);
            expect(given.node.parent).toBeNull();
        });
    });

    context("with an object with a parent", () => {
        given("params", () => ({
            name: "n1",
            parent: "abc",
        }));

        it("doesn't set the parent", () => {
            expect(given.node.name).toBe("n1");
            expect(given.node.parent).toBeNull();
        });
    });

    context("with an object with children", () => {
        given("params", () => ({
            name: "n1",
            children: ["c"],
        }));

        it("doesn't set the children", () => {
            // todo: match object?
            expect(given.node.name).toBe("n1");
            expect(given.node.children).toHaveLength(0);
        });
    });
});

describe("getChildIndex", () => {
    interface Vars {
        child2: Node;
        node: Node;
    }
    const given = getGiven<Vars>();
    given("child2", () => new Node("child2"));
    given("node", () => new Node());

    beforeEach(() => {
        given.node.addChild(new Node("child1"));
        given.node.addChild(given.child2);
        given.node.addChild(new Node("child3"));
    });

    context("when a child exists", () => {
        it("returns the index", () => {
            expect(given.node.getChildIndex(given.child2)).toBe(1);
        });
    });

    context("when a child doesn't exist", () => {
        it("returns -1", () => {
            const nonExistingChild = new Node("non-existing");
            expect(given.node.getChildIndex(nonExistingChild)).toBe(-1);
        });
    });
});

describe("getData", () => {
    interface Vars {
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));

    it("returns the tree data", () => {
        expect(given.tree.getData()).toEqual([
            expect.objectContaining({
                name: "node1",
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ],
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("doesn't include internal attributes", () => {
        expect(given.tree.getData()[0]).not.toContainAnyKeys([
            "element",
            "isEmptyFolder",
            "parent",
        ]);
    });

    context("with includeParent parameter", () => {
        it("returns the tree data including the node itself", () => {
            expect(given.tree.getData(true)).toEqual([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node2" }),
                    ],
                }),
            ]);
        });
    });
});

describe("getLastChild", () => {
    interface Vars {
        node: Node;
    }
    const given = getGiven<Vars>();
    given("node", () => new Node());

    context("when a node has no children", () => {
        it("returns null", () => {
            expect(given.node.getLastChild()).toBeNull();
        });
    });

    context("when a node has children", () => {
        beforeEach(() => {
            given.node.append("child1");
            given.node.append("child2");
        });

        it("returns the last child", () => {
            expect(given.node.getLastChild()).toMatchObject({ name: "child2" });
        });

        context("when its last child is open and has children", () => {
            beforeEach(() => {
                const child2 = given.node.children[1];
                child2.append("child2a");
                child2.append("child2b");
            });

            context("and the last child is open", () => {
                beforeEach(() => {
                    const child2 = given.node.children[1];
                    child2.is_open = true;
                });

                it("returns the last child of that child", () => {
                    expect(given.node.getLastChild()).toMatchObject({
                        name: "child2b",
                    });
                });
            });

            context("and the last child is closed", () => {
                it("returns the last child", () => {
                    expect(given.node.getLastChild()).toMatchObject({
                        name: "child2",
                    });
                });
            });
        });
    });
});

describe("getNextNode", () => {
    interface Vars {
        includeChildren: boolean;
        fromNode: Node;
        nextNode: Node | null;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));
    given("nextNode", () => given.fromNode.getNextNode(given.includeChildren));

    context("with includeChildren is true", () => {
        given("includeChildren", () => true);

        context("with a parent node", () => {
            given("fromNode", () => given.tree.getNodeByNameMustExist("node1"));

            context("when the parent node is closed", () => {
                it("returns the next sibling", () => {
                    expect(given.nextNode).toMatchObject({ name: "node2" });
                });
            });

            context("when the parent node is open", () => {
                beforeEach(() => {
                    given.fromNode.is_open = true;
                });

                it("returns the first child", () => {
                    expect(given.nextNode).toMatchObject({ name: "child1" });
                });
            });
        });

        context("with the node is the last child", () => {
            given("fromNode", () =>
                given.tree.getNodeByNameMustExist("child2")
            );

            it("returns the next sibling of the parent", () => {
                expect(given.nextNode).toMatchObject({ name: "node2" });
            });
        });
    });

    context("with includeChildren is false", () => {
        given("includeChildren", () => false);

        context("with an open parent node", () => {
            given("fromNode", () => given.tree.getNodeByNameMustExist("node1"));

            beforeEach(() => {
                given.fromNode.is_open = true;
            });

            it("returns the next sibling", () => {
                expect(given.nextNode).toMatchObject({ name: "node2" });
            });
        });
    });
});

describe("getNextSibling", () => {
    interface Vars {
        node1: Node;
        node2: Node;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("with a tree", () => {
        it("returns null", () => {
            expect(given.tree.getNextSibling()).toBeNull();
        });
    });

    context("when the node is the last child", () => {
        it("returns null", () => {
            expect(given.node2.getNextSibling()).toBeNull();
        });
    });

    context("when the node is the first child", () => {
        it("returns the second child", () => {
            expect(given.node1.getNextSibling()).toBe(given.node2);
        });
    });
});

describe("getNodeByCallback", () => {
    interface Vars {
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));

    context("when a matching node exists", () => {
        it("returns the node", () => {
            expect(
                given.tree.getNodeByCallback((node) =>
                    node.name.startsWith("chi")
                )
            ).toMatchObject({
                name: "child1",
            });
        });
    });

    context("when no matching node exists", () => {
        it("returns null", () => {
            expect(given.tree.getNodeByCallback(() => false)).toBeNull();
        });
    });
});

describe("getNodeByName", () => {
    interface Vars {
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));

    context("when the node exists", () => {
        it("returns the node", () => {
            expect(given.tree.getNodeByName("child1")).toMatchObject({
                id: 125,
                name: "child1",
            });
        });
    });

    context("when the node doesn't exist", () => {
        it("returns null", () => {
            expect(given.tree.getNodeByName("non-existing")).toBeNull();
        });
    });
});

describe("getNodeByNameMustExist", () => {
    interface Vars {
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));

    context("when the node exists", () => {
        it("returns the node", () => {
            expect(given.tree.getNodeByNameMustExist("child1")).toMatchObject({
                id: 125,
                name: "child1",
            });
        });
    });

    context("when the node doesn't exist", () => {
        it("throws an exception", () => {
            expect(() =>
                given.tree.getNodeByNameMustExist("non-existing")
            ).toThrow("Node with name non-existing not found");
        });
    });
});

describe("getParent", () => {
    interface Vars {
        child1: Node;
        node1: Node;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("child1", () => given.tree.getNodeByNameMustExist("child1"));
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("with a tree", () => {
        it("returns null", () => {
            expect(given.tree.getParent()).toBeNull();
        });
    });

    context("with a node on the first level", () => {
        it("returns null", () => {
            expect(given.node1.getParent()).toBeNull();
        });
    });

    context("with a node on the second level", () => {
        it("returns the parent", () => {
            expect(given.child1.getParent()).toMatchObject({
                name: "node1",
            });
        });
    });
});

describe("getPreviousNode", () => {
    interface Vars {
        node2: Node;
        node3: Node;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("node3", () => given.tree.getNodeByNameMustExist("node3"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("with a tree", () => {
        it("returns null", () => {
            expect(given.tree.getPreviousNode()).toBeNull();
        });
    });

    context("when the previous sibling has children", () => {
        context("when the previous node is closed", () => {
            it("returns the previous sibling", () => {
                expect(given.node2.getPreviousNode()).toMatchObject({
                    name: "node1",
                });
            });
        });

        context("when the previous node is open", () => {
            beforeEach(() => {
                given.tree.getNodeByNameMustExist("node1").is_open = true;
            });

            it("returns the last child of the previous sibling", () => {
                expect(given.node2.getPreviousNode()).toMatchObject({
                    name: "child2",
                });
            });
        });
    });

    context("with a node that is the first child", () => {
        it("returns the parent", () => {
            expect(given.node3.getPreviousNode()).toMatchObject({
                name: "node2",
            });
        });
    });
});

describe("getPreviousSibling", () => {
    interface Vars {
        node1: Node;
        node2: Node;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("with a tree", () => {
        it("returns null", () => {
            expect(given.tree.getPreviousSibling()).toBeNull();
        });
    });

    context("when the node is the first child", () => {
        it("returns null", () => {
            expect(given.node1.getPreviousSibling()).toBeNull();
        });
    });

    context("when the node is the second child", () => {
        it("returns the first child", () => {
            expect(given.node2.getPreviousSibling()).toBe(given.node1);
        });
    });
});

describe("hasChildren", () => {
    interface Vars {
        node: Node;
    }
    const given = getGiven<Vars>();
    given("node", () => new Node());

    context("when a node has children", () => {
        beforeEach(() => {
            given.node.addChild(new Node("child1"));
        });

        it("returns true", () => {
            expect(given.node.hasChildren()).toEqual(true);
        });
    });

    context("when a node doesn't have children", () => {
        it("returns false", () => {
            expect(given.node.hasChildren()).toEqual(false);
        });
    });
});

describe("initFromData", () => {
    interface Vars {
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node());

    beforeEach(() => {
        given.tree.initFromData({
            name: "node1",
            id: 1,
            children: [
                { name: "child1", id: 2 },
                { name: "child2", id: 3 },
            ],
        });
    });

    it("loads the data", () => {
        expect(given.tree).toMatchObject({
            id: 1,
            name: "node1",
            children: [
                expect.objectContaining({ id: 2, name: "child1" }),
                expect.objectContaining({ id: 3, name: "child2" }),
            ],
        });
    });
});

describe("isFolder", () => {
    interface Vars {
        node: Node;
    }
    const given = getGiven<Vars>();
    given("node", () => new Node());

    context("when the node has no children", () => {
        it("returns false", () => {
            expect(given.node.isFolder()).toBe(false);
        });

        context("when the node is loaded on demand", () => {
            beforeEach(() => {
                given.node.load_on_demand = true;
            });

            it("returns false", () => {
                expect(given.node.isFolder()).toBe(true);
            });
        });
    });

    context("when the node has a child", () => {
        beforeEach(() => {
            given.node.append("child1");
        });

        it("returns false", () => {
            expect(given.node.isFolder()).toBe(true);
        });
    });
});

describe("iterate", () => {
    interface Vars {
        tree: Node;
        visited: [string, number][];
        visitor: (node: Node, level: number) => boolean;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node().loadFromData(exampleData));
    given("visited", () => []);

    beforeEach(() => {
        given.tree.iterate(given.visitor);
    });

    context("when the visitor function returns true", () => {
        const visitAllNodes = (node: Node, level: number) => {
            given.visited.push([node.name, level]);
            return true;
        };
        given("visitor", () => visitAllNodes);

        it("visits all nodes", () => {
            expect(given.visited).toEqual([
                ["node1", 0],
                ["child1", 1],
                ["child2", 1],
                ["node2", 0],
                ["node3", 1],
                ["child3", 2],
            ]);
        });
    });

    context("when the visitor function returns false", () => {
        const visitNodes = (node: Node, level: number) => {
            given.visited.push([node.name, level]);
            return false;
        };
        given("visitor", () => visitNodes);

        it("stops the iteration for the current node", () => {
            expect(given.visited).toEqual([
                ["node1", 0],
                ["node2", 0],
            ]);
        });
    });
});

describe("loadFromData", () => {
    interface Vars {
        tree: Node;
    }

    const given = getGiven<Vars>();

    given("tree", () => new Node().loadFromData(exampleData));

    it("creates a tree", () => {
        expect(given.tree.children).toEqual([
            expect.objectContaining({
                id: 123,
                intProperty: 1,
                name: "node1",
                strProperty: "1",
                children: [
                    expect.objectContaining({ id: 125, name: "child1" }),
                    expect.objectContaining({ id: 126, name: "child2" }),
                ],
            }),
            expect.objectContaining({
                id: 124,
                intProperty: 3,
                name: "node2",
                strProperty: "3",
                children: [expect.objectContaining({ id: 127, name: "node3" })],
            }),
        ]);
    });
});

describe("moveNode", () => {
    interface Vars {
        child1: Node;
        child2: Node;
        node1: Node;
        node2: Node;
        tree: Node;
    }

    const given = getGiven<Vars>();

    given("child1", () => given.tree.getNodeByNameMustExist("child1"));
    given("child2", () => given.tree.getNodeByNameMustExist("child2"));
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("tree", () => new Node().loadFromData(exampleData));

    context("when moving after a node", () => {
        it("moves the node", () => {
            expect(
                given.tree.moveNode(given.child2, given.node2, Position.After)
            ).toBe(true);

            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [expect.objectContaining({ name: "child1" })],
                    }),
                    expect.objectContaining({ name: "node2" }),
                    expect.objectContaining({ name: "child2" }),
                ],
            });
        });

        context("when the target is the root node", () => {
            it("returns false", () => {
                expect(
                    given.tree.moveNode(
                        given.child2,
                        given.tree,
                        Position.After
                    )
                ).toBe(false);
            });
        });
    });

    context("when moving inside a node", () => {
        it("moves the node", () => {
            expect(
                given.tree.moveNode(given.child1, given.node2, Position.Inside)
            ).toBe(true);

            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [expect.objectContaining({ name: "child2" })],
                    }),
                    expect.objectContaining({
                        name: "node2",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "node3" }),
                        ],
                    }),
                ],
            });
        });
    });

    context("when moving before a node", () => {
        it("moves the node", () => {
            expect(
                given.tree.moveNode(given.child2, given.child1, Position.Before)
            ).toBe(true);

            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({ name: "child2" }),
                            expect.objectContaining({ name: "child1" }),
                        ],
                    }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });

        context("when the target is the root node", () => {
            it("returns false", () => {
                expect(
                    given.tree.moveNode(
                        given.child2,
                        given.tree,
                        Position.Before
                    )
                ).toBe(false);
            });
        });
    });

    context("when the moved node is a parent of the target node", () => {
        it("doesn't move the node", () => {
            expect(
                given.tree.moveNode(given.node1, given.child1, Position.Before)
            ).toBe(false);

            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "child2" }),
                        ],
                    }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    context("with position None", () => {
        it("returns false", () => {
            expect(
                given.tree.moveNode(given.child2, given.node2, Position.None)
            ).toBe(false);
        });
    });
});

describe("prepend", () => {
    interface Vars {
        node: Node;
    }
    const given = getGiven<Vars>();
    given("node", () => new Node("node1"));

    it("prepends a node", () => {
        given.node.prepend("child2");
        given.node.prepend("child1");

        expect(given.node).toMatchObject({
            name: "node1",
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ],
        });
    });

    context("when prepending a node with children", () => {
        it("adds the children", () => {
            given.node.prepend({
                name: "new node",
                children: ["newchild1", "newchild2"],
            });

            expect(given.node).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ],
                    }),
                ],
            });
        });
    });
});

describe("remove", () => {
    interface Vars {
        child1: Node;
        tree: Node;
    }
    const given = getGiven<Vars>();
    given("child1", () => given.tree.getNodeByNameMustExist("child1"));
    given("tree", () => new Node().loadFromData(exampleData));

    beforeEach(() => {
        given.child1.remove();
    });

    it("removes the node", () => {
        expect(given.tree).toMatchObject({
            children: [
                expect.objectContaining({
                    name: "node1",
                    children: [expect.objectContaining({ name: "child2" })],
                }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("removeChild", () => {
    interface Vars {
        child1: Node;
        node1: Node;
        tree: Node;
    }

    const given = getGiven<Vars>();

    given("child1", () => given.tree.getNodeByNameMustExist("child1"));
    given("node1", () => given.tree.getNodeByNameMustExist("node1"));
    given("tree", () => new Node().loadFromData(exampleData));

    beforeEach(() => {
        given.node1.removeChild(given.child1);
    });

    it("removes the child", () => {
        expect(given.node1.children).toEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
