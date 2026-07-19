function mockServer(handlers) {
    const worker = MockServiceWorker.setupWorker(...handlers);
    return worker.start({
        serviceWorker: { url: "/jqTree/examples/mockServiceWorker.js" },
    });
}
function mockServerWithDefaultData() {
    const handlers = [
        MockServiceWorker.http.get("/example_data/", () => {
            return MockServiceWorker.HttpResponse.json(ExampleData.exampleData);
        }),
    ];
    return mockServer(handlers);
}
