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
exports.dragAndDrop = exports.getTreeStructure = exports.selectNode = exports.openNode = exports.findNodeElement = exports.findTitleElement = exports.expectToBeClosed = exports.expectToBeOpen = exports.expectToBeSelected = void 0;
exports.expectToBeSelected = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var isSelected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, isNodeSelected(handle)];
            case 1:
                isSelected = _a.sent();
                expect(isSelected).toBe(true);
                return [2 /*return*/];
        }
    });
}); };
exports.expectToBeOpen = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var isOpen;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, isNodeOpen(handle)];
            case 1:
                isOpen = _a.sent();
                expect(isOpen).toBe(true);
                return [2 /*return*/];
        }
    });
}); };
exports.expectToBeClosed = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var isOpen;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, isNodeOpen(handle)];
            case 1:
                isOpen = _a.sent();
                expect(isOpen).toBe(false);
                return [2 /*return*/];
        }
    });
}); };
exports.findTitleElement = function (title) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, findElement("css=.jqtree-title >> text=\"" + title + "\"")];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.findNodeElement = function (title) { return __awaiter(void 0, void 0, void 0, function () {
    var titleElement;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findTitleElement(title)];
            case 1:
                titleElement = _a.sent();
                return [4 /*yield*/, titleElement.evaluateHandle(function (el) {
                        var li = el.closest("li");
                        if (!li) {
                            throw Error("Node element not found");
                        }
                        return li;
                    })];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.openNode = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var toggler;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, findToggler(handle)];
            case 1:
                toggler = _a.sent();
                return [4 /*yield*/, toggler.click()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var findToggler = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var toggler;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handle.$(".jqtree-toggler")];
            case 1:
                toggler = _a.sent();
                if (!toggler) {
                    throw Error("Toggler button not found");
                }
                return [2 /*return*/, toggler];
        }
    });
}); };
var findElement = function (selector) { return __awaiter(void 0, void 0, void 0, function () {
    var element;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, page.$(selector)];
            case 1:
                element = _a.sent();
                if (!element) {
                    throw Error("Element not found: " + selector);
                }
                return [2 /*return*/, element];
        }
    });
}); };
var isNodeOpen = function (handle) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, handle.evaluate(function (el) { return !el.classList.contains("jqtree-closed"); })];
}); }); };
var isNodeSelected = function (handle) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, handle.evaluate(function (el) { return el.classList.contains("jqtree-selected"); })];
}); }); };
exports.selectNode = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var titleHandle;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handle.$(".jqtree-title")];
            case 1:
                titleHandle = _a.sent();
                return [4 /*yield*/, (titleHandle === null || titleHandle === void 0 ? void 0 : titleHandle.click())];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getTreeStructure = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, page
                    .evaluate("\n        function getTreeNode($li) {\n            const $div = $li.children(\"div.jqtree-element\");\n            const $span = $div.children(\"span.jqtree-title\");\n            const name = $span.text();\n            const selected = $li.hasClass(\"jqtree-selected\");\n\n            if ($li.hasClass(\"jqtree-folder\")) {\n                const $ul = $li.children(\"ul.jqtree_common\");\n\n                return {\n                    nodeType: \"folder\",\n                    children: getChildren($ul),\n                    name,\n                    open: !$li.hasClass(\"jqtree-closed\"),\n                    selected,\n                };\n            } else {\n                return {\n                    nodeType: \"child\",\n                    name,\n                    selected,\n                };\n            }\n        };\n\n        function getChildren($ul) {\n            return $ul\n                .children(\"li.jqtree_common\")\n                .map((_, li) => {\n                    return getTreeNode(jQuery(li))\n                })\n                .get();\n        };\n\n        JSON.stringify(window.getChildren(jQuery(\"ul.jqtree-tree\")))\n        ")
                    .then(function (s) { return JSON.parse(s); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getRect = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    var boundingBox;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handle.boundingBox()];
            case 1:
                boundingBox = _a.sent();
                if (!boundingBox) {
                    throw "No bounding box";
                }
                return [2 /*return*/, boundingBox];
        }
    });
}); };
exports.dragAndDrop = function (from, to) { return __awaiter(void 0, void 0, void 0, function () {
    var fromRect, toRect;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findTitleElement(from).then(getRect)];
            case 1:
                fromRect = _a.sent();
                return [4 /*yield*/, exports.findTitleElement(to).then(getRect)];
            case 2:
                toRect = _a.sent();
                return [4 /*yield*/, page.mouse.move(fromRect.x + fromRect.width / 2, fromRect.y + fromRect.height / 2)];
            case 3:
                _a.sent();
                return [4 /*yield*/, page.mouse.down()];
            case 4:
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(200)];
            case 5:
                _a.sent();
                return [4 /*yield*/, page.mouse.move(toRect.x + toRect.width / 2, toRect.y + toRect.height / 2)];
            case 6:
                _a.sent();
                return [4 /*yield*/, page.mouse.up()];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
