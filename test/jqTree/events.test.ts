import { waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import getGiven from "givens";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest"

import "app/tree.jquery";

import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

const context = describe;

describe("events", () => {
    beforeEach(() => {
        $("body").append('<div id="tree1"></div>');
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        $tree.remove();
    });

    describe("tree.click", () => {
        interface Vars {
            $tree: JQuery;
            node1: INode;
            titleSpan: HTMLElement;
        }

        const given = getGiven<Vars>();
        given("node1", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1"),
        );
        given("titleSpan", () => titleSpan(given.node1.element as HTMLElement));
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({ data: exampleData });
        });

        it("fires tree.click", async () => {
            const onClick = vi.fn();
            (given.$tree.get(0) as HTMLElement).addEventListener(
                "tree.click",
                onClick,
            );

            await userEvent.click(given.titleSpan);

            expect(onClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ type: "tree.click" }),
            );

            const event = onClick.mock.calls[0]?.[0] as CustomEvent;

            expect(event.detail).toMatchObject({ node: given.node1 });
        });
    });

    describe("tree.contextmenu", () => {
        interface Vars {
            $tree: JQuery;
            node1: INode;
            titleSpan: HTMLElement;
        }

        const given = getGiven<Vars>();
        given("node1", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1"),
        );
        given("titleSpan", () => titleSpan(given.node1.element as HTMLElement));
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({ data: exampleData });
        });

        it("fires tree.contextmenu", async () => {
            const onContextMenu = vi.fn();
            (given.$tree.get(0) as HTMLElement).addEventListener(
                "tree.contextmenu",
                onContextMenu,
            );

            await userEvent.pointer({
                keys: "[MouseRight]",
                target: given.titleSpan,
            });

            expect(onContextMenu).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ type: "tree.contextmenu" }),
            );

            const event = onContextMenu.mock.calls[0]?.[0] as CustomEvent;

            expect(event.detail).toMatchObject({ node: given.node1 });
        });
    });

    describe("tree.dblclick", () => {
        interface Vars {
            $tree: JQuery;
            node1: INode;
            titleSpan: HTMLElement;
        }

        const given = getGiven<Vars>();
        given("node1", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1"),
        );
        given("titleSpan", () => titleSpan(given.node1.element as HTMLElement));
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({ data: exampleData });
        });

        it("fires tree.dblclick", async () => {
            const onDoubleClick = vi.fn();
            (given.$tree.get(0) as HTMLElement).addEventListener(
                "tree.dblclick",
                onDoubleClick,
            );

            await userEvent.dblClick(given.titleSpan);

            expect(onDoubleClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ type: "tree.dblclick" }),
            );

            const event = onDoubleClick.mock.calls[0]?.[0] as CustomEvent;

            expect(event.detail).toMatchObject({ node: given.node1 });
        });
    });

    describe("tree.init", () => {
        interface Vars {
            $tree: JQuery;
        }
        const given = getGiven<Vars>();
        given("$tree", () => $("#tree1"));

        context("with json data", () => {
            it("is called", () => {
                const onInit = vi.fn();
                (given.$tree.get(0) as HTMLElement).addEventListener(
                    "tree.init",
                    onInit,
                );

                given.$tree.tree({
                    data: exampleData,
                });

                expect(onInit).toHaveBeenCalledExactlyOnceWith(expect.anything());
            });
        });

        context("with data loaded from an url", () => {
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
                const onInit = vi.fn();
                (given.$tree.get(0) as HTMLElement).addEventListener(
                    "tree.init",
                    onInit,
                );

                given.$tree.tree({ dataUrl: "/tree/" });

                await waitFor(() => {
                    expect(onInit).toHaveBeenCalledExactlyOnceWith(expect.anything());
                });
            });
        });
    });

    describe("tree.load_data", () => {
        interface Vars {
            $tree: JQuery;
        }
        const given = getGiven<Vars>();
        given("$tree", () => $("#tree1"));

        context("when the tree is initialized with data", () => {
            it("fires tree.load_data", () => {
                const onLoadData = vi.fn();
                (given.$tree.get(0) as HTMLElement).addEventListener(
                    "tree.load_data",
                    onLoadData,
                );

                given.$tree.tree({ data: exampleData });

                expect(onLoadData).toHaveBeenCalledExactlyOnceWith(
                    expect.objectContaining({ type: "tree.load_data" }),
                );

                const event = onLoadData.mock.calls[0]?.[0] as CustomEvent;

                expect(event.detail).toMatchObject({ tree_data: exampleData });
            });
        });
    });

    describe("tree.select", () => {
        interface Vars {
            $tree: JQuery;
            node1: INode;
            titleSpan: HTMLElement;
        }

        const given = getGiven<Vars>();
        given("node1", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1"),
        );
        given("titleSpan", () => titleSpan(given.node1.element as HTMLElement));
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({
                data: exampleData,
            });
        });

        it("fires tree.select", async () => {
            const onSelect = vi.fn();
            (given.$tree.get(0) as HTMLElement).addEventListener(
                "tree.select",
                onSelect,
            );

            await userEvent.click(given.titleSpan);

            expect(onSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ type: "tree.select" }),
            );

            const event = onSelect.mock.calls[0]?.[0] as CustomEvent;

            expect(event.detail).toMatchObject({
                deselected_node: null,
                node: given.node1,
            });
        });

        context("when the node was selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node1);
            });

            it("fires tree.select with node is null", async () => {
                const onSelect = vi.fn();
                (given.$tree.get(0) as HTMLElement).addEventListener(
                    "tree.select",
                    onSelect,
                );

                await userEvent.click(given.titleSpan);

                expect(onSelect).toHaveBeenCalledExactlyOnceWith(
                    expect.objectContaining({ type: "tree.select" }),
                );

                const event = onSelect.mock.calls[0]?.[0] as CustomEvent;

                expect(event.detail).toMatchObject({
                    node: null,
                    previous_node: given.node1,
                });
            });
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
            ($tree.get(0) as HTMLElement).addEventListener(
                "tree.loading_data",
                onLoading,
            );

            $tree.tree({ dataUrl: "/tree/" });

            await waitFor(() => {
                const event = onLoading.mock.calls[0]?.[0] as
                    | CustomEvent
                    | undefined;

                expect(event?.detail).toMatchObject({
                    isLoading: true,
                    node: null,
                });
            });

            await waitFor(() => {
                const event = onLoading.mock.lastCall?.[0] as
                    | CustomEvent
                    | undefined;

                expect(event?.detail).toMatchObject({
                    isLoading: false,
                    node: null,
                });
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
                expect(onLoading).toHaveBeenNthCalledWith(2, false, null, $tree);
            });
        });
    });
});
