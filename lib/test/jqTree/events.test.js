"use strict";
exports.__esModule = true;
var $ = require("jquery");
var givens_1 = require("givens");
var msw_1 = require("msw");
var node_1 = require("msw/node");
require("../../tree.jquery");
var exampleData_1 = require("../support/exampleData");
var testUtil_1 = require("../support/testUtil");
var context = describe;
beforeEach(function () {
    $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
    var $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});
describe("tree.click", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("titleSpan", function () { return testUtil_1.titleSpan(given.node1.element); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("fires tree.click", function () {
        return new Promise(function (done) {
            given.$tree.on("tree.click", function (e) {
                var treeClickEvent = e;
                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });
            given.titleSpan.click();
        });
    });
});
describe("tree.contextmenu", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("titleSpan", function () { return testUtil_1.titleSpan(given.node1.element); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("fires tree.contextmenu", function () {
        return new Promise(function (done) {
            given.$tree.on("tree.contextmenu", function (e) {
                var treeClickEvent = e;
                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });
            given.titleSpan.contextmenu();
        });
    });
});
describe("tree.dblclick", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("titleSpan", function () { return testUtil_1.titleSpan(given.node1.element); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("fires tree.dblclick", function () {
        return new Promise(function (done) {
            given.$tree.on("tree.dblclick", function (e) {
                var treeClickEvent = e;
                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });
            given.titleSpan.dblclick();
        });
    });
});
describe("tree.init", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    context("with json data", function () {
        it("is called", function () {
            return new Promise(function (done) {
                given.$tree.on("tree.init", function () {
                    expect(given.$tree.tree("getNodeByName", "node2")).toMatchObject({
                        id: 124,
                        name: "node2"
                    });
                    done();
                });
                given.$tree.tree({
                    data: exampleData_1["default"]
                });
            });
        });
    });
    context("with data loaded from an url", function () {
        var server = null;
        beforeAll(function () {
            server = node_1.setupServer(msw_1.rest.get("/tree/", function (_request, response, ctx) {
                return response(ctx.status(200), ctx.json(exampleData_1["default"]));
            }));
            server.listen();
        });
        afterAll(function () {
            server === null || server === void 0 ? void 0 : server.close();
        });
        it("is called", function () {
            return new Promise(function (done) {
                given.$tree.on("tree.init", function () {
                    expect(given.$tree.tree("getNodeByName", "node2")).toMatchObject({
                        id: 124,
                        name: "node2"
                    });
                    done();
                });
                given.$tree.tree({ dataUrl: "/tree/" });
            });
        });
    });
});
describe("tree.load_data", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    context("when the tree is initialized with data", function () {
        it("fires tree.load_data", function () {
            return new Promise(function (resolve) {
                given.$tree.on("tree.load_data", function (e) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    expect(e.tree_data).toEqual(exampleData_1["default"]);
                    resolve();
                });
                given.$tree.tree({ data: exampleData_1["default"] });
            });
        });
    });
});
describe("tree.select", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("titleSpan", function () { return testUtil_1.titleSpan(given.node1.element); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    it("fires tree.click", function () {
        return new Promise(function (done) {
            given.$tree.on("tree.select", function (e) {
                var treeClickEvent = e;
                expect(treeClickEvent.node).toBe(given.node1);
                expect(treeClickEvent.deselected_node).toBeNull();
                done();
            });
            given.titleSpan.click();
        });
    });
    context("when the node was selected", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
        });
        it("fires tree.select with node is null", function () {
            return new Promise(function (done) {
                given.$tree.on("tree.select", function (e) {
                    var treeClickEvent = e;
                    expect(treeClickEvent.node).toBeNull();
                    expect(treeClickEvent.previous_node).toBe(given.node1);
                    done();
                });
                given.titleSpan.click();
            });
        });
    });
});
