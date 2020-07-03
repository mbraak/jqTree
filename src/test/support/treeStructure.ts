import { singleChild } from "./testUtil";

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
