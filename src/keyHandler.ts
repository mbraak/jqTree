import { Node } from "./node";
import { JqTreeWidget } from "./tree.jquery";

export default class KeyHandler {
    private static LEFT = 37;
    private static UP = 38;
    private static RIGHT = 39;
    private static DOWN = 40;

    private treeWidget: JqTreeWidget;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;

        if (treeWidget.options.keyboardSupport) {
            jQuery(document).on("keydown.jqtree", this.handleKeyDown);
        }
    }

    public deinit(): void {
        jQuery(document).off("keydown.jqtree");
    }

    public moveDown(selectedNode: Node): boolean {
        return this.selectNode(selectedNode.getNextNode());
    }

    public moveUp(selectedNode: Node): boolean {
        return this.selectNode(selectedNode.getPreviousNode());
    }

    public moveRight(selectedNode: Node): boolean {
        if (!selectedNode.isFolder()) {
            return true;
        } else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(selectedNode.getNextNode());
            } else {
                // Right expands a closed node
                this.treeWidget.openNode(selectedNode);
                return false;
            }
        }
    }

    public moveLeft(selectedNode: Node): boolean {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(selectedNode);
            return false;
        } else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(selectedNode.getParent());
        }
    }

    public selectNode(node: Node | null): boolean {
        if (!node) {
            return true;
        } else {
            this.treeWidget.selectNode(node);

            if (
                !this.treeWidget.scrollHandler.isScrolledIntoView(
                    jQuery(node.element).find(".jqtree-element")
                )
            ) {
                this.treeWidget.scrollToNode(node);
            }

            return false;
        }
    }

    private handleKeyDown = (e: JQuery.Event): boolean => {
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

    private canHandleKeyboard(): boolean {
        return (
            (this.treeWidget.options.keyboardSupport || false) &&
            this.treeWidget.selectNodeHandler.isFocusOnTree()
        );
    }
}
