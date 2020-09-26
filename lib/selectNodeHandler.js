export default class SelectNodeHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.clear();
    }
    getSelectedNode() {
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length) {
            return selectedNodes[0];
        }
        else {
            return false;
        }
    }
    getSelectedNodes() {
        if (this.selectedSingleNode) {
            return [this.selectedSingleNode];
        }
        else {
            const selectedNodes = [];
            for (const id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
        }
    }
    getSelectedNodesUnder(parent) {
        if (this.selectedSingleNode) {
            if (parent.isParentOf(this.selectedSingleNode)) {
                return [this.selectedSingleNode];
            }
            else {
                return [];
            }
        }
        else {
            const selectedNodes = [];
            for (const id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
        }
    }
    isNodeSelected(node) {
        if (node.id != null) {
            if (this.selectedNodes[node.id]) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        }
        else {
            return false;
        }
    }
    clear() {
        this.selectedNodes = {};
        this.selectedSingleNode = null;
    }
    removeFromSelection(node, includeChildren = false) {
        if (node.id == null) {
            if (this.selectedSingleNode &&
                node.element === this.selectedSingleNode.element) {
                this.selectedSingleNode = null;
            }
        }
        else {
            delete this.selectedNodes[node.id];
            if (includeChildren) {
                node.iterate(() => {
                    if (node.id != null) {
                        delete this.selectedNodes[node.id];
                    }
                    return true;
                });
            }
        }
    }
    addToSelection(node) {
        if (node.id != null) {
            this.selectedNodes[node.id] = true;
        }
        else {
            this.selectedSingleNode = node;
        }
    }
}
