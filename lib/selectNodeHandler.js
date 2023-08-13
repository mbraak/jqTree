"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class SelectNodeHandler {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
    this.selectedNodes = new Set();
    this.clear();
  }
  getSelectedNode() {
    const selectedNodes = this.getSelectedNodes();
    if (selectedNodes.length) {
      return selectedNodes[0] || false;
    } else {
      return false;
    }
  }
  getSelectedNodes() {
    if (this.selectedSingleNode) {
      return [this.selectedSingleNode];
    } else {
      const selectedNodes = [];
      this.selectedNodes.forEach(id => {
        const node = this.treeWidget.getNodeById(id);
        if (node) {
          selectedNodes.push(node);
        }
      });
      return selectedNodes;
    }
  }
  getSelectedNodesUnder(parent) {
    if (this.selectedSingleNode) {
      if (parent.isParentOf(this.selectedSingleNode)) {
        return [this.selectedSingleNode];
      } else {
        return [];
      }
    } else {
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
      return this.selectedNodes.has(node.id);
    } else if (this.selectedSingleNode) {
      return this.selectedSingleNode.element === node.element;
    } else {
      return false;
    }
  }
  clear() {
    this.selectedNodes.clear();
    this.selectedSingleNode = null;
  }
  removeFromSelection(node) {
    let includeChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (node.id == null) {
      if (this.selectedSingleNode && node.element === this.selectedSingleNode.element) {
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
  addToSelection(node) {
    if (node.id != null) {
      this.selectedNodes.add(node.id);
    } else {
      this.selectedSingleNode = node;
    }
  }
  isFocusOnTree() {
    const activeElement = document.activeElement;
    return Boolean(activeElement && activeElement.tagName === "SPAN" && this.treeWidget._containsElement(activeElement));
  }
}
exports.default = SelectNodeHandler;