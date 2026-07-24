import { queryHelpers } from "@testing-library/dom";

const assertSingleElement = (container: HTMLElement, elements: NodeListOf<Element>, name: string) => {
  if (!elements.length) {
    throw queryHelpers.getElementError(`Unable to find ${name} element`, container);
  } else if (elements.length > 1) {
    throw queryHelpers.getElementError(`Found multiple ${name} elements`, container);
  }
}

export const getTreeButton = (treeElement: HTMLElement) => {
  if (treeElement.role != "treeitem") {
    throw new Error("Element must have role treeitem");
  }

  const parent = treeElement.parentElement; // eslint-disable-line testing-library/no-node-access
  if (!parent) {
    throw new Error("Tree element must have a parent");
  }

  const elements = parent.querySelectorAll(":scope > a.jqtree-toggler"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(parent, elements, 'tree button');
  return elements[0] as HTMLElement;
};

export const getTreeListElement = (treeElement: HTMLElement) => {
  if (treeElement.role != "treeitem") {
    throw new Error("Element must have role treeitem");
  }

  const parentOfParent = treeElement.parentElement?.parentElement; // eslint-disable-line testing-library/no-node-access
  if (!parentOfParent) {
    throw new Error("Tree element must have a parent");
  }

  if (parentOfParent.tagName != "LI") {
    throw new Error("Must be a list element");
  }

  return parentOfParent;
};
