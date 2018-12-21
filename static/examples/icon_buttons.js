$.mockjax({
    url: "*",
    response: function(options) {
        this.responseText = ExampleData.exampleData;
    },
    responseTime: 0
});

$(function() {
    $("#tree1").tree({
        closedIcon: $('<i class="fas fa-arrow-circle-right"></i>'),
        openedIcon: $('<i class="fas fa-arrow-circle-down"></i>')
    });
});
