"use strict";
exports.__esModule = true;
var SimpleWidget = /** @class */ (function () {
    function SimpleWidget(el, options) {
        this.$el = jQuery(el);
        var defaults = this.constructor.defaults;
        this.options = jQuery.extend({}, defaults, options);
    }
    SimpleWidget.register = function (widgetClass, widgetName) {
        var getDataKey = function () { return "simple_widget_" + widgetName; };
        function getWidgetData(el, dataKey) {
            var widget = jQuery.data(el, dataKey);
            if (widget && widget instanceof SimpleWidget) {
                return widget;
            }
            else {
                return null;
            }
        }
        function createWidget($el, options) {
            var dataKey = getDataKey();
            for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
                var el = _a[_i];
                var existingWidget = getWidgetData(el, dataKey);
                if (!existingWidget) {
                    var widget = new widgetClass(el, options);
                    if (!jQuery.data(el, dataKey)) {
                        jQuery.data(el, dataKey, widget);
                    }
                    // Call init after setting data, so we can call methods
                    widget._init();
                }
            }
            return $el;
        }
        function destroyWidget($el) {
            var dataKey = getDataKey();
            for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
                var el = _a[_i];
                var widget = getWidgetData(el, dataKey);
                if (widget) {
                    widget.destroy();
                }
                jQuery.removeData(el, dataKey);
            }
        }
        function callFunction($el, functionName, args) {
            var result = null;
            for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
                var el = _a[_i];
                var widget = jQuery.data(el, getDataKey());
                if (widget && widget instanceof SimpleWidget) {
                    var widgetFunction = widget[functionName];
                    if (widgetFunction && typeof widgetFunction === "function") {
                        result = widgetFunction.apply(widget, args);
                    }
                }
            }
            return result;
        }
        jQuery.fn[widgetName] = function (argument1) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (argument1 === undefined || typeof argument1 === "object") {
                var options = argument1;
                return createWidget(this, options);
            }
            else if (typeof argument1 === "string" && argument1[0] !== "_") {
                var functionName = argument1;
                if (functionName === "destroy") {
                    return destroyWidget(this);
                }
                else if (functionName === "get_widget_class") {
                    return widgetClass;
                }
                else {
                    return callFunction(this, functionName, args);
                }
            }
        };
    };
    SimpleWidget.prototype.destroy = function () {
        this._deinit();
    };
    SimpleWidget.prototype._init = function () {
        //
    };
    SimpleWidget.prototype._deinit = function () {
        //
    };
    SimpleWidget.defaults = {};
    return SimpleWidget;
}());
exports["default"] = SimpleWidget;
