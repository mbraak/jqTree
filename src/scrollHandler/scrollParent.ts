import type { ScrollParent} from './types'
import ContainerScrollParent from './containerScrollParent'

const hasOverFlow = ($element: JQuery<HTMLElement): boolean => {
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

const createScrollParent = ($treeElement: JQuery<HTMLElement>): ScrollParent => {
  const $parentElement = getParentWithOverflow($treeElement);

  if (
    $parentElement?.length &&
    $parentElement[0]?.tagName !== "HTML"
) {
  return new ContainerScrollParent($parentElement);
};

export default createScrollParent;
