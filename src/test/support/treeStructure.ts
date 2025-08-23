import { getChilden, singleChild } from "./testUtil";

const getTreeNode = (li: HTMLElement): JQTreeMatchers.TreeNode => {
    const div = singleChild(li, "div", "jqtree-element");
    const span = singleChild(div, "span", "jqtree-title");
    const name = span.innerHTML;
    const selected = li.classList.contains("jqtree-selected");

    if (li.classList.contains("jqtree-folder")) {
        const ulChildren = getChilden(li, "ul", "jqtree_common");

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
    getChilden(ul, "li", "jqtree_common").map((li) => getTreeNode(li));

const treeStructure = (el: HTMLElement): JQTreeMatchers.TreeStructure => {
    return getChildNodes(singleChild(el, "ul", "jqtree-tree"));
};

export default treeStructure;
