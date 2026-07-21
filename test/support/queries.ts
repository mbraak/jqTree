import { queryHelpers } from "@testing-library/dom";

// Get the HTML element for the title of a tree node.
export const getTitleElement = (container: HTMLElement) => {
  const elements = getNodeElement(container).querySelectorAll(":scope > .jqtree-title"); // eslint-disable-line testing-library/no-node-access

  if (!elements.length) {
    throw queryHelpers.getElementError('Unable to find title element', container);
  } else if (elements.length > 1) {
    throw queryHelpers.getElementError('Found multiple title elements', container);
  }

  return elements[0] as HTMLElement;
}

// Get the HTML element for the 'jqtree-element' of a tree node. 
const getNodeElement = (container: HTMLElement) => {
  const elements = container.querySelectorAll(":scope > .jqtree-element"); // eslint-disable-line testing-library/no-node-access

  if (!elements.length) {
    throw queryHelpers.getElementError('Unable to find node element', container);
  } else if (elements.length > 1) {
    throw queryHelpers.getElementError('Found multiple node elements', container);
  }

  return elements[0] as HTMLElement;
}