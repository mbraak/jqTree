import { Node } from "./node";

const $ = window["jQuery"];


export default class KeyHandler {
    tree_widget;

    static LEFT = 37;
    static UP = 38;
    static RIGHT = 39;
    static DOWN = 40;

    constructor(tree_widget) {
        this.tree_widget = tree_widget;

        if (tree_widget.options.keyboardSupport) {
            $(document).on('keydown.jqtree', $.proxy(this.handleKeyDown, this));
        }
    }

    deinit() {
        $(document).off('keydown.jqtree');
    }

    moveDown() {
        const node = this.tree_widget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getNextNode());
        }
        else {
            return false;
        }
    }

    moveUp() {
        const node = this.tree_widget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getPreviousNode());
        }
        else {
            return false;
        }
    }

    moveRight() {
        const node = this.tree_widget.getSelectedNode();

        if (! node) {
            return true;
        }
        else if (! node.isFolder()) {
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
                this.tree_widget.openNode(node);
                return false;
            }
        }
    }

    moveLeft() {
        const node = this.tree_widget.getSelectedNode();

        if (! node) {
            return true;
        }
        else if (node.isFolder() && node.is_open) {
            // Left on an open node closes the node
            this.tree_widget.closeNode(node);
            return false;
        }
        else {
            /// Left on a closed or end node moves focus to the node's parent
            return this.selectNode(node.getParent());
        }
    }

    handleKeyDown(e) {
        if (! this.tree_widget.options.keyboardSupport) {
            return true;
        }

        if ($(document.activeElement).is('textarea,input,select')) {
            return true;
        }

        if (! this.tree_widget.getSelectedNode()) {
            return true;
        }

        const key = e.which;

        switch (key) {
            case KeyHandler.DOWN:
                return this.moveDown();

            case KeyHandler.UP:
                return this.moveUp();

            case KeyHandler.RIGHT:
                return this.moveRight();

            case KeyHandler.LEFT:
                return this.moveLeft();
        }

        return true;
    }

    selectNode(node: Node) {
        if (! node) {
            return true;
        }
        else {
            this.tree_widget.selectNode(node);

            if (
                this.tree_widget.scroll_handler &&
                (! this.tree_widget.scroll_handler.isScrolledIntoView($(node.element).find('.jqtree-element')))
            ) {
                this.tree_widget.scrollToNode(node);
            }

            return false;
        }
    }
}
