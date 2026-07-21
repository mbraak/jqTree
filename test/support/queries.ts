import { queryHelpers } from "@testing-library/dom";

// Get the HTML element for the title of a tree node.
export const getTitleElement = (container: HTMLElement) => {
  const elements = getNodeElement(container).querySelectorAll(":scope > span.jqtree-title"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(container, elements, 'title');
  return elements[0] as HTMLElement;
}

// Get the toggler link element of a tree node.
export const getTogglerElement = (container: HTMLElement) => {
  const elements = getNodeElement(container).querySelectorAll(":scope > a.jqtree-toggler"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(container, elements, 'toggler');
  return elements[0] as HTMLElement;
}

// Get the HTML element for the 'jqtree-element' of a tree node. 
const getNodeElement = (container: HTMLElement) => {
  const elements = container.querySelectorAll(":scope > div.jqtree-element"); // eslint-disable-line testing-library/no-node-access
  assertSingleElement(container, elements, 'node');
  return elements[0] as HTMLElement;
}

export const assertSingleElement = (container: HTMLElement, elements: NodeListOf<Element>, name: string) => {
  if (!elements.length) {
    throw queryHelpers.getElementError(`Unable to find ${name} element`, container);
  } else if (elements.length > 1) {
    throw queryHelpers.getElementError(`Found multiple ${name} elements`, container);
  }
}