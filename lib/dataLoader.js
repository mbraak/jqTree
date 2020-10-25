"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var DataLoader = /** @class */ (function () {
    function DataLoader(treeWidget) {
        this.treeWidget = treeWidget;
    }
    DataLoader.prototype.loadFromUrl = function (urlInfo, parentNode, onFinished) {
        var _this = this;
        if (!urlInfo) {
            return;
        }
        var $el = this.getDomElement(parentNode);
        this.addLoadingClass($el);
        this.notifyLoading(true, parentNode, $el);
        var stopLoading = function () {
            _this.removeLoadingClass($el);
            _this.notifyLoading(false, parentNode, $el);
        };
        var handleSuccess = function (data) {
            stopLoading();
            _this.treeWidget.loadData(_this.parseData(data), parentNode);
            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };
        var handleError = function (jqXHR) {
            stopLoading();
            if (_this.treeWidget.options.onLoadFailed) {
                _this.treeWidget.options.onLoadFailed(jqXHR);
            }
        };
        this.submitRequest(urlInfo, handleSuccess, handleError);
    };
    DataLoader.prototype.addLoadingClass = function ($el) {
        if ($el) {
            $el.addClass("jqtree-loading");
        }
    };
    DataLoader.prototype.removeLoadingClass = function ($el) {
        if ($el) {
            $el.removeClass("jqtree-loading");
        }
    };
    DataLoader.prototype.getDomElement = function (parentNode) {
        if (parentNode) {
            return jQuery(parentNode.element);
        }
        else {
            return this.treeWidget.element;
        }
    };
    DataLoader.prototype.notifyLoading = function (isLoading, node, $el) {
        if (this.treeWidget.options.onLoading) {
            this.treeWidget.options.onLoading(isLoading, node, $el);
        }
        this.treeWidget._triggerEvent("tree.loading_data", {
            isLoading: isLoading,
            node: node,
            $el: $el
        });
    };
    DataLoader.prototype.submitRequest = function (urlInfoInput, handleSuccess, handleError) {
        var _a;
        var urlInfo = typeof urlInfoInput === "string"
            ? { url: urlInfoInput }
            : urlInfoInput;
        var ajaxSettings = __assign({ method: "GET", cache: false, dataType: "json", success: handleSuccess, error: handleError }, urlInfo);
        ajaxSettings.method = ((_a = ajaxSettings.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "GET";
        void jQuery.ajax(ajaxSettings);
    };
    DataLoader.prototype.parseData = function (data) {
        var dataFilter = this.treeWidget.options.dataFilter;
        var getParsedData = function () {
            if (typeof data === "string") {
                return JSON.parse(data);
            }
            else {
                return data;
            }
        };
        var parsedData = getParsedData();
        if (dataFilter) {
            return dataFilter(parsedData);
        }
        else {
            return parsedData;
        }
    };
    return DataLoader;
}());
exports["default"] = DataLoader;
