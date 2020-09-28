"use strict";
exports.__esModule = true;
var testUtil_1 = require("./testUtil");
var getTreeNode = function ($li) {
    var $div = testUtil_1.singleChild($li, "div.jqtree-element");
    var $span = testUtil_1.singleChild($div, "span.jqtree-title");
    var name = $span.html();
    var selected = $li.hasClass("jqtree-selected");
    if ($li.hasClass("jqtree-folder")) {
        var $ul = $li.children("ul.jqtree_common");
        return {
            nodeType: "folder",
            children: getChildren($ul),
            name: name,
            open: !$li.hasClass("jqtree-closed"),
            selected: selected
        };
    }
    else {
        return {
            nodeType: "child",
            name: name,
            selected: selected
        };
    }
};
var getChildren = function ($ul) {
    return $ul
        .children("li.jqtree_common")
        .map(function (_, li) { return getTreeNode(jQuery(li)); })
        .get();
};
var treeStructure = function ($el) {
    return getChildren(testUtil_1.singleChild($el, "ul.jqtree-tree"));
};
exports["default"] = treeStructure;
