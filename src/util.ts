// todo: use native implementation
export function _indexOf(array: Array<any>, item: any): number {
    return array.indexOf(item);
}

// todo: use native implementation
export function indexOf(array, item): number {
    return array.indexOf(item);
}

export function isInt(n: any): boolean {
    return typeof n == "number" && n % 1 == 0;
}

export function isFunction(v: any): boolean {
    return typeof v == "function";
}

// Escape a string for HTML interpolation; copied from underscore js
export function html_escape(string: string): string {
    return `${string}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g,"&#x2F;");
}

export function getBoolString(value: any): string {
    if (value) {
        return "true";
    }
    else {
        return "false";
    }
}
