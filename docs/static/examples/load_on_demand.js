$.ajax = function (settings) {
    setTimeout(function () {
        if (settings.data && settings.data.node) {
            settings.success(ExampleData.getChildrenOfNode(settings.data.node));
        } else {
            settings.success(ExampleData.getFirstLevelData());
        }
    }, 1000);
};

var $tree = $("#tree1");

$tree.tree({
    saveState: true,
});
