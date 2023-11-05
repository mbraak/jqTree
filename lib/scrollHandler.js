"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _createScrollParent = _interopRequireDefault(require("./scrollHandler/createScrollParent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class ScrollHandler {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
    this.scrollParent = undefined;
  }
  checkScrolling(positionInfo) {
    this.checkVerticalScrolling(positionInfo);
    this.checkHorizontalScrolling(positionInfo);
  }
  stopScrolling() {
    this.getScrollParent().stopScrolling();
  }
  scrollToY(top) {
    this.getScrollParent().scrollToY(top);
  }
  getScrollLeft() {
    return this.getScrollParent().getScrollLeft();
  }
  checkVerticalScrolling(positionInfo) {
    if (positionInfo.pageY == null) {
      return;
    }
    this.getScrollParent().checkVerticalScrolling(positionInfo.pageY);
  }
  checkHorizontalScrolling(positionInfo) {
    if (positionInfo.pageX == null) {
      return;
    }
    this.getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
  }
  getScrollParent() {
    if (!this.scrollParent) {
      this.scrollParent = (0, _createScrollParent.default)(this.treeWidget.$el, this.treeWidget.refreshHitAreas.bind(this.treeWidget));
    }
    return this.scrollParent;
  }
}
exports.default = ScrollHandler;