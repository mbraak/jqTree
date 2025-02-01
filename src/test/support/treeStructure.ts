import { singleChild } from "./testUtil";

const getTreeNode = ($li: JQuery): JQTreeMatchers.TreeNode => {
    const $div = singleChild($li, "div.jqtree-element");
    const $span = singleChild($div, "span.jqtree-title");
    const name = $span.html();
    const selected = $li.hasClass("jqtree-selected");

    if ($li.hasClass("jqtree-folder")) {
        const $ul = $li.children("ul.jqtree_common");

        return {
            children: getChildren($ul),
            name,
            nodeType: "folder",
            open: !$li.hasClass("jqtree-closed"),
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

const getChildren = ($ul: JQuery): JQTreeMatchers.TreeStructure =>
    $ul
        .children("li.jqtree_common")
        .map<JQTreeMatchers.TreeNode>((_, li) => getTreeNode(jQuery(li)))
        .get();

const treeStructure = ($el: JQuery): JQTreeMatchers.TreeStructure =>
    getChildren(singleChild($el, "ul.jqtree-tree"));

export default treeStructure;
