"use strict";
exports.__esModule = true;
var SelectNodeHandler = /** @class */ (function () {
    function SelectNodeHandler(treeWidget) {
        this.treeWidget = treeWidget;
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
        if (this.selectedSingleNode) {
            return [this.selectedSingleNode];
        }
        else {
            var selectedNodes = [];
            for (var id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    var node = this.treeWidget.getNodeById(id);
                    if (node) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
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
            if (this.selectedNodes[node.id]) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        }
        else {
            return false;
        }
    };
    SelectNodeHandler.prototype.clear = function () {
        this.selectedNodes = {};
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
            delete this.selectedNodes[node.id];
            if (includeChildren) {
                node.iterate(function () {
                    if (node.id != null) {
                        delete _this.selectedNodes[node.id];
                    }
                    return true;
                });
            }
        }
    };
    SelectNodeHandler.prototype.addToSelection = function (node) {
        if (node.id != null) {
            this.selectedNodes[node.id] = true;
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
