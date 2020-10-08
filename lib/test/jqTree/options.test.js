"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var $ = require("jquery");
var givens_1 = require("givens");
var dom_1 = require("@testing-library/dom");
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
    localStorage.clear();
});
describe("autoEscape", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoEscape: given.autoEscape,
            data: ["<span>test</span>"]
        });
    });
    context("with autoEscape true", function () {
        given("autoEscape", function () { return true; });
        it("escapes the node name", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "&lt;span&gt;test&lt;/span&gt;"
                }),
            ]);
        });
    });
    context("with autoEscape false", function () {
        given("autoEscape", function () { return false; });
        it("doesn't escape the node name", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "<span>test</span>"
                }),
            ]);
        });
    });
});
describe("autoOpen", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: exampleData_1["default"]
        });
    });
    context("with autoOpen false", function () {
        given("autoOpen", function () { return false; });
        it("doesn't open any nodes", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: false }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
        });
    });
    context("with autoOpen true", function () {
        given("autoOpen", function () { return true; });
        it("opens all nodes", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ]
                }),
            ]);
        });
    });
    context("with autoOpen 0", function () {
        given("autoOpen", function () { return 0; });
        it("opens level 0", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: false }),
                    ]
                }),
            ]);
        });
    });
    context("with autoOpen 1", function () {
        given("autoOpen", function () { return 1; });
        it("opens levels 1", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ]
                }),
            ]);
        });
    });
    context("with autoOpen '1'", function () {
        given("autoOpen", function () { return "1"; });
        it("opens levels 1", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ]
                }),
            ]);
        });
    });
});
describe("dataUrl", function () {
    var exampleStructure = [
        expect.objectContaining({ name: "node1" }),
        expect.objectContaining({ name: "node2" }),
    ];
    var testCases = [
        {
            name: "string",
            dataUrl: "/tree/",
            expectedNode: "node1",
            expectedStructure: exampleStructure
        },
        {
            name: "object with url and headers",
            dataUrl: {
                url: "/tree/",
                headers: { node: "test-node" }
            },
            expectedNode: "test-node",
            expectedStructure: [expect.objectContaining({ name: "test-node" })]
        },
        {
            name: "function",
            dataUrl: function () { return ({ url: "/tree/" }); },
            expectedNode: "node1",
            expectedStructure: exampleStructure
        },
    ];
    var server = null;
    beforeAll(function () {
        server = node_1.setupServer(msw_1.rest.get("/tree/", function (request, response, ctx) {
            var nodeName = request.headers.get("node");
            var data = nodeName ? [nodeName] : exampleData_1["default"];
            return response(ctx.status(200), ctx.json(data));
        }));
        server.listen();
    });
    afterAll(function () {
        server === null || server === void 0 ? void 0 : server.close();
    });
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    testCases.forEach(function (_a) {
        var dataUrl = _a.dataUrl, expectedNode = _a.expectedNode, expectedStructure = _a.expectedStructure, name = _a.name;
        context("with " + name, function () {
            it("loads the data from the url", function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            given.$tree.tree({ dataUrl: dataUrl });
                            return [4 /*yield*/, dom_1.screen.findByText(expectedNode)];
                        case 1:
                            _a.sent();
                            expect(given.$tree).toHaveTreeStructure(expectedStructure);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
describe("onCanSelectNode", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"],
            onCanSelectNode: function (node) { return node.name !== "node1"; }
        });
    });
    it("doesn't select the node", function () {
        given.$tree.tree("selectNode", given.node1);
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
    });
});
describe("onCreateLi", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"],
            onCreateLi: function (node, el) {
                testUtil_1.titleSpan(el).text("_" + node.name + "_");
            }
        });
    });
    it("is called when creating a node", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "_node1_" }),
            expect.objectContaining({ name: "_node2_" }),
        ]);
    });
});
describe("onGetStateFromStorage and onSetStateFromStorage", function () {
    var savedState = "";
    var setState = function (state) {
        savedState = state;
    };
    var getState = function () { return savedState; };
    var given = givens_1["default"]();
    given("initialState", function () { return ""; });
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        savedState = given.initialState;
        given.$tree.tree({
            autoOpen: false,
            data: exampleData_1["default"],
            onGetStateFromStorage: getState,
            onSetStateFromStorage: setState,
            saveState: true
        });
    });
    context("with an open and a selected node", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("openNode", given.node1);
        });
        it("saves the state", function () {
            expect(JSON.parse(savedState)).toEqual({
                open_nodes: [123],
                selected_node: [123]
            });
        });
    });
    context("with a saved state", function () {
        given("initialState", function () {
            return JSON.stringify({
                open_nodes: [123],
                selected_node: [123]
            });
        });
        it("restores the state", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true
                }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
            expect(given.node1.element).toBeSelected();
        });
    });
});
describe("onLoadFailed", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    context("when the loading fails", function () {
        var server = null;
        beforeAll(function () {
            server = node_1.setupServer(msw_1.rest.get("/tree/", function (_request, response, ctx) {
                return response(ctx.status(500), ctx.body("Internal server error"));
            }));
            server.listen();
        });
        afterAll(function () {
            server === null || server === void 0 ? void 0 : server.close();
        });
        it("calls onLoadFailed", function () {
            return new Promise(function (done) {
                given.$tree.tree({
                    dataUrl: "/tree/",
                    onLoadFailed: function (jqXHR) {
                        expect(jqXHR.status).toBe(500);
                        done();
                    }
                });
            });
        });
    });
});
describe("rtl", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    context("with the rtl option is true", function () {
        beforeEach(function () {
            given.$tree.tree({ data: exampleData_1["default"], rtl: true });
        });
        it("has a different closed icon", function () {
            expect(testUtil_1.togglerLink(given.node1.element).text()).toEqual("◀");
        });
    });
    context("with the rtl data option", function () {
        beforeEach(function () {
            given.$tree.attr("data-rtl", "true");
            given.$tree.tree({ data: exampleData_1["default"] });
        });
        it("has a different closed icon", function () {
            expect(testUtil_1.togglerLink(given.node1.element).text()).toEqual("◀");
        });
    });
});
describe("saveState", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    context("when a node is open and selected", function () {
        beforeEach(function () {
            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData_1["default"],
                saveState: given.saveState
            });
            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("openNode", given.node1);
        });
        context("when saveState is true", function () {
            given("saveState", function () { return true; });
            it("saves the state to local storage", function () {
                expect(localStorage.getItem("tree")).toEqual('{"open_nodes":[123],"selected_node":[123]}');
            });
        });
        context("when saveState is a string", function () {
            given("saveState", function () { return "my-state"; });
            it("uses the string as a key", function () {
                expect(localStorage.getItem("my-state")).toEqual('{"open_nodes":[123],"selected_node":[123]}');
            });
        });
        context("when saveState is false", function () {
            given("saveState", function () { return false; });
            it("doesn't save to local storage", function () {
                expect(localStorage.getItem("tree")).toBeNull();
            });
        });
    });
    context("when there is a state in the local storage", function () {
        given("saveState", function () { return true; });
        beforeEach(function () {
            localStorage.setItem("tree", '{"open_nodes":[123],"selected_node":[123]}');
            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData_1["default"],
                saveState: given.saveState
            });
        });
        it("restores the state", function () {
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
});
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
            it("creates a child node", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "parent1" }),
                ]);
            });
        });
        context("with showEmptyFolder true", function () {
            given("showEmptyFolder", function () { return true; });
            it("creates a folder", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "parent1", children: [] }),
                ]);
            });
        });
    });
});
