"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ScrollHandler = /*#__PURE__*/function () {
  function ScrollHandler(treeWidget) {
    _classCallCheck(this, ScrollHandler);
    _defineProperty(this, "treeWidget", void 0);
    _defineProperty(this, "previousTop", void 0);
    _defineProperty(this, "isInitialized", void 0);
    _defineProperty(this, "$scrollParent", void 0);
    _defineProperty(this, "scrollParentTop", void 0);
    this.treeWidget = treeWidget;
    this.previousTop = -1;
    this.isInitialized = false;
  }
  _createClass(ScrollHandler, [{
    key: "checkScrolling",
    value: function checkScrolling() {
      this.ensureInit();
      this.checkVerticalScrolling();
      this.checkHorizontalScrolling();
    }
  }, {
    key: "scrollToY",
    value: function scrollToY(top) {
      this.ensureInit();
      if (this.$scrollParent && this.$scrollParent[0]) {
        this.$scrollParent[0].scrollTop = top;
      } else {
        var offset = this.treeWidget.$el.offset();
        var treeTop = offset ? offset.top : 0;
        jQuery(document).scrollTop(top + treeTop);
      }
    }
  }, {
    key: "isScrolledIntoView",
    value: function isScrolledIntoView($element) {
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
      } else {
        viewTop = jQuery(window).scrollTop() || 0;
        var windowHeight = jQuery(window).height() || 0;
        viewBottom = viewTop + windowHeight;
        var _offset = $element.offset();
        elementTop = _offset ? _offset.top : 0;
        elementBottom = elementTop + elHeight;
      }
      return elementBottom <= viewBottom && elementTop >= viewTop;
    }
  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      if (!this.$scrollParent) {
        return 0;
      } else {
        return this.$scrollParent.scrollLeft() || 0;
      }
    }
  }, {
    key: "initScrollParent",
    value: function initScrollParent() {
      var _this = this,
        _$scrollParent$;
      var getParentWithOverflow = function getParentWithOverflow() {
        var cssAttributes = ["overflow", "overflow-y"];
        var hasOverFlow = function hasOverFlow($el) {
          for (var _i = 0, _cssAttributes = cssAttributes; _i < _cssAttributes.length; _i++) {
            var attr = _cssAttributes[_i];
            var overflowValue = $el.css(attr);
            if (overflowValue === "auto" || overflowValue === "scroll") {
              return true;
            }
          }
          return false;
        };
        if (hasOverFlow(_this.treeWidget.$el)) {
          return _this.treeWidget.$el;
        }
        var _iterator = _createForOfIteratorHelper(_this.treeWidget.$el.parents().get()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var el = _step.value;
            var $el = jQuery(el);
            if (hasOverFlow($el)) {
              return $el;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return null;
      };
      var setDocumentAsScrollParent = function setDocumentAsScrollParent() {
        _this.scrollParentTop = 0;
        _this.$scrollParent = null;
      };
      if (this.treeWidget.$el.css("position") === "fixed") {
        setDocumentAsScrollParent();
      }
      var $scrollParent = getParentWithOverflow();
      if ($scrollParent && $scrollParent.length && ((_$scrollParent$ = $scrollParent[0]) === null || _$scrollParent$ === void 0 ? void 0 : _$scrollParent$.tagName) !== "HTML") {
        this.$scrollParent = $scrollParent;
        var offset = this.$scrollParent.offset();
        this.scrollParentTop = offset ? offset.top : 0;
      } else {
        setDocumentAsScrollParent();
      }
      this.isInitialized = true;
    }
  }, {
    key: "ensureInit",
    value: function ensureInit() {
      if (!this.isInitialized) {
        this.initScrollParent();
      }
    }
  }, {
    key: "handleVerticalScrollingWithScrollParent",
    value: function handleVerticalScrollingWithScrollParent(area) {
      var scrollParent = this.$scrollParent && this.$scrollParent[0];
      if (!scrollParent) {
        return;
      }
      var distanceBottom = this.scrollParentTop + scrollParent.offsetHeight - area.bottom;
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
  }, {
    key: "handleVerticalScrollingWithDocument",
    value: function handleVerticalScrollingWithDocument(area) {
      var scrollTop = jQuery(document).scrollTop() || 0;
      var distanceTop = area.top - scrollTop;
      if (distanceTop < 20) {
        jQuery(document).scrollTop(scrollTop - 20);
      } else {
        var windowHeight = jQuery(window).height() || 0;
        if (windowHeight - (area.bottom - scrollTop) < 20) {
          jQuery(document).scrollTop(scrollTop + 20);
        }
      }
    }
  }, {
    key: "checkVerticalScrolling",
    value: function checkVerticalScrolling() {
      var hoveredArea = this.treeWidget.dndHandler.hoveredArea;
      if (hoveredArea && hoveredArea.top !== this.previousTop) {
        this.previousTop = hoveredArea.top;
        if (this.$scrollParent) {
          this.handleVerticalScrollingWithScrollParent(hoveredArea);
        } else {
          this.handleVerticalScrollingWithDocument(hoveredArea);
        }
      }
    }
  }, {
    key: "checkHorizontalScrolling",
    value: function checkHorizontalScrolling() {
      var positionInfo = this.treeWidget.dndHandler.positionInfo;
      if (!positionInfo) {
        return;
      }
      if (this.$scrollParent) {
        this.handleHorizontalScrollingWithParent(positionInfo);
      } else {
        this.handleHorizontalScrollingWithDocument(positionInfo);
      }
    }
  }, {
    key: "handleHorizontalScrollingWithParent",
    value: function handleHorizontalScrollingWithParent(positionInfo) {
      if (positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
        return;
      }
      var $scrollParent = this.$scrollParent;
      var scrollParentOffset = $scrollParent && $scrollParent.offset();
      if (!($scrollParent && scrollParentOffset)) {
        return;
      }
      var scrollParent = $scrollParent[0];
      if (!scrollParent) {
        return;
      }
      var canScrollRight = scrollParent.scrollLeft + scrollParent.clientWidth < scrollParent.scrollWidth;
      var canScrollLeft = scrollParent.scrollLeft > 0;
      var rightEdge = scrollParentOffset.left + scrollParent.clientWidth;
      var leftEdge = scrollParentOffset.left;
      var isNearRightEdge = positionInfo.pageX > rightEdge - 20;
      var isNearLeftEdge = positionInfo.pageX < leftEdge + 20;
      if (isNearRightEdge && canScrollRight) {
        scrollParent.scrollLeft = Math.min(scrollParent.scrollLeft + 20, scrollParent.scrollWidth);
      } else if (isNearLeftEdge && canScrollLeft) {
        scrollParent.scrollLeft = Math.max(scrollParent.scrollLeft - 20, 0);
      }
    }
  }, {
    key: "handleHorizontalScrollingWithDocument",
    value: function handleHorizontalScrollingWithDocument(positionInfo) {
      if (positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
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
      } else if (isNearLeftEdge && canScrollLeft) {
        $document.scrollLeft(Math.max(scrollLeft - 20, 0));
      }
    }
  }]);
  return ScrollHandler;
}();
exports["default"] = ScrollHandler;