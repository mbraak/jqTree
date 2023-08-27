import type { ScrollParent } from "./types";
import ContainerScrollParent from "./containerScrollParent";
import DocumentScrollParent from "./documentScrollParent";

const hasOverFlow = ($element: JQuery<HTMLElement>): boolean => {
    for (const attr of ["overflow", "overflow-y"]) {
        const overflowValue = $element.css(attr);
        if (overflowValue === "auto" || overflowValue === "scroll") {
            return true;
        }
    }

    return false;
};

const getParentWithOverflow = (
    $treeElement: JQuery<HTMLElement>,
): JQuery<HTMLElement> | null => {
    if (hasOverFlow($treeElement)) {
        return $treeElement;
    }

    for (const element of $treeElement.parents().get()) {
        const $element = jQuery(element);
        if (hasOverFlow($element)) {
            return $element;
        }
    }

    return null;
};

const createScrollParent = (
    $treeElement: JQuery<HTMLElement>,
    refreshHitAreas: () => void,
): ScrollParent => {
    const $container = getParentWithOverflow($treeElement);

    if ($container?.length && $container[0]?.tagName !== "HTML") {
        return new ContainerScrollParent({
            $container,
            refreshHitAreas,
            $treeElement,
        });
    } else {
        return new DocumentScrollParent($treeElement, refreshHitAreas);
    }
};

export default createScrollParent;
