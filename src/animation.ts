export const getAnimationDuration = (duration: JQuery.Duration): number => {
    if (typeof duration === "number") {
        return duration;
    }

    return duration === "slow" ? 600 : 200;
};

export const slideDown = (
    element: HTMLElement,
    animationSpeed: JQuery.Duration,
    onFinished: () => void,
): void => {
    element.style.display = "block";

    const animation = element.animate(
        [
            { height: "0", overflow: "hidden" },
            { height: `${element.scrollHeight}px`, overflow: "hidden" },
        ],
        { duration: getAnimationDuration(animationSpeed) },
    );

    animation.onfinish = () => {
        onFinished();
    };
};

export const slideUp = (
    element: HTMLElement,
    animationSpeed: JQuery.Duration,
    onFinished: () => void,
): void => {
    const animation = element.animate(
        [
            { height: `${element.scrollHeight}px`, overflow: "hidden" },
            { height: "0", overflow: "hidden" },
        ],
        { duration: getAnimationDuration(animationSpeed) },
    );

    animation.onfinish = () => {
        element.style.display = "none";
        onFinished();
    };
};
