"use strict";
exports.__esModule = true;
exports.exampleData = [
    {
        label: "node1",
        id: 123,
        intProperty: 1,
        strProperty: "1",
        children: [{ label: "child1", id: 125, intProperty: 2 }, { label: "child2", id: 126 }]
    },
    {
        label: "node2",
        id: 124,
        intProperty: 3,
        strProperty: "3",
        children: [{ label: "child3", id: 127 }]
    }
];
/*
example data 2:

-main
---c1
---c2
*/
exports.exampleData2 = [
    {
        label: "main",
        children: [{ label: "c1" }, { label: "c2" }]
    }
];
function formatNodes(nodes) {
    var strings = nodes.map(function (node) { return node.name; });
    return strings.join(" ");
}
exports.formatNodes = formatNodes;
function isNodeClosed($node) {
    return ($node.is("li.jqtree-folder.jqtree-closed") &&
        $node.find("a:eq(0)").is("a.jqtree-toggler.jqtree-closed") &&
        $node.find("ul:eq(0)").is("ul"));
}
exports.isNodeClosed = isNodeClosed;
function isNodeOpen($node) {
    return ($node.is("li.jqtree-folder") &&
        $node.find("a:eq(0)").is("a.jqtree-toggler") &&
        $node.find("ul:eq(0)").is("ul") &&
        !$node.is("li.jqtree-folder.jqtree-closed") &&
        !$node.find("span:eq(0)").is("a.jqtree-toggler.jqtree-closed"));
}
exports.isNodeOpen = isNodeOpen;
function formatTitles($node) {
    var titles = $node.find(".jqtree-title").map(function (_, el) { return $(el).text(); });
    return titles.toArray().join(" ");
}
exports.formatTitles = formatTitles;
function doGetNodeByName(tree, name) {
    var result = tree.getNodeByName(name);
    if (!result) {
        throw Error("Node with name '" + name + "' not found");
    }
    return result;
}
exports.doGetNodeByName = doGetNodeByName;
function doGetNodeById(tree, id) {
    var result = tree.getNodeById(id);
    if (!result) {
        throw Error("Node with id '" + id + "' not found");
    }
    return result;
}
exports.doGetNodeById = doGetNodeById;
