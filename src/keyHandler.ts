import {
    CloseNode,
    GetSelectedNode,
    IsFocusOnTree,
    OpenNode,
    SelectNode,
} from "./jqtreeMethodTypes";
import { Node } from "./node";

type KeyboardEventHandler = (event: KeyboardEvent) => boolean;

interface KeyHandlerParams {
    closeNode: CloseNode;
    getSelectedNode: GetSelectedNode;
    isFocusOnTree: IsFocusOnTree;
    keyboardSupport: boolean;
    openNode: OpenNode;
    selectNode: SelectNode;
}

export default class KeyHandler {
    private closeNode: CloseNode;
    private getSelectedNode: GetSelectedNode;

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (!this.canHandleKeyboard()) {
            return;
        }

        let isKeyHandled = false;

        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            switch (e.key) {
                case "ArrowDown":
                    isKeyHandled = this.moveDown(selectedNode);
                    break;

                case "ArrowUp":
                    isKeyHandled = this.moveUp(selectedNode);
                    break;

                case "ArrowRight":
                    isKeyHandled = this.moveRight(selectedNode);
                    break;

                case "ArrowLeft":
                    isKeyHandled = this.moveLeft(selectedNode);
                    break;
            }
        }

        if (isKeyHandled) {
            e.preventDefault();
        }
    };

    private handleKeyDownHandler?: KeyboardEventHandler;
    private isFocusOnTree: IsFocusOnTree;
    private keyboardSupport: boolean;
    private openNode: OpenNode;
    private originalSelectNode: SelectNode;

    constructor({
        closeNode,
        getSelectedNode,
        isFocusOnTree,
        keyboardSupport,
        openNode,
        selectNode,
    }: KeyHandlerParams) {
        this.closeNode = closeNode;
        this.getSelectedNode = getSelectedNode;
        this.isFocusOnTree = isFocusOnTree;
        this.keyboardSupport = keyboardSupport;
        this.openNode = openNode;
        this.originalSelectNode = selectNode;

        if (keyboardSupport) {
            document.addEventListener("keydown", this.handleKeyDown);
        }
    }

    private canHandleKeyboard(): boolean {
        return this.keyboardSupport && this.isFocusOnTree();
    }

    private moveLeft(selectedNode: Node): boolean {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.closeNode(selectedNode);
            return true;
        } else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(selectedNode.getParent());
        }
    }

    private moveRight(selectedNode: Node): boolean {
        if (!selectedNode.isFolder()) {
            return false;
        } else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(selectedNode.getNextVisibleNode());
            } else {
                // Right expands a closed node
                this.openNode(selectedNode);
                return true;
            }
        }
    }

    /* Select the node.
     * Don't do anything if the node is null.
     * Result: a different node was selected.
     */
    private selectNode(node: Node | null): boolean {
        if (!node) {
            return false;
        } else {
            this.originalSelectNode(node);

            return true;
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
}
