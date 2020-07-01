"use strict";
exports.__esModule = true;
var singleChild = function ($el, selector) {
    var $result = $el.children(selector);
    /* istanbul ignore if */
    if ($result.length === 0) {
        throw "No child found for selector '" + selector + "'";
    }
    /* istanbul ignore if */
    if ($result.length > 1) {
        throw "Multiple elements found for selector '" + selector + "'";
    }
    return $result;
};
var getTreeNode = function ($li) {
    var $div = singleChild($li, "div.jqtree-element");
    var $span = singleChild($div, "span.jqtree-title");
    var name = $span.text();
    if ($li.hasClass("jqtree-folder")) {
        var $ul = $li.children("ul.jqtree_common");
        return {
            children: getChildren($ul),
            name: name,
            open: !$li.hasClass("jqtree-closed")
        };
    }
    else {
        return name;
    }
};
var getChildren = function ($ul) {
    return $ul
        .children("li.jqtree_common")
        .map(function (_, li) { return getTreeNode(jQuery(li)); })
        .get();
};
var treeStructure = function ($el) {
    return getChildren(singleChild($el, "ul.jqtree-tree"));
};
exports["default"] = treeStructure;
