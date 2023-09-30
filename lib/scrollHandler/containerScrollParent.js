"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class ContainerScrollParent {
  constructor(_ref) {
    let {
      $container,
      refreshHitAreas
    } = _ref;
    this.$container = $container;
    this.refreshHitAreas = refreshHitAreas;
  }
  checkHorizontalScrolling(pageX) {
    const newHorizontalScrollDirection = this.getNewHorizontalScrollDirection(pageX);
    if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
      this.horizontalScrollDirection = newHorizontalScrollDirection;
      if (this.horizontalScrollTimeout != null) {
        window.clearTimeout(this.verticalScrollTimeout);
      }
      if (newHorizontalScrollDirection) {
        this.horizontalScrollTimeout = window.setTimeout(this.scrollHorizontally.bind(this), 40);
      }
    }
  }
  checkVerticalScrolling(pageY) {
    const newVerticalScrollDirection = this.getNewVerticalScrollDirection(pageY);
    if (this.verticalScrollDirection !== newVerticalScrollDirection) {
      this.verticalScrollDirection = newVerticalScrollDirection;
      if (this.verticalScrollTimeout != null) {
        window.clearTimeout(this.verticalScrollTimeout);
        this.verticalScrollTimeout = undefined;
      }
      if (newVerticalScrollDirection) {
        this.verticalScrollTimeout = window.setTimeout(this.scrollVertically.bind(this), 40);
      }
    }
  }
  getScrollLeft() {
    return this.$container.scrollLeft() || 0;
  }
  scrollToY(top) {
    const container = this.$container.get(0);
    container.scrollTop = top;
  }
  stopScrolling() {
    this.horizontalScrollDirection = undefined;
    this.verticalScrollDirection = undefined;
    this.scrollParentTop = undefined;
    this.scrollParentBottom = undefined;
  }
  getNewHorizontalScrollDirection(pageX) {
    const scrollParentOffset = this.$container.offset();
    if (!scrollParentOffset) {
      return undefined;
    }
    const container = this.$container.get(0);
    const rightEdge = scrollParentOffset.left + container.clientWidth;
    const leftEdge = scrollParentOffset.left;
    const isNearRightEdge = pageX > rightEdge - 20;
    const isNearLeftEdge = pageX < leftEdge + 20;
    if (isNearRightEdge) {
      return "right";
    } else if (isNearLeftEdge) {
      return "left";
    }
    return undefined;
  }
  getNewVerticalScrollDirection(pageY) {
    if (pageY < this.getScrollParentTop()) {
      return "top";
    }
    if (pageY > this.getScrollParentBottom()) {
      return "bottom";
    }
    return undefined;
  }
  scrollHorizontally() {
    if (!this.horizontalScrollDirection) {
      return;
    }
    const distance = this.horizontalScrollDirection === "left" ? -20 : 20;
    const container = this.$container.get(0);
    container.scrollBy({
      left: distance,
      top: 0,
      behavior: "instant"
    });
    this.refreshHitAreas();
    setTimeout(this.scrollHorizontally.bind(this), 40);
  }
  scrollVertically() {
    if (!this.verticalScrollDirection) {
      return;
    }
    const distance = this.verticalScrollDirection === "top" ? -20 : 20;
    const container = this.$container.get(0);
    container.scrollBy({
      left: 0,
      top: distance,
      behavior: "instant"
    });
    this.refreshHitAreas();
    setTimeout(this.scrollVertically.bind(this), 40);
  }
  getScrollParentTop() {
    if (this.scrollParentTop == null) {
      this.scrollParentTop = this.$container.offset()?.top || 0;
    }
    return this.scrollParentTop;
  }
  getScrollParentBottom() {
    if (this.scrollParentBottom == null) {
      this.scrollParentBottom = this.getScrollParentTop() + (this.$container.innerHeight() ?? 0);
    }
    return this.scrollParentBottom;
  }
}
exports.default = ContainerScrollParent;