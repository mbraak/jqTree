"use strict";
exports.__esModule = true;
var ScrollHandler = /** @class */ (function () {
    function ScrollHandler(treeWidget) {
        this.treeWidget = treeWidget;
        this.previousTop = -1;
        this.isInitialized = false;
    }
    ScrollHandler.prototype.checkScrolling = function () {
        this.ensureInit();
        this.checkVerticalScrolling();
        this.checkHorizontalScrolling();
    };
    ScrollHandler.prototype.scrollToY = function (top) {
        this.ensureInit();
        if (this.$scrollParent) {
            this.$scrollParent[0].scrollTop = top;
        }
        else {
            var offset = this.treeWidget.$el.offset();
            var treeTop = offset ? offset.top : 0;
            jQuery(document).scrollTop(top + treeTop);
        }
    };
    ScrollHandler.prototype.isScrolledIntoView = function ($element) {
        this.ensureInit();
        var elementBottom;
        var viewBottom;
        var elementTop;
        var viewTop;
        var elHeight = $element.height() || 0;
        if (this.$scrollParent) {
            viewTop = 0;
            viewBottom = this.$scrollParent.height() || 0;
            var offset = $element.offset();
            var originalTop = offset ? offset.top : 0;
            elementTop = originalTop - this.scrollParentTop;
            elementBottom = elementTop + elHeight;
        }
        else {
            viewTop = jQuery(window).scrollTop() || 0;
            var windowHeight = jQuery(window).height() || 0;
            viewBottom = viewTop + windowHeight;
            var offset = $element.offset();
            elementTop = offset ? offset.top : 0;
            elementBottom = elementTop + elHeight;
        }
        return elementBottom <= viewBottom && elementTop >= viewTop;
    };
    ScrollHandler.prototype.getScrollLeft = function () {
        if (!this.$scrollParent) {
            return 0;
        }
        else {
            return this.$scrollParent.scrollLeft() || 0;
        }
    };
    ScrollHandler.prototype.initScrollParent = function () {
        var _this = this;
        var getParentWithOverflow = function () {
            var cssAttributes = ["overflow", "overflow-y"];
            var hasOverFlow = function ($el) {
                for (var _i = 0, cssAttributes_1 = cssAttributes; _i < cssAttributes_1.length; _i++) {
                    var attr = cssAttributes_1[_i];
                    var overflowValue = $el.css(attr);
                    if (overflowValue === "auto" ||
                        overflowValue === "scroll") {
                        return true;
                    }
                }
                return false;
            };
            if (hasOverFlow(_this.treeWidget.$el)) {
                return _this.treeWidget.$el;
            }
            for (var _i = 0, _a = _this.treeWidget.$el.parents().get(); _i < _a.length; _i++) {
                var el = _a[_i];
                var $el = jQuery(el);
                if (hasOverFlow($el)) {
                    return $el;
                }
            }
            return null;
        };
        var setDocumentAsScrollParent = function () {
            _this.scrollParentTop = 0;
            _this.$scrollParent = null;
        };
        if (this.treeWidget.$el.css("position") === "fixed") {
            setDocumentAsScrollParent();
        }
        var $scrollParent = getParentWithOverflow();
        if ($scrollParent &&
            $scrollParent.length &&
            $scrollParent[0].tagName !== "HTML") {
            this.$scrollParent = $scrollParent;
            var offset = this.$scrollParent.offset();
            this.scrollParentTop = offset ? offset.top : 0;
        }
        else {
            setDocumentAsScrollParent();
        }
        this.isInitialized = true;
    };
    ScrollHandler.prototype.ensureInit = function () {
        if (!this.isInitialized) {
            this.initScrollParent();
        }
    };
    ScrollHandler.prototype.handleVerticalScrollingWithScrollParent = function (area) {
        var scrollParent = this.$scrollParent && this.$scrollParent[0];
        if (!scrollParent) {
            return;
        }
        var distanceBottom = this.scrollParentTop + scrollParent.offsetHeight - area.bottom;
        if (distanceBottom < 20) {
            scrollParent.scrollTop += 20;
            this.treeWidget.refreshHitAreas();
            this.previousTop = -1;
        }
        else if (area.top - this.scrollParentTop < 20) {
            scrollParent.scrollTop -= 20;
            this.treeWidget.refreshHitAreas();
            this.previousTop = -1;
        }
    };
    ScrollHandler.prototype.handleVerticalScrollingWithDocument = function (area) {
        var scrollTop = jQuery(document).scrollTop() || 0;
        var distanceTop = area.top - scrollTop;
        if (distanceTop < 20) {
            jQuery(document).scrollTop(scrollTop - 20);
        }
        else {
            var windowHeight = jQuery(window).height() || 0;
            if (windowHeight - (area.bottom - scrollTop) < 20) {
                jQuery(document).scrollTop(scrollTop + 20);
            }
        }
    };
    ScrollHandler.prototype.checkVerticalScrolling = function () {
        var hoveredArea = this.treeWidget.dndHandler.hoveredArea;
        if (hoveredArea && hoveredArea.top !== this.previousTop) {
            this.previousTop = hoveredArea.top;
            if (this.$scrollParent) {
                this.handleVerticalScrollingWithScrollParent(hoveredArea);
            }
            else {
                this.handleVerticalScrollingWithDocument(hoveredArea);
            }
        }
    };
    ScrollHandler.prototype.checkHorizontalScrolling = function () {
        var positionInfo = this.treeWidget.dndHandler.positionInfo;
        if (!positionInfo) {
            return;
        }
        if (this.$scrollParent) {
            this.handleHorizontalScrollingWithParent(positionInfo);
        }
        else {
            this.handleHorizontalScrollingWithDocument(positionInfo);
        }
    };
    ScrollHandler.prototype.handleHorizontalScrollingWithParent = function (positionInfo) {
        if (positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return;
        }
        var $scrollParent = this.$scrollParent;
        var scrollParentOffset = $scrollParent && $scrollParent.offset();
        if (!($scrollParent && scrollParentOffset)) {
            return;
        }
        var scrollParent = $scrollParent[0];
        var canScrollRight = scrollParent.scrollLeft + scrollParent.clientWidth <
            scrollParent.scrollWidth;
        var canScrollLeft = scrollParent.scrollLeft > 0;
        var rightEdge = scrollParentOffset.left + scrollParent.clientWidth;
        var leftEdge = scrollParentOffset.left;
        var isNearRightEdge = positionInfo.pageX > rightEdge - 20;
        var isNearLeftEdge = positionInfo.pageX < leftEdge + 20;
        if (isNearRightEdge && canScrollRight) {
            scrollParent.scrollLeft = Math.min(scrollParent.scrollLeft + 20, scrollParent.scrollWidth);
        }
        else if (isNearLeftEdge && canScrollLeft) {
            scrollParent.scrollLeft = Math.max(scrollParent.scrollLeft - 20, 0);
        }
    };
    ScrollHandler.prototype.handleHorizontalScrollingWithDocument = function (positionInfo) {
        if (positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return;
        }
        var $document = jQuery(document);
        var scrollLeft = $document.scrollLeft() || 0;
        var windowWidth = jQuery(window).width() || 0;
        var canScrollLeft = scrollLeft > 0;
        var isNearRightEdge = positionInfo.pageX > windowWidth - 20;
        var isNearLeftEdge = positionInfo.pageX - scrollLeft < 20;
        if (isNearRightEdge) {
            $document.scrollLeft(scrollLeft + 20);
        }
        else if (isNearLeftEdge && canScrollLeft) {
            $document.scrollLeft(Math.max(scrollLeft - 20, 0));
        }
    };
    return ScrollHandler;
}());
exports["default"] = ScrollHandler;
