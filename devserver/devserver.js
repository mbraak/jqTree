const $tree = $("#tree1");

$tree.tree({
    animationSpeed: 0,
    autoOpen: 0,
    data: ExampleData.exampleData,
    dragAndDrop: true,
});
$tree.tree("setMouseDelay", 0);
