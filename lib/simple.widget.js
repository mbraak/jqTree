"use strict";
// tslint:disable-next-line: no-string-literal
var $ = window["jQuery"];
var SimpleWidget = (function () {
    function SimpleWidget(el, options) {
        this.$el = $(el);
        var defaults = this.constructor.defaults;
        this.options = $.extend({}, defaults, options);
    }
    SimpleWidget.register = function (widget_class, widget_name) {
        var getDataKey = function () { return "simple_widget_" + widget_name; };
        function getWidgetData(el, data_key) {
            var widget = $.data(el, data_key);
            if (widget && (widget instanceof SimpleWidget)) {
                return widget;
            }
            else {
                return null;
            }
        }
        function createWidget($el, options) {
            var data_key = getDataKey();
            for (var _i = 0, $el_1 = $el; _i < $el_1.length; _i++) {
                var el = $el_1[_i];
                var existing_widget = getWidgetData(el, data_key);
                if (!existing_widget) {
                    var widget = new widget_class(el, options);
                    if (!$.data(el, data_key)) {
                        $.data(el, data_key, widget);
                    }
                    // Call init after setting data, so we can call methods
                    widget._init();
                }
            }
            return $el;
        }
        function destroyWidget($el) {
            var data_key = getDataKey();
            for (var _i = 0, $el_2 = $el; _i < $el_2.length; _i++) {
                var el = $el_2[_i];
                var widget = getWidgetData(el, data_key);
                if (widget) {
                    widget.destroy();
                }
                $.removeData(el, data_key);
            }
        }
        function callFunction($el, function_name, args) {
            var result = null;
            for (var _i = 0, $el_3 = $el; _i < $el_3.length; _i++) {
                var el = $el_3[_i];
                var widget = $.data(el, getDataKey());
                if (widget && (widget instanceof SimpleWidget)) {
                    var widget_function = widget[function_name];
                    if (widget_function && (typeof widget_function === "function")) {
                        result = widget_function.apply(widget, args);
                    }
                }
            }
            return result;
        }
        // tslint:disable-next-line: only-arrow-functions
        $.fn[widget_name] = function (argument1) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var $el = this;
            if (argument1 === undefined || typeof argument1 === "object") {
                var options = argument1;
                return createWidget($el, options);
            }
            else if (typeof argument1 === "string" && argument1[0] !== "_") {
                var function_name = argument1;
                if (function_name === "destroy") {
                    return destroyWidget($el);
                }
                else if (function_name === "get_widget_class") {
                    return widget_class;
                }
                else {
                    return callFunction($el, function_name, args);
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
    return SimpleWidget;
}());
SimpleWidget.defaults = {};
exports.__esModule = true;
exports["default"] = SimpleWidget;
