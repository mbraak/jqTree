export type AnimationSpeed = "fast" | "slow" | number;

export const getAnimationDuration = (duration: AnimationSpeed): number => {
  if (typeof duration === "number") {
    return duration;
  }

  return duration === "slow" ? 600 : 200;
};

export const slideDown = (
  element: HTMLElement,
  animationSpeed: AnimationSpeed,
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
  animationSpeed: AnimationSpeed,
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