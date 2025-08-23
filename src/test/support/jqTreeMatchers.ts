import { titleSpan } from "./testUtil";
import treeStructure from "./treeStructure";

const assertJqTreeFolder = (el: HTMLElement) => {
    /* istanbul ignore if */
    if (!el.classList.contains("jqtree-folder")) {
        throw new Error("Node is not a folder");
    }
};

expect.extend({
    toBeClosed(el: HTMLElement) {
        assertJqTreeFolder(el);

        /* istanbul ignore next */
        return {
            message: () => "The node is open",
            pass: el.classList.contains("jqtree-closed"),
        };
    },
    toBeFocused(el: HTMLElement) {
        /* istanbul ignore next */
        return {
            message: () => "The is node is not focused",
            pass: document.activeElement === titleSpan(el),
        };
    },
    toBeOpen(el: HTMLElement) {
        assertJqTreeFolder(el);

        /* istanbul ignore next */
        return {
            message: () => "The node is closed",
            pass: !el.classList.contains("jqtree-closed"),
        };
    },
    toBeSelected(el: HTMLElement) {
        /* istanbul ignore next */
        return {
            message: () => "The node is not selected",
            pass: el.classList.contains("jqtree-selected"),
        };
    },
    toHaveTreeStructure(
        $el: JQuery,
        expectedStructure: JQTreeMatchers.TreeStructure,
    ) {
        const el = $el.get(0) as HTMLElement;
        const receivedStructure = treeStructure(el);

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
