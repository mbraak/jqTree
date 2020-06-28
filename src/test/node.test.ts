import getGiven from "givens";
import { Node } from "../node";
import exampleData from "./exampleData";

const context = describe;

describe(".addChild", () => {
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

describe(".addChildAtPosition", () => {
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

describe(".loadFromData", () => {
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
                children: [
                    expect.objectContaining({ id: 127, name: "child3" }),
                ],
            }),
        ]);
    });
});

describe(".removeChild", () => {
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
