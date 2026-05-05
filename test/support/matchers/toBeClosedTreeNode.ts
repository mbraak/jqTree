import { assertJqTreeFolder } from "../testUtil";

export function toBeClosedTreeNode(el: HTMLElement) {
  assertJqTreeFolder(el);

  /* istanbul ignore next @preserve */
  return {
    message: () => "The node is open",
    pass: el.classList.contains("jqtree-closed"),
  };
}
