"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DocumentScrollParent = /*#__PURE__*/function () {
  function DocumentScrollParent($element, refreshHitAreas) {
    _classCallCheck(this, DocumentScrollParent);
    _defineProperty(this, "$element", void 0);
    _defineProperty(this, "horizontalScrollDirection", void 0);
    _defineProperty(this, "horizontalScrollTimeout", void 0);
    _defineProperty(this, "refreshHitAreas", void 0);
    _defineProperty(this, "verticalScrollDirection", void 0);
    _defineProperty(this, "verticalScrollTimeout", void 0);
    _defineProperty(this, "documentScrollHeight", void 0);
    _defineProperty(this, "documentScrollWidth", void 0);
    this.$element = $element;
    this.refreshHitAreas = refreshHitAreas;
  }
  _createClass(DocumentScrollParent, [{
    key: "checkHorizontalScrolling",
    value: function checkHorizontalScrolling(pageX) {
      var newHorizontalScrollDirection = this.getNewHorizontalScrollDirection(pageX);
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
  }, {
    key: "checkVerticalScrolling",
    value: function checkVerticalScrolling(pageY) {
      var newVerticalScrollDirection = this.getNewVerticalScrollDirection(pageY);
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
  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      return document.documentElement.scrollLeft;
    }
  }, {
    key: "scrollToY",
    value: function scrollToY(top) {
      var offset = this.$element.offset();
      var treeTop = offset ? offset.top : 0;
      jQuery(document).scrollTop(top + treeTop);
    }
  }, {
    key: "stopScrolling",
    value: function stopScrolling() {
      this.horizontalScrollDirection = undefined;
      this.verticalScrollDirection = undefined;
      this.documentScrollHeight = undefined;
      this.documentScrollWidth = undefined;
    }
  }, {
    key: "getNewHorizontalScrollDirection",
    value: function getNewHorizontalScrollDirection(pageX) {
      var $document = jQuery(document);
      var scrollLeft = $document.scrollLeft() || 0;
      var windowWidth = jQuery(window).width() || 0;
      var isNearRightEdge = pageX > windowWidth - 20;
      var isNearLeftEdge = pageX - scrollLeft < 20;
      if (isNearRightEdge && this.canScrollRight()) {
        return "right";
      }
      if (isNearLeftEdge) {
        return "left";
      }
      return undefined;
    }
  }, {
    key: "canScrollRight",
    value: function canScrollRight() {
      var documentElement = document.documentElement;
      return documentElement.scrollLeft + documentElement.clientWidth < this.getDocumentScrollWidth();
    }
  }, {
    key: "canScrollDown",
    value: function canScrollDown() {
      var documentElement = document.documentElement;
      return documentElement.scrollTop + documentElement.clientHeight < this.getDocumentScrollHeight();
    }
  }, {
    key: "getDocumentScrollHeight",
    value: function getDocumentScrollHeight() {
      // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
      if (this.documentScrollHeight == null) {
        this.documentScrollHeight = document.documentElement.scrollHeight;
      }
      return this.documentScrollHeight;
    }
  }, {
    key: "getDocumentScrollWidth",
    value: function getDocumentScrollWidth() {
      // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
      if (this.documentScrollWidth == null) {
        this.documentScrollWidth = document.documentElement.scrollWidth;
      }
      return this.documentScrollWidth;
    }
  }, {
    key: "getNewVerticalScrollDirection",
    value: function getNewVerticalScrollDirection(pageY) {
      var scrollTop = jQuery(document).scrollTop() || 0;
      var distanceTop = pageY - scrollTop;
      if (distanceTop < 20) {
        return "top";
      }
      var windowHeight = jQuery(window).height() || 0;
      if (windowHeight - (pageY - scrollTop) < 20 && this.canScrollDown()) {
        return "bottom";
      }
      return undefined;
    }
  }, {
    key: "scrollHorizontally",
    value: function scrollHorizontally() {
      if (!this.horizontalScrollDirection) {
        return;
      }
      var distance = this.horizontalScrollDirection === "left" ? -20 : 20;
      window.scrollBy({
        left: distance,
        top: 0,
        behavior: "instant"
      });
      this.refreshHitAreas();
      setTimeout(this.scrollHorizontally.bind(this), 40);
    }
  }, {
    key: "scrollVertically",
    value: function scrollVertically() {
      if (!this.verticalScrollDirection) {
        return;
      }
      var distance = this.verticalScrollDirection === "top" ? -20 : 20;
      window.scrollBy({
        left: 0,
        top: distance,
        behavior: "instant"
      });
      this.refreshHitAreas();
      setTimeout(this.scrollVertically.bind(this), 40);
    }
  }]);
  return DocumentScrollParent;
}();
exports["default"] = DocumentScrollParent;