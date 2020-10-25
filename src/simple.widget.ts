const register = (widgetClass: unknown, widgetName: string): void => {
    const getDataKey = (): string => `simple_widget_${widgetName}`;

    const getWidgetData = (
        el: HTMLElement,
        dataKey: string
    ): SimpleWidget<unknown> | null => {
        const widget = jQuery.data(el, dataKey) as unknown;

        if (widget && widget instanceof SimpleWidget) {
            return widget;
        } else {
            return null;
        }
    };

    const createWidget = ($el: JQuery, options: unknown): JQuery => {
        const dataKey = getDataKey();

        for (const el of $el.get()) {
            const existingWidget = getWidgetData(el, dataKey);

            if (!existingWidget) {
                const simpleWidgetClass = widgetClass as typeof SimpleWidget;
                const widget = new simpleWidgetClass(el, options);

                if (!jQuery.data(el, dataKey)) {
                    jQuery.data(el, dataKey, widget);
                }

                // Call init after setting data, so we can call methods
                widget.init();
            }
        }

        return $el;
    };

    const destroyWidget = ($el: JQuery): void => {
        const dataKey = getDataKey();

        for (const el of $el.get()) {
            const widget = getWidgetData(el, dataKey);

            if (widget) {
                widget.destroy();
            }

            jQuery.removeData(el, dataKey);
        }
    };

    const callFunction = (
        $el: JQuery,
        functionName: string,
        args: unknown[]
    ): unknown => {
        let result = null;

        for (const el of $el.get()) {
            const widget = jQuery.data(el, getDataKey()) as unknown;

            if (widget && widget instanceof SimpleWidget) {
                const simpleWidget = widget as SimpleWidget<unknown>;
                const widgetFunction = simpleWidget[functionName];

                if (widgetFunction && typeof widgetFunction === "function") {
                    result = widgetFunction.apply(widget, args) as unknown;
                }
            }
        }

        return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (jQuery.fn as any)[widgetName] = function (
        this: JQuery,
        argument1: unknown,
        ...args: unknown[]
    ) {
        if (!argument1) {
            return createWidget(this, null);
        } else if (typeof argument1 === "object") {
            const options = argument1 as unknown;
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
};

export default class SimpleWidget<WidgetOptions> {
    public static register(widgetClass: unknown, widgetName: string): void {
        register(widgetClass, widgetName);
    }

    [key: string]: unknown;

    protected static defaults: unknown = {};

    public options: WidgetOptions;

    protected $el: JQuery<HTMLElement>;

    constructor(el: HTMLElement, options: WidgetOptions) {
        this.$el = jQuery(el);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const defaults = (this.constructor as any)["defaults"] as WidgetOptions;
        this.options = { ...defaults, ...options };
    }

    public destroy(): void {
        this.deinit();
    }

    public init(): void {
        //
    }

    public deinit(): void {
        //
    }
}
