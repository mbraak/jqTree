export default class SimpleWidget {
    [key: string]: any;

    public static register(widget_class: any, widget_name: string) {
        const getDataKey = () => `simple_widget_${widget_name}`;

        function getWidgetData(el: Element, data_key: string) {
            const widget = $.data(el, data_key);

            if (widget && widget instanceof SimpleWidget) {
                return widget;
            } else {
                return null;
            }
        }

        function createWidget($el: JQuery, options: object) {
            const data_key = getDataKey();

            for (const el of $el.get()) {
                const existing_widget = getWidgetData(el, data_key);

                if (!existing_widget) {
                    const widget = new widget_class(el, options);

                    if (!$.data(el, data_key)) {
                        $.data(el, data_key, widget);
                    }

                    // Call init after setting data, so we can call methods
                    widget._init();
                }
            }

            return $el;
        }

        function destroyWidget($el: JQuery) {
            const data_key = getDataKey();

            for (const el of $el.get()) {
                const widget = getWidgetData(el, data_key);

                if (widget) {
                    widget.destroy();
                }

                $.removeData(el, data_key);
            }
        }

        function callFunction(
            $el: JQuery,
            function_name: string,
            args: any[]
        ): any {
            let result = null;

            for (const el of $el.get()) {
                const widget = $.data(el, getDataKey());

                if (widget && widget instanceof SimpleWidget) {
                    const widget_function = widget[function_name];

                    if (
                        widget_function &&
                        typeof widget_function === "function"
                    ) {
                        result = widget_function.apply(widget, args);
                    }
                }
            }

            return result;
        }

        // tslint:disable-next-line: only-arrow-functions
        $.fn[widget_name] = function(
            this: JQuery,
            argument1: any,
            ...args: any[]
        ) {
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

    public options: any;

    protected $el: JQuery;

    constructor(el: Element, options: any) {
        this.$el = $(el);

        const defaults = (this.constructor as typeof SimpleWidget).defaults;
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
