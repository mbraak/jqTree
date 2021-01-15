"use strict";
exports.__esModule = true;
var SelectNodeHandler = /** @class */ (function () {
    function SelectNodeHandler(treeWidget) {
        this.treeWidget = treeWidget;
        this.selectedNodes = new Set();
        this.clear();
    }
    SelectNodeHandler.prototype.getSelectedNode = function () {
        var selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length) {
            return selectedNodes[0];
        }
        else {
            return false;
        }
    };
    SelectNodeHandler.prototype.getSelectedNodes = function () {
        var _this = this;
        if (this.selectedSingleNode) {
            return [this.selectedSingleNode];
        }
        else {
            var selectedNodes_1 = [];
            this.selectedNodes.forEach(function (id) {
                var node = _this.treeWidget.getNodeById(id);
                if (node) {
                    selectedNodes_1.push(node);
                }
            });
            return selectedNodes_1;
        }
    };
    SelectNodeHandler.prototype.getSelectedNodesUnder = function (parent) {
        if (this.selectedSingleNode) {
            if (parent.isParentOf(this.selectedSingleNode)) {
                return [this.selectedSingleNode];
            }
            else {
                return [];
            }
        }
        else {
            var selectedNodes = [];
            for (var id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    var node = this.treeWidget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
        }
    };
    SelectNodeHandler.prototype.isNodeSelected = function (node) {
        if (node.id != null) {
            return this.selectedNodes.has(node.id);
        }
        else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        }
        else {
            return false;
        }
    };
    SelectNodeHandler.prototype.clear = function () {
        this.selectedNodes.clear();
        this.selectedSingleNode = null;
    };
    SelectNodeHandler.prototype.removeFromSelection = function (node, includeChildren) {
        var _this = this;
        if (includeChildren === void 0) { includeChildren = false; }
        if (node.id == null) {
            if (this.selectedSingleNode &&
                node.element === this.selectedSingleNode.element) {
                this.selectedSingleNode = null;
            }
        }
        else {
            this.selectedNodes["delete"](node.id);
            if (includeChildren) {
                node.iterate(function () {
                    if (node.id != null) {
                        _this.selectedNodes["delete"](node.id);
                    }
                    return true;
                });
            }
        }
    };
    SelectNodeHandler.prototype.addToSelection = function (node) {
        if (node.id != null) {
            this.selectedNodes.add(node.id);
        }
        else {
            this.selectedSingleNode = node;
        }
    };
    SelectNodeHandler.prototype.isFocusOnTree = function () {
        var activeElement = document.activeElement;
        return Boolean(activeElement &&
            activeElement.tagName === "SPAN" &&
            this.treeWidget._containsElement(activeElement));
    };
    return SelectNodeHandler;
}());
exports["default"] = SelectNodeHandler;
