"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _node = require("../node");
class GhostDropHint {
  constructor(node, element, position) {
    this.element = element;
    this.node = node;
    this.ghost = this.createGhostElement();
    if (position === _node.Position.After) {
      this.moveAfter();
    } else if (position === _node.Position.Before) {
      this.moveBefore();
    } else if (position === _node.Position.Inside) {
      if (node.isFolder() && node.is_open) {
        this.moveInsideOpenFolder();
      } else {
        this.moveInside();
      }
    }
  }
  remove() {
    this.ghost.remove();
  }
  moveAfter() {
    this.element.after(this.ghost);
  }
  moveBefore() {
    this.element.before(this.ghost);
  }
  moveInsideOpenFolder() {
    const childElement = this.node.children[0]?.element;
    if (childElement) {
      childElement.before(this.ghost);
    }
  }
  moveInside() {
    this.element.after(this.ghost);
    this.ghost.classList.add("jqtree-inside");
  }
  createGhostElement() {
    const ghost = document.createElement("li");
    ghost.className = "jqtree_common jqtree-ghost";
    const circleSpan = document.createElement("span");
    circleSpan.className = "jqtree_common jqtree-circle";
    ghost.append(circleSpan);
    const lineSpan = document.createElement("span");
    lineSpan.className = "jqtree_common jqtree-line";
    ghost.append(lineSpan);
    return ghost;
  }
}
var _default = exports.default = GhostDropHint;