"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _testUtil = require("./testUtil");
var getTreeNode = function getTreeNode($li) {
  var $div = (0, _testUtil.singleChild)($li, "div.jqtree-element");
  var $span = (0, _testUtil.singleChild)($div, "span.jqtree-title");
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
  } else {
    return {
      nodeType: "child",
      name: name,
      selected: selected
    };
  }
};
var getChildren = function getChildren($ul) {
  return $ul.children("li.jqtree_common").map(function (_, li) {
    return getTreeNode(jQuery(li));
  }).get();
};
var treeStructure = function treeStructure($el) {
  return getChildren((0, _testUtil.singleChild)($el, "ul.jqtree-tree"));
};
var _default = exports["default"] = treeStructure;