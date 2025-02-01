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

    const createNodeElement = (node: Node) => {
        const isTree = node.tree === node;

        if (isTree) {
            const element = document.createElement("ul");
            element.className = "jqtree-tree";
            return element;
        } else {
            const li = document.createElement("li");

            if (node.isFolder()) {
                li.className = "jqtree-folder";

                if (!node.is_open) {
                    li.classList.add("jqtree-closed");
                }
            }

            return li;
        }
    };

    function generateHtmlElementsForNode(
        node: Node,
        parentElement: HTMLElement,
        x: number,
    ) {
        const isTree = node.tree === node;
        const nodeElement = createNodeElement(node);

        parentElement.append(nodeElement);

        if (!isTree) {
            const divElement = document.createElement("div");
            divElement.className = "jqtree-element";
            nodeElement.append(divElement);

            mockLayout(nodeElement, { height: 20, width: 100 - x, x, y });
            node.element = nodeElement;
            y += 20;
        }

        if (node.hasChildren() && (node.is_open || isTree)) {
            for (const child of node.children) {
                generateHtmlElementsForNode(
                    child,
                    nodeElement,
                    isTree ? x : x + 10,
                );
            }
        }

        return nodeElement;
    }

    const treeElement = generateHtmlElementsForNode(tree, document.body, 0);
    mockLayout(treeElement, { height: y, width: 100, x: 0, y: 0 });

    return treeElement;
};
