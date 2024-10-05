/// <reference types="jest"/>

declare namespace JQTreeMatchers {
    interface TreeChild {
        name: string;
        nodeType: "child";
        selected: boolean;
    }

    interface TreeFolder {
        children: TreeNode[];
        name: string;
        nodeType: "folder";
        open: boolean;
        selected: boolean;
    }

    export type TreeNode = TreeChild | TreeFolder;
    export type TreeStructure = TreeNode[];
}

declare namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
        toBeClosed(): boolean;
        toBeFocused(): boolean;
        toBeOpen(): boolean;
        toBeSelected(): boolean;
        toHaveTreeStructure(treeStructure: any): boolean;
    }
}
