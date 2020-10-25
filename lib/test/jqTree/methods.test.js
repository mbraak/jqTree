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
var version_1 = require("../../version");
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
describe("addNodeAfter", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("node", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("addNodeAfter", "added-node", given.node);
    });
    it("adds the node", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "added-node" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});
describe("addNodeBefore", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("node", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("addNodeBefore", "added-node", given.node);
    });
    it("adds the node", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "added-node" }),
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});
describe("addParentNode", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("child1", function () { return given.$tree.tree("getNodeByNameMustExist", "child1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("addParentNode", "new-parent-node", given.child1);
    });
    it("adds the parent node", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                children: [
                    expect.objectContaining({
                        name: "new-parent-node",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "child2" }),
                        ]
                    }),
                ]
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});
describe("addToSelection", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("child1", function () { return given.$tree.tree("getNodeByNameMustExist", "child1"); });
    given("child2", function () { return given.$tree.tree("getNodeByNameMustExist", "child2"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("addToSelection", given.child1);
        given.$tree.tree("addToSelection", given.child2);
    });
    it("selects the nodes", function () {
        expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
    });
    it("renders the nodes correctly", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                selected: false,
                children: [
                    expect.objectContaining({ name: "child1", selected: true }),
                    expect.objectContaining({ name: "child2", selected: true }),
                ]
            }),
            expect.objectContaining({
                name: "node2",
                selected: false,
                children: [
                    expect.objectContaining({
                        name: "node3",
                        selected: false
                    }),
                ]
            }),
        ]);
    });
});
describe("appendNode", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("parent", function () { return undefined; });
    given("nodeData", function () { return "appended-node"; });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("appendNode", given.nodeData, given.parent);
    });
    context("with an empty parent parameter", function () {
        it("appends the node to the tree", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-node" }),
            ]);
        });
    });
    context("when appending to a parent node", function () {
        given("parent", function () {
            return given.$tree.tree("getNodeByNameMustExist", "node1");
        });
        it("appends the node to parent node", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                        expect.objectContaining({ name: "appended-node" }),
                    ]
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
    context("when appending a node using an object", function () {
        given("nodeData", function () { return ({
            color: "green",
            id: 99,
            name: "appended-using-object"
        }); });
        it("appends the node to the tree", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1"
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-using-object" }),
            ]);
        });
        it("sets the properties of the object", function () {
            expect(given.$tree.tree("getNodeById", 99)).toMatchObject(given.nodeData);
        });
    });
});
describe("closeNode", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("closeNode", given.node1, false);
    });
    it("closes the node", function () {
        expect(given.node1.element).toBeClosed();
    });
});
describe("getNodeByCallback", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("returns the node", function () {
        var callback = function (node) { return node.name.startsWith("chi"); };
        expect(given.$tree.tree("getNodeByCallback", callback)).toMatchObject({
            name: "child1"
        });
    });
});
describe("getNodeByHtmlElement", function () {
    var given = givens_1["default"]();
    given("htmlElement", function () {
        return dom_1.screen.getByText("node1", { selector: ".jqtree-title" });
    });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("returns the node", function () {
        expect(given.$tree.tree("getNodeByHtmlElement", given.htmlElement)).toEqual(expect.objectContaining({ name: "node1" }));
    });
});
describe("getNodeById", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    it("returns the node", function () {
        expect(given.$tree.tree("getNodeById", 127)).toMatchObject({
            name: "node3"
        });
    });
    context("with a string parameter", function () {
        it("returns the node", function () {
            expect(given.$tree.tree("getNodeById", "127")).toMatchObject({
                name: "node3"
            });
        });
    });
    context("when the node doesn't exist", function () {
        it("returns undefined", function () {
            expect(given.$tree.tree("getNodeById", 99999)).toBeNull();
        });
    });
});
describe("getNodesByProperty", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    it("gets nodes by property", function () {
        expect(given.$tree.tree("getNodesByProperty", "intProperty", 1)).toEqual([given.node1]);
    });
});
describe("getSelectedNode", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: given.treeData
        });
    });
    context("when nodes have ids", function () {
        given("node", function () {
            return given.$tree.tree("getNodeByNameMustExist", "node1");
        });
        given("treeData", function () { return exampleData_1["default"]; });
        context("when no node is selected", function () {
            it("returns false", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
        context("when a node is selected", function () {
            beforeEach(function () {
                given.$tree.tree("selectNode", given.node);
            });
            it("returns the selected node", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
            });
        });
    });
    context("when nodes don't have ids", function () {
        given("node", function () {
            return given.$tree.tree("getNodeByNameMustExist", "without-id1");
        });
        given("treeData", function () { return ["without-id1", "without-id2"]; });
        context("when no node is selected", function () {
            it("returns false", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
        context("when a node is selected", function () {
            beforeEach(function () {
                given.$tree.tree("selectNode", given.node);
            });
            it("returns the selected node", function () {
                expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
            });
        });
    });
});
describe("getSelectedNodes", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.$tree.tree("getNodeByNameMustExist", "child1"); });
    given("child2", function () { return given.$tree.tree("getNodeByNameMustExist", "child2"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    context("when no node is selected", function () {
        it("returns an empty array", function () {
            expect(given.$tree.tree("getSelectedNodes")).toHaveLength(0);
        });
    });
    context("when nodes are selected", function () {
        beforeEach(function () {
            given.$tree.tree("addToSelection", given.child1);
            given.$tree.tree("addToSelection", given.child2);
        });
        it("returns the selected nodes", function () {
            expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
        });
    });
});
describe("getState", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
        given.$tree.tree("openNode", given.node1, false);
    });
    it("returns the state", function () {
        expect(given.$tree.tree("getState")).toEqual({
            open_nodes: [123],
            selected_node: []
        });
    });
});
describe("getStateFromStorage", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"],
            saveState: true
        });
        given.$tree.tree("openNode", given.node1, false);
    });
    it("returns the state", function () {
        expect(given.$tree.tree("getStateFromStorage")).toEqual({
            open_nodes: [123],
            selected_node: []
        });
    });
});
describe("getTree", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    it("returns the tree", function () {
        expect(given.$tree.tree("getTree")).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]
        });
    });
});
describe("getVersion", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree();
    });
    it("returns the version", function () {
        expect(given.$tree.tree("getVersion")).toBe(version_1["default"]);
    });
});
describe("isNodeSelected", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
    });
    context("when the node is selected", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
        });
        it("returns true", function () {
            expect(given.$tree.tree("isNodeSelected", given.node1)).toBeTrue();
        });
    });
    context("when the node is not selected", function () {
        it("returns false", function () {
            expect(given.$tree.tree("isNodeSelected", given.node1)).toBeFalse();
        });
    });
});
describe("loadData", function () {
    var given = givens_1["default"]();
    given("initialData", function () { return ["initial1"]; });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: given.initialData });
    });
    context("when the node parameter is empty", function () {
        beforeEach(function () {
            given.$tree.tree("loadData", exampleData_1["default"]);
        });
        it("replaces the whole tree", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ]
                }),
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })]
                }),
            ]);
        });
    });
    context("with a node parameter", function () {
        beforeEach(function () {
            given.$tree.tree("loadData", exampleData_1["default"], given.$tree.tree("getNodeByNameMustExist", "initial1"));
        });
        it("loads the data under the node", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "initial1",
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
                }),
            ]);
        });
    });
    context("with a node parameter which has a selected child", function () {
        given("initialData", function () { return exampleData_1["default"]; });
        beforeEach(function () {
            given.$tree.tree("selectNode", given.$tree.tree("getNodeByNameMustExist", "child1"));
        });
        it("deselects the node", function () {
            given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
            expect(given.$tree.tree("getSelectedNode")).toBeFalse();
        });
        context("when the selected node doesn't have an id", function () {
            given("initialData", function () { return [
                { name: "node1", children: ["child1", "child2"] },
                "node2",
            ]; });
            it("deselects the node", function () {
                given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
                expect(given.$tree.tree("getSelectedNode")).toBeFalse();
            });
            context("when the selected child is under another node", function () {
                it("doesn't deselect the node", function () {
                    given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node2"));
                    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                        name: "child1"
                    });
                });
            });
        });
    });
});
describe("loadDataFromUrl", function () {
    var given = givens_1["default"]();
    given("initialData", function () { return []; });
    given("serverData", function () { return exampleData_1["default"]; });
    given("$tree", function () { return $("#tree1"); });
    var server = null;
    beforeAll(function () {
        server = node_1.setupServer(msw_1.rest.get("/tree/", function (_request, response, ctx) {
            return response(ctx.status(200), ctx.json(given.serverData));
        }));
        server.listen();
    });
    afterAll(function () {
        server === null || server === void 0 ? void 0 : server.close();
    });
    beforeEach(function () {
        given.$tree.tree({ data: given.initialData });
    });
    context("with url parameter", function () {
        it("loads the tree", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        given.$tree.tree("loadDataFromUrl", "/tree/");
                        return [4 /*yield*/, dom_1.screen.findByText("node1")];
                    case 1:
                        _a.sent();
                        expect(given.$tree).toHaveTreeStructure([
                            expect.objectContaining({ name: "node1" }),
                            expect.objectContaining({ name: "node2" }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        context("with parent node", function () {
            given("initialData", function () { return ["initial1", "initial2"]; });
            given("serverData", function () { return ["new1", "new2"]; });
            it("loads a subtree", function () { return __awaiter(void 0, void 0, void 0, function () {
                var parentNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parentNode = given.$tree.tree("getNodeByNameMustExist", "initial1");
                            given.$tree.tree("loadDataFromUrl", "/tree/", parentNode);
                            return [4 /*yield*/, dom_1.screen.findByText("new1")];
                        case 1:
                            _a.sent();
                            expect(given.$tree).toHaveTreeStructure([
                                expect.objectContaining({
                                    name: "initial1",
                                    children: [
                                        expect.objectContaining({ name: "new1" }),
                                        expect.objectContaining({ name: "new2" }),
                                    ]
                                }),
                                expect.objectContaining({ name: "initial2" }),
                            ]);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    context("without url parameter", function () {
        it("loads the data from dataUrl", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        given.$tree.tree("setOption", "dataUrl", "/tree/");
                        given.$tree.tree("loadDataFromUrl");
                        return [4 /*yield*/, dom_1.screen.findByText("node1")];
                    case 1:
                        _a.sent();
                        expect(given.$tree).toHaveTreeStructure([
                            expect.objectContaining({ name: "node1" }),
                            expect.objectContaining({ name: "node2" }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe("moveDown", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
        given.$tree.tree("selectNode", given.node1);
    });
    it("selects the next node", function () {
        given.$tree.tree("moveDown");
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node2"
        });
    });
});
describe("moveNode", function () {
    var given = givens_1["default"]();
    given("child1", function () { return given.$tree.tree("getNodeByNameMustExist", "child1"); });
    given("node2", function () { return given.$tree.tree("getNodeByNameMustExist", "node2"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        given.$tree.tree("moveNode", given.child1, given.node2, "after");
    });
    it("moves node", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                children: [expect.objectContaining({ name: "child2" })]
            }),
            expect.objectContaining({ name: "node2" }),
            expect.objectContaining({ name: "child1" }),
        ]);
    });
});
describe("moveUp", function () {
    var given = givens_1["default"]();
    given("node2", function () { return given.$tree.tree("getNodeByNameMustExist", "node2"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({ data: exampleData_1["default"] });
        given.$tree.tree("selectNode", given.node2);
    });
    it("selects the next node", function () {
        given.$tree.tree("moveUp");
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node1"
        });
    });
});
describe("openNode", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: false,
            data: exampleData_1["default"]
        });
    });
    it("opens the node", function () {
        given.$tree.tree("openNode", given.node1, false);
        expect(given.node1.element).toBeOpen();
    });
    context("with onFinished parameter", function () {
        it("calls the function", function () {
            return new Promise(function (resolve) {
                return given.$tree.tree("openNode", given.node1, function (node) {
                    return resolve(expect(node).toBe(given.node1));
                });
            });
        });
    });
});
describe("prependNode", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    given("parent", function () { return undefined; });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
        given.$tree.tree("prependNode", "prepended-node", given.parent);
    });
    context("with an empty parent parameter", function () {
        it("prepends the node to the tree", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "prepended-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
    context("with a parent node", function () {
        given("parent", function () {
            return given.$tree.tree("getNodeByNameMustExist", "node1");
        });
        it("prepends the node to the parent", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "prepended-node" }),
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ]
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
});
describe("reload", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
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
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    given.$tree.tree({ dataUrl: "/tree/" });
                    return [4 /*yield*/, dom_1.screen.findByText("node1")];
                case 1:
                    _a.sent();
                    given.$tree.tree("removeNode", given.node1);
                    return [2 /*return*/];
            }
        });
    }); });
    it("reloads the data from the server", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect(given.$tree).toHaveTreeStructure([
                        expect.objectContaining({ name: "node2" }),
                    ]);
                    given.$tree.tree("reload");
                    return [4 /*yield*/, dom_1.screen.findByText("node1")];
                case 1:
                    _a.sent();
                    expect(given.$tree).toHaveTreeStructure([
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node2" }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    context("with a onFinished parameter", function () {
        it("calls onFinished", function () {
            return new Promise(function (resolve) {
                var handleFinished = function () {
                    expect(given.$tree).toHaveTreeStructure([
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node2" }),
                    ]);
                    resolve();
                };
                given.$tree.tree("reload", handleFinished);
            });
        });
    });
});
describe("removeNode", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    context("with a child node", function () {
        given("node", function () {
            return given.$tree.tree("getNodeByNameMustExist", "child1");
        });
        it("removes the node", function () {
            given.$tree.tree("removeNode", given.node);
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [expect.objectContaining({ name: "child2" })]
                }),
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })]
                }),
            ]);
        });
        context("when the node is selected", function () {
            beforeEach(function () {
                given.$tree.tree("selectNode", given.node);
            });
            it("removes and deselects the node", function () {
                given.$tree.tree("removeNode", given.node);
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });
    context("with a parent node and its children", function () {
        given("node", function () {
            return given.$tree.tree("getNodeByNameMustExist", "node1");
        });
        it("removes the node", function () {
            given.$tree.tree("removeNode", given.node);
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })]
                }),
            ]);
        });
        context("when a child node is selected", function () {
            beforeEach(function () {
                var child1 = given.$tree.tree("getNodeByNameMustExist", "child1");
                given.$tree.tree("selectNode", child1);
            });
            it("removes the node and deselects the child", function () {
                given.$tree.tree("removeNode", given.node);
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });
    context("with a root node", function () {
        given("node", function () { return given.$tree.tree("getTree"); });
        it("raises an exception", function () {
            expect(function () { return given.$tree.tree("removeNode", given.node); }).toThrow("Node has no parent");
        });
    });
});
describe("selectNode", function () {
    var given = givens_1["default"]();
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("node2", function () { return given.$tree.tree("getNodeByNameMustExist", "node2"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"],
            selectable: true
        });
    });
    context("when another node is selected", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node2);
            given.$tree.tree("selectNode", given.node1);
        });
        it("selects the node and deselects the previous node", function () {
            expect(given.node1.element).toBeSelected();
            expect(given.node2.element).notToBeSelected();
        });
    });
    context("when the node is not selected", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
        });
        it("selects the node", function () {
            expect(given.node1.element).toBeSelected();
        });
    });
    context("when the node is selected", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
        });
        it("deselects the node", function () {
            given.$tree.tree("selectNode", given.node1);
            expect(given.node1.element).notToBeSelected();
        });
    });
    context("with a null parameter", function () {
        beforeEach(function () {
            given.$tree.tree("selectNode", given.node1);
        });
        it("deselects the current node", function () {
            given.$tree.tree("selectNode", null);
            expect(given.$tree.tree("getSelectedNode")).toBeFalse();
        });
    });
});
describe("setOption", function () {
    var given = givens_1["default"]();
    beforeEach(function () {
        given.$tree.tree({
            animationSpeed: 0,
            data: exampleData_1["default"],
            selectable: false
        });
    });
    given("node1", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    it("sets an option", function () {
        given.$tree.tree("setOption", "selectable", true);
        testUtil_1.titleSpan(given.node1.element).click();
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node1"
        });
    });
});
describe("setState", function () {
    var given = givens_1["default"]();
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: false,
            data: exampleData_1["default"],
            selectable: true
        });
    });
    given("$tree", function () { return $("#tree1"); });
    it("sets the state", function () {
        given.$tree.tree("setState", {
            open_nodes: [123],
            selected_node: [123]
        });
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
        it("opens the node", function () {
            expect(given.node1.element).toBeOpen();
        });
    });
    context("when the node is open", function () {
        given("autoOpen", function () { return true; });
        it("closes the node", function () {
            expect(given.node1.element).toBeClosed();
        });
    });
});
describe("toJson", function () {
    var given = givens_1["default"]();
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            data: exampleData_1["default"]
        });
    });
    it("returns nodes as json", function () {
        expect(JSON.parse(given.$tree.tree("toJson"))).toEqual(exampleData_1["default"]);
    });
});
describe("updateNode", function () {
    var given = givens_1["default"]();
    given("isSelected", function () { return false; });
    given("node", function () { return given.$tree.tree("getNodeByNameMustExist", "node1"); });
    given("$tree", function () { return $("#tree1"); });
    beforeEach(function () {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData_1["default"]
        });
        if (given.isSelected) {
            given.$tree.tree("selectNode", given.node);
        }
        given.$tree.tree("updateNode", given.node, given.nodeData);
    });
    context("with a string", function () {
        given("nodeData", function () { return "updated-node"; });
        it("updates the name", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
    context("with an object containing a name", function () {
        given("nodeData", function () { return ({ name: "updated-node" }); });
        it("updates the name", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
    context("with an object containing an id", function () {
        given("nodeData", function () { return ({ id: 999 }); });
        it("updates the id", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(given.$tree.tree("getNodeById", 999)).toMatchObject(given.nodeData);
        });
    });
    context("with an object containing a property", function () {
        given("nodeData", function () { return ({ color: "green" }); });
        it("updates the node", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(given.$tree.tree("getNodeById", 123)).toMatchObject({
                color: "green",
                name: "node1"
            });
        });
    });
    context("with an object containing children", function () {
        context("when adding a child to a child node", function () {
            given("nodeData", function () { return ({ children: ["new-child"] }); });
            given("node", function () {
                return given.$tree.tree("getNodeByNameMustExist", "child1");
            });
            it("adds the child node", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({
                                name: "child1",
                                children: [
                                    expect.objectContaining({
                                        name: "new-child"
                                    }),
                                ]
                            }),
                            expect.objectContaining({ name: "child2" }),
                        ]
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]);
            });
        });
        context("when removing the children", function () {
            given("nodeData", function () { return ({ children: [] }); });
            it("removes the children", function () {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        nodeType: "child",
                        name: "node1"
                    }),
                    expect.objectContaining({
                        nodeType: "folder",
                        name: "node2"
                    }),
                ]);
            });
        });
    });
    context("when the node was selected", function () {
        given("isSelected", function () { return true; });
        it("keeps the node selected", function () {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
        it("keeps the focus on the node", function () {
            expect(document.activeElement).not.toBeNil();
            expect(given.$tree.tree("getNodeByHtmlElement", document.activeElement)).not.toBeNil();
        });
    });
});
