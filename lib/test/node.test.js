"use strict";
exports.__esModule = true;
var givens_1 = require("givens");
var node_1 = require("../node");
var exampleData_1 = require("./support/exampleData");
var context = describe;
describe(".addChild", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node(); });
    beforeEach(function () {
        given.node.addChild(new node_1.Node({ id: 100, name: "child1" }));
    });
    test("adds the child", function () {
        expect(given.node.children).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 100, name: "child1" }),
        ]));
    });
    test("sets the parent of the child", function () {
        expect(given.node.children[0].parent).toEqual(given.node);
    });
});
describe(".addChildAtPosition", function () {
    var given = givens_1["default"]();
    given("child", function () { return new node_1.Node("new"); });
    given("node", function () { return new node_1.Node("new").loadFromData(["child1", "child2"]); });
    beforeEach(function () {
        given.node.addChildAtPosition(given.child, given.index);
    });
    context("with index 0", function () {
        given("index", function () { return 0; });
        test("adds at the start", function () {
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
    context("with index 1", function () {
        given("index", function () { return 1; });
        test("inserts at index 1", function () {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });
    context("with non existing index", function () {
        given("index", function () { return 99; });
        test("adds add the end", function () {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
                expect.objectContaining({ name: "new" }),
            ]);
        });
    });
});
describe("constructor", function () {
    var given = givens_1["default"]();
    given("node", function () {
        return given.params === undefined ? new node_1.Node() : new node_1.Node(given.params);
    });
    context("without parameters", function () {
        test("creates a node", function () {
            expect(given.node.name).toBe("");
            expect(given.node.id).toBeUndefined();
        });
    });
    context("with a string", function () {
        given("params", function () { return "n1"; });
        test("creates a node", function () {
            expect(given.node).toMatchObject({
                name: "n1",
                children: [],
                parent: null
            });
            expect(given.node).not.toHaveProperty("id");
        });
    });
    context("with an object with a name property", function () {
        given("params", function () { return ({
            id: 123,
            name: "n1"
        }); });
        test("creates a node", function () {
            expect(given.node).toMatchObject({
                id: 123,
                name: "n1"
            });
        });
    });
    context("when the name property is null", function () {
        given("params", function () { return ({
            name: null
        }); });
        test("sets the name to an empty string", function () {
            expect(given.node.name).toBe("");
        });
    });
    context("with an object with more properties", function () {
        given("params", function () { return ({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc"
        }); });
        test("creates a node", function () {
            expect(given.node).toMatchObject({
                color: "green",
                id: 123,
                name: "n1",
                url: "/abc"
            });
        });
    });
    context("with an object with a label property", function () {
        given("params", function () { return ({
            id: 123,
            label: "n1",
            url: "/"
        }); });
        test("creates a node", function () {
            expect(given.node).toMatchObject({
                id: 123,
                name: "n1",
                url: "/"
            });
            // todo: match object?
            expect(given.node).not.toHaveProperty("label");
            expect(given.node.children).toHaveLength(0);
            expect(given.node.parent).toBeNull();
        });
    });
    context("with an object with a parent", function () {
        given("params", function () { return ({
            name: "n1",
            parent: "abc"
        }); });
        test("doesn't set the parent", function () {
            expect(given.node.name).toBe("n1");
            expect(given.node.parent).toBeNull();
        });
    });
    context("with an object with children", function () {
        given("params", function () { return ({
            name: "n1",
            children: ["c"]
        }); });
        test("doesn't set the children", function () {
            // todo: match object?
            expect(given.node.name).toBe("n1");
            expect(given.node.children).toHaveLength(0);
        });
    });
});
describe(".loadFromData", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node(); });
    beforeEach(function () {
        given.tree.loadFromData(exampleData_1["default"]);
    });
    test("creates a tree", function () {
        expect(given.tree.children).toEqual([
            expect.objectContaining({
                id: 123,
                intProperty: 1,
                name: "node1",
                strProperty: "1",
                children: [
                    expect.objectContaining({ id: 125, name: "child1" }),
                    expect.objectContaining({ id: 126, name: "child2" }),
                ]
            }),
            expect.objectContaining({
                id: 124,
                intProperty: 3,
                name: "node2",
                strProperty: "3",
                children: [
                    expect.objectContaining({ id: 127, name: "child3" }),
                ]
            }),
        ]);
    });
});
describe(".removeChild", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.tree.getNodeByNameMustExist("child1"); });
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    beforeEach(function () {
        given.node1.removeChild(given.child1);
    });
    test("removes the child", function () {
        expect(given.node1.children).toEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
