export const isInt = (n: unknown): boolean =>
    typeof n === "number" && n % 1 === 0;

export const getBoolString = (value: unknown): string =>
    value ? "true" : "false";

export const getAnimationDuration = (duration: JQuery.Duration): number => {
    if (typeof duration === "number") {
        return duration;
    }

    return duration === "slow" ? 600 : 200;
};
