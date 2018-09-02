export const isInt = (n: any): boolean => typeof n === "number" && n % 1 === 0;

export const isFunction = (v: any): boolean => typeof v === "function";

// Escape a string for HTML interpolation; copied from underscore js
export const htmlEscape = (text: string): string =>
    `${text}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

export const getBoolString = (value: any): string => (value ? "true" : "false");
