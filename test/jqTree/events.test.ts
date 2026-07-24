import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest"

import "app/tree.jquery";

import exampleData from "../support/exampleData";

describe("events", () => {
    beforeEach(() => {
        const element = document.createElement("div");
        element.id = "tree1";
        document.body.appendChild(element);
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        (document.getElementById("tree1") as HTMLElement).remove(); // eslint-disable-line testing-library/no-node-access
    });

    describe("tree.click", () => {
        it("fires tree.click", async () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const onClick = vi.fn();
            $tree.on("tree.click", onClick);

            await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(onClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ node: node1 }),
            );
        });
    });

    describe("tree.contextmenu", () => {
        it("fires tree.contextmenu", async () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const onContextMenu = vi.fn();
            $tree.on("tree.contextmenu", onContextMenu);

            await userEvent.pointer({
                keys: "[MouseRight]",
                target: screen.getByRole("treeitem", { name: "node1" }),
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(onContextMenu).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ node: node1 }),
            );
        });
    });

    describe("tree.dblclick", () => {
        it("fires tree.dblclick", async () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const onDoubleClick = vi.fn();
            $tree.on("tree.dblclick", onDoubleClick);

            await userEvent.dblClick(screen.getByRole("treeitem", { name: "node1" }));

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(onDoubleClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ node: node1 }),
            );
        });
    });

    describe("tree.init", () => {
        it("is called with json data", () => {
            const $tree = $("#tree1");
            const onInit = vi.fn();
            $tree.on("tree.init", onInit);

            $tree.tree({
                data: exampleData,
            });

            expect(onInit).toHaveBeenCalledExactlyOnceWith(expect.anything());
        });

        describe("with data loaded from an url", () => {
            const server = setupServer(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            beforeEach(() => {
                server.listen();
            });

            afterAll(() => {
                server.close();
            });

            it("is called", async () => {
                const $tree = $("#tree1");
                const onInit = vi.fn();
                $tree.on("tree.init", onInit);

                $tree.tree({ dataUrl: "/tree/" });

                await waitFor(() => {
                    expect(onInit).toHaveBeenCalledExactlyOnceWith(
                        expect.anything(),
                    );
                });
            });
        });
    });

    describe("tree.load_data", () => {
        it("fires tree.load_data when the tree is initialized with data", () => {
            const $tree = $("#tree1");
            const onLoadData = vi.fn();
            $tree.on("tree.load_data", onLoadData);

            $tree.tree({ data: exampleData });

            expect(onLoadData).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ tree_data: exampleData }),
            );
        });
    });

    describe("tree.select", () => {
        it("fires tree.select", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });

            const onSelect = vi.fn();
            $tree.on("tree.select", onSelect);

            await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(onSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    deselected_node: null,
                    node: node1,
                }),
            );
        });

        it("fires tree.select with node is null when the node was selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            const onSelect = vi.fn();
            $tree.on("tree.select", onSelect);

            await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

            expect(onSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    node: null,
                    previous_node: node1,
                }),
            );
        });
    });

    describe("tree.loading_data", () => {
        const server = setupServer(
            http.get("/tree/", () => HttpResponse.json(exampleData)),
        );

        beforeEach(() => {
            server.listen();
        });

        afterAll(() => {
            server.close();
        });

        it("fires tree.loading_data when the data is loading from an url", async () => {
            const $tree = $("#tree1");

            const onLoading = vi.fn();
            $tree.on("tree.loading_data", onLoading);

            $tree.tree({ dataUrl: "/tree/" });

            await waitFor(() => {
                expect(onLoading).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        $el: $tree,
                        isLoading: true,
                        node: null,
                    })
                );
            });

            await waitFor(() => {
                expect(onLoading).toHaveBeenNthCalledWith(
                    2,
                    expect.objectContaining({
                        $el: $tree,
                        isLoading: false,
                        node: null,
                    })
                );
            });
        });
    });

    describe("onLoading", () => {
        const server = setupServer(
            http.get("/tree/", () => HttpResponse.json(exampleData)),
        );

        beforeEach(() => {
            server.listen();
        });

        afterAll(() => {
            server.close();
        });

        it("calls onLoading", async () => {
            const $tree = $("#tree1");
            const onLoading = vi.fn();

            $tree.tree({ dataUrl: "/tree/", onLoading });

            await waitFor(() => {
                expect(onLoading).toHaveBeenNthCalledWith(1, true, null, $tree);
            });
            await waitFor(() => {
                expect(onLoading).toHaveBeenNthCalledWith(2, false, null, $tree);
            });
        });
    });
});
