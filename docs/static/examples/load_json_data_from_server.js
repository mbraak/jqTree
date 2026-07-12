const handlers = [
    MockServiceWorker.http.get("/jqTree/static/example_data/", () => {
        return MockServiceWorker.HttpResponse.json(ExampleData.exampleData);
    }),
];

async function setup() {
    const worker = MockServiceWorker.setupWorker(...handlers);
    await worker.start({
        serviceWorker: {
            url: "/jqTree/examples/mockServiceWorker.js",
        },
    });

    $("#tree1").tree();
}

setup();
