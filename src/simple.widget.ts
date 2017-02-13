import * as $ from "jquery";

export default class SimpleWidget {
    public static register(widget_class, widget_name: string) {
        const getDataKey = () => `simple_widget_${widget_name}`;

        function getWidgetData(el, data_key: string) {
            const widget = $.data(el, data_key);

            if (widget && (widget instanceof SimpleWidget)) {
                return widget;
            } else {
                return null;
            }
        }

        function createWidget($el, options: Object) {
            const data_key = getDataKey();

            for (let el of $el) {
                const existing_widget = getWidgetData(el, data_key);

                if (! existing_widget) {
                    const widget = new widget_class(el, options);

                    if (! $.data(el, data_key)) {
                        $.data(el, data_key, widget);
                    }

                    // Call init after setting data, so we can call methods
                    widget._init();
                }
            }

            return $el;
        }

        function destroyWidget($el) {
            const data_key = getDataKey();

            for (let el of $el) {
                const widget = getWidgetData(el, data_key);

                if (widget) {
                    widget.destroy();
                }

                $.removeData(el, data_key);
            }
        }

        function callFunction($el, function_name: string, args: any[]) {
            let result = null;

            for (let el of $el) {
                const widget = $.data(el, getDataKey());

                if (widget && (widget instanceof SimpleWidget)) {
                    const widget_function = widget[function_name];

                    if (widget_function && (typeof widget_function === "function")) {
                        result = widget_function.apply(widget, args);
                    }
                }
            }

            return result;
        }

        // tslint:disable-next-line: only-arrow-functions
        $.fn[widget_name] = function(argument1, ...args) {
            const $el = this;

            if (argument1 === undefined || typeof argument1 === "object") {
                const options = argument1;
                return createWidget($el, options);
            } else if (typeof argument1 === "string" && argument1[0] !== "_") {
                const function_name = argument1;

                if (function_name === "destroy") {
                    return destroyWidget($el);
                } else if (function_name === "get_widget_class") {
                    return widget_class;
                } else {
                    return callFunction($el, function_name, args);
                }
            }
        };
    }

    protected static defaults = {};
    protected $el;
    protected options;

    constructor(el, options: Object) {
        this.$el = $(el);

        const defaults = (<typeof SimpleWidget> this.constructor).defaults;
        this.options = $.extend({}, defaults, options);
    }

    public destroy() {
        this._deinit();
    }

    protected _init() {
        //
    }

    protected _deinit() {
        //
    }
}
