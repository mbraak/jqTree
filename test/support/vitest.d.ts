import 'vitest'

declare module 'vitest' {
    interface Matchers<R = any> {
        toBeAriaExpanded(): R;
        toBeAriaSelected(): R;
        toHaveTreeStructure(treeStructure: any): R;
    }
}