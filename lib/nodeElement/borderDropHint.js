"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class BorderDropHint {
  constructor(element, scrollLeft) {
    const div = element.querySelector(":scope > .jqtree-element");
    if (!div) {
      this.hint = undefined;
      return;
    }
    const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
    const height = Math.max(element.clientHeight - 4, 0);
    const hint = document.createElement("span");
    hint.className = "jqtree-border";
    hint.style.width = `${width}px`;
    hint.style.height = `${height}px`;
    this.hint = hint;
    div.append(this.hint);
  }
  remove() {
    this.hint?.remove();
  }
}
var _default = exports.default = BorderDropHint;