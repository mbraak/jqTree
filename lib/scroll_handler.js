"use strict";
exports.__esModule = true;
var ScrollHandler = (function () {
    function ScrollHandler(tree_widget) {
        this.tree_widget = tree_widget;
        this.previous_top = -1;
        this.is_initialized = false;
    }
    ScrollHandler.prototype.checkScrolling = function () {
        this._ensureInit();
        if (this.tree_widget.dnd_handler) {
            var hovered_area = this.tree_widget.dnd_handler.hovered_area;
            if (hovered_area && hovered_area.top !== this.previous_top) {
                this.previous_top = hovered_area.top;
                if (this.$scroll_parent) {
                    this._handleScrollingWithScrollParent(hovered_area);
                }
                else {
                    this._handleScrollingWithDocument(hovered_area);
                }
            }
        }
    };
    ScrollHandler.prototype.scrollTo = function (top) {
        this._ensureInit();
        if (this.$scroll_parent) {
            this.$scroll_parent[0].scrollTop = top;
        }
        else {
            var tree_top = this.tree_widget.$el.offset().top;
            $(document).scrollTop(top + tree_top);
        }
    };
    ScrollHandler.prototype.isScrolledIntoView = function ($element) {
        this._ensureInit();
        var element_bottom;
        var view_bottom;
        var element_top;
        var view_top;
        if (this.$scroll_parent) {
            view_top = 0;
            view_bottom = this.$scroll_parent.height();
            element_top = $element.offset().top - this.scroll_parent_top;
            element_bottom = element_top + $element.height();
        }
        else {
            view_top = $(window).scrollTop();
            view_bottom = view_top + $(window).height();
            element_top = $element.offset().top;
            element_bottom = element_top + $element.height();
        }
        return element_bottom <= view_bottom && element_top >= view_top;
    };
    ScrollHandler.prototype._initScrollParent = function () {
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
                var $el = $(el);
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
            this.scroll_parent_top = this.$scroll_parent.offset().top;
        }
        else {
            setDocumentAsScrollParent();
        }
        this.is_initialized = true;
    };
    ScrollHandler.prototype._ensureInit = function () {
        if (!this.is_initialized) {
            this._initScrollParent();
        }
    };
    ScrollHandler.prototype._handleScrollingWithScrollParent = function (area) {
        if (!this.$scroll_parent) {
            return;
        }
        else {
            var distance_bottom = this.scroll_parent_top +
                this.$scroll_parent[0].offsetHeight -
                area.bottom;
            if (distance_bottom < 20) {
                this.$scroll_parent[0].scrollTop += 20;
                this.tree_widget.refreshHitAreas();
                this.previous_top = -1;
            }
            else if (area.top - this.scroll_parent_top < 20) {
                this.$scroll_parent[0].scrollTop -= 20;
                this.tree_widget.refreshHitAreas();
                this.previous_top = -1;
            }
        }
    };
    ScrollHandler.prototype._handleScrollingWithDocument = function (area) {
        var distance_top = area.top - $(document).scrollTop();
        if (distance_top < 20) {
            $(document).scrollTop($(document).scrollTop() - 20);
        }
        else if ($(window).height() - (area.bottom - $(document).scrollTop()) <
            20) {
            $(document).scrollTop($(document).scrollTop() + 20);
        }
    };
    return ScrollHandler;
}());
exports["default"] = ScrollHandler;
