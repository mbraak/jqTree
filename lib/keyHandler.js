"use strict";
exports.__esModule = true;
var KeyHandler = /** @class */ (function () {
    function KeyHandler(treeWidget) {
        var _this = this;
        this.handleKeyDown = function (e) {
            if (!_this.canHandleKeyboard()) {
                return true;
            }
            var selectedNode = _this.treeWidget.getSelectedNode();
            if (!selectedNode) {
                return true;
            }
            var key = e.which;
            switch (key) {
                case KeyHandler.DOWN:
                    return _this.moveDown(selectedNode);
                case KeyHandler.UP:
                    return _this.moveUp(selectedNode);
                case KeyHandler.RIGHT:
                    return _this.moveRight(selectedNode);
                case KeyHandler.LEFT:
                    return _this.moveLeft(selectedNode);
                default:
                    return true;
            }
        };
        this.treeWidget = treeWidget;
        if (treeWidget.options.keyboardSupport) {
            jQuery(document).on("keydown.jqtree", this.handleKeyDown);
        }
    }
    KeyHandler.prototype.deinit = function () {
        jQuery(document).off("keydown.jqtree");
    };
    KeyHandler.prototype.moveDown = function (selectedNode) {
        return this.selectNode(selectedNode.getNextNode());
    };
    KeyHandler.prototype.moveUp = function (selectedNode) {
        return this.selectNode(selectedNode.getPreviousNode());
    };
    KeyHandler.prototype.moveRight = function (selectedNode) {
        if (!selectedNode.isFolder()) {
            return true;
        }
        else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(selectedNode.getNextNode());
            }
            else {
                // Right expands a closed node
                this.treeWidget.openNode(selectedNode);
                return false;
            }
        }
    };
    KeyHandler.prototype.moveLeft = function (selectedNode) {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(selectedNode);
            return false;
        }
        else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(selectedNode.getParent());
        }
    };
    KeyHandler.prototype.selectNode = function (node) {
        if (!node) {
            return true;
        }
        else {
            this.treeWidget.selectNode(node);
            if (!this.treeWidget.scrollHandler.isScrolledIntoView(jQuery(node.element).find(".jqtree-element"))) {
                this.treeWidget.scrollToNode(node);
            }
            return false;
        }
    };
    KeyHandler.prototype.canHandleKeyboard = function () {
        return ((this.treeWidget.options.keyboardSupport || false) &&
            this.treeWidget.selectNodeHandler.isFocusOnTree());
    };
    KeyHandler.LEFT = 37;
    KeyHandler.UP = 38;
    KeyHandler.RIGHT = 39;
    KeyHandler.DOWN = 40;
    return KeyHandler;
}());
exports["default"] = KeyHandler;
