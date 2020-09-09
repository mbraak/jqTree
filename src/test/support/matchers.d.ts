/// <reference types="jest"/>

declare namespace JQTreeMatchers {
    interface TreeChild {
        nodeType: "child";
        name: string;
        selected: boolean;
    }

    interface TreeFolder {
        nodeType: "folder";
        children: TreeNode[];
        name: string;
        open: boolean;
        selected: boolean;
    }

    export type TreeNode = TreeChild | TreeFolder;
    export type TreeStructure = TreeNode[];
}

declare namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
        notToBeSelected(): boolean;
        toBeClosed(): boolean;
        toBeOpen(): boolean;
        toBeSelected(): boolean;
        toHaveTreeStructure(
            treeStructure: JQTreeMatchers.TreeStructure
        ): boolean;
    }
}
