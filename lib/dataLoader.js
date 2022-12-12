"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DataLoader = /*#__PURE__*/function () {
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
exports["default"] = DataLoader;