/// <reference types="jest"/>

declare namespace JQTreeMatchers {
    interface TreeFolder {
        name: string;
        open: boolean;
        children: TreeNode[];
    }

    export type TreeNode = TreeFolder | string;
    export type TreeStructure = TreeNode[];
}

declare namespace jest {
    interface Matchers<R> {
        toBeClosed(): boolean;
        toBeOpen(): boolean;
        toHaveTreeStructure(
            treeStructure: JQTreeMatchers.TreeStructure
        ): boolean;
    }
}
