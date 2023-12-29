export const isInt = (n: unknown): boolean =>
    typeof n === "number" && n % 1 === 0;

export const isFunction = (v: unknown): boolean => typeof v === "function";

export const getBoolString = (value: unknown): string =>
    value ? "true" : "false";

export const getOffsetTop = (element: HTMLElement) =>
    getElementPosition(element).top;

export const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.x + window.scrollX,
        top: rect.y + window.scrollY,
    };
};
