"use strict";
exports.__esModule = true;
var ScrollHandler = /** @class */ (function () {
    function ScrollHandler(tree_widget) {
        this.tree_widget = tree_widget;
        this.previous_top = -1;
        this.is_initialized = false;
    }
    ScrollHandler.prototype.checkScrolling = function () {
        this.ensureInit();
        this.checkVerticalScrolling();
        this.checkHorizontalScrolling();
    };
    ScrollHandler.prototype.scrollToY = function (top) {
        this.ensureInit();
        if (this.$scroll_parent) {
            this.$scroll_parent[0].scrollTop = top;
        }
        else {
            var offset = this.tree_widget.$el.offset();
            var tree_top = offset ? offset.top : 0;
            jQuery(document).scrollTop(top + tree_top);
        }
    };
    ScrollHandler.prototype.isScrolledIntoView = function ($element) {
        this.ensureInit();
        var element_bottom;
        var view_bottom;
        var element_top;
        var view_top;
        var el_height = $element.height() || 0;
        if (this.$scroll_parent) {
            view_top = 0;
            view_bottom = this.$scroll_parent.height() || 0;
            var offset = $element.offset();
            var original_top = offset ? offset.top : 0;
            element_top = original_top - this.scroll_parent_top;
            element_bottom = element_top + el_height;
        }
        else {
            view_top = jQuery(window).scrollTop() || 0;
            var window_height = jQuery(window).height() || 0;
            view_bottom = view_top + window_height;
            var offset = $element.offset();
            element_top = offset ? offset.top : 0;
            element_bottom = element_top + el_height;
        }
        return element_bottom <= view_bottom && element_top >= view_top;
    };
    ScrollHandler.prototype.getScrollLeft = function () {
        if (!this.$scroll_parent) {
            return 0;
        }
        else {
            return this.$scroll_parent.scrollLeft() || 0;
        }
    };
    ScrollHandler.prototype.initScrollParent = function () {
        var _this = this;
        var getParentWithOverflow = function () {
            var css_attributes = ["overflow", "overflow-y"];
            var hasOverFlow = function ($el) {
                for (var _i = 0, css_attributes_1 = css_attributes; _i < css_attributes_1.length; _i++) {
                    var attr = css_attributes_1[_i];
                    var overflow_value = $el.css(attr);
                    if (overflow_value === "auto" ||
                        overflow_value === "scroll") {
                        return true;
                    }
                }
                return false;
            };
            if (hasOverFlow(_this.tree_widget.$el)) {
                return _this.tree_widget.$el;
            }
            for (var _i = 0, _a = _this.tree_widget.$el.parents().get(); _i < _a.length; _i++) {
                var el = _a[_i];
                var $el = jQuery(el);
                if (hasOverFlow($el)) {
                    return $el;
                }
            }
            return null;
        };
        var setDocumentAsScrollParent = function () {
            _this.scroll_parent_top = 0;
            _this.$scroll_parent = null;
        };
        if (this.tree_widget.$el.css("position") === "fixed") {
            setDocumentAsScrollParent();
        }
        var $scroll_parent = getParentWithOverflow();
        if ($scroll_parent &&
            $scroll_parent.length &&
            $scroll_parent[0].tagName !== "HTML") {
            this.$scroll_parent = $scroll_parent;
            var offset = this.$scroll_parent.offset();
            this.scroll_parent_top = offset ? offset.top : 0;
        }
        else {
            setDocumentAsScrollParent();
        }
        this.is_initialized = true;
    };
    ScrollHandler.prototype.ensureInit = function () {
        if (!this.is_initialized) {
            this.initScrollParent();
        }
    };
    ScrollHandler.prototype.handleVerticalScrollingWithScrollParent = function (area) {
        var scroll_parent = this.$scroll_parent && this.$scroll_parent[0];
        if (!scroll_parent) {
            return;
        }
        var distance_bottom = this.scroll_parent_top + scroll_parent.offsetHeight - area.bottom;
        if (distance_bottom < 20) {
            scroll_parent.scrollTop += 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        }
        else if (area.top - this.scroll_parent_top < 20) {
            scroll_parent.scrollTop -= 20;
            this.tree_widget.refreshHitAreas();
            this.previous_top = -1;
        }
    };
    ScrollHandler.prototype.handleVerticalScrollingWithDocument = function (area) {
        var scroll_top = jQuery(document).scrollTop() || 0;
        var distance_top = area.top - scroll_top;
        if (distance_top < 20) {
            jQuery(document).scrollTop(scroll_top - 20);
        }
        else {
            var window_height = jQuery(window).height() || 0;
            if (window_height - (area.bottom - scroll_top) < 20) {
                jQuery(document).scrollTop(scroll_top + 20);
            }
        }
    };
    ScrollHandler.prototype.checkVerticalScrolling = function () {
        var hovered_area = this.tree_widget.dnd_handler &&
            this.tree_widget.dnd_handler.hovered_area;
        if (hovered_area && hovered_area.top !== this.previous_top) {
            this.previous_top = hovered_area.top;
            if (this.$scroll_parent) {
                this.handleVerticalScrollingWithScrollParent(hovered_area);
            }
            else {
                this.handleVerticalScrollingWithDocument(hovered_area);
            }
        }
    };
    ScrollHandler.prototype.checkHorizontalScrolling = function () {
        var position_info = this.tree_widget.dnd_handler &&
            this.tree_widget.dnd_handler.position_info;
        if (!position_info) {
            return;
        }
        if (this.$scroll_parent) {
            this.handleHorizontalScrollingWithParent(position_info);
        }
        else {
            this.handleHorizontalScrollingWithDocument(position_info);
        }
    };
    ScrollHandler.prototype.handleHorizontalScrollingWithParent = function (position_info) {
        var $scroll_parent = this.$scroll_parent;
        var scroll_parent_offset = $scroll_parent && $scroll_parent.offset();
        if (!($scroll_parent && scroll_parent_offset)) {
            return;
        }
        var scroll_parent = $scroll_parent[0];
        var can_scroll_right = scroll_parent.scrollLeft + scroll_parent.clientWidth <
            scroll_parent.scrollWidth;
        var can_scroll_left = scroll_parent.scrollLeft > 0;
        var right_edge = scroll_parent_offset.left + scroll_parent.clientWidth;
        var left_edge = scroll_parent_offset.left;
        var is_near_right_edge = position_info.page_x > right_edge - 20;
        var is_near_left_edge = position_info.page_x < left_edge + 20;
        if (is_near_right_edge && can_scroll_right) {
            scroll_parent.scrollLeft = Math.min(scroll_parent.scrollLeft + 20, scroll_parent.scrollWidth);
        }
        else if (is_near_left_edge && can_scroll_left) {
            scroll_parent.scrollLeft = Math.max(scroll_parent.scrollLeft - 20, 0);
        }
    };
    ScrollHandler.prototype.handleHorizontalScrollingWithDocument = function (position_info) {
        var $document = jQuery(document);
        var scroll_left = $document.scrollLeft() || 0;
        var window_width = jQuery(window).width() || 0;
        var can_scroll_left = scroll_left > 0;
        var is_near_right_edge = position_info.page_x > window_width - 20;
        var is_near_left_edge = position_info.page_x - scroll_left < 20;
        if (is_near_right_edge) {
            $document.scrollLeft(scroll_left + 20);
        }
        else if (is_near_left_edge && can_scroll_left) {
            $document.scrollLeft(Math.max(scroll_left - 20, 0));
        }
    };
    return ScrollHandler;
}());
exports["default"] = ScrollHandler;
