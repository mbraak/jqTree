"use strict";
exports.__esModule = true;
var $ = require("jquery");
var givens_1 = require("givens");
require("../../tree.jquery");
var exampleData_1 = require("../support/exampleData");
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
    it("creates a tree", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                open: false,
                selected: false,
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ]
            }),
            expect.objectContaining({
                name: "node2",
                open: false,
                selected: false,
                children: [
                    expect.objectContaining({
                        name: "node3",
                        open: false,
                        children: [expect.objectContaining({ name: "child3" })]
                    }),
                ]
            }),
        ]);
    });
});
