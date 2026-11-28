var $tree = $("#tree1");

$tree.tree({
    data: ExampleData.exampleData,
    autoOpen: true,
    multiSelect: true
});

// Show the selected nodes. tree.select is triggered when a node is added to
// the selection or removed from it.
$tree.on("tree.select", function() {
    var names = $tree.tree("getSelectedNodes").map(function(node) {
        return node.name;
    });

    $("#selected-nodes").text(names.length ? names.join(", ") : "none");
});
