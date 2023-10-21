"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _node = require("../node");
var _borderDropHint = _interopRequireDefault(require("./borderDropHint"));
var _ghostDropHint = _interopRequireDefault(require("./ghostDropHint"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var NodeElement = /*#__PURE__*/function () {
  function NodeElement(node, treeWidget) {
    _classCallCheck(this, NodeElement);
    _defineProperty(this, "node", void 0);
    _defineProperty(this, "element", void 0);
    _defineProperty(this, "treeWidget", void 0);
    this.init(node, treeWidget);
  }
  _createClass(NodeElement, [{
    key: "init",
    value: function init(node, treeWidget) {
      this.node = node;
      this.treeWidget = treeWidget;
      if (!node.element) {
        var element = this.treeWidget.element.get(0);
        if (element) {
          node.element = element;
        }
      }
      if (node.element) {
        this.element = node.element;
      }
    }
  }, {
    key: "addDropHint",
    value: function addDropHint(position) {
      if (this.mustShowBorderDropHint(position)) {
        return new _borderDropHint["default"](this.element, this.treeWidget._getScrollLeft());
      } else {
        return new _ghostDropHint["default"](this.node, this.element, position);
      }
    }
  }, {
    key: "select",
    value: function select(mustSetFocus) {
      this.element.classList.add("jqtree-selected");
      var titleSpan = this.getTitleSpan();
      var tabIndex = this.treeWidget.options.tabIndex;

      // Check for null or undefined
      if (tabIndex != null) {
        titleSpan.setAttribute("tabindex", tabIndex.toString());
      }
      titleSpan.setAttribute("aria-selected", "true");
      if (mustSetFocus) {
        titleSpan.focus();
      }
    }
  }, {
    key: "deselect",
    value: function deselect() {
      this.element.classList.remove("jqtree-selected");
      var titleSpan = this.getTitleSpan();
      titleSpan.removeAttribute("tabindex");
      titleSpan.setAttribute("aria-selected", "false");
      titleSpan.blur();
    }
  }, {
    key: "getUl",
    value: function getUl() {
      return this.element.querySelector(":scope > ul");
    }
  }, {
    key: "getTitleSpan",
    value: function getTitleSpan() {
      return this.element.querySelector(":scope > .jqtree-element > span.jqtree-title");
    }
  }, {
    key: "mustShowBorderDropHint",
    value: function mustShowBorderDropHint(position) {
      return position === _node.Position.Inside;
    }
  }]);
  return NodeElement;
}();
var _default = exports["default"] = NodeElement;