"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeElement = exports.FolderElement = exports.BorderDropHint = void 0;
var _node = require("./node");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
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
        return new BorderDropHint(jQuery(this.element), this.treeWidget._getScrollLeft());
      } else {
        return new GhostDropHint(this.node, jQuery(this.element), position);
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
exports.NodeElement = NodeElement;
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
}(NodeElement);
exports.FolderElement = FolderElement;
var BorderDropHint = /*#__PURE__*/function () {
  function BorderDropHint($element, scrollLeft) {
    _classCallCheck(this, BorderDropHint);
    _defineProperty(this, "$hint", void 0);
    var $div = $element.children(".jqtree-element");
    var elWidth = $element.width() || 0;
    var width = Math.max(elWidth + scrollLeft - 4, 0);
    var elHeight = $div.outerHeight() || 0;
    var height = Math.max(elHeight - 4, 0);
    this.$hint = jQuery('<span class="jqtree-border"></span>');
    $div.append(this.$hint);
    this.$hint.css({
      width: width,
      height: height
    });
  }
  _createClass(BorderDropHint, [{
    key: "remove",
    value: function remove() {
      this.$hint.remove();
    }
  }]);
  return BorderDropHint;
}();
exports.BorderDropHint = BorderDropHint;
var GhostDropHint = /*#__PURE__*/function () {
  function GhostDropHint(node, $element, position) {
    _classCallCheck(this, GhostDropHint);
    _defineProperty(this, "$element", void 0);
    _defineProperty(this, "node", void 0);
    _defineProperty(this, "$ghost", void 0);
    this.$element = $element;
    this.node = node;
    this.$ghost = jQuery("<li class=\"jqtree_common jqtree-ghost\"><span class=\"jqtree_common jqtree-circle\"></span>\n            <span class=\"jqtree_common jqtree-line\"></span></li>");
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
      this.$ghost.remove();
    }
  }, {
    key: "moveAfter",
    value: function moveAfter() {
      this.$element.after(this.$ghost);
    }
  }, {
    key: "moveBefore",
    value: function moveBefore() {
      this.$element.before(this.$ghost);
    }
  }, {
    key: "moveInsideOpenFolder",
    value: function moveInsideOpenFolder() {
      var _this$node$children$;
      var childElement = (_this$node$children$ = this.node.children[0]) === null || _this$node$children$ === void 0 ? void 0 : _this$node$children$.element;
      if (childElement) {
        jQuery(childElement).before(this.$ghost);
      }
    }
  }, {
    key: "moveInside",
    value: function moveInside() {
      this.$element.after(this.$ghost);
      this.$ghost.addClass("jqtree-inside");
    }
  }]);
  return GhostDropHint;
}();