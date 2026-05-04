import 'vitest'

declare module 'vitest' {
    interface Matchers<R = any> {
        toBeClosed(): R;
        toBeFocused(): R;
        toBeOpen(): R;
        toBeSelected(): R;
        toHaveTreeStructure(treeStructure: any): R;
    }
}