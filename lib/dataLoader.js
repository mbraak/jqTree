"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class DataLoader {
  constructor(treeWidget) {
    this.treeWidget = treeWidget;
  }
  loadFromUrl(urlInfo, parentNode, onFinished) {
    if (!urlInfo) {
      return;
    }
    const $el = this.getDomElement(parentNode);
    this.addLoadingClass($el);
    this.notifyLoading(true, parentNode, $el);
    const stopLoading = () => {
      this.removeLoadingClass($el);
      this.notifyLoading(false, parentNode, $el);
    };
    const handleSuccess = data => {
      stopLoading();
      this.treeWidget.loadData(this.parseData(data), parentNode);
      if (onFinished && typeof onFinished === "function") {
        onFinished();
      }
    };
    const handleError = jqXHR => {
      stopLoading();
      if (this.treeWidget.options.onLoadFailed) {
        this.treeWidget.options.onLoadFailed(jqXHR);
      }
    };
    this.submitRequest(urlInfo, handleSuccess, handleError);
  }
  addLoadingClass($el) {
    if ($el) {
      $el.addClass("jqtree-loading");
    }
  }
  removeLoadingClass($el) {
    if ($el) {
      $el.removeClass("jqtree-loading");
    }
  }
  getDomElement(parentNode) {
    if (parentNode) {
      return jQuery(parentNode.element);
    } else {
      return this.treeWidget.element;
    }
  }
  notifyLoading(isLoading, node, $el) {
    if (this.treeWidget.options.onLoading) {
      this.treeWidget.options.onLoading(isLoading, node, $el);
    }
    this.treeWidget._triggerEvent("tree.loading_data", {
      isLoading,
      node,
      $el
    });
  }
  submitRequest(urlInfoInput, handleSuccess, handleError) {
    const urlInfo = typeof urlInfoInput === "string" ? {
      url: urlInfoInput
    } : urlInfoInput;
    const ajaxSettings = {
      method: "GET",
      cache: false,
      dataType: "json",
      success: handleSuccess,
      error: handleError,
      ...urlInfo
    };
    ajaxSettings.method = ajaxSettings.method?.toUpperCase() || "GET";
    void jQuery.ajax(ajaxSettings);
  }
  parseData(data) {
    const {
      dataFilter
    } = this.treeWidget.options;
    const getParsedData = () => {
      if (typeof data === "string") {
        return JSON.parse(data);
      } else {
        return data;
      }
    };
    const parsedData = getParsedData();
    if (dataFilter) {
      return dataFilter(parsedData);
    } else {
      return parsedData;
    }
  }
}
exports.default = DataLoader;