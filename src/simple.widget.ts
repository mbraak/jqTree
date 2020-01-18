export default class SimpleWidget {
    [key: string]: any;

    public static register(widgetClass: any, widgetName: string): void {
        const getDataKey = (): string => `simple_widget_${widgetName}`;

        function getWidgetData(el: Element, dataKey: string): SimpleWidget | null {
            const widget = jQuery.data(el, dataKey);

            if (widget && widget instanceof SimpleWidget) {
                return widget;
            } else {
                return null;
            }
        }

        function createWidget($el: JQuery, options: object): JQuery<any> {
            const dataKey = getDataKey();

            for (const el of $el.get()) {
                const existingWidget = getWidgetData(el, dataKey);

                if (!existingWidget) {
                    const widget = new widgetClass(el, options);

                    if (!jQuery.data(el, dataKey)) {
                        jQuery.data(el, dataKey, widget);
                    }

                    // Call init after setting data, so we can call methods
                    widget._init();
                }
            }

            return $el;
        }

        function destroyWidget($el: JQuery): void {
            const dataKey = getDataKey();

            for (const el of $el.get()) {
                const widget = getWidgetData(el, dataKey);

                if (widget) {
                    widget.destroy();
                }

                jQuery.removeData(el, dataKey);
            }
        }

        function callFunction($el: JQuery, functionName: string, args: any[]): any {
            let result = null;

            for (const el of $el.get()) {
                const widget = jQuery.data(el, getDataKey());

                if (widget && widget instanceof SimpleWidget) {
                    const widgetFunction = widget[functionName];

                    if (widgetFunction && typeof widgetFunction === "function") {
                        result = widgetFunction.apply(widget, args);
                    }
                }
            }

            return result;
        }

        (jQuery.fn as any)[widgetName] = function(this: JQuery, argument1: any, ...args: any[]): any {
            if (argument1 === undefined || typeof argument1 === "object") {
                const options = argument1;
                return createWidget(this, options);
            } else if (typeof argument1 === "string" && argument1[0] !== "_") {
                const functionName = argument1;

                if (functionName === "destroy") {
                    return destroyWidget(this);
                } else if (functionName === "get_widget_class") {
                    return widgetClass;
                } else {
                    return callFunction(this, functionName, args);
                }
            }
        };
    }

    protected static defaults = {};

    public options: any;

    protected $el: JQuery<any>;

    constructor(el: Element, options: any) {
        this.$el = jQuery(el);

        const defaults = (this.constructor as typeof SimpleWidget).defaults;
        this.options = jQuery.extend({}, defaults, options);
    }

    public destroy(): void {
        this._deinit();
    }

    protected _init(): void {
        //
    }

    protected _deinit(): void {
        //
    }
}
