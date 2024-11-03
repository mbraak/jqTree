import { waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import DataLoader from "../dataLoader";

const server = setupServer();

afterAll(() => {
    server.close();
});

afterEach(() => {
    server.resetHandlers();
});

beforeAll(() => {
    server.listen();
});

describe("loadFromUrl", () => {
    it("does nothing when urlInfo is empty", () => {
        const loadData = () => null;
        const treeElement = document.createElement("div");
        const triggerEvent = jest.fn();

        const dataLoader = new DataLoader({
            loadData,
            treeElement,
            triggerEvent,
        });

        dataLoader.loadFromUrl(null, null, null);
        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("parses json when the response is a string", async () => {
        server.use(
            http.get(
                "/test",
                () =>
                    new HttpResponse('{ "key1": "value1" }', {
                        headers: {
                            "Content-Type": "text/plain",
                        },
                    }),
                {},
            ),
        );

        const loadData = jest.fn();
        const treeElement = document.createElement("div");
        const triggerEvent = jest.fn();

        const dataLoader = new DataLoader({
            loadData,
            treeElement,
            triggerEvent,
        });
        dataLoader.loadFromUrl({ dataType: "text", url: "/test" }, null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledWith({ key1: "value1" }, null);
        });
    });
});
