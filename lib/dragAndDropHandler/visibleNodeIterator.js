"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var VisibleNodeIterator = /*#__PURE__*/function () {
  function VisibleNodeIterator(tree) {
    _classCallCheck(this, VisibleNodeIterator);
    _defineProperty(this, "tree", void 0);
    this.tree = tree;
  }
  _createClass(VisibleNodeIterator, [{
    key: "iterate",
    value: function iterate() {
      var _this = this;
      var isFirstNode = true;
      var _iterateNode = function _iterateNode(node, nextNode) {
        var mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
        var $element = null;
        if (node.element) {
          $element = jQuery(node.element);
          if (!$element.is(":visible")) {
            return;
          }
          if (isFirstNode) {
            _this.handleFirstNode(node);
            isFirstNode = false;
          }
          if (!node.hasChildren()) {
            _this.handleNode(node, nextNode, $element);
          } else if (node.is_open) {
            if (!_this.handleOpenFolder(node, $element)) {
              mustIterateInside = false;
            }
          } else {
            _this.handleClosedFolder(node, nextNode, $element);
          }
        }
        if (mustIterateInside) {
          var childrenLength = node.children.length;
          node.children.forEach(function (_, i) {
            var child = node.children[i];
            if (child) {
              if (i === childrenLength - 1) {
                _iterateNode(child, null);
              } else {
                var nextChild = node.children[i + 1];
                if (nextChild) {
                  _iterateNode(child, nextChild);
                }
              }
            }
          });
          if (node.is_open && $element) {
            _this.handleAfterOpenFolder(node, nextNode);
          }
        }
      };
      _iterateNode(this.tree, null);
    }
  }]);
  return VisibleNodeIterator;
}();
var _default = VisibleNodeIterator;
exports["default"] = _default;