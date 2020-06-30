import { treeStructure } from "./testUtil";

expect.extend({
    toHaveTreeStructure(
        $el: JQuery<HTMLElement>,
        expectedStructure: JQTreeMatchers.TreeStructure
    ) {
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
