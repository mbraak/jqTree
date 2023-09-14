$.mockjax({
    url: "*",
    response: function(options) {
        this.responseText = ExampleData.exampleData;
    },
    responseTime: 0
});

$("#tree1").tree({
    saveState: true
});
