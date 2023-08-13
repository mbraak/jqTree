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
var BorderDropHint = /*#__PURE__*/function () {
  function BorderDropHint(element, scrollLeft) {
    _classCallCheck(this, BorderDropHint);
    _defineProperty(this, "hint", void 0);
    var div = element.querySelector(":scope > .jqtree-element");
    if (!div) {
      this.hint = undefined;
      return;
    }
    var width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
    var height = Math.max(element.clientHeight - 4, 0);
    var hint = document.createElement("span");
    hint.className = "jqtree-border";
    hint.style.width = "".concat(width, "px");
    hint.style.height = "".concat(height, "px");
    this.hint = hint;
    div.append(this.hint);
  }
  _createClass(BorderDropHint, [{
    key: "remove",
    value: function remove() {
      var _this$hint;
      (_this$hint = this.hint) === null || _this$hint === void 0 ? void 0 : _this$hint.remove();
    }
  }]);
  return BorderDropHint;
}();
var _default = BorderDropHint;
exports["default"] = _default;