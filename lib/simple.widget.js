"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var _register = function register(widgetClass, widgetName) {
  var getDataKey = function getDataKey() {
    return "simple_widget_".concat(widgetName);
  };
  var getWidgetData = function getWidgetData(el, dataKey) {
    var widget = jQuery.data(el, dataKey);
    if (widget && widget instanceof SimpleWidget) {
      return widget;
    } else {
      return null;
    }
  };
  var createWidget = function createWidget($el, options) {
    var dataKey = getDataKey();
    var _iterator = _createForOfIteratorHelper($el.get()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        var existingWidget = getWidgetData(el, dataKey);
        if (!existingWidget) {
          var simpleWidgetClass = widgetClass;
          var widget = new simpleWidgetClass(el, options);
          if (!jQuery.data(el, dataKey)) {
            jQuery.data(el, dataKey, widget);
          }

          // Call init after setting data, so we can call methods
          widget.init();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return $el;
  };
  var destroyWidget = function destroyWidget($el) {
    var dataKey = getDataKey();
    var _iterator2 = _createForOfIteratorHelper($el.get()),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var el = _step2.value;
        var widget = getWidgetData(el, dataKey);
        if (widget) {
          widget.destroy();
        }
        jQuery.removeData(el, dataKey);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  };
  var callFunction = function callFunction($el, functionName, args) {
    var result = null;
    var _iterator3 = _createForOfIteratorHelper($el.get()),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var el = _step3.value;
        var widget = jQuery.data(el, getDataKey());
        if (widget && widget instanceof SimpleWidget) {
          var simpleWidget = widget;
          var widgetFunction = simpleWidget[functionName];
          if (widgetFunction && typeof widgetFunction === "function") {
            result = widgetFunction.apply(widget, args);
          }
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jQuery.fn[widgetName] = function (argument1) {
    if (!argument1) {
      return createWidget(this, null);
    } else if (_typeof(argument1) === "object") {
      var options = argument1;
      return createWidget(this, options);
    } else if (typeof argument1 === "string" && argument1[0] !== "_") {
      var functionName = argument1;
      if (functionName === "destroy") {
        return destroyWidget(this);
      } else if (functionName === "get_widget_class") {
        return widgetClass;
      } else {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return callFunction(this, functionName, args);
      }
    } else {
      return undefined;
    }
  };
};
var SimpleWidget = /*#__PURE__*/function () {
  function SimpleWidget(el, options) {
    _classCallCheck(this, SimpleWidget);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "$el", void 0);
    this.$el = jQuery(el);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    var defaults = this.constructor["defaults"];
    this.options = _objectSpread(_objectSpread({}, defaults), options);
  }
  _createClass(SimpleWidget, [{
    key: "destroy",
    value: function destroy() {
      this.deinit();
    }
  }, {
    key: "init",
    value: function init() {
      //
    }
  }, {
    key: "deinit",
    value: function deinit() {
      //
    }
  }], [{
    key: "register",
    value: function register(widgetClass, widgetName) {
      _register(widgetClass, widgetName);
    }
  }]);
  return SimpleWidget;
}();
exports["default"] = SimpleWidget;
_defineProperty(SimpleWidget, "defaults", {});