export function toBeSelected(el: HTMLElement) {
  /* istanbul ignore next @preserve */
  return {
    message: () => "The node is not selected",
    pass: el.classList.contains("jqtree-selected"),
  };
}
