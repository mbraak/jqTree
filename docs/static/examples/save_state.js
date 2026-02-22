$.ajax = function (settings) {
    settings.success(ExampleData.exampleData);
};

$("#tree1").tree({
    saveState: true,
});
