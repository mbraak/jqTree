import type {
    CloseNode,
    GetSelectedNode,
    IsFocusOnTree,
    OpenNode,
    SelectNode,
} from "./methodTypes";
import type { Node } from "./node";

interface KeyHandlerParams {
    closeNode: CloseNode;
    getSelectedNode: GetSelectedNode;
    isFocusOnTree: IsFocusOnTree;
    keyboardSupport: boolean;
    openNode: OpenNode;
    selectNode: SelectNode;
}

export default class KeyHandler {
    private _closeNode: CloseNode;
    private _getSelectedNode: GetSelectedNode;

    private _isFocusOnTree: IsFocusOnTree;

    private _keyboardSupport: boolean;
    private _openNode: OpenNode;
    private _originalSelectNode: SelectNode;
    constructor({
        closeNode,
        getSelectedNode,
        isFocusOnTree,
        keyboardSupport,
        openNode,
        selectNode,
    }: KeyHandlerParams) {
        this._closeNode = closeNode;
        this._getSelectedNode = getSelectedNode;
        this._isFocusOnTree = isFocusOnTree;
        this._keyboardSupport = keyboardSupport;
        this._openNode = openNode;
        this._originalSelectNode = selectNode;

        if (keyboardSupport) {
            document.addEventListener("keydown", this._handleKeyDown);
        }
    }

    public deinit(): void {
        if (this._keyboardSupport) {
            document.removeEventListener("keydown", this._handleKeyDown);
        }
    }

    public moveDown(selectedNode: Node): boolean {
        return this._selectNode(selectedNode.getNextVisibleNode());
    }

    public moveUp(selectedNode: Node): boolean {
        return this._selectNode(selectedNode.getPreviousVisibleNode());
    }

    private _canHandleKeyboard(): boolean {
        return this._keyboardSupport && this._isFocusOnTree();
    }

    private _handleKeyDown = (e: KeyboardEvent): void => {
        if (!this._canHandleKeyboard()) {
            return;
        }

        let isKeyHandled = false;

        const selectedNode = this._getSelectedNode();
        if (selectedNode) {
            switch (e.key) {
                case "ArrowDown":
                    isKeyHandled = this.moveDown(selectedNode);
                    break;

                case "ArrowLeft":
                    isKeyHandled = this._moveLeft(selectedNode);
                    break;

                case "ArrowRight":
                    isKeyHandled = this._moveRight(selectedNode);
                    break;

                case "ArrowUp":
                    isKeyHandled = this.moveUp(selectedNode);
                    break;
            }
        }

        if (isKeyHandled) {
            e.preventDefault();
        }
    };

    private _moveLeft(selectedNode: Node): boolean {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this._closeNode(selectedNode);
            return true;
        } else {
            // Left on a closed or end node moves focus to the node's parent
            return this._selectNode(selectedNode.getParent());
        }
    }

    private _moveRight(selectedNode: Node): boolean {
        if (!selectedNode.isFolder()) {
            return false;
        } else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this._selectNode(selectedNode.getNextVisibleNode());
            } else {
                // Right expands a closed node
                this._openNode(selectedNode);
                return true;
            }
        }
    }

    /* Select the node.
     * Don't do anything if the node is null.
     * Result: a different node was selected.
     */
    private _selectNode(node: Node | null): boolean {
        if (!node) {
            return false;
        } else {
            this._originalSelectNode(node);

            return true;
        }
    }
}
