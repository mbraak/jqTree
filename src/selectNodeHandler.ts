import { Node } from "./node";
import { JqTreeWidget } from "./tree.jquery";

export default class SelectNodeHandler {
    private treeWidget: JqTreeWidget;
    private selectedNodes: Set<NodeId>;
    private selectedSingleNode: Node | null;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;
        this.selectedNodes = new Set<NodeId>();
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
            const selectedNodes: Node[] = [];

            this.selectedNodes.forEach((id) => {
                const node = this.treeWidget.getNodeById(id);
                if (node) {
                    selectedNodes.push(node);
                }
            });

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
                if (
                    Object.prototype.hasOwnProperty.call(this.selectedNodes, id)
                ) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selectedNodes.push(node);
                    }
                }
            }

            return selectedNodes;
        }
    }

    public isNodeSelected(node: Node): boolean {
        if (node.id != null) {
            return this.selectedNodes.has(node.id);
        } else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        } else {
            return false;
        }
    }

    public clear(): void {
        this.selectedNodes.clear();
        this.selectedSingleNode = null;
    }

    public removeFromSelection(node: Node, includeChildren = false): void {
        if (node.id == null) {
            if (
                this.selectedSingleNode &&
                node.element === this.selectedSingleNode.element
            ) {
                this.selectedSingleNode = null;
            }
        } else {
            this.selectedNodes.delete(node.id);

            if (includeChildren) {
                node.iterate(() => {
                    if (node.id != null) {
                        this.selectedNodes.delete(node.id);
                    }
                    return true;
                });
            }
        }
    }

    public addToSelection(node: Node): void {
        if (node.id != null) {
            this.selectedNodes.add(node.id);
        } else {
            this.selectedSingleNode = node;
        }
    }

    public isFocusOnTree(): boolean {
        const activeElement = document.activeElement;

        return Boolean(
            activeElement &&
                activeElement.tagName === "SPAN" &&
                this.treeWidget._containsElement(activeElement as HTMLElement)
        );
    }
}
