import type { GetNodeById } from "./methodTypes";
import type { Node, NodeId } from "./node";

interface SelectNodeHandlerParameters {
    getNodeById: GetNodeById;
}

export default class SelectNodeHandler {
    private _getNodeById: GetNodeById;
    private _selectedNodes: Set<NodeId>;
    private _selectedSingleNode: Node | null;

    constructor({ getNodeById }: SelectNodeHandlerParameters) {
        this._getNodeById = getNodeById;
        this._selectedNodes = new Set<NodeId>();
        this.clear();
    }

    public addToSelection(node: Node): void {
        if (node.id != null) {
            this._selectedNodes.add(node.id);
        } else {
            this._selectedSingleNode = node;
        }
    }

    public clear(): void {
        this._selectedNodes.clear();
        this._selectedSingleNode = null;
    }

    public getSelectedNode(): false | Node {
        const selectedNodes = this.getSelectedNodes();

        if (selectedNodes.length) {
            return selectedNodes[0] ?? false;
        } else {
            return false;
        }
    }

    public getSelectedNodes(): Node[] {
        if (this._selectedSingleNode) {
            return [this._selectedSingleNode];
        } else {
            const selectedNodes: Node[] = [];

            this._selectedNodes.forEach((id) => {
                const node = this._getNodeById(id);
                if (node) {
                    selectedNodes.push(node);
                }
            });

            return selectedNodes;
        }
    }

    public getSelectedNodesUnder(parent: Node): Node[] {
        if (this._selectedSingleNode) {
            if (parent.isParentOf(this._selectedSingleNode)) {
                return [this._selectedSingleNode];
            } else {
                return [];
            }
        } else {
            const selectedNodes: Node[] = [];

            this._selectedNodes.forEach((id) => {
                const node = this._getNodeById(id);
                if (node && parent.isParentOf(node)) {
                    selectedNodes.push(node);
                }
            });

            return selectedNodes;
        }
    }

    public isNodeSelected(node: Node): boolean {
        if (node.id != null) {
            return this._selectedNodes.has(node.id);
        } else if (this._selectedSingleNode) {
            return this._selectedSingleNode.element === node.element;
        } else {
            return false;
        }
    }

    public removeFromSelection(node: Node, includeChildren = false): void {
        if (node.id == null) {
            if (
                this._selectedSingleNode &&
                node.element === this._selectedSingleNode.element
            ) {
                this._selectedSingleNode = null;
            }
        } else {
            this._selectedNodes.delete(node.id);

            if (includeChildren) {
                node.iterate(() => {
                    if (node.id != null) {
                        this._selectedNodes.delete(node.id);
                    }
                    return true;
                });
            }
        }
    }
}
