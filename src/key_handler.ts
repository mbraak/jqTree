import { Node } from "./node";
import { ITreeWidget } from "./itree_widget";

export default class KeyHandler {
    private static LEFT = 37;
    private static UP = 38;
    private static RIGHT = 39;
    private static DOWN = 40;

    private tree_widget: ITreeWidget;

    constructor(tree_widget: ITreeWidget) {
        this.tree_widget = tree_widget;

        if (tree_widget.options.keyboardSupport) {
            $(document).on("keydown.jqtree", $.proxy(this.handleKeyDown, this));
        }
    }

    public deinit() {
        $(document).off("keydown.jqtree");
    }

    public moveDown() {
        const node = this.tree_widget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getNextNode());
        } else {
            return false;
        }
    }

    public moveUp() {
        const node = this.tree_widget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getPreviousNode());
        } else {
            return false;
        }
    }

    public moveRight() {
        const node = this.tree_widget.getSelectedNode();

        if (!node) {
            return true;
        } else if (!node.isFolder()) {
            return true;
        } else {
            // folder node
            if (node.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(node.getNextNode());
            } else {
                // Right expands a closed node
                this.tree_widget.openNode(node);
                return false;
            }
        }
    }

    public moveLeft() {
        const node = this.tree_widget.getSelectedNode();

        if (!node) {
            return true;
        } else if (node.isFolder() && node.is_open) {
            // Left on an open node closes the node
            this.tree_widget.closeNode(node);
            return false;
        } else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(node.getParent());
        }
    }

    public handleKeyDown(e: JQueryEventObject) {
        if (!this.canHandleKeyboard()) {
            return true;
        } else {
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

                default:
                    return true;
            }
        }
    }

    public selectNode(node: Node | null) {
        if (!node) {
            return true;
        } else {
            this.tree_widget.selectNode(node);

            if (
                this.tree_widget.scroll_handler &&
                !this.tree_widget.scroll_handler.isScrolledIntoView(
                    $(node.element).find(".jqtree-element")
                )
            ) {
                this.tree_widget.scrollToNode(node);
            }

            return false;
        }
    }

    private canHandleKeyboard(): boolean {
        return (
            this.tree_widget.options.keyboardSupport &&
            this.isFocusOnTree() &&
            this.tree_widget.getSelectedNode() != null
        );
    }

    private isFocusOnTree(): boolean {
        const active_element = document.activeElement;

        return (
            active_element &&
            active_element.tagName === "SPAN" &&
            this.tree_widget._containsElement(active_element)
        );
    }
}
