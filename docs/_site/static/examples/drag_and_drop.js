$.mockjax({
    url: "*",
    response: function(options) {
        this.responseText = ExampleData.exampleData;
    },
    responseTime: 0
});

var $tree = $("#tree1");
$tree.tree({
    dragAndDrop: true,
    autoOpen: 0
});
