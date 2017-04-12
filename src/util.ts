export function isInt(n: any): boolean {
    return typeof n === "number" && n % 1 === 0;
}

export function isFunction(v: any): boolean {
    return typeof v === "function";
}

// Escape a string for HTML interpolation; copied from underscore js
export function html_escape(text: string): string {
    return `${text}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

export function getBoolString(value: any): string {
    if (value) {
        return "true";
    } else {
        return "false";
    }
}
