"use strict";
exports.__esModule = true;
var givens_1 = require("givens");
var node_1 = require("../node");
var exampleData_1 = require("./support/exampleData");
require("jest-extended");
var context = describe;
describe("addAfter", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("when moving after node1", function () {
        it("returns the new node", function () {
            expect(given.node1.addAfter("new node")).toMatchObject({
                name: "new node"
            });
        });
        it("adds after the node", function () {
            given.node1.addAfter("new node");
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "new node" }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
    context("when moving after the root node", function () {
        it("returns null", function () {
            expect(given.tree.addAfter("new node")).toBeNull();
        });
        it("doesn't add anything", function () {
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
    context("when adding a node with children", function () {
        it("adds the children", function () {
            given.node1.addAfter({
                name: "new node",
                children: ["newchild1", "newchild2"]
            });
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ]
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
});
describe("addBefore", function () {
    var given = givens_1["default"]();
    given("node2", function () { return given.tree.getNodeByNameMustExist("node2"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    it("returns the new node", function () {
        expect(given.node2.addBefore("new node")).toMatchObject({
            name: "new node"
        });
    });
    it("adds before the node", function () {
        given.node2.addBefore("new node");
        expect(given.tree).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "new node" }),
                expect.objectContaining({ name: "node2" }),
            ]
        });
    });
    context("with a root node", function () {
        it("returns null", function () {
            expect(given.tree.addBefore("new node")).toBeNull();
        });
        it("does nothing", function () {
            given.tree.addBefore("new node");
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
    context("when adding a node with children", function () {
        it("adds the children", function () {
            given.node2.addBefore({
                name: "new node",
                children: ["newchild1", "newchild2"]
            });
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ]
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
});
describe("addChild", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node(); });
    beforeEach(function () {
        given.node.addChild(new node_1.Node({ id: 100, name: "child1" }));
    });
    it("adds the child", function () {
        expect(given.node.children).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 100, name: "child1" }),
        ]));
    });
    it("sets the parent of the child", function () {
        expect(given.node.children[0].parent).toEqual(given.node);
    });
});
describe("addChildAtPosition", function () {
    var given = givens_1["default"]();
    given("child", function () { return new node_1.Node("new"); });
    given("node", function () { return new node_1.Node("new").loadFromData(["child1", "child2"]); });
    beforeEach(function () {
        given.node.addChildAtPosition(given.child, given.index);
    });
    context("with index 0", function () {
        given("index", function () { return 0; });
        it("adds at the start", function () {
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
        it("inserts at index 1", function () {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "new" }),
                expect.objectContaining({ name: "child2" }),
            ]);
        });
    });
    context("with non existing index", function () {
        given("index", function () { return 99; });
        it("adds add the end", function () {
            expect(given.node.children).toEqual([
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
                expect.objectContaining({ name: "new" }),
            ]);
        });
    });
});
describe("addParent", function () {
    var given = givens_1["default"]();
    given("node1", function () { return new node_1.Node("node1"); });
    given("tree", function () { return new node_1.Node({}, true); });
    beforeEach(function () {
        given.tree.addChild(given.node1);
        given.node1.append("child1");
    });
    it("adds a parent node", function () {
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
                            ]
                        }),
                    ]
                }),
            ]
        });
    });
    it("returns the new node", function () {
        expect(given.node1.addParent("parent1")).toMatchObject({
            name: "parent1"
        });
    });
    context("with a root node", function () {
        it("returns null", function () {
            expect(given.tree.addParent("parent1")).toBeNull();
        });
    });
});
describe("append", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node("node1"); });
    it("appends a node", function () {
        given.node.append("child1");
        given.node.append("child2");
        expect(given.node).toMatchObject({
            name: "node1",
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]
        });
    });
    it("returns the new node", function () {
        expect(given.node.append("child1")).toMatchObject({ name: "child1" });
    });
    context("when adding a node with children", function () {
        it("adds the children", function () {
            given.node.append({
                name: "new node",
                children: ["newchild1", "newchild2"]
            });
            expect(given.node).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ]
                    }),
                ]
            });
        });
    });
});
describe("constructor", function () {
    var given = givens_1["default"]();
    given("node", function () {
        return given.params === undefined ? new node_1.Node() : new node_1.Node(given.params);
    });
    context("without parameters", function () {
        it("creates a node", function () {
            expect(given.node.name).toBe("");
            expect(given.node.id).toBeUndefined();
        });
    });
    context("with a string", function () {
        given("params", function () { return "n1"; });
        it("creates a node", function () {
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
        it("creates a node", function () {
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
        it("sets the name to an empty string", function () {
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
        it("creates a node", function () {
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
        it("creates a node", function () {
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
        it("doesn't set the parent", function () {
            expect(given.node.name).toBe("n1");
            expect(given.node.parent).toBeNull();
        });
    });
    context("with an object with children", function () {
        given("params", function () { return ({
            name: "n1",
            children: ["c"]
        }); });
        it("doesn't set the children", function () {
            // todo: match object?
            expect(given.node.name).toBe("n1");
            expect(given.node.children).toHaveLength(0);
        });
    });
});
describe("getChildIndex", function () {
    var given = givens_1["default"]();
    given("child2", function () { return new node_1.Node("child2"); });
    given("node", function () { return new node_1.Node(); });
    beforeEach(function () {
        given.node.addChild(new node_1.Node("child1"));
        given.node.addChild(given.child2);
        given.node.addChild(new node_1.Node("child3"));
    });
    context("when a child exists", function () {
        it("returns the index", function () {
            expect(given.node.getChildIndex(given.child2)).toBe(1);
        });
    });
    context("when a child doesn't exist", function () {
        it("returns -1", function () {
            var nonExistingChild = new node_1.Node("non-existing");
            expect(given.node.getChildIndex(nonExistingChild)).toBe(-1);
        });
    });
});
describe("getData", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    it("returns the tree data", function () {
        expect(given.tree.getData()).toEqual([
            expect.objectContaining({
                name: "node1",
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ]
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
    it("doesn't include internal attributes", function () {
        expect(given.tree.getData()[0]).not.toContainAnyKeys([
            "element",
            "isEmptyFolder",
            "parent",
        ]);
    });
    context("with includeParent parameter", function () {
        it("returns the tree data including the node itself", function () {
            expect(given.tree.getData(true)).toEqual([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node2" }),
                    ]
                }),
            ]);
        });
    });
});
describe("getLastChild", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node(); });
    context("when a node has no children", function () {
        it("returns null", function () {
            expect(given.node.getLastChild()).toBeNull();
        });
    });
    context("when a node has children", function () {
        beforeEach(function () {
            given.node.append("child1");
            given.node.append("child2");
        });
        it("returns the last child", function () {
            expect(given.node.getLastChild()).toMatchObject({ name: "child2" });
        });
        context("when its last child is open and has children", function () {
            beforeEach(function () {
                var child2 = given.node.children[1];
                child2.append("child2a");
                child2.append("child2b");
            });
            context("and the last child is open", function () {
                beforeEach(function () {
                    var child2 = given.node.children[1];
                    child2.is_open = true;
                });
                it("returns the last child of that child", function () {
                    expect(given.node.getLastChild()).toMatchObject({
                        name: "child2b"
                    });
                });
            });
            context("and the last child is closed", function () {
                it("returns the last child", function () {
                    expect(given.node.getLastChild()).toMatchObject({
                        name: "child2"
                    });
                });
            });
        });
    });
});
describe("getNextNode", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    given("nextNode", function () { return given.fromNode.getNextNode(given.includeChildren); });
    context("with includeChildren is true", function () {
        given("includeChildren", function () { return true; });
        context("with a parent node", function () {
            given("fromNode", function () { return given.tree.getNodeByNameMustExist("node1"); });
            context("when the parent node is closed", function () {
                it("returns the next sibling", function () {
                    expect(given.nextNode).toMatchObject({ name: "node2" });
                });
            });
            context("when the parent node is open", function () {
                beforeEach(function () {
                    given.fromNode.is_open = true;
                });
                it("returns the first child", function () {
                    expect(given.nextNode).toMatchObject({ name: "child1" });
                });
            });
        });
        context("with the node is the last child", function () {
            given("fromNode", function () {
                return given.tree.getNodeByNameMustExist("child2");
            });
            it("returns the next sibling of the parent", function () {
                expect(given.nextNode).toMatchObject({ name: "node2" });
            });
        });
    });
    context("with includeChildren is false", function () {
        given("includeChildren", function () { return false; });
        context("with an open parent node", function () {
            given("fromNode", function () { return given.tree.getNodeByNameMustExist("node1"); });
            beforeEach(function () {
                given.fromNode.is_open = true;
            });
            it("returns the next sibling", function () {
                expect(given.nextNode).toMatchObject({ name: "node2" });
            });
        });
    });
});
describe("getNextSibling", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("node2", function () { return given.tree.getNodeByNameMustExist("node2"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("with a tree", function () {
        it("returns null", function () {
            expect(given.tree.getNextSibling()).toBeNull();
        });
    });
    context("when the node is the last child", function () {
        it("returns null", function () {
            expect(given.node2.getNextSibling()).toBeNull();
        });
    });
    context("when the node is the first child", function () {
        it("returns the second child", function () {
            expect(given.node1.getNextSibling()).toBe(given.node2);
        });
    });
});
describe("getNodeByCallback", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("when a matching node exists", function () {
        it("returns the node", function () {
            expect(given.tree.getNodeByCallback(function (node) {
                return node.name.startsWith("chi");
            })).toMatchObject({
                name: "child1"
            });
        });
    });
    context("when no matching node exists", function () {
        it("returns null", function () {
            expect(given.tree.getNodeByCallback(function () { return false; })).toBeNull();
        });
    });
});
describe("getNodeByName", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("when the node exists", function () {
        it("returns the node", function () {
            expect(given.tree.getNodeByName("child1")).toMatchObject({
                id: 125,
                name: "child1"
            });
        });
    });
    context("when the node doesn't exist", function () {
        it("returns null", function () {
            expect(given.tree.getNodeByName("non-existing")).toBeNull();
        });
    });
});
describe("getNodeByNameMustExist", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("when the node exists", function () {
        it("returns the node", function () {
            expect(given.tree.getNodeByNameMustExist("child1")).toMatchObject({
                id: 125,
                name: "child1"
            });
        });
    });
    context("when the node doesn't exist", function () {
        it("throws an exception", function () {
            expect(function () {
                return given.tree.getNodeByNameMustExist("non-existing");
            }).toThrow("Node with name non-existing not found");
        });
    });
});
describe("getParent", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.tree.getNodeByNameMustExist("child1"); });
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("with a tree", function () {
        it("returns null", function () {
            expect(given.tree.getParent()).toBeNull();
        });
    });
    context("with a node on the first level", function () {
        it("returns null", function () {
            expect(given.node1.getParent()).toBeNull();
        });
    });
    context("with a node on the second level", function () {
        it("returns the parent", function () {
            expect(given.child1.getParent()).toMatchObject({
                name: "node1"
            });
        });
    });
});
describe("getPreviousNode", function () {
    var given = givens_1["default"]();
    given("node2", function () { return given.tree.getNodeByNameMustExist("node2"); });
    given("node3", function () { return given.tree.getNodeByNameMustExist("node3"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("with a tree", function () {
        it("returns null", function () {
            expect(given.tree.getPreviousNode()).toBeNull();
        });
    });
    context("when the previous sibling has children", function () {
        context("when the previous node is closed", function () {
            it("returns the previous sibling", function () {
                expect(given.node2.getPreviousNode()).toMatchObject({
                    name: "node1"
                });
            });
        });
        context("when the previous node is open", function () {
            beforeEach(function () {
                given.tree.getNodeByNameMustExist("node1").is_open = true;
            });
            it("returns the last child of the previous sibling", function () {
                expect(given.node2.getPreviousNode()).toMatchObject({
                    name: "child2"
                });
            });
        });
    });
    context("with a node that is the first child", function () {
        it("returns the parent", function () {
            expect(given.node3.getPreviousNode()).toMatchObject({
                name: "node2"
            });
        });
    });
});
describe("getPreviousSibling", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("node2", function () { return given.tree.getNodeByNameMustExist("node2"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("with a tree", function () {
        it("returns null", function () {
            expect(given.tree.getPreviousSibling()).toBeNull();
        });
    });
    context("when the node is the first child", function () {
        it("returns null", function () {
            expect(given.node1.getPreviousSibling()).toBeNull();
        });
    });
    context("when the node is the second child", function () {
        it("returns the first child", function () {
            expect(given.node2.getPreviousSibling()).toBe(given.node1);
        });
    });
});
describe("hasChildren", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node(); });
    context("when a node has children", function () {
        beforeEach(function () {
            given.node.addChild(new node_1.Node("child1"));
        });
        it("returns true", function () {
            expect(given.node.hasChildren()).toEqual(true);
        });
    });
    context("when a node doesn't have children", function () {
        it("returns false", function () {
            expect(given.node.hasChildren()).toEqual(false);
        });
    });
});
describe("initFromData", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node(); });
    beforeEach(function () {
        given.tree.initFromData({
            name: "node1",
            id: 1,
            children: [
                { name: "child1", id: 2 },
                { name: "child2", id: 3 },
            ]
        });
    });
    it("loads the data", function () {
        expect(given.tree).toMatchObject({
            id: 1,
            name: "node1",
            children: [
                expect.objectContaining({ id: 2, name: "child1" }),
                expect.objectContaining({ id: 3, name: "child2" }),
            ]
        });
    });
});
describe("isFolder", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node(); });
    context("when the node has no children", function () {
        it("returns false", function () {
            expect(given.node.isFolder()).toBe(false);
        });
        context("when the node is loaded on demand", function () {
            beforeEach(function () {
                given.node.load_on_demand = true;
            });
            it("returns false", function () {
                expect(given.node.isFolder()).toBe(true);
            });
        });
    });
    context("when the node has a child", function () {
        beforeEach(function () {
            given.node.append("child1");
        });
        it("returns false", function () {
            expect(given.node.isFolder()).toBe(true);
        });
    });
});
describe("iterate", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    given("visited", function () { return []; });
    beforeEach(function () {
        given.tree.iterate(given.visitor);
    });
    context("when the visitor function returns true", function () {
        var visitAllNodes = function (node, level) {
            given.visited.push([node.name, level]);
            return true;
        };
        given("visitor", function () { return visitAllNodes; });
        it("visits all nodes", function () {
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
    context("when the visitor function returns false", function () {
        var visitNodes = function (node, level) {
            given.visited.push([node.name, level]);
            return false;
        };
        given("visitor", function () { return visitNodes; });
        it("stops the iteration for the current node", function () {
            expect(given.visited).toEqual([
                ["node1", 0],
                ["node2", 0],
            ]);
        });
    });
});
describe("loadFromData", function () {
    var given = givens_1["default"]();
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    it("creates a tree", function () {
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
                children: [expect.objectContaining({ id: 127, name: "node3" })]
            }),
        ]);
    });
});
describe("moveNode", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.tree.getNodeByNameMustExist("child1"); });
    given("child2", function () { return given.tree.getNodeByNameMustExist("child2"); });
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("node2", function () { return given.tree.getNodeByNameMustExist("node2"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    context("when moving after a node", function () {
        it("moves the node", function () {
            expect(given.tree.moveNode(given.child2, given.node2, node_1.Position.After)).toBe(true);
            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [expect.objectContaining({ name: "child1" })]
                    }),
                    expect.objectContaining({ name: "node2" }),
                    expect.objectContaining({ name: "child2" }),
                ]
            });
        });
        context("when the target is the root node", function () {
            it("returns false", function () {
                expect(given.tree.moveNode(given.child2, given.tree, node_1.Position.After)).toBe(false);
            });
        });
    });
    context("when moving inside a node", function () {
        it("moves the node", function () {
            expect(given.tree.moveNode(given.child1, given.node2, node_1.Position.Inside)).toBe(true);
            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [expect.objectContaining({ name: "child2" })]
                    }),
                    expect.objectContaining({
                        name: "node2",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "node3" }),
                        ]
                    }),
                ]
            });
        });
    });
    context("when moving before a node", function () {
        it("moves the node", function () {
            expect(given.tree.moveNode(given.child2, given.child1, node_1.Position.Before)).toBe(true);
            expect(given.tree).toMatchObject({
                name: "",
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({ name: "child2" }),
                            expect.objectContaining({ name: "child1" }),
                        ]
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
        context("when the target is the root node", function () {
            it("returns false", function () {
                expect(given.tree.moveNode(given.child2, given.tree, node_1.Position.Before)).toBe(false);
            });
        });
    });
    context("when the moved node is a parent of the target node", function () {
        it("doesn't move the node", function () {
            expect(given.tree.moveNode(given.node1, given.child1, node_1.Position.Before)).toBe(false);
            expect(given.tree).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "child2" }),
                        ]
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]
            });
        });
    });
    context("with position None", function () {
        it("returns false", function () {
            expect(given.tree.moveNode(given.child2, given.node2, node_1.Position.None)).toBe(false);
        });
    });
});
describe("prepend", function () {
    var given = givens_1["default"]();
    given("node", function () { return new node_1.Node("node1"); });
    it("prepends a node", function () {
        given.node.prepend("child2");
        given.node.prepend("child1");
        expect(given.node).toMatchObject({
            name: "node1",
            children: [
                expect.objectContaining({ name: "child1" }),
                expect.objectContaining({ name: "child2" }),
            ]
        });
    });
    context("when prepending a node with children", function () {
        it("adds the children", function () {
            given.node.prepend({
                name: "new node",
                children: ["newchild1", "newchild2"]
            });
            expect(given.node).toMatchObject({
                children: [
                    expect.objectContaining({
                        name: "new node",
                        children: [
                            expect.objectContaining({ name: "newchild1" }),
                            expect.objectContaining({ name: "newchild2" }),
                        ]
                    }),
                ]
            });
        });
    });
});
describe("remove", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.tree.getNodeByNameMustExist("child1"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    beforeEach(function () {
        given.child1.remove();
    });
    it("removes the node", function () {
        expect(given.tree).toMatchObject({
            children: [
                expect.objectContaining({
                    name: "node1",
                    children: [expect.objectContaining({ name: "child2" })]
                }),
                expect.objectContaining({ name: "node2" }),
            ]
        });
    });
});
describe("removeChild", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.tree.getNodeByNameMustExist("child1"); });
    given("node1", function () { return given.tree.getNodeByNameMustExist("node1"); });
    given("tree", function () { return new node_1.Node().loadFromData(exampleData_1["default"]); });
    beforeEach(function () {
        given.node1.removeChild(given.child1);
    });
    it("removes the child", function () {
        expect(given.node1.children).toEqual([
            expect.objectContaining({ name: "child2" }),
        ]);
    });
});
