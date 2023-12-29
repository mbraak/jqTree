import type { ScrollParent } from "./types";
import ContainerScrollParent from "./containerScrollParent";
import DocumentScrollParent from "./documentScrollParent";

const isOverflow = (overflowValue: string) =>
    overflowValue === "auto" || overflowValue === "scroll";

const hasOverFlow = (element: HTMLElement): boolean => {
    const style = getComputedStyle(element);

    return isOverflow(style.overflowX) || isOverflow(style.overflowY);
};

const getParentWithOverflow = (
    treeElement: HTMLElement,
): HTMLElement | null => {
    if (hasOverFlow(treeElement)) {
        return treeElement;
    }

    let parent = treeElement.parentElement;

    while (parent) {
        if (hasOverFlow(parent)) {
            return parent;
        }

        parent = parent.parentElement;
    }

    return null;
};

const createScrollParent = (
    treeElement: HTMLElement,
    refreshHitAreas: () => void,
): ScrollParent => {
    const container = getParentWithOverflow(treeElement);

    if (container && container.tagName !== "HTML") {
        return new ContainerScrollParent({
            container,
            refreshHitAreas,
        });
    } else {
        return new DocumentScrollParent({ refreshHitAreas, treeElement });
    }
};

export default createScrollParent;
