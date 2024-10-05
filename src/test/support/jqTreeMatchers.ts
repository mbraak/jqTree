import treeStructure from "./treeStructure";
import { titleSpan } from "./testUtil";

const assertJqTreeFolder = ($el: JQuery) => {
    /* istanbul ignore if */
    if (!$el.hasClass("jqtree-folder")) {
        throw new Error("Node is not a folder");
    }
};

expect.extend({
    toBeClosed(el: HTMLElement | JQuery) {
        const $el = jQuery(el);
        assertJqTreeFolder($el);

        /* istanbul ignore next */
        return {
            message: () => "The node is open",
            pass: $el.hasClass("jqtree-closed"),
        };
    },
    toBeFocused(el: HTMLElement | JQuery) {
        /* istanbul ignore next */
        return {
            message: () => "The is node is not focused",
            pass: document.activeElement === titleSpan(el)[0],
        };
    },
    toBeOpen(el: HTMLElement | JQuery) {
        const $el = jQuery(el);
        assertJqTreeFolder($el);

        /* istanbul ignore next */
        return {
            message: () => "The node is closed",
            pass: !$el.hasClass("jqtree-closed"),
        };
    },
    toBeSelected(el: HTMLElement | JQuery) {
        const $el = jQuery(el);

        /* istanbul ignore next */
        return {
            message: () => "The node is not selected",
            pass: $el.hasClass("jqtree-selected"),
        };
    },
    toHaveTreeStructure(
        el: HTMLElement | JQuery,
        expectedStructure: JQTreeMatchers.TreeStructure,
    ) {
        const $el = jQuery(el);
        const receivedStructure = treeStructure($el);

        /* istanbul ignore next */
        return {
            message: () =>
                this.utils.printDiffOrStringify(
                    expectedStructure,
                    receivedStructure,
                    "expected",
                    "received",
                    true,
                ),
            pass: this.equals(receivedStructure, expectedStructure),
        };
    },
});
