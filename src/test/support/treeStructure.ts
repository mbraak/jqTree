const singleChild = (
    $el: JQuery<HTMLElement>,
    selector: string
): JQuery<HTMLElement> => {
    const $result = $el.children(selector);

    /* istanbul ignore if */
    if ($result.length === 0) {
        throw `No child found for selector '${selector}'`;
    }

    /* istanbul ignore if */
    if ($result.length > 1) {
        throw `Multiple elements found for selector '${selector}'`;
    }

    return $result;
};

const getTreeNode = ($li: JQuery<HTMLElement>): JQTreeMatchers.TreeNode => {
    const $div = singleChild($li, "div.jqtree-element");
    const $span = singleChild($div, "span.jqtree-title");
    const name = $span.text();

    if ($li.hasClass("jqtree-folder")) {
        const $ul = $li.children("ul.jqtree_common");

        return {
            children: getChildren($ul),
            name,
            open: !$li.hasClass("jqtree-closed"),
        };
    } else {
        return name;
    }
};

const getChildren = ($ul: JQuery<HTMLElement>): JQTreeMatchers.TreeStructure =>
    $ul
        .children("li.jqtree_common")
        .map<JQTreeMatchers.TreeNode>((_, li) => getTreeNode(jQuery(li)))
        .get();

const treeStructure = (
    $el: JQuery<HTMLElement>
): JQTreeMatchers.TreeStructure =>
    getChildren(singleChild($el, "ul.jqtree-tree"));

export default treeStructure;
