import { assertSingleElement, getTitleElement } from "./queries";

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
    const span = getTitleElement(li);
    const name = span.innerHTML;
    const selected = li.classList.contains("jqtree-selected");

    if (li.classList.contains("jqtree-folder")) {
        const ulChildren = li.querySelectorAll(":scope > ul.jqtree_common");

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

const getChildNodes = (ul: HTMLElement) => Array.from(ul.querySelectorAll<HTMLElement>(":scope > li.jqtree_common")).map((li) => getTreeNode(li))

const treeStructure = (el: HTMLElement): TreeStructure => {
    const elements = el.querySelectorAll<HTMLElement>(":scope > ul.jqtree-tree");
    assertSingleElement(el, elements, "tree");
    return getChildNodes(elements[0] as HTMLElement);
};

export default treeStructure;
