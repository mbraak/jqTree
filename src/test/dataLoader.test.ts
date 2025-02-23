import { jest } from "@jest/globals";
import { waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import DataLoader from "../dataLoader";
import { TriggerEvent } from "../jqtreeMethodTypes";

describe("loadFromUrl", () => {
    const server = setupServer();

    beforeAll(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    });

    it("does nothing when urlInfo is empty", () => {
        const loadData = () => null;
        const treeElement = document.createElement("div");
        const triggerEvent = jest.fn<TriggerEvent>();

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
        const triggerEvent = jest.fn<TriggerEvent>();

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
