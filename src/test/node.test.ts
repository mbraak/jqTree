import { Node } from "../node";
import exampleData from "./exampleData";

const context = describe;

describe(".addChild", () => {
    const node = new Node();
    node.addChild(new Node({ id: 100, name: "child1" }));

    test("adds the child", () => {
        expect(node.children).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 100, name: "child1" }),
            ])
        );
    });

    test("sets the parent of the child", () => {
        expect(node.children[0].parent).toEqual(node);
    });
});

describe("addChildAtPosition", () => {
    const child = new Node("new");

    let node: Node;

    beforeEach(() => {
        node = new Node();
        node.loadFromData(["child1", "child2"]);
    });

    context("with index 0", () => {
        beforeEach(() => {
            node.addChildAtPosition(child, 0);
        });

        test("adds at the start", () => {
            expect(node.children).toEqual([
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]);

            expect(node.children).toEqual([
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });

    context("with index 1", () => {
        beforeEach(() => {
            node.addChildAtPosition(child, 1);
        });

        test("inserts at index 1", () => {
            expect(node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });

    context("with non existing index", () => {
        beforeEach(() => {
            node.addChildAtPosition(child, 99);
        });

        test("adds add the end", () => {
            expect(node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
                expect.objectContaining({ name: "new" }),
            ]);
        });
    });
});

describe("constructor", () => {
    context("without parameters", () => {
        const node = new Node();

        test("creates a node", () => {
            expect(node.name).toBe("");
            expect(node.id).toBeUndefined();
        });
    });

    context("with a string", () => {
        const node = new Node("n1");

        test("creates a node", () => {
            expect(node.name).toBe("n1");
            expect(node.children).toHaveLength(0);
            expect(node.parent).toBeNull();
            expect(node.id).toBeUndefined();
        });
    });

    context("with an object with a name property", () => {
        const node = new Node({
            id: 123,
            name: "n1",
        });

        test("creates a node", () => {
            expect(node).toMatchObject({
                id: 123,
                name: "n1",
            });
        });
    });

    context("when the name property is null", () => {
        const node = new Node({ name: null });

        test("sets the name to an empty string", () => {
            expect(node.name).toBe("");
        });
    });

    context("with an object with more properties", () => {
        const node = new Node({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc",
        });

        test("creates a node", () => {
            expect(node).toMatchObject({
                color: "green",
                id: 123,
                name: "n1",
                url: "/abc",
            });
        });
    });

    context("with an object with a label property", () => {
        const node = new Node({
            id: 123,
            label: "n1",
            url: "/",
        });

        test("creates a node", () => {
            expect(node).toMatchObject({
                id: 123,
                name: "n1",
                url: "/",
            });
            expect(node).not.toHaveProperty("label");
            expect(node.children).toHaveLength(0);
            expect(node.parent).toBeNull();
        });
    });

    context("with an object with a parent", () => {
        const node = new Node({
            name: "n1",
            parent: "abc",
        });

        test("doesn't set the parent", () => {
            expect(node.name).toBe("n1");
            expect(node.parent).toBeNull();
        });
    });

    context("with an object with children", () => {
        const node = new Node({
            name: "n1",
            children: ["c"],
        });

        test("doesn't set the children", () => {
            expect(node.name).toBe("n1");
            expect(node.children).toHaveLength(0);
        });
    });
});

describe(".loadFromData", () => {
    const tree = new Node();
    tree.loadFromData(exampleData);

    test("creates a tree", () => {
        expect(tree.children).toEqual([
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
    let node1: Node;

    beforeEach(() => {
        const tree = new Node();
        tree.loadFromData(exampleData);

        node1 = tree.getNodeByNameMustExist("node1");
        const child1 = tree.getNodeByNameMustExist("child1");

        node1.removeChild(child1);
    });

    test("removes the child", () => {
        expect(node1.children).toEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
