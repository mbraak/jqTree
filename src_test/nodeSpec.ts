import { expect } from "chai";
import { Node } from "../src/node";

describe("constructor", () => {
    context("without parameters", () => {
        const node = new Node();

        it("creates a node", () => {
            expect(node.name).to.eq("");
            expect(node.id).to.be.undefined;
        });
    });

    context("with a string", () => {
        const node = new Node("n1");

        it("creates a node", () => {
            expect(node.name).to.eq("n1");
            expect(node.children).to.be.empty;
            expect(node.parent).to.be.null;
            expect(node.id).to.be.undefined;
        });
    });

    context("with an object with a name property", () => {
        const node = new Node({
            id: 123,
            name: "n1",
        });

        it("creates a node", () => {
            expect(node).to.include({
                id: 123,
                name: "n1",
            });
        });
    });

    context("with an object with more properties", () => {
        const node = new Node({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc",
        });

        it("creates a node", () => {
            expect(node).to.include({
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

        it("creates a node", () => {
            expect(node).to.include({
                id: 123,
                name: "n1",
                url: "/",
            });
            expect(node).to.not.have.property("label");
            expect(node.children).to.be.empty;
            expect(node.parent).to.be.null;
        });
    });

    context("with an object with a parent", () => {
        const node = new Node({
            name: "n1",
            parent: "abc",
        });

        it("doesn't set the parent", () => {
            expect(node.name).to.eq("n1");
            expect(node.parent).to.be.null;
        });
    });
    context("with an object with children", () => {
        const node = new Node({
            name: "n1",
            children: ["c"],
        });

        it("doesn't set the children", () => {
            expect(node.name).to.eq("n1");
            expect(node.children).to.be.empty;
        });
    });
});
