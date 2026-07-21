import { getTitleElement } from "../queries";

export function toBeFocusedTreeNode(el: HTMLElement) {
    /* istanbul ignore next @preserve */
    return {
        message: () => "The is node is not focused",
        pass: document.activeElement === getTitleElement(el),
    };
}
