"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class DragElement {
  constructor(nodeName, offsetX, offsetY, $tree, autoEscape) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.$element = jQuery("<span>").addClass("jqtree-title jqtree-dragging");
    if (autoEscape) {
      this.$element.text(nodeName);
    } else {
      this.$element.html(nodeName);
    }
    this.$element.css("position", "absolute");
    $tree.append(this.$element);
  }
  move(pageX, pageY) {
    this.$element.offset({
      left: pageX - this.offsetX,
      top: pageY - this.offsetY
    });
  }
  remove() {
    this.$element.remove();
  }
}
var _default = exports.default = DragElement;