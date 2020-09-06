"use strict";
exports.__esModule = true;
var $ = require("jquery");
var givens_1 = require("givens");
require("../../tree.jquery");
var exampleData_1 = require("../support/exampleData");
var context = describe;
beforeEach(function () {
    $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
    var $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});
describe("keyboard support", function () {
    var KEY_DOWN = 40;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_UP = 38;
    var KEY_PAGE_UP = 33;
    var given = givens_1["default"]();
    given("autoOpen", function () { return false; });
    given("initialSelectedNode", function () { return null; });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            animationSpeed: 0,
            autoOpen: given.autoOpen,
            data: exampleData_1["default"]
        });
        if (given.initialSelectedNode) {
            given.$tree.tree("selectNode", given.initialSelectedNode);
        }
        given.$tree.trigger($.Event("keydown", { which: given.pressedKey }));
    });
    context("with key down", function () {
        given("pressedKey", function () { return KEY_DOWN; });
        context("when a node is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node1");
            });
            it("selects the next node", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "node1", selected: false }),
                    expect.objectContaining({ name: "node2", selected: true }),
                ]);
            });
        });
        context("when no node is selected", function () {
            it("does nothing", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
        context("when the last node is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node2");
            });
            it("keeps the node selected", function () {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "node2"
                });
            });
        });
    });
    context("with key up", function () {
        given("pressedKey", function () { return KEY_UP; });
        context("when a node is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node2");
            });
            it("selects the next node", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "node1", selected: true }),
                    expect.objectContaining({ name: "node2", selected: false }),
                ]);
            });
        });
        context("when no node is selected", function () {
            it("does nothing", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });
    context("with key right", function () {
        given("pressedKey", function () { return KEY_RIGHT; });
        context("when a closed folder is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node1");
            });
            it("opens the folder", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        open: true,
                        selected: true
                    }),
                    expect.objectContaining({
                        name: "node2",
                        open: false,
                        selected: false
                    }),
                ]);
            });
        });
        context("when an open folder is selected", function () {
            given("autoOpen", function () { return true; });
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node1");
            });
            it("selects the first child", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        open: true,
                        selected: false,
                        children: [
                            expect.objectContaining({
                                name: "child1",
                                selected: true
                            }),
                            expect.objectContaining({
                                name: "child2",
                                selected: false
                            }),
                        ]
                    }),
                    expect.objectContaining({
                        name: "node2",
                        selected: false
                    }),
                ]);
            });
        });
        context("when no node is selected", function () {
            it("does nothing", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
        context("when a child is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "child1");
            });
            it("does nothing", function () {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "child1"
                });
            });
        });
    });
    context("with key left", function () {
        given("pressedKey", function () { return KEY_LEFT; });
        context("when a closed folder is selected", function () {
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node3");
            });
            it("selects the previous node", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        selected: false
                    }),
                    expect.objectContaining({
                        name: "node2",
                        selected: true,
                        children: [
                            expect.objectContaining({
                                name: "node3",
                                open: false,
                                selected: false
                            }),
                        ]
                    }),
                ]);
            });
        });
        context("when an open folder is selected", function () {
            given("autoOpen", function () { return true; });
            given("initialSelectedNode", function () {
                return given.$tree.tree("getNodeByNameMustExist", "node2");
            });
            it("closes the folder", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        open: true,
                        selected: false
                    }),
                    expect.objectContaining({
                        name: "node2",
                        open: false,
                        selected: true
                    }),
                ]);
            });
        });
        context("when no node is selected", function () {
            it("does nothing", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });
    context("with page up key", function () {
        given("pressedKey", function () { return KEY_PAGE_UP; });
        given("initialSelectedNode", function () {
            return given.$tree.tree("getNodeByNameMustExist", "child1");
        });
        it("does nothing", function () {
            expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                name: "child1"
            });
        });
    });
});
