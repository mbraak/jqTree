"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DataLoader = exports["default"] = /*#__PURE__*/function () {
  function DataLoader(treeWidget) {
    _classCallCheck(this, DataLoader);
    _defineProperty(this, "treeWidget", void 0);
    this.treeWidget = treeWidget;
  }
  _createClass(DataLoader, [{
    key: "loadFromUrl",
    value: function loadFromUrl(urlInfo, parentNode, onFinished) {
      var _this = this;
      if (!urlInfo) {
        return;
      }
      var $el = this.getDomElement(parentNode);
      this.addLoadingClass($el);
      this.notifyLoading(true, parentNode, $el);
      var stopLoading = function stopLoading() {
        _this.removeLoadingClass($el);
        _this.notifyLoading(false, parentNode, $el);
      };
      var handleSuccess = function handleSuccess(data) {
        stopLoading();
        _this.treeWidget.loadData(_this.parseData(data), parentNode);
        if (onFinished && typeof onFinished === "function") {
          onFinished();
        }
      };
      var handleError = function handleError(jqXHR) {
        stopLoading();
        if (_this.treeWidget.options.onLoadFailed) {
          _this.treeWidget.options.onLoadFailed(jqXHR);
        }
      };
      this.submitRequest(urlInfo, handleSuccess, handleError);
    }
  }, {
    key: "addLoadingClass",
    value: function addLoadingClass($el) {
      if ($el) {
        $el.addClass("jqtree-loading");
      }
    }
  }, {
    key: "removeLoadingClass",
    value: function removeLoadingClass($el) {
      if ($el) {
        $el.removeClass("jqtree-loading");
      }
    }
  }, {
    key: "getDomElement",
    value: function getDomElement(parentNode) {
      if (parentNode) {
        return jQuery(parentNode.element);
      } else {
        return this.treeWidget.element;
      }
    }
  }, {
    key: "notifyLoading",
    value: function notifyLoading(isLoading, node, $el) {
      if (this.treeWidget.options.onLoading) {
        this.treeWidget.options.onLoading(isLoading, node, $el);
      }
      this.treeWidget._triggerEvent("tree.loading_data", {
        isLoading: isLoading,
        node: node,
        $el: $el
      });
    }
  }, {
    key: "submitRequest",
    value: function submitRequest(urlInfoInput, handleSuccess, handleError) {
      var _ajaxSettings$method;
      var urlInfo = typeof urlInfoInput === "string" ? {
        url: urlInfoInput
      } : urlInfoInput;
      var ajaxSettings = _objectSpread({
        method: "GET",
        cache: false,
        dataType: "json",
        success: handleSuccess,
        error: handleError
      }, urlInfo);
      ajaxSettings.method = ((_ajaxSettings$method = ajaxSettings.method) === null || _ajaxSettings$method === void 0 ? void 0 : _ajaxSettings$method.toUpperCase()) || "GET";
      void jQuery.ajax(ajaxSettings);
    }
  }, {
    key: "parseData",
    value: function parseData(data) {
      var dataFilter = this.treeWidget.options.dataFilter;
      var getParsedData = function getParsedData() {
        if (typeof data === "string") {
          return JSON.parse(data);
        } else {
          return data;
        }
      };
      var parsedData = getParsedData();
      if (dataFilter) {
        return dataFilter(parsedData);
      } else {
        return parsedData;
      }
    }
  }]);
  return DataLoader;
}();