$(function() {
    var $tree = $("#tree1");
    $tree.tree({
        data: ExampleData.exampleData,
        dragAndDrop: true,
        autoOpen: true
    });
});
