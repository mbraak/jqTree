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
var KeyHandler = /*#__PURE__*/function () {
  function KeyHandler(treeWidget) {
    var _this = this;
    _classCallCheck(this, KeyHandler);
    _defineProperty(this, "treeWidget", void 0);
    _defineProperty(this, "handleKeyDown", function (e) {
      if (!_this.canHandleKeyboard()) {
        return true;
      }
      var selectedNode = _this.treeWidget.getSelectedNode();
      if (!selectedNode) {
        return true;
      }
      var key = e.which;
      switch (key) {
        case KeyHandler.DOWN:
          return _this.moveDown(selectedNode);
        case KeyHandler.UP:
          return _this.moveUp(selectedNode);
        case KeyHandler.RIGHT:
          return _this.moveRight(selectedNode);
        case KeyHandler.LEFT:
          return _this.moveLeft(selectedNode);
        default:
          return true;
      }
    });
    this.treeWidget = treeWidget;
    if (treeWidget.options.keyboardSupport) {
      jQuery(document).on("keydown.jqtree", this.handleKeyDown);
    }
  }
  _createClass(KeyHandler, [{
    key: "deinit",
    value: function deinit() {
      jQuery(document).off("keydown.jqtree");
    }
  }, {
    key: "moveDown",
    value: function moveDown(selectedNode) {
      return this.selectNode(selectedNode.getNextVisibleNode());
    }
  }, {
    key: "moveUp",
    value: function moveUp(selectedNode) {
      return this.selectNode(selectedNode.getPreviousVisibleNode());
    }
  }, {
    key: "moveRight",
    value: function moveRight(selectedNode) {
      if (!selectedNode.isFolder()) {
        return true;
      } else {
        // folder node
        if (selectedNode.is_open) {
          // Right moves to the first child of an open node
          return this.selectNode(selectedNode.getNextVisibleNode());
        } else {
          // Right expands a closed node
          this.treeWidget.openNode(selectedNode);
          return false;
        }
      }
    }
  }, {
    key: "moveLeft",
    value: function moveLeft(selectedNode) {
      if (selectedNode.isFolder() && selectedNode.is_open) {
        // Left on an open node closes the node
        this.treeWidget.closeNode(selectedNode);
        return false;
      } else {
        // Left on a closed or end node moves focus to the node's parent
        return this.selectNode(selectedNode.getParent());
      }
    }
  }, {
    key: "selectNode",
    value: function selectNode(node) {
      if (!node) {
        return true;
      } else {
        this.treeWidget.selectNode(node);
        if (!this.treeWidget.scrollHandler.isScrolledIntoView(jQuery(node.element).find(".jqtree-element"))) {
          this.treeWidget.scrollToNode(node);
        }
        return false;
      }
    }
  }, {
    key: "canHandleKeyboard",
    value: function canHandleKeyboard() {
      return (this.treeWidget.options.keyboardSupport || false) && this.treeWidget.selectNodeHandler.isFocusOnTree();
    }
  }]);
  return KeyHandler;
}();
exports["default"] = KeyHandler;
_defineProperty(KeyHandler, "LEFT", 37);
_defineProperty(KeyHandler, "UP", 38);
_defineProperty(KeyHandler, "RIGHT", 39);
_defineProperty(KeyHandler, "DOWN", 40);