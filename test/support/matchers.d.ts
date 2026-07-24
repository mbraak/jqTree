import 'vitest'

declare module 'vitest' {
    interface Matchers<R = any> {
        toBeAriaExpanded(): R;
        toBeAriaSelected(): R;
        toBeClosedTreeNode(): R;
        toBeFocusedTreeNode(): R;
        toBeOpenTreeNode(): R;
        toBeSelectedTreeNode(): R;
        toHaveTreeStructure(treeStructure: any): R;
    }
}