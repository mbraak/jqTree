import { mockElementBoundingClientRect } from "jsdom-testing-mocks";
import { vi } from "vitest";

const rowHeight = 20;
const treeWidth = 100;

const mockElement = (element: HTMLElement, top: number, height: number) => {
    vi.spyOn(element, "clientHeight", "get").mockReturnValue(height);
    vi.spyOn(element, "clientWidth", "get").mockReturnValue(treeWidth);
    vi.spyOn(element, "offsetParent", "get").mockReturnValue(
        element.parentElement,
    );

    mockElementBoundingClientRect(element, {
        height,
        width: treeWidth,
        x: 0,
        y: top,
    });
};

// The list elements of the visible nodes, in the order in which they are displayed.
const getVisibleListElements = (listElement: HTMLElement): HTMLElement[] => {
    const listItemElements =
        listElement.querySelectorAll<HTMLElement>(":scope > li");

    return Array.from(listItemElements).flatMap((listItemElement) => {
        const isClosed = listItemElement.classList.contains("jqtree-closed");

        const childListElement = isClosed
            ? null
            : listItemElement.querySelector<HTMLElement>(":scope > ul");

        return [
            listItemElement,
            ...(childListElement
                ? getVisibleListElements(childListElement)
                : []),
        ];
    });
};

// Give the rendered nodes a layout: every visible node is a row of 20 pixels.
// Jsdom doesn't do layout, but drag and drop needs the positions of the nodes.
const mockLayout = (element: HTMLElement) => {
    const treeListElement = element.querySelector<HTMLElement>(":scope > ul");

    if (!treeListElement) {
        throw new Error("Cannot find the list element of the tree");
    }

    const listElements = getVisibleListElements(treeListElement);

    listElements.forEach((listItemElement, index) => {
        // The height of a node includes the height of its visible children.
        const childCount = getVisibleListElements(listItemElement).length;

        mockElement(
            listItemElement,
            index * rowHeight,
            (childCount + 1) * rowHeight,
        );
    });

    mockElement(element, 0, listElements.length * rowHeight);
};

export default mockLayout;
