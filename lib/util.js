export const isInt = (n) => typeof n === "number" && n % 1 === 0;
export const isFunction = (v) => typeof v === "function";
export const getBoolString = (value) => value ? "true" : "false";
