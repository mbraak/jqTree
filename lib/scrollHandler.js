"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class ScrollHandler {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
    this.previousTop = -1;
    this.isInitialized = false;
  }
  checkScrolling() {
    this.ensureInit();
    this.checkVerticalScrolling();
    this.checkHorizontalScrolling();
  }
  scrollToY(top) {
    this.ensureInit();
    if (this.$scrollParent && this.$scrollParent[0]) {
      this.$scrollParent[0].scrollTop = top;
    } else {
      const offset = this.treeWidget.$el.offset();
      const treeTop = offset ? offset.top : 0;
      jQuery(document).scrollTop(top + treeTop);
    }
  }
  isScrolledIntoView($element) {
    this.ensureInit();
    let elementBottom;
    let viewBottom;
    let elementTop;
    let viewTop;
    const elHeight = $element.height() || 0;
    if (this.$scrollParent) {
      viewTop = 0;
      viewBottom = this.$scrollParent.height() || 0;
      const offset = $element.offset();
      const originalTop = offset ? offset.top : 0;
      elementTop = originalTop - this.scrollParentTop;
      elementBottom = elementTop + elHeight;
    } else {
      viewTop = jQuery(window).scrollTop() || 0;
      const windowHeight = jQuery(window).height() || 0;
      viewBottom = viewTop + windowHeight;
      const offset = $element.offset();
      elementTop = offset ? offset.top : 0;
      elementBottom = elementTop + elHeight;
    }
    return elementBottom <= viewBottom && elementTop >= viewTop;
  }
  getScrollLeft() {
    if (!this.$scrollParent) {
      return 0;
    } else {
      return this.$scrollParent.scrollLeft() || 0;
    }
  }
  initScrollParent() {
    const getParentWithOverflow = () => {
      const cssAttributes = ["overflow", "overflow-y"];
      const hasOverFlow = $el => {
        for (const attr of cssAttributes) {
          const overflowValue = $el.css(attr);
          if (overflowValue === "auto" || overflowValue === "scroll") {
            return true;
          }
        }
        return false;
      };
      if (hasOverFlow(this.treeWidget.$el)) {
        return this.treeWidget.$el;
      }
      for (const el of this.treeWidget.$el.parents().get()) {
        const $el = jQuery(el);
        if (hasOverFlow($el)) {
          return $el;
        }
      }
      return null;
    };
    const setDocumentAsScrollParent = () => {
      this.scrollParentTop = 0;
      this.$scrollParent = null;
    };
    if (this.treeWidget.$el.css("position") === "fixed") {
      setDocumentAsScrollParent();
    }
    const $scrollParent = getParentWithOverflow();
    if ($scrollParent && $scrollParent.length && $scrollParent[0]?.tagName !== "HTML") {
      this.$scrollParent = $scrollParent;
      const offset = this.$scrollParent.offset();
      this.scrollParentTop = offset ? offset.top : 0;
    } else {
      setDocumentAsScrollParent();
    }
    this.isInitialized = true;
  }
  ensureInit() {
    if (!this.isInitialized) {
      this.initScrollParent();
    }
  }
  handleVerticalScrollingWithScrollParent(area) {
    const scrollParent = this.$scrollParent && this.$scrollParent[0];
    if (!scrollParent) {
      return;
    }
    const distanceBottom = this.scrollParentTop + scrollParent.offsetHeight - area.bottom;
    if (distanceBottom < 20) {
      scrollParent.scrollTop += 20;
      this.treeWidget.refreshHitAreas();
      this.previousTop = -1;
    } else if (area.top - this.scrollParentTop < 20) {
      scrollParent.scrollTop -= 20;
      this.treeWidget.refreshHitAreas();
      this.previousTop = -1;
    }
  }
  handleVerticalScrollingWithDocument(area) {
    const scrollTop = jQuery(document).scrollTop() || 0;
    const distanceTop = area.top - scrollTop;
    if (distanceTop < 20) {
      jQuery(document).scrollTop(scrollTop - 20);
    } else {
      const windowHeight = jQuery(window).height() || 0;
      if (windowHeight - (area.bottom - scrollTop) < 20) {
        jQuery(document).scrollTop(scrollTop + 20);
      }
    }
  }
  checkVerticalScrolling() {
    const hoveredArea = this.treeWidget.dndHandler.hoveredArea;
    if (hoveredArea && hoveredArea.top !== this.previousTop) {
      this.previousTop = hoveredArea.top;
      if (this.$scrollParent) {
        this.handleVerticalScrollingWithScrollParent(hoveredArea);
      } else {
        this.handleVerticalScrollingWithDocument(hoveredArea);
      }
    }
  }
  checkHorizontalScrolling() {
    const positionInfo = this.treeWidget.dndHandler.positionInfo;
    if (!positionInfo) {
      return;
    }
    if (this.$scrollParent) {
      this.handleHorizontalScrollingWithParent(positionInfo);
    } else {
      this.handleHorizontalScrollingWithDocument(positionInfo);
    }
  }
  handleHorizontalScrollingWithParent(positionInfo) {
    if (positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
      return;
    }
    const $scrollParent = this.$scrollParent;
    const scrollParentOffset = $scrollParent && $scrollParent.offset();
    if (!($scrollParent && scrollParentOffset)) {
      return;
    }
    const scrollParent = $scrollParent[0];
    if (!scrollParent) {
      return;
    }
    const canScrollRight = scrollParent.scrollLeft + scrollParent.clientWidth < scrollParent.scrollWidth;
    const canScrollLeft = scrollParent.scrollLeft > 0;
    const rightEdge = scrollParentOffset.left + scrollParent.clientWidth;
    const leftEdge = scrollParentOffset.left;
    const isNearRightEdge = positionInfo.pageX > rightEdge - 20;
    const isNearLeftEdge = positionInfo.pageX < leftEdge + 20;
    if (isNearRightEdge && canScrollRight) {
      scrollParent.scrollLeft = Math.min(scrollParent.scrollLeft + 20, scrollParent.scrollWidth);
    } else if (isNearLeftEdge && canScrollLeft) {
      scrollParent.scrollLeft = Math.max(scrollParent.scrollLeft - 20, 0);
    }
  }
  handleHorizontalScrollingWithDocument(positionInfo) {
    if (positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
      return;
    }
    const $document = jQuery(document);
    const scrollLeft = $document.scrollLeft() || 0;
    const windowWidth = jQuery(window).width() || 0;
    const canScrollLeft = scrollLeft > 0;
    const isNearRightEdge = positionInfo.pageX > windowWidth - 20;
    const isNearLeftEdge = positionInfo.pageX - scrollLeft < 20;
    if (isNearRightEdge) {
      $document.scrollLeft(scrollLeft + 20);
    } else if (isNearLeftEdge && canScrollLeft) {
      $document.scrollLeft(Math.max(scrollLeft - 20, 0));
    }
  }
}
exports.default = ScrollHandler;