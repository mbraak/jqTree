"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _node = require("../node");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var GhostDropHint = /*#__PURE__*/function () {
  function GhostDropHint(node, element, position) {
    _classCallCheck(this, GhostDropHint);
    _defineProperty(this, "element", void 0);
    _defineProperty(this, "node", void 0);
    _defineProperty(this, "ghost", void 0);
    this.element = element;
    this.node = node;
    this.ghost = this.createGhostElement();
    if (position === _node.Position.After) {
      this.moveAfter();
    } else if (position === _node.Position.Before) {
      this.moveBefore();
    } else if (position === _node.Position.Inside) {
      if (node.isFolder() && node.is_open) {
        this.moveInsideOpenFolder();
      } else {
        this.moveInside();
      }
    }
  }
  _createClass(GhostDropHint, [{
    key: "remove",
    value: function remove() {
      this.ghost.remove();
    }
  }, {
    key: "moveAfter",
    value: function moveAfter() {
      this.element.after(this.ghost);
    }
  }, {
    key: "moveBefore",
    value: function moveBefore() {
      this.element.before(this.ghost);
    }
  }, {
    key: "moveInsideOpenFolder",
    value: function moveInsideOpenFolder() {
      var _this$node$children$;
      var childElement = (_this$node$children$ = this.node.children[0]) === null || _this$node$children$ === void 0 ? void 0 : _this$node$children$.element;
      if (childElement) {
        childElement.before(this.ghost);
      }
    }
  }, {
    key: "moveInside",
    value: function moveInside() {
      this.element.after(this.ghost);
      this.ghost.classList.add("jqtree-inside");
    }
  }, {
    key: "createGhostElement",
    value: function createGhostElement() {
      var ghost = document.createElement("li");
      ghost.className = "jqtree_common jqtree-ghost";
      var circleSpan = document.createElement("span");
      circleSpan.className = "jqtree_common jqtree-circle";
      ghost.append(circleSpan);
      var lineSpan = document.createElement("span");
      lineSpan.className = "jqtree_common jqtree-line";
      ghost.append(lineSpan);
      return ghost;
    }
  }]);
  return GhostDropHint;
}();
var _default = exports["default"] = GhostDropHint;