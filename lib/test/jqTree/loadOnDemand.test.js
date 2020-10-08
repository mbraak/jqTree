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
context("when a node has load_on_demand in the data", function () {
    var given = givens_1["default"]();
    given("autoOpen", function () { return false; });
    given("$tree", function () { return $("#tree1"); });
    var initialData = [
        {
            id: 1,
            name: "parent-node",
            load_on_demand: true
        },
    ];
    var server = null;
    beforeAll(function () {
        server = node_1.setupServer(msw_1.rest.get("/tree/", function (request, response, ctx) {
            var parentId = request.url.searchParams.get("node");
            if (parentId === "1") {
                return response(ctx.status(200), ctx.json([{ id: 2, name: "loaded-on-demand" }]));
            }
            else {
                return response(ctx.status(400));
            }
        }));
        server.listen();
    });
    afterAll(function () {
        server === null || server === void 0 ? void 0 : server.close();
    });
    beforeEach(function () {
        if (given.savedState) {
            localStorage.setItem("tree", given.savedState);
        }
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true
        });
    });
    it("creates a parent node without children", function () {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "parent-node",
                open: false
            }),
        ]);
    });
    context("when the node is opened", function () {
        given("node", function () {
            return given.$tree.tree("getNodeByNameMustExist", "parent-node");
        });
        it("loads the subtree", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testUtil_1.togglerLink(given.node.element).trigger("click");
                        return [4 /*yield*/, dom_1.screen.findByText("loaded-on-demand")];
                    case 1:
                        _a.sent();
                        expect(given.$tree).toHaveTreeStructure([
                            expect.objectContaining({
                                name: "parent-node",
                                open: true,
                                children: [
                                    expect.objectContaining({ name: "loaded-on-demand" }),
                                ]
                            }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    context("with autoOpen is true", function () {
        given("autoOpen", function () { return true; });
        it("loads the node on demand", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dom_1.screen.findByText("loaded-on-demand")];
                    case 1:
                        _a.sent();
                        expect(given.$tree).toHaveTreeStructure([
                            expect.objectContaining({
                                name: "parent-node",
                                open: true,
                                children: [
                                    expect.objectContaining({ name: "loaded-on-demand" }),
                                ]
                            }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    context("with a saved state with an opened node", function () {
        given("savedState", function () { return '{"open_nodes":[1],"selected_node":[]}'; });
        it("opens the node and loads its children on demand", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dom_1.screen.findByText("loaded-on-demand")];
                    case 1:
                        _a.sent();
                        expect(given.$tree).toHaveTreeStructure([
                            expect.objectContaining({
                                name: "parent-node",
                                open: true,
                                children: [
                                    expect.objectContaining({ name: "loaded-on-demand" }),
                                ]
                            }),
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
