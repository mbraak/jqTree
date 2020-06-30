import { TreeNode, treeStructure } from "./testUtil";

expect.extend({
    toHaveTreeStructure(
        $el: JQuery<HTMLElement>,
        expectedStructure: TreeNode[]
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
