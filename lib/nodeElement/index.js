"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _node = require("../node");
var _borderDropHint = _interopRequireDefault(require("./borderDropHint"));
var _ghostDropHint = _interopRequireDefault(require("./ghostDropHint"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class NodeElement {
  constructor(node, treeWidget) {
    this.init(node, treeWidget);
  }
  init(node, treeWidget) {
    this.node = node;
    this.treeWidget = treeWidget;
    if (!node.element) {
      const element = this.treeWidget.element.get(0);
      if (element) {
        node.element = element;
      }
    }
    if (node.element) {
      this.element = node.element;
    }
  }
  addDropHint(position) {
    if (this.mustShowBorderDropHint(position)) {
      return new _borderDropHint.default(this.element, this.treeWidget._getScrollLeft());
    } else {
      return new _ghostDropHint.default(this.node, this.element, position);
    }
  }
  select(mustSetFocus) {
    this.element.classList.add("jqtree-selected");
    const titleSpan = this.getTitleSpan();
    const tabIndex = this.treeWidget.options.tabIndex;

    // Check for null or undefined
    if (tabIndex != null) {
      titleSpan.setAttribute("tabindex", tabIndex.toString());
    }
    titleSpan.setAttribute("aria-selected", "true");
    if (mustSetFocus) {
      titleSpan.focus();
    }
  }
  deselect() {
    this.element.classList.remove("jqtree-selected");
    const titleSpan = this.getTitleSpan();
    titleSpan.removeAttribute("tabindex");
    titleSpan.setAttribute("aria-selected", "false");
    titleSpan.blur();
  }
  getUl() {
    return this.element.querySelector(":scope > ul");
  }
  getTitleSpan() {
    return this.element.querySelector(":scope > .jqtree-element > span.jqtree-title");
  }
  mustShowBorderDropHint(position) {
    return position === _node.Position.Inside;
  }
}
var _default = exports.default = NodeElement;