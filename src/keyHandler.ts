import { Node } from "./node";
import { JqTreeWidget } from "./tree.jquery";

type KeyboardEventHandler = (event: KeyboardEvent) => boolean;

export default class KeyHandler {
    private treeWidget: JqTreeWidget;
    private handleKeyDownHandler: KeyboardEventHandler | null = null;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;

        if (treeWidget.options.keyboardSupport) {
            this.handleKeyDownHandler = this.handleKeyDown.bind(this);

            document.addEventListener("keydown", this.handleKeyDownHandler);
        }
    }

    public deinit(): void {
        if (this.handleKeyDownHandler) {
            document.removeEventListener("keydown", this.handleKeyDownHandler);
        }
    }

    public moveDown(selectedNode: Node): boolean {
        return this.selectNode(selectedNode.getNextVisibleNode());
    }

    public moveUp(selectedNode: Node): boolean {
        return this.selectNode(selectedNode.getPreviousVisibleNode());
    }

    public moveRight(selectedNode: Node): boolean {
        if (!selectedNode.isFolder()) {
            return true;
        } else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(selectedNode.getNextVisibleNode());
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

            return false;
        }
    }

    private handleKeyDown = (e: KeyboardEvent): boolean => {
        if (!this.canHandleKeyboard()) {
            return true;
        }

        const selectedNode = this.treeWidget.getSelectedNode();
        if (!selectedNode) {
            return true;
        }

        switch (e.key) {
            case "ArrowDown":
                return this.moveDown(selectedNode);

            case "ArrowUp":
                return this.moveUp(selectedNode);

            case "ArrowRight":
                return this.moveRight(selectedNode);

            case "ArrowLeft":
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
