"use strict";
/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />
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
var givens_1 = require("givens");
var testUtil_1 = require("./testUtil");
var visualRegression_1 = require("./visualRegression");
var given = givens_1["default"]();
given("dragAndDrop", function () { return false; });
beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, jestPlaywright.resetPage()];
            case 1:
                _a.sent();
                return [4 /*yield*/, page.goto("http://localhost:8080/test_index.html")];
            case 2:
                _a.sent();
                return [4 /*yield*/, page.waitForLoadState("domcontentloaded")];
            case 3:
                _a.sent();
                // Fix error on iphone6 device when collecting coverage
                return [4 /*yield*/, page.evaluate(function () {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        window["reportCodeCoverage"] = function () { return null; };
                    })];
            case 4:
                // Fix error on iphone6 device when collecting coverage
                _a.sent();
                return [4 /*yield*/, page.evaluate("\n        const $tree = jQuery(\"#tree1\");\n\n        $tree.tree({\n            animationSpeed: 0,\n            autoOpen: 0,\n            data: ExampleData.exampleData,\n            dragAndDrop: " + given.dragAndDrop + ",\n        });\n        $tree.tree(\"setMouseDelay\", 100);\n    ")];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, jestPlaywright.saveCoverage(page)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it("displays a tree", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect(page).toHaveText("Saurischia")];
            case 1:
                _a.sent();
                return [4 /*yield*/, expect(page).toHaveText("Ornithischians")];
            case 2:
                _a.sent();
                return [4 /*yield*/, expect(page).toHaveText("Coelophysoids")];
            case 3:
                _a.sent();
                return [4 /*yield*/, visualRegression_1.matchScreenshot("displays_a_tree")];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it("selects a node", function () { return __awaiter(void 0, void 0, void 0, function () {
    var saurischia;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect(page).toHaveText("Saurischia")];
            case 1:
                _a.sent();
                return [4 /*yield*/, testUtil_1.findNodeElement("Saurischia")];
            case 2:
                saurischia = _a.sent();
                return [4 /*yield*/, testUtil_1.selectNode(saurischia)];
            case 3:
                _a.sent();
                return [4 /*yield*/, testUtil_1.expectToBeSelected(saurischia)];
            case 4:
                _a.sent();
                return [4 /*yield*/, visualRegression_1.matchScreenshot("selects_a_node")];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it("opens a node", function () { return __awaiter(void 0, void 0, void 0, function () {
    var theropods;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect(page).toHaveText("Saurischia")];
            case 1:
                _a.sent();
                return [4 /*yield*/, testUtil_1.findNodeElement("Theropods")];
            case 2:
                theropods = _a.sent();
                return [4 /*yield*/, testUtil_1.expectToBeClosed(theropods)];
            case 3:
                _a.sent();
                return [4 /*yield*/, testUtil_1.openNode(theropods)];
            case 4:
                _a.sent();
                return [4 /*yield*/, testUtil_1.expectToBeOpen(theropods)];
            case 5:
                _a.sent();
                return [4 /*yield*/, visualRegression_1.matchScreenshot("opens_a_node")];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe("dragAndDrop", function () {
    given("dragAndDrop", function () { return true; });
    it("moves a node", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testUtil_1.dragAndDrop("Herrerasaurians", "Ornithischians")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testUtil_1.getTreeStructure().then(function (structure) {
                            expect(structure).toEqual([
                                expect.objectContaining({
                                    name: "Saurischia",
                                    children: [
                                        expect.objectContaining({ name: "Theropods" }),
                                        expect.objectContaining({ name: "Sauropodomorphs" }),
                                    ]
                                }),
                                expect.objectContaining({
                                    name: "Ornithischians",
                                    children: [
                                        expect.objectContaining({ name: "Herrerasaurians" }),
                                        expect.objectContaining({ name: "Heterodontosaurids" }),
                                        expect.objectContaining({ name: "Thyreophorans" }),
                                        expect.objectContaining({ name: "Ornithopods" }),
                                        expect.objectContaining({
                                            name: "Pachycephalosaurians"
                                        }),
                                        expect.objectContaining({ name: "Ceratopsians" }),
                                    ]
                                }),
                            ]);
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, visualRegression_1.matchScreenshot("moves_a_node")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
