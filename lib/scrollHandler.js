"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _createScrollParent = _interopRequireDefault(require("./scrollHandler/createScrollParent"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ScrollHandler = exports["default"] = /*#__PURE__*/function () {
  function ScrollHandler(treeWidget) {
    _classCallCheck(this, ScrollHandler);
    _defineProperty(this, "treeWidget", void 0);
    _defineProperty(this, "scrollParent", void 0);
    this.treeWidget = treeWidget;
    this.scrollParent = undefined;
  }
  _createClass(ScrollHandler, [{
    key: "checkScrolling",
    value: function checkScrolling(positionInfo) {
      this.checkVerticalScrolling(positionInfo);
      this.checkHorizontalScrolling(positionInfo);
    }
  }, {
    key: "stopScrolling",
    value: function stopScrolling() {
      this.getScrollParent().stopScrolling();
    }
  }, {
    key: "scrollToY",
    value: function scrollToY(top) {
      this.getScrollParent().scrollToY(top);
    }
  }, {
    key: "getScrollLeft",
    value: function getScrollLeft() {
      return this.getScrollParent().getScrollLeft();
    }
  }, {
    key: "checkVerticalScrolling",
    value: function checkVerticalScrolling(positionInfo) {
      if (positionInfo.pageY == null) {
        return;
      }
      this.getScrollParent().checkVerticalScrolling(positionInfo.pageY);
    }
  }, {
    key: "checkHorizontalScrolling",
    value: function checkHorizontalScrolling(positionInfo) {
      if (positionInfo.pageX == null) {
        return;
      }
      this.getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
    }
  }, {
    key: "getScrollParent",
    value: function getScrollParent() {
      if (!this.scrollParent) {
        this.scrollParent = (0, _createScrollParent["default"])(this.treeWidget.$el, this.treeWidget.refreshHitAreas.bind(this.treeWidget));
      }
      return this.scrollParent;
    }
  }]);
  return ScrollHandler;
}();