/// <reference types="jest"/>

declare namespace jest {
    interface Matchers<R> {
        toHaveTreeStructure(treeStructure: any): boolean;
    }
}

declare module "jest-jqtree-matchers";
