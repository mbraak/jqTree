import { Node } from "./node";
import { ITreeWidget } from "./itree_widget";

export default class SelectNodeHandler {
    private treeWidget: ITreeWidget;
    private selectedNodes: any;
    private selectedSingleNode: Node | null;

    constructor(treeWidget: ITreeWidget) {
        this.treeWidget = treeWidget;
        this.clear();
    }

    public getSelectedNode(): Node | false {
        const selectedNodes = this.getSelectedNodes();

        if (selectedNodes.length) {
            return selectedNodes[0];
        } else {
            return false;
        }
    }

    public getSelectedNodes(): Node[] {
        if (this.selectedSingleNode) {
            return [this.selectedSingleNode];
        } else {
            const selectedNodes = [];

            for (const id in this.selectedNodes) {
                if (this.selectedNodes.hasOwnProperty(id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node) {
                        selectedNodes.push(node);
                    }
                }
            }

            return selectedNodes;
        }
    }

    public getSelectedNodesUnder(parent: Node): Node[] {
        if (this.selectedSingleNode) {
            if (parent.isParentOf(this.selectedSingleNode)) {
                return [this.selectedSingleNode];
            } else {
                return [];
            }
        } else {
            const selectedNodes = [];

            for (const id in this.selectedNodes) {
                if (this.selectedNodes.hasOwnProperty(id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selectedNodes.push(node);
                    }
                }
            }

            return selectedNodes;
        }
    }

    public isNodeSelected(node?: Node): boolean {
        if (!node) {
            return false;
        } else if (node.id != null) {
            if (this.selectedNodes[node.id]) {
                return true;
            } else {
                return false;
            }
        } else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        } else {
            return false;
        }
    }

    public clear(): void {
        this.selectedNodes = {};
        this.selectedSingleNode = null;
    }

    public removeFromSelection(node: Node, includeChildren = false): void {
        if (node.id == null) {
            if (this.selectedSingleNode && node.element === this.selectedSingleNode.element) {
                this.selectedSingleNode = null;
            }
        } else {
            delete this.selectedNodes[node.id];

            if (includeChildren) {
                node.iterate(() => {
                    delete this.selectedNodes[node.id];
                    return true;
                });
            }
        }
    }

    public addToSelection(node: Node): void {
        if (node.id != null) {
            this.selectedNodes[node.id] = true;
        } else {
            this.selectedSingleNode = node;
        }
    }
}
