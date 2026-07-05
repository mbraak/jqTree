import { waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import type { TriggerEvent } from "app/jqtreeMethodTypes";
import type { DataFilter } from "app/jqtreeOptions";

import DataLoader from "app/dataLoader";

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

    const setupResponse = (contentType = "application/json") => {
        server.use(
            http.get(
                "/test",
                () =>
                    new HttpResponse('{ "key1": "value1" }', {
                        headers: {
                            "Content-Type": contentType,
                        },
                    }),
                {},
            ),
        );
    }

    const setupErrorResponse = (status: number) => {
        server.use(
            http.get(
                "/test",
                () =>
                    new HttpResponse('', {
                        status,
                    }),
                {},
            ),
        );
    }

    const createDataLoader = (dataFilter?: DataFilter) => {
        const loadData = vi.fn();
        const onLoadFailed = vi.fn();
        const onLoading = vi.fn();
        const treeElement = document.createElement("div");
        const triggerEvent = vi.fn<TriggerEvent>();

        const dataLoader = new DataLoader({
            dataFilter,
            loadData,
            onLoadFailed,
            onLoading,
            treeElement,
            triggerEvent,
        });

        return { dataLoader, loadData, onLoadFailed, onLoading, triggerEvent };
    }

    it("does nothing when urlInfo is empty", () => {
        const { dataLoader, triggerEvent } = createDataLoader();

        dataLoader.loadFromUrl(null, null, null);

        expect(triggerEvent).not.toHaveBeenCalled();
    });

    it("parses json when the response has content type text", async () => {
        setupResponse("text/plain");

        const { dataLoader, loadData } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledExactlyOnceWith({ key1: "value1" }, null);
        });
    });

    it("parses json when the response has content type json", async () => {
        setupResponse();

        const { dataLoader, loadData } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledExactlyOnceWith({ key1: "value1" }, null);
        });
    });

    it("calls onFinished", async () => {
        setupResponse();

        const onFinished = vi.fn();

        const { dataLoader, } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, onFinished);

        await waitFor(() => {
            expect(onFinished).toHaveBeenCalledExactlyOnceWith();
        });
    });

    it("calls onLoadFailed with a 404 error", async () => {
        setupErrorResponse(404);

        const { dataLoader, onLoadFailed } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(onLoadFailed).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ status: 404 })
            );
        });
    });

    it("calls onLoadFailed with a 500 error", async () => {
        setupErrorResponse(500);

        const { dataLoader, onLoadFailed } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(onLoadFailed).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ status: 500 })
            );
        });
    });

    it("triggers tree.loading_data events", async () => {
        setupResponse();

        const { dataLoader, triggerEvent } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(triggerEvent).toHaveBeenNthCalledWith(
                1,
                "tree.loading_data",
                expect.objectContaining({
                    isLoading: true,
                    node: null
                })
            );
        });
        await waitFor(() => {
            expect(triggerEvent).toHaveBeenNthCalledWith(
                2,
                "tree.loading_data",
                expect.objectContaining({
                    isLoading: false,
                    node: null
                })
            );
        });
    });

    it("calls onLoading", async () => {
        setupResponse();

        const { dataLoader, onLoading } = createDataLoader();
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(onLoading).toHaveBeenNthCalledWith(
                1,
                true,
                null,
                expect.objectContaining({})
            );
        });

        await waitFor(() => {
            expect(onLoading).toHaveBeenNthCalledWith(
                2,
                false,
                null,
                expect.objectContaining({})
            );
        });
    });

    it("calls dataFilter", async () => {
        setupResponse();

        const dataFilter = () => ["changed"]

        const { dataLoader, loadData } = createDataLoader(dataFilter);
        dataLoader.loadFromUrl("/test", null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledExactlyOnceWith(["changed"], null);
        });
    });
});
