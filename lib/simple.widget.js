"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const register = (widgetClass, widgetName) => {
  const getDataKey = () => `simple_widget_${widgetName}`;
  const getWidgetData = (el, dataKey) => {
    const widget = jQuery.data(el, dataKey);
    if (widget && widget instanceof SimpleWidget) {
      return widget;
    } else {
      return null;
    }
  };
  const createWidget = ($el, options) => {
    const dataKey = getDataKey();
    for (const el of $el.get()) {
      const existingWidget = getWidgetData(el, dataKey);
      if (!existingWidget) {
        const simpleWidgetClass = widgetClass;
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
  const destroyWidget = $el => {
    const dataKey = getDataKey();
    for (const el of $el.get()) {
      const widget = getWidgetData(el, dataKey);
      if (widget) {
        widget.destroy();
      }
      jQuery.removeData(el, dataKey);
    }
  };
  const callFunction = ($el, functionName, args) => {
    let result = null;
    for (const el of $el.get()) {
      const widget = jQuery.data(el, getDataKey());
      if (widget && widget instanceof SimpleWidget) {
        const simpleWidget = widget;
        const widgetFunction = simpleWidget[functionName];
        if (widgetFunction && typeof widgetFunction === "function") {
          result = widgetFunction.apply(widget, args);
        }
      }
    }
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jQuery.fn[widgetName] = function (argument1) {
    if (!argument1) {
      return createWidget(this, null);
    } else if (typeof argument1 === "object") {
      const options = argument1;
      return createWidget(this, options);
    } else if (typeof argument1 === "string" && argument1[0] !== "_") {
      const functionName = argument1;
      if (functionName === "destroy") {
        return destroyWidget(this);
      } else if (functionName === "get_widget_class") {
        return widgetClass;
      } else {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return callFunction(this, functionName, args);
      }
    } else {
      return undefined;
    }
  };
};
class SimpleWidget {
  static register(widgetClass, widgetName) {
    register(widgetClass, widgetName);
  }
  static defaults = {};
  constructor(el, options) {
    this.$el = jQuery(el);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const defaults = this.constructor["defaults"];
    this.options = {
      ...defaults,
      ...options
    };
  }
  destroy() {
    this.deinit();
  }
  init() {
    //
  }
  deinit() {
    //
  }
}
exports.default = SimpleWidget;