interface TopLeftPosition {
  left: number;
  top: number;
}

// Get the top position of the HTML element.
export const getOffsetTop = (element: HTMLElement): number =>
  getElementPosition(element).top;

// Get the top left position of the HTML element.
export const getElementPosition = (element: HTMLElement): TopLeftPosition => {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.x + window.scrollX,
    top: rect.y + window.scrollY,
  };
};
