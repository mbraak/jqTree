"use strict";
exports.__esModule = true;
var node_1 = require("../node");
var exampleData_1 = require("./exampleData");
var context = describe;
describe("constructor", function () {
    context("without parameters", function () {
        var node = new node_1.Node();
        test("creates a node", function () {
            expect(node.name).toBe("");
            expect(node.id).toBeUndefined();
        });
    });
    context("with a string", function () {
        var node = new node_1.Node("n1");
        test("creates a node", function () {
            expect(node.name).toBe("n1");
            expect(node.children).toHaveLength(0);
            expect(node.parent).toBeNull();
            expect(node.id).toBeUndefined();
        });
    });
    context("with an object with a name property", function () {
        var node = new node_1.Node({
            id: 123,
            name: "n1"
        });
        test("creates a node", function () {
            expect(node).toMatchObject({
                id: 123,
                name: "n1"
            });
        });
    });
    context("when the name property is null", function () {
        var node = new node_1.Node({ name: null });
        test("sets the name to an empty string", function () {
            expect(node.name).toBe("");
        });
    });
    context("with an object with more properties", function () {
        var node = new node_1.Node({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc"
        });
        test("creates a node", function () {
            expect(node).toMatchObject({
                color: "green",
                id: 123,
                name: "n1",
                url: "/abc"
            });
        });
    });
    context("with an object with a label property", function () {
        var node = new node_1.Node({
            id: 123,
            label: "n1",
            url: "/"
        });
        test("creates a node", function () {
            expect(node).toMatchObject({
                id: 123,
                name: "n1",
                url: "/"
            });
            expect(node).not.toHaveProperty("label");
            expect(node.children).toHaveLength(0);
            expect(node.parent).toBeNull();
        });
    });
    context("with an object with a parent", function () {
        var node = new node_1.Node({
            name: "n1",
            parent: "abc"
        });
        test("doesn't set the parent", function () {
            expect(node.name).toBe("n1");
            expect(node.parent).toBeNull();
        });
    });
    context("with an object with children", function () {
        var node = new node_1.Node({
            name: "n1",
            children: ["c"]
        });
        test("doesn't set the children", function () {
            expect(node.name).toBe("n1");
            expect(node.children).toHaveLength(0);
        });
    });
});
describe(".loadFromData", function () {
    var tree = new node_1.Node({}, true);
    tree.loadFromData(exampleData_1["default"]);
    test("creates nodes", function () {
        expect(tree.getData(true)).toMatchObject({
            id: 123
        });
    });
});
