import { Node } from "../node";

const context = describe;

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
