interface TreeFolder {
    name: string;
    open: boolean;
    children: TreeNode[];
}

type TreeNode = TreeFolder | string;

const singleChild = (
    $el: JQuery<HTMLElement>,
    selector: string
): JQuery<HTMLElement> => {
    const $result = $el.children(selector);

    if ($result.length === 0) {
        throw `No child found for selector '${selector}'`;
    } else if ($result.length > 1) {
        throw `Multiple elements found for selector '${selector}'`;
    }

    return $result;
};

const getTreeNode = ($li: JQuery<HTMLElement>): TreeNode => {
    const $div = singleChild($li, "div.jqtree-element");
    const $span = singleChild($div, "span.jqtree-title");
    const name = $span.text();

    if ($li.hasClass("jqtree-folder")) {
        const $ul = singleChild($li, "ul.jqtree_common");

        return {
            children: getChildren($ul),
            name,
            open: $li.hasClass("jqtree-closed"),
        };
    } else {
        return name;
    }
};

const getChildren = ($ul: JQuery<HTMLElement>): TreeNode[] =>
    $ul
        .children("li.jqtree_common")
        .map<TreeNode>((_, li) => getTreeNode(jQuery(li)))
        .get();

export const treeStructure = ($el: JQuery<HTMLElement>): TreeNode[] =>
    getChildren(singleChild($el, "ul.jqtree-tree"));
