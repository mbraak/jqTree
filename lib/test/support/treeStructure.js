"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _testUtil = require("./testUtil");
const getTreeNode = $li => {
  const $div = (0, _testUtil.singleChild)($li, "div.jqtree-element");
  const $span = (0, _testUtil.singleChild)($div, "span.jqtree-title");
  const name = $span.html();
  const selected = $li.hasClass("jqtree-selected");
  if ($li.hasClass("jqtree-folder")) {
    const $ul = $li.children("ul.jqtree_common");
    return {
      nodeType: "folder",
      children: getChildren($ul),
      name,
      open: !$li.hasClass("jqtree-closed"),
      selected
    };
  } else {
    return {
      nodeType: "child",
      name,
      selected
    };
  }
};
const getChildren = $ul => $ul.children("li.jqtree_common").map((_, li) => getTreeNode(jQuery(li))).get();
const treeStructure = $el => getChildren((0, _testUtil.singleChild)($el, "ul.jqtree-tree"));
var _default = treeStructure;
exports.default = _default;