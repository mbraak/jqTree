import { waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import type { DataFilter } from "app/htmlTree/options";
import type { TriggerEvent } from "app/jqtreeMethodTypes";

import DataLoader from "app/dataLoader";
import RequestUrl from "app/requestUrl";

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

    const setupResponse = () => {
        server.use(
            http.get(
                "/test",
                () =>
                    new HttpResponse('{ "key1": "value1" }'),
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

        return { dataLoader, loadData, onLoadFailed, onLoading, treeElement, triggerEvent };
    }

    it("calls loadData with the parsed json data", async () => {
        setupResponse();

        const { dataLoader, loadData } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledExactlyOnceWith({ key1: "value1" }, null);
        });
    });

    it("calls onFinished", async () => {
        setupResponse();

        const onFinished = vi.fn();

        const { dataLoader, } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, onFinished);

        await waitFor(() => {
            expect(onFinished).toHaveBeenCalledExactlyOnceWith();
        });
    });

    it("calls onLoadFailed with a 404 error", async () => {
        setupErrorResponse(404);

        const { dataLoader, onLoadFailed } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(onLoadFailed).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ status: 404 })
            );
        });
    });

    it("calls onLoadFailed with a 500 error", async () => {
        setupErrorResponse(500);

        const { dataLoader, onLoadFailed } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(onLoadFailed).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ status: 500 })
            );
        });
    });

    it("triggers tree.loading_data events", async () => {
        setupResponse();

        const { dataLoader, treeElement, triggerEvent } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(triggerEvent).toHaveBeenNthCalledWith(
                1,
                "tree.loading_data",
                {
                    $el: jQuery(treeElement),
                    isLoading: true,
                    node: null
                }
            );
        });
        await waitFor(() => {
            expect(triggerEvent).toHaveBeenNthCalledWith(
                2,
                "tree.loading_data",
                {
                    $el: jQuery(treeElement),
                    isLoading: false,
                    node: null
                }
            );
        });
    });

    it("calls onLoading", async () => {
        setupResponse();

        const { dataLoader, onLoading, treeElement } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(onLoading).toHaveBeenNthCalledWith(
                1,
                true,
                null,
                jQuery(treeElement)
            );
        });

        await waitFor(() => {
            expect(onLoading).toHaveBeenNthCalledWith(
                2,
                false,
                null,
                jQuery(treeElement)
            );
        });
    });

    it("calls dataFilter", async () => {
        setupResponse();

        const dataFilter = () => ["changed"]

        const { dataLoader, loadData } = createDataLoader(dataFilter);
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            expect(loadData).toHaveBeenCalledExactlyOnceWith(["changed"], null);
        });
    });

    it("adds a parameter with a timestamp to force the response not to be cached", async () => {
        let requestUrl = "";

        server.use(
            http.get(
                "/test",
                ({ request }) => {
                    requestUrl = request.url;
                    return new HttpResponse('{ "key1": "value1" }')
                }
            ),
        );

        const { dataLoader } = createDataLoader();
        dataLoader.loadFromUrl(new RequestUrl("/test"), null, null);

        await waitFor(() => {
            const url = new URL(requestUrl);

            expect(url.pathname).toBe("/test");

            const cacheBuster = url.searchParams.get('_');

            expect(cacheBuster).toBeString();
            expect(cacheBuster).not.toBeEmpty();
        });
    });
});
