$.mockjax({
    url: "*",
    response: function(options) {
        this.responseText = ExampleData.exampleData;
    },
    responseTime: 0
});

$(function() {
    $("#tree1").tree({
        buttonLeft: false,
        autoOpen: 0,
        slide: true
    });
});
