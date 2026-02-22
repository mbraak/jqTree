$.ajax = function (settings) {
    settings.success(ExampleData.exampleData);
};

var $tree = $("#tree1");
$tree.tree({
    dragAndDrop: true,
    autoOpen: 0,
});
