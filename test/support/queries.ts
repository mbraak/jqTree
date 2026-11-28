import { queryHelpers } from "@testing-library/dom";

const assertSingleElement = (container: HTMLElement, elements: NodeListOf<Element>, name: string) => {
  if (!elements.length) {
    throw queryHelpers.getElementError(`Unable to find ${name} element`, container);
  } else if (elements.length > 1) {
    throw queryHelpers.getElementError(`Found multiple ${name} elements`, container);
  }
}

/* The treeitem is the li of the node. The toggler is in the element div of
 * the node, not in the li of a child node.
 */
export const getTreeButton = (treeElement: HTMLElement) => {
  if (treeElement.role != "treeitem") {
    throw new Error("Element must have role treeitem");
  }

  const elements = treeElement.querySelectorAll(":scope > .jqtree-element > .jqtree-toggler"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(treeElement, elements, 'tree button');
  return elements[0] as HTMLElement;
};

/* The title of the node. Click this instead of the treeitem: the li of a
 * folder also contains its children, and tree-element only handles clicks on
 * the element div of a node.
 */
export const getTreeTitle = (treeElement: HTMLElement) => {
  if (treeElement.role != "treeitem") {
    throw new Error("Element must have role treeitem");
  }

  const elements = treeElement.querySelectorAll(":scope > .jqtree-element > .jqtree-title"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(treeElement, elements, 'tree title');
  return elements[0] as HTMLElement;
};
