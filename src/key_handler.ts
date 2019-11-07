import { Node } from "./node";
import { ITreeWidget } from "./itree_widget";

export default class KeyHandler {
    private static LEFT = 37;
    private static UP = 38;
    private static RIGHT = 39;
    private static DOWN = 40;

    private treeWidget: ITreeWidget;

    constructor(treeWidget: ITreeWidget) {
        this.treeWidget = treeWidget;

        if (treeWidget.options.keyboardSupport) {
            jQuery(document).on("keydown.jqtree", this.handleKeyDown);
        }
    }

    public deinit(): void {
        jQuery(document).off("keydown.jqtree");
    }

    public moveDown(): boolean {
        const node = this.treeWidget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getNextNode());
        } else {
            return false;
        }
    }

    public moveUp(): boolean {
        const node = this.treeWidget.getSelectedNode();

        if (node) {
            return this.selectNode(node.getPreviousNode());
        } else {
            return false;
        }
    }

    public moveRight(): boolean {
        const node = this.treeWidget.getSelectedNode();

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
                this.treeWidget.openNode(node);
                return false;
            }
        }
    }

    public moveLeft(): boolean {
        const node = this.treeWidget.getSelectedNode();

        if (!node) {
            return true;
        } else if (node.isFolder() && node.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(node);
            return false;
        } else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(node.getParent());
        }
    }

    public selectNode(node: Node | null): boolean {
        if (!node) {
            return true;
        } else {
            this.treeWidget.selectNode(node);

            if (
                this.treeWidget.scrollHandler &&
                !this.treeWidget.scrollHandler.isScrolledIntoView(jQuery(node.element).find(".jqtree-element"))
            ) {
                this.treeWidget.scrollToNode(node);
            }

            return false;
        }
    }

    private handleKeyDown = (e: JQuery.Event): boolean => {
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
    };

    private canHandleKeyboard(): boolean {
        return (
            this.treeWidget.options.keyboardSupport && this.isFocusOnTree() && this.treeWidget.getSelectedNode() != null
        );
    }

    private isFocusOnTree(): boolean {
        const activeElement = document.activeElement;

        return Boolean(
            activeElement && activeElement.tagName === "SPAN" && this.treeWidget._containsElement(activeElement)
        );
    }
}
