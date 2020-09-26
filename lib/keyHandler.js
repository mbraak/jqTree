export default class KeyHandler {
    constructor(treeWidget) {
        this.handleKeyDown = (e) => {
            if (!this.canHandleKeyboard()) {
                return true;
            }
            const selectedNode = this.treeWidget.getSelectedNode();
            if (!selectedNode) {
                return true;
            }
            const key = e.which;
            switch (key) {
                case KeyHandler.DOWN:
                    return this.moveDown(selectedNode);
                case KeyHandler.UP:
                    return this.moveUp(selectedNode);
                case KeyHandler.RIGHT:
                    return this.moveRight(selectedNode);
                case KeyHandler.LEFT:
                    return this.moveLeft(selectedNode);
                default:
                    return true;
            }
        };
        this.treeWidget = treeWidget;
        if (treeWidget.options.keyboardSupport) {
            jQuery(document).on("keydown.jqtree", this.handleKeyDown);
        }
    }
    deinit() {
        jQuery(document).off("keydown.jqtree");
    }
    moveDown(selectedNode) {
        return this.selectNode(selectedNode.getNextNode());
    }
    moveUp(selectedNode) {
        return this.selectNode(selectedNode.getPreviousNode());
    }
    moveRight(selectedNode) {
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
    }
    moveLeft(selectedNode) {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(selectedNode);
            return false;
        }
        else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(selectedNode.getParent());
        }
    }
    selectNode(node) {
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
    }
    canHandleKeyboard() {
        return ((this.treeWidget.options.keyboardSupport || false) &&
            this.isFocusOnTree());
    }
    isFocusOnTree() {
        const activeElement = document.activeElement;
        return Boolean(activeElement &&
            activeElement.tagName === "SPAN" &&
            this.treeWidget._containsElement(activeElement));
    }
}
KeyHandler.LEFT = 37;
KeyHandler.UP = 38;
KeyHandler.RIGHT = 39;
KeyHandler.DOWN = 40;
