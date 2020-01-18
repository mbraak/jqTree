"use strict";
exports.__esModule = true;
var KeyHandler = /** @class */ (function () {
    function KeyHandler(treeWidget) {
        var _this = this;
        this.handleKeyDown = function (e) {
            if (!_this.canHandleKeyboard()) {
                return true;
            }
            else {
                var key = e.which;
                switch (key) {
                    case KeyHandler.DOWN:
                        return _this.moveDown();
                    case KeyHandler.UP:
                        return _this.moveUp();
                    case KeyHandler.RIGHT:
                        return _this.moveRight();
                    case KeyHandler.LEFT:
                        return _this.moveLeft();
                    default:
                        return true;
                }
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
    KeyHandler.prototype.moveDown = function () {
        var node = this.treeWidget.getSelectedNode();
        if (node) {
            return this.selectNode(node.getNextNode());
        }
        else {
            return false;
        }
    };
    KeyHandler.prototype.moveUp = function () {
        var node = this.treeWidget.getSelectedNode();
        if (node) {
            return this.selectNode(node.getPreviousNode());
        }
        else {
            return false;
        }
    };
    KeyHandler.prototype.moveRight = function () {
        var node = this.treeWidget.getSelectedNode();
        if (!node) {
            return true;
        }
        else if (!node.isFolder()) {
            return true;
        }
        else {
            // folder node
            if (node.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(node.getNextNode());
            }
            else {
                // Right expands a closed node
                this.treeWidget.openNode(node);
                return false;
            }
        }
    };
    KeyHandler.prototype.moveLeft = function () {
        var node = this.treeWidget.getSelectedNode();
        if (!node) {
            return true;
        }
        else if (node.isFolder() && node.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(node);
            return false;
        }
        else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(node.getParent());
        }
    };
    KeyHandler.prototype.selectNode = function (node) {
        if (!node) {
            return true;
        }
        else {
            this.treeWidget.selectNode(node);
            if (this.treeWidget.scrollHandler &&
                !this.treeWidget.scrollHandler.isScrolledIntoView(jQuery(node.element).find(".jqtree-element"))) {
                this.treeWidget.scrollToNode(node);
            }
            return false;
        }
    };
    KeyHandler.prototype.canHandleKeyboard = function () {
        return (this.treeWidget.options.keyboardSupport && this.isFocusOnTree() && this.treeWidget.getSelectedNode() != null);
    };
    KeyHandler.prototype.isFocusOnTree = function () {
        var activeElement = document.activeElement;
        return Boolean(activeElement && activeElement.tagName === "SPAN" && this.treeWidget._containsElement(activeElement));
    };
    KeyHandler.LEFT = 37;
    KeyHandler.UP = 38;
    KeyHandler.RIGHT = 39;
    KeyHandler.DOWN = 40;
    return KeyHandler;
}());
exports["default"] = KeyHandler;
