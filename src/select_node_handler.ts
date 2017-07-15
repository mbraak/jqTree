import { Node } from "./node";
import { ITreeWidget } from "./itree_widget";

export default class SelectNodeHandler {
    private tree_widget: ITreeWidget;
    private selected_nodes: any;
    private selected_single_node: Node | null;

    constructor(tree_widget: ITreeWidget) {
        this.tree_widget = tree_widget;
        this.clear();
    }

    public getSelectedNode(): Node | false {
        const selected_nodes = this.getSelectedNodes();

        if (selected_nodes.length) {
            return selected_nodes[0];
        } else {
            return false;
        }
    }

    public getSelectedNodes(): Node[] {
        if (this.selected_single_node) {
            return [this.selected_single_node];
        } else {
            const selected_nodes = [];

            for (const id in this.selected_nodes) {
                if (this.selected_nodes.hasOwnProperty(id)) {
                    const node = this.tree_widget.getNodeById(id);
                    if (node) {
                        selected_nodes.push(node);
                    }
                }
            }

            return selected_nodes;
        }
    }

    public getSelectedNodesUnder(parent: Node) {
        if (this.selected_single_node) {
            if (parent.isParentOf(this.selected_single_node)) {
                return [this.selected_single_node];
            } else {
                return [];
            }
        } else {
            const selected_nodes = [];

            for (const id in this.selected_nodes) {
                if (this.selected_nodes.hasOwnProperty(id)) {
                    const node = this.tree_widget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selected_nodes.push(node);
                    }
                }
            }

            return selected_nodes;
        }
    }

    public isNodeSelected(node?: Node): boolean {
        if (!node) {
            return false;
        } else if (node.id != null) {
            if (this.selected_nodes[node.id]) {
                return true;
            } else {
                return false;
            }
        } else if (this.selected_single_node) {
            return this.selected_single_node.element === node.element;
        } else {
            return false;
        }
    }

    public clear() {
        this.selected_nodes = {};
        this.selected_single_node = null;
    }

    public removeFromSelection(node: Node, include_children: boolean = false) {
        if (node.id == null) {
            if (
                this.selected_single_node &&
                node.element === this.selected_single_node.element
            ) {
                this.selected_single_node = null;
            }
        } else {
            delete this.selected_nodes[node.id];

            if (include_children) {
                node.iterate(() => {
                    delete this.selected_nodes[node.id];
                    return true;
                });
            }
        }
    }

    public addToSelection(node: Node) {
        if (node.id != null) {
            this.selected_nodes[node.id] = true;
        } else {
            this.selected_single_node = node;
        }
    }
}
