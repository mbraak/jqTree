"use strict";
exports.__esModule = true;
var $ = require("jquery");
var givens_1 = require("givens");
require("../tree.jquery");
var exampleData_1 = require("./support/exampleData");
var context = describe;
beforeEach(function () {
    $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
    var $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});
describe("create with data", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    test("creates a tree", function () {
        expect(given.$tree).toHaveTreeStructure([
            {
                name: "node1",
                open: false,
                children: ["child1", "child2"]
            },
            { name: "node2", open: false, children: ["child3"] },
        ]);
    });
});
describe("options", function () {
    describe("showEmptyFolder", function () {
        context("when children attribute is an empty array", function () {
            var given = givens_1["default"]();
            given("$tree", function () { return $("#tree1"); });
            beforeEach(function () {
                given.$tree.tree({
                    data: [{ name: "parent1", children: [] }],
                    showEmptyFolder: given.showEmptyFolder
                });
            });
            context("with showEmptyFolder false", function () {
                given("showEmptyFolder", function () { return false; });
                test("creates a child node", function () {
                    expect(given.$tree).toHaveTreeStructure(["parent1"]);
                });
            });
            context("with showEmptyFolder true", function () {
                given("showEmptyFolder", function () { return true; });
                test("creates a folder", function () {
                    expect(given.$tree).toHaveTreeStructure([
                        { name: "parent1", children: [], open: false },
                    ]);
                });
            });
        });
    });
});
describe("toggle", function () {
    var given = givens_1["default"]();
    given("autoOpen", function () { return false; });
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: exampleData_1["default"]
        });
        given.$tree.tree("toggle", given.node1, false);
    });
    context("when the node is closed", function () {
        test("opens the node", function () {
            expect(given.node1.element).toBeOpen();
        });
    });
    context("when the node is open", function () {
        given("autoOpen", function () { return true; });
        test("closes the node", function () {
            expect(given.node1.element).toBeClosed();
        });
    });
});
describe("events", function () {
    describe("tree.click", function () {
        var given = givens_1["default"]();
        given("$tree", function () { return $("#tree1"); });
        given("node1", function () {
            return given.$tree.tree("getNodeByNameMustExist", "node1");
        });
        beforeEach(function () {
            given.$tree.tree({
                data: exampleData_1["default"]
            });
        });
        context("when a node is clicked", function () {
            test("it is fired", function (done) {
                given.$tree.on("tree.click", function (e) {
                    var treeClickEvent = e;
                    expect(treeClickEvent.node).toBe(given.node1);
                    done();
                });
                jQuery(given.node1.element).find("span:first").click();
            });
        });
    });
});
