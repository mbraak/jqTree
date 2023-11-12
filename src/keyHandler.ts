import { Node } from "./node";
import {
    CloseNode,
    GetSelectedNode,
    IsFocusOnTree,
    OpenNode,
    SelectNode,
} from "./jqtreeMethodTypes";

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
                this.openNode(selectedNode);
                return false;
            }
        }
    }

    public moveLeft(selectedNode: Node): boolean {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.closeNode(selectedNode);
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
            this.originalSelectNode(node);

            return false;
        }
    }

    private handleKeyDown = (e: KeyboardEvent): boolean => {
        if (!this.canHandleKeyboard()) {
            return true;
        }

        const selectedNode = this.getSelectedNode();
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
        return this.keyboardSupport && this.isFocusOnTree();
    }
}
