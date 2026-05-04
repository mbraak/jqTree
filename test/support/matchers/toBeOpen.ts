import { assertJqTreeFolder } from "../testUtil";

export function toBeOpen(el: HTMLElement) {
  assertJqTreeFolder(el);

  /* istanbul ignore next @preserve */
  return {
    message: () => "The node is closed",
    pass: !el.classList.contains("jqtree-closed"),
  };
}
