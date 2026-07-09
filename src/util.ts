export const isInt = (n: unknown): boolean =>
    typeof n === "number" && n % 1 === 0;

export const getBoolString = (value: unknown): string =>
    value ? "true" : "false";
