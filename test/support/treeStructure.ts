import { getChildren, singleChild } from "./testUtil";

export type TreeNode = TreeChild | TreeFolder;

export type TreeStructure = TreeNode[];

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

const getTreeNode = (li: HTMLElement): TreeNode => {
    const div = singleChild(li, "div", "jqtree-element");
    const span = singleChild(div, "span", "jqtree-title");
    const name = span.innerHTML;
    const selected = li.classList.contains("jqtree-selected");

    if (li.classList.contains("jqtree-folder")) {
        const ulChildren = getChildren(li, "ul", "jqtree_common");

        const children =
            ulChildren.length === 1
                ? getChildNodes(ulChildren[0] as HTMLElement)
                : [];

        return {
            children,
            name,
            nodeType: "folder",
            open: !li.classList.contains("jqtree-closed"),
            selected,
        };
    } else {
        return {
            name,
            nodeType: "child",
            selected,
        };
    }
};

const getChildNodes = (ul: HTMLElement) =>
    getChildren(ul, "li", "jqtree_common").map((li) => getTreeNode(li));

const treeStructure = (el: HTMLElement): TreeStructure => {
    return getChildNodes(singleChild(el, "ul", "jqtree-tree"));
};

export default treeStructure;
