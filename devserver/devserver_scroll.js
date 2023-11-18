const $tree = $("#tree1");

$tree.tree({
    autoOpen: true,
    data: ExampleData.exampleData,
    dragAndDrop: true,
    useContextMenu: false,
});
