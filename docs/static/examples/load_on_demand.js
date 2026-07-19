const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

const handlers = [
    MockServiceWorker.http.get("/nodes/", async ({ request }) => {
        {
            await sleep(1000);

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
        }
    }),
];

mockServer(handlers).then(() => {
    const $tree = $("#tree1");
    $tree.tree({
        saveState: true,
    });
});
