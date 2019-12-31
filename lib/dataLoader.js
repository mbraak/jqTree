"use strict";
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
            var onLoadFailed = _this.treeWidget.options.onLoadFailed;
            if (onLoadFailed) {
                onLoadFailed(jqXHR);
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
        var onLoading = this.treeWidget.options.onLoading;
        if (onLoading) {
            onLoading(isLoading, node, $el);
        }
        this.treeWidget._triggerEvent("tree.loading_data", {
            isLoading: isLoading,
            node: node,
            $el: $el
        });
    };
    DataLoader.prototype.submitRequest = function (urlInfo, handleSuccess, handleError) {
        var ajaxSettings = jQuery.extend({ method: "GET" }, typeof urlInfo === "string" ? { url: urlInfo } : urlInfo, {
            cache: false,
            dataType: "json",
            success: handleSuccess,
            error: handleError
        });
        ajaxSettings.method = ajaxSettings.method.toUpperCase();
        jQuery.ajax(ajaxSettings);
    };
    DataLoader.prototype.parseData = function (data) {
        var dataFilter = this.treeWidget.options.dataFilter;
        var parsedData = data instanceof Array || typeof data === "object"
            ? data
            : data != null
                ? jQuery.parseJSON(data)
                : [];
        return dataFilter ? dataFilter(parsedData) : parsedData;
    };
    return DataLoader;
}());
exports["default"] = DataLoader;
