/*
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
*/
const handlers = [
    MockServiceWorker.http.get("/nodes/", ({ request }) => {
        const url = new URL(request.url);
        const parentId = url.searchParams.get("node");

        if (parentId) {
            return MockServiceWorker.HttpResponse.json(
                ExampleData.getChildrenOfNode(parentId),
            );
        } else {
            return MockServiceWorker.HttpResponse.json(
                ExampleData.getFirstLevelData(),
            );
        }
    }),
];

mockServer(handlers).then(() => {
    const $tree = $("#tree1");
    $tree.tree({
        saveState: true,
    });
});
