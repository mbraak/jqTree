"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _node = require("../node");
var _index = _interopRequireDefault(require("./index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var FolderElement = /*#__PURE__*/function (_NodeElement) {
  _inherits(FolderElement, _NodeElement);
  var _super = _createSuper(FolderElement);
  function FolderElement() {
    _classCallCheck(this, FolderElement);
    return _super.apply(this, arguments);
  }
  _createClass(FolderElement, [{
    key: "open",
    value: function open(onFinished) {
      var _this = this;
      var slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var animationSpeed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "fast";
      if (this.node.is_open) {
        return;
      }
      this.node.is_open = true;
      var button = this.getButton();
      button.classList.remove("jqtree-closed");
      button.innerHTML = "";
      var openedIconElement = this.treeWidget.renderer.openedIconElement;
      if (openedIconElement) {
        var icon = openedIconElement.cloneNode(true);
        button.appendChild(icon);
      }
      var doOpen = function doOpen() {
        _this.element.classList.remove("jqtree-closed");
        var titleSpan = _this.getTitleSpan();
        titleSpan.setAttribute("aria-expanded", "true");
        if (onFinished) {
          onFinished(_this.node);
        }
        _this.treeWidget._triggerEvent("tree.open", {
          node: _this.node
        });
      };
      if (slide) {
        jQuery(this.getUl()).slideDown(animationSpeed, doOpen);
      } else {
        jQuery(this.getUl()).show();
        doOpen();
      }
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;
      var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var animationSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "fast";
      if (!this.node.is_open) {
        return;
      }
      this.node.is_open = false;
      var button = this.getButton();
      button.classList.add("jqtree-closed");
      button.innerHTML = "";
      var closedIconElement = this.treeWidget.renderer.closedIconElement;
      if (closedIconElement) {
        var icon = closedIconElement.cloneNode(true);
        button.appendChild(icon);
      }
      var doClose = function doClose() {
        _this2.element.classList.add("jqtree-closed");
        var titleSpan = _this2.getTitleSpan();
        titleSpan.setAttribute("aria-expanded", "false");
        _this2.treeWidget._triggerEvent("tree.close", {
          node: _this2.node
        });
      };
      if (slide) {
        jQuery(this.getUl()).slideUp(animationSpeed, doClose);
      } else {
        jQuery(this.getUl()).hide();
        doClose();
      }
    }
  }, {
    key: "mustShowBorderDropHint",
    value: function mustShowBorderDropHint(position) {
      return !this.node.is_open && position === _node.Position.Inside;
    }
  }, {
    key: "getButton",
    value: function getButton() {
      return this.element.querySelector(":scope > .jqtree-element > a.jqtree-toggler");
    }
  }]);
  return FolderElement;
}(_index["default"]);
var _default = FolderElement;
exports["default"] = _default;