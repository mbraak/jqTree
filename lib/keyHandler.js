"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class KeyHandler {
  handleKeyDownHandler = null;
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
    if (treeWidget.options.keyboardSupport) {
      this.handleKeyDownHandler = this.handleKeyDown.bind(this);
      document.addEventListener("keydown", this.handleKeyDownHandler);
    }
  }
  deinit() {
    if (this.handleKeyDownHandler) {
      document.removeEventListener("keydown", this.handleKeyDownHandler);
    }
  }
  moveDown(selectedNode) {
    return this.selectNode(selectedNode.getNextVisibleNode());
  }
  moveUp(selectedNode) {
    return this.selectNode(selectedNode.getPreviousVisibleNode());
  }
  moveRight(selectedNode) {
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
  moveLeft(selectedNode) {
    if (selectedNode.isFolder() && selectedNode.is_open) {
      // Left on an open node closes the node
      this.treeWidget.closeNode(selectedNode);
      return false;
    } else {
      // Left on a closed or end node moves focus to the node's parent
      return this.selectNode(selectedNode.getParent());
    }
  }
  selectNode(node) {
    if (!node) {
      return true;
    } else {
      this.treeWidget.selectNode(node);
      return false;
    }
  }
  handleKeyDown = e => {
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
  canHandleKeyboard() {
    return (this.treeWidget.options.keyboardSupport || false) && this.treeWidget.selectNodeHandler.isFocusOnTree();
  }
}
exports.default = KeyHandler;