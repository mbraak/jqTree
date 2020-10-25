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
var register = function (widgetClass, widgetName) {
    var getDataKey = function () { return "simple_widget_" + widgetName; };
    var getWidgetData = function (el, dataKey) {
        var widget = jQuery.data(el, dataKey);
        if (widget && widget instanceof SimpleWidget) {
            return widget;
        }
        else {
            return null;
        }
    };
    var createWidget = function ($el, options) {
        var dataKey = getDataKey();
        for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
            var el = _a[_i];
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
        return $el;
    };
    var destroyWidget = function ($el) {
        var dataKey = getDataKey();
        for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
            var el = _a[_i];
            var widget = getWidgetData(el, dataKey);
            if (widget) {
                widget.destroy();
            }
            jQuery.removeData(el, dataKey);
        }
    };
    var callFunction = function ($el, functionName, args) {
        var result = null;
        for (var _i = 0, _a = $el.get(); _i < _a.length; _i++) {
            var el = _a[_i];
            var widget = jQuery.data(el, getDataKey());
            if (widget && widget instanceof SimpleWidget) {
                var simpleWidget = widget;
                var widgetFunction = simpleWidget[functionName];
                if (widgetFunction && typeof widgetFunction === "function") {
                    result = widgetFunction.apply(widget, args);
                }
            }
        }
        return result;
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    jQuery.fn[widgetName] = function (argument1) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!argument1) {
            return createWidget(this, null);
        }
        else if (typeof argument1 === "object") {
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
var SimpleWidget = /** @class */ (function () {
    function SimpleWidget(el, options) {
        this.$el = jQuery(el);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        var defaults = this.constructor["defaults"];
        this.options = __assign(__assign({}, defaults), options);
    }
    SimpleWidget.register = function (widgetClass, widgetName) {
        register(widgetClass, widgetName);
    };
    SimpleWidget.prototype.destroy = function () {
        this.deinit();
    };
    SimpleWidget.prototype.init = function () {
        //
    };
    SimpleWidget.prototype.deinit = function () {
        //
    };
    SimpleWidget.defaults = {};
    return SimpleWidget;
}());
exports["default"] = SimpleWidget;
