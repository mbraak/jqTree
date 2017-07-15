"use strict";
exports.__esModule = true;
var SelectNodeHandler = (function () {
    function SelectNodeHandler(tree_widget) {
        this.tree_widget = tree_widget;
        this.clear();
    }
    SelectNodeHandler.prototype.getSelectedNode = function () {
        var selected_nodes = this.getSelectedNodes();
        if (selected_nodes.length) {
            return selected_nodes[0];
        }
        else {
            return false;
        }
    };
    SelectNodeHandler.prototype.getSelectedNodes = function () {
        if (this.selected_single_node) {
            return [this.selected_single_node];
        }
        else {
            var selected_nodes = [];
            for (var id in this.selected_nodes) {
                if (this.selected_nodes.hasOwnProperty(id)) {
                    var node = this.tree_widget.getNodeById(id);
                    if (node) {
                        selected_nodes.push(node);
                    }
                }
            }
            return selected_nodes;
        }
    };
    SelectNodeHandler.prototype.getSelectedNodesUnder = function (parent) {
        if (this.selected_single_node) {
            if (parent.isParentOf(this.selected_single_node)) {
                return [this.selected_single_node];
            }
            else {
                return [];
            }
        }
        else {
            var selected_nodes = [];
            for (var id in this.selected_nodes) {
                if (this.selected_nodes.hasOwnProperty(id)) {
                    var node = this.tree_widget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selected_nodes.push(node);
                    }
                }
            }
            return selected_nodes;
        }
    };
    SelectNodeHandler.prototype.isNodeSelected = function (node) {
        if (!node) {
            return false;
        }
        else if (node.id != null) {
            if (this.selected_nodes[node.id]) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (this.selected_single_node) {
            return this.selected_single_node.element === node.element;
        }
        else {
            return false;
        }
    };
    SelectNodeHandler.prototype.clear = function () {
        this.selected_nodes = {};
        this.selected_single_node = null;
    };
    SelectNodeHandler.prototype.removeFromSelection = function (node, include_children) {
        var _this = this;
        if (include_children === void 0) { include_children = false; }
        if (node.id == null) {
            if (this.selected_single_node &&
                node.element === this.selected_single_node.element) {
                this.selected_single_node = null;
            }
        }
        else {
            delete this.selected_nodes[node.id];
            if (include_children) {
                node.iterate(function () {
                    delete _this.selected_nodes[node.id];
                    return true;
                });
            }
        }
    };
    SelectNodeHandler.prototype.addToSelection = function (node) {
        if (node.id != null) {
            this.selected_nodes[node.id] = true;
        }
        else {
            this.selected_single_node = node;
        }
    };
    return SelectNodeHandler;
}());
exports["default"] = SelectNodeHandler;
