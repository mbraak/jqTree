"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _node = require("../node");
var _index = _interopRequireDefault(require("./index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class FolderElement extends _index.default {
  open(onFinished) {
    let slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let animationSpeed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "fast";
    if (this.node.is_open) {
      return;
    }
    this.node.is_open = true;
    const button = this.getButton();
    button.classList.remove("jqtree-closed");
    button.innerHTML = "";
    const openedIconElement = this.treeWidget.renderer.openedIconElement;
    if (openedIconElement) {
      const icon = openedIconElement.cloneNode(true);
      button.appendChild(icon);
    }
    const doOpen = () => {
      this.element.classList.remove("jqtree-closed");
      const titleSpan = this.getTitleSpan();
      titleSpan.setAttribute("aria-expanded", "true");
      if (onFinished) {
        onFinished(this.node);
      }
      this.treeWidget._triggerEvent("tree.open", {
        node: this.node
      });
    };
    if (slide) {
      jQuery(this.getUl()).slideDown(animationSpeed, doOpen);
    } else {
      jQuery(this.getUl()).show();
      doOpen();
    }
  }
  close() {
    let slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    let animationSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "fast";
    if (!this.node.is_open) {
      return;
    }
    this.node.is_open = false;
    const button = this.getButton();
    button.classList.add("jqtree-closed");
    button.innerHTML = "";
    const closedIconElement = this.treeWidget.renderer.closedIconElement;
    if (closedIconElement) {
      const icon = closedIconElement.cloneNode(true);
      button.appendChild(icon);
    }
    const doClose = () => {
      this.element.classList.add("jqtree-closed");
      const titleSpan = this.getTitleSpan();
      titleSpan.setAttribute("aria-expanded", "false");
      this.treeWidget._triggerEvent("tree.close", {
        node: this.node
      });
    };
    if (slide) {
      jQuery(this.getUl()).slideUp(animationSpeed, doClose);
    } else {
      jQuery(this.getUl()).hide();
      doClose();
    }
  }
  mustShowBorderDropHint(position) {
    return !this.node.is_open && position === _node.Position.Inside;
  }
  getButton() {
    return this.element.querySelector(":scope > .jqtree-element > a.jqtree-toggler");
  }
}
var _default = exports.default = FolderElement;