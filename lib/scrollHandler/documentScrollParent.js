"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class DocumentScrollParent {
  constructor($element, refreshHitAreas) {
    this.$element = $element;
    this.refreshHitAreas = refreshHitAreas;
  }
  checkHorizontalScrolling(pageX) {
    const newHorizontalScrollDirection = this.getNewHorizontalScrollDirection(pageX);
    if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
      this.horizontalScrollDirection = newHorizontalScrollDirection;
      if (this.horizontalScrollTimeout != null) {
        window.clearTimeout(this.horizontalScrollTimeout);
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
    return document.documentElement.scrollLeft;
  }
  scrollToY(top) {
    const offset = this.$element.offset();
    const treeTop = offset ? offset.top : 0;
    jQuery(document).scrollTop(top + treeTop);
  }
  stopScrolling() {
    this.horizontalScrollDirection = undefined;
    this.verticalScrollDirection = undefined;
    this.documentScrollHeight = undefined;
    this.documentScrollWidth = undefined;
  }
  getNewHorizontalScrollDirection(pageX) {
    const $document = jQuery(document);
    const scrollLeft = $document.scrollLeft() || 0;
    const windowWidth = jQuery(window).width() || 0;
    const isNearRightEdge = pageX > windowWidth - 20;
    const isNearLeftEdge = pageX - scrollLeft < 20;
    if (isNearRightEdge && this.canScrollRight()) {
      return "right";
    }
    if (isNearLeftEdge) {
      return "left";
    }
    return undefined;
  }
  canScrollRight() {
    const documentElement = document.documentElement;
    return documentElement.scrollLeft + documentElement.clientWidth < this.getDocumentScrollWidth();
  }
  canScrollDown() {
    const documentElement = document.documentElement;
    return documentElement.scrollTop + documentElement.clientHeight < this.getDocumentScrollHeight();
  }
  getDocumentScrollHeight() {
    // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
    if (this.documentScrollHeight == null) {
      this.documentScrollHeight = document.documentElement.scrollHeight;
    }
    return this.documentScrollHeight;
  }
  getDocumentScrollWidth() {
    // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
    if (this.documentScrollWidth == null) {
      this.documentScrollWidth = document.documentElement.scrollWidth;
    }
    return this.documentScrollWidth;
  }
  getNewVerticalScrollDirection(pageY) {
    const scrollTop = jQuery(document).scrollTop() || 0;
    const distanceTop = pageY - scrollTop;
    if (distanceTop < 20) {
      return "top";
    }
    const windowHeight = jQuery(window).height() || 0;
    if (windowHeight - (pageY - scrollTop) < 20 && this.canScrollDown()) {
      return "bottom";
    }
    return undefined;
  }
  scrollHorizontally() {
    if (!this.horizontalScrollDirection) {
      return;
    }
    const distance = this.horizontalScrollDirection === "left" ? -20 : 20;
    window.scrollBy({
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
    window.scrollBy({
      left: 0,
      top: distance,
      behavior: "instant"
    });
    this.refreshHitAreas();
    setTimeout(this.scrollVertically.bind(this), 40);
  }
}
exports.default = DocumentScrollParent;