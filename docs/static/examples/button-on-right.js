$.ajax = function (settings) {
    settings.success(ExampleData.exampleData);
};

$("#tree1").tree({
    buttonLeft: false,
    autoOpen: 0,
    slide: true,
});
