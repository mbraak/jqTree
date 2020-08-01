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
    given("tree", () => new Node());

    beforeEach(() => {
        given.tree.loadFromData(exampleData);
        given.node1.addAfter("new node");
    });

    test("adds after the node", () => {
        expect(given.tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "new node" }),
                expect.objectContaining({ name: "node2" }),
            ],
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

    test("adds the child", () => {
        expect(given.node.children).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 100, name: "child1" }),
            ])
        );
    });

    test("sets the parent of the child", () => {
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

        test("adds at the start", () => {
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

        test("inserts at index 1", () => {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });

    context("with non existing index", () => {
        given("index", () => 99);

        test("adds add the end", () => {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
                expect.objectContaining({ name: "new" }),
            ]);
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
        test("creates a node", () => {
            expect(given.node.name).toBe("");
            expect(given.node.id).toBeUndefined();
        });
    });

    context("with a string", () => {
        given("params", () => "n1");

        test("creates a node", () => {
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

        test("creates a node", () => {
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

        test("sets the name to an empty string", () => {
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

        test("creates a node", () => {
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

        test("creates a node", () => {
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

        test("doesn't set the parent", () => {
            expect(given.node.name).toBe("n1");
            expect(given.node.parent).toBeNull();
        });
    });

    context("with an object with children", () => {
        given("params", () => ({
            name: "n1",
            children: ["c"],
        }));

        test("doesn't set the children", () => {
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
        test("it returns the index", () => {
            expect(given.node.getChildIndex(given.child2)).toBe(1);
        });
    });

    context("when a child doesn't exist", () => {
        test("returns -1", () => {
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
    given("tree", () => new Node());

    beforeEach(() => {
        given.tree.loadFromData(exampleData);
    });

    test("returns the tree data", () => {
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

    test("doesn't include internal attributes", () => {
        expect(given.tree.getData()[0]).not.toContainAnyKeys([
            "element",
            "isEmptyFolder",
            "parent",
        ]);
    });

    context("with includeParent parameter", () => {
        test("returns the tree data including the node itself", () => {
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

        test("returns true", () => {
            expect(given.node.hasChildren()).toEqual(true);
        });
    });

    context("when a node doesn't have children", () => {
        test("returns false", () => {
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

    test("loads the data", () => {
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

describe("iterate", () => {
    interface Vars {
        tree: Node;
        visited: [string, number][];
        visitor: (node: Node, level: number) => boolean;
    }
    const given = getGiven<Vars>();
    given("tree", () => new Node());
    given("visited", () => []);

    beforeEach(() => {
        given.tree.loadFromData(exampleData);
        given.tree.iterate(given.visitor);
    });

    context("when the visitor function returns true", () => {
        const visitAllNodes = (node: Node, level: number) => {
            given.visited.push([node.name, level]);
            return true;
        };
        given("visitor", () => visitAllNodes);

        test("visits all nodes", () => {
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

        test("stops the iteration for the current node", () => {
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

    given("tree", () => new Node());

    beforeEach(() => {
        given.tree.loadFromData(exampleData);
    });

    test("creates a tree", () => {
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
        node2: Node;
        tree: Node;
    }

    const given = getGiven<Vars>();

    given("child1", () => given.tree.getNodeByNameMustExist("child1"));
    given("child2", () => given.tree.getNodeByNameMustExist("child2"));
    given("node2", () => given.tree.getNodeByNameMustExist("node2"));
    given("tree", () => new Node());

    beforeEach(() => {
        given.tree.loadFromData(exampleData);
    });

    context("when moving after a node", () => {
        beforeEach(() => {
            given.tree.moveNode(given.child2, given.node2, Position.After);
        });

        test("moves the node", () => {
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
    });

    context("when moving inside a node", () => {
        beforeEach(() => {
            given.tree.moveNode(given.child1, given.node2, Position.Inside);
        });

        test("moves the node", () => {
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
        beforeEach(() => {
            given.tree.moveNode(given.child2, given.child1, Position.Before);
        });

        test("moves the node", () => {
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

    test("removes the child", () => {
        expect(given.node1.children).toEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
