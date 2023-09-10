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
var ContainerScrollParent = /*#__PURE__*/function () {
  function ContainerScrollParent(_ref) {
    var $container = _ref.$container,
      refreshHitAreas = _ref.refreshHitAreas;
    _classCallCheck(this, ContainerScrollParent);
    _defineProperty(this, "$container", void 0);
    _defineProperty(this, "horizontalScrollDirection", void 0);
    _defineProperty(this, "horizontalScrollTimeout", void 0);
    _defineProperty(this, "refreshHitAreas", void 0);
    _defineProperty(this, "scrollParentBottom", void 0);
    _defineProperty(this, "scrollParentTop", void 0);
    _defineProperty(this, "verticalScrollTimeout", void 0);
    _defineProperty(this, "verticalScrollDirection", void 0);
    this.$container = $container;
    this.refreshHitAreas = refreshHitAreas;
  }
  _createClass(ContainerScrollParent, [{
    key: "checkHorizontalScrolling",
    value: function checkHorizontalScrolling(pageX) {
      var newHorizontalScrollDirection = this.getNewHorizontalScrollDirection(pageX);
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
      return this.$container.scrollLeft() || 0;
    }
  }, {
    key: "scrollToY",
    value: function scrollToY(top) {
      var container = this.$container.get(0);
      container.scrollTop = top;
    }
  }, {
    key: "stopScrolling",
    value: function stopScrolling() {
      this.horizontalScrollDirection = undefined;
      this.verticalScrollDirection = undefined;
      this.scrollParentTop = undefined;
      this.scrollParentBottom = undefined;
    }
  }, {
    key: "getNewHorizontalScrollDirection",
    value: function getNewHorizontalScrollDirection(pageX) {
      var scrollParentOffset = this.$container.offset();
      if (!scrollParentOffset) {
        return undefined;
      }
      var container = this.$container.get(0);
      var rightEdge = scrollParentOffset.left + container.clientWidth;
      var leftEdge = scrollParentOffset.left;
      var isNearRightEdge = pageX > rightEdge - 20;
      var isNearLeftEdge = pageX < leftEdge + 20;
      if (isNearRightEdge) {
        return "right";
      } else if (isNearLeftEdge) {
        return "left";
      }
      return undefined;
    }
  }, {
    key: "getNewVerticalScrollDirection",
    value: function getNewVerticalScrollDirection(pageY) {
      if (pageY < this.getScrollParentTop()) {
        return "top";
      }
      if (pageY > this.getScrollParentBottom()) {
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
      var container = this.$container.get(0);
      container.scrollBy({
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
      var container = this.$container.get(0);
      container.scrollBy({
        left: 0,
        top: distance,
        behavior: "instant"
      });
      this.refreshHitAreas();
      setTimeout(this.scrollVertically.bind(this), 40);
    }
  }, {
    key: "getScrollParentTop",
    value: function getScrollParentTop() {
      if (this.scrollParentTop == null) {
        var _this$$container$offs;
        this.scrollParentTop = ((_this$$container$offs = this.$container.offset()) === null || _this$$container$offs === void 0 ? void 0 : _this$$container$offs.top) || 0;
      }
      return this.scrollParentTop;
    }
  }, {
    key: "getScrollParentBottom",
    value: function getScrollParentBottom() {
      if (this.scrollParentBottom == null) {
        var _this$$container$inne;
        this.scrollParentBottom = this.getScrollParentTop() + ((_this$$container$inne = this.$container.innerHeight()) !== null && _this$$container$inne !== void 0 ? _this$$container$inne : 0);
      }
      return this.scrollParentBottom;
    }
  }]);
  return ContainerScrollParent;
}();
exports["default"] = ContainerScrollParent;