"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class VisibleNodeIterator {
  constructor(tree) {
    this.tree = tree;
  }
  iterate() {
    let isFirstNode = true;
    const _iterateNode = (node, nextNode) => {
      let mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
      let element = null;

      // Is the element visible?
      if (node.element?.offsetParent) {
        element = node.element;
        if (isFirstNode) {
          this.handleFirstNode(node);
          isFirstNode = false;
        }
        if (!node.hasChildren()) {
          this.handleNode(node, nextNode, node.element);
        } else if (node.is_open) {
          if (!this.handleOpenFolder(node, node.element)) {
            mustIterateInside = false;
          }
        } else {
          this.handleClosedFolder(node, nextNode, element);
        }
      }
      if (mustIterateInside) {
        const childrenLength = node.children.length;
        node.children.forEach((_, i) => {
          const child = node.children[i];
          if (child) {
            if (i === childrenLength - 1) {
              _iterateNode(child, null);
            } else {
              const nextChild = node.children[i + 1];
              if (nextChild) {
                _iterateNode(child, nextChild);
              }
            }
          }
        });
        if (node.is_open && element) {
          this.handleAfterOpenFolder(node, nextNode);
        }
      }
    };
    _iterateNode(this.tree, null);
  }

  /*
  override
  return
      - true: continue iterating
      - false: stop iterating
  */
}
var _default = exports.default = VisibleNodeIterator;