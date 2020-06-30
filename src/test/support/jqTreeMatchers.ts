import treeStructure from "./treeStructure";

const assertJqTreeFolder = ($el: JQuery<HTMLElement>) => {
    /* istanbul ignore if */
    if (!$el.hasClass("jqtree-folder")) {
        throw new Error("Node is not a folder");
    }
};

expect.extend({
    toBeClosed(el: HTMLElement | JQuery<HTMLElement>) {
        const $el = jQuery(el);
        assertJqTreeFolder($el);

        return {
            message: () => "The node is open",
            pass: $el.hasClass("jqtree-closed"),
        };
    },
    toBeOpen(el: HTMLElement | JQuery<HTMLElement>) {
        const $el = jQuery(el);
        assertJqTreeFolder($el);

        return {
            message: () => "The node is closed",
            pass: !$el.hasClass("jqtree-closed"),
        };
    },
    toHaveTreeStructure(
        el: HTMLElement | JQuery<HTMLElement>,
        expectedStructure: JQTreeMatchers.TreeStructure
    ) {
        const $el = jQuery(el);
        const receivedStructure = treeStructure($el);

        return {
            message: () =>
                this.utils.printDiffOrStringify(
                    expectedStructure,
                    receivedStructure,
                    "expected",
                    "received",
                    true
                ),
            pass: this.equals(receivedStructure, expectedStructure),
        };
    },
});
