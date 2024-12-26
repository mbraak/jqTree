import { mockElementBoundingClientRect } from "jsdom-testing-mocks";

import { Node } from "../../node";

interface Rect {
    height: number;
    width: number;
    x: number;
    y: number;
}

export const singleChild = ($el: JQuery, selector: string): JQuery => {
    const $result = $el.children(selector);

    /* istanbul ignore if */
    if ($result.length === 0) {
        throw new Error(`No child found for selector '${selector}'`);
    }

    /* istanbul ignore if */
    if ($result.length > 1) {
        throw new Error(`Multiple elements found for selector '${selector}'`);
    }

    return $result;
};

export const titleSpan = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(nodeElement(liNode), "span.jqtree-title");

export const togglerLink = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(nodeElement(liNode), "a.jqtree-toggler");

const nodeElement = (liNode: HTMLElement | JQuery): JQuery =>
    singleChild(jQuery(liNode), "div.jqtree-element ");

export const mockLayout = (element: HTMLElement, rect: Rect) => {
    jest.spyOn(element, "clientHeight", "get").mockReturnValue(rect.height);
    jest.spyOn(element, "clientWidth", "get").mockReturnValue(rect.width);
    jest.spyOn(element, "offsetParent", "get").mockReturnValue(
        element.parentElement,
    );

    mockElementBoundingClientRect(element, rect);
};

export const generateHtmlElementsForTree = (tree: Node) => {
    let y = 0;

    function generateHtmlElementsForNode(
        node: Node,
        parentElement: HTMLElement,
        x: number,
    ) {
        const isTree = node.tree === node;
        const element = document.createElement("div");
        parentElement.append(element);

        const childElement = document.createElement("div");
        childElement.className = "jqtree-element";
        element.append(childElement);

        if (!isTree) {
            mockLayout(element, { height: 20, width: 100 - x, x, y });
            node.element = element;
            y += 20;
        }

        if (node.hasChildren() && (node.is_open || isTree)) {
            for (const child of node.children) {
                generateHtmlElementsForNode(
                    child,
                    element,
                    isTree ? x : x + 10,
                );
            }
        }

        return element;
    }

    const treeElement = generateHtmlElementsForNode(tree, document.body, 0);
    mockLayout(treeElement, { height: y, width: 100, x: 0, y: 0 });

    return treeElement;
};
