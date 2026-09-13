import type { UserEvent } from "@testing-library/user-event";

import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest"

import "app/tree.jquery";

import exampleData from "../support/exampleData";
import mockLayout from "../support/mockLayout";

interface MoveEvent {
    move_info: { do_move: () => void };
}

describe("events", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
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
                expect.objectContaining({
                    click_event: expect.any(MouseEvent), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                    node: node1,
                }),
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
                expect.objectContaining({
                    click_event: expect.any(MouseEvent), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                    node: node1,
                }),
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
                expect.objectContaining({
                    click_event: expect.any(MouseEvent), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                    node: node1,
                }),
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
            expect(onLoadData.mock.calls[0]?.[0]).not.toHaveProperty(
                "parent_node",
            );
        });

        it("fires tree.load_data with the parent node when data is loaded into a parent", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            const onLoadData = vi.fn();
            $tree.on("tree.load_data", onLoadData);

            const childData = [{ id: 200, name: "child3" }];
            $tree.tree("loadData", childData, node1);

            expect(onLoadData).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    parent_node: node1,
                    tree_data: childData,
                }),
            );
        });
    });

    describe("tree.move", () => {
        // A position in the horizontal middle of the tree. Keep the mouse away
        // from the edges of the window, because the tree scrolls when it comes
        // near them.
        const x = 50;

        const coordinates = (y: number) => ({
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
        });

        let user: UserEvent;

        const createTree = () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: true,
                startDndDelay: 0,
            });

            mockLayout($tree.get(0) as HTMLElement);

            return $tree;
        };

        // Drag a node and drop it at a vertical position in the tree.
        const dragAndDropNode = async (
            $tree: JQuery,
            name: string,
            y: number,
        ) => {
            const treeElement = $tree.get(0) as HTMLElement;

            await user.pointer([
                {
                    coords: coordinates(10),
                    keys: "[MouseLeft>]",
                    target: screen.getByRole("treeitem", { name }),
                },
                { coords: coordinates(y), target: treeElement },
                { keys: "[/MouseLeft]", target: treeElement },
            ]);
        };

        beforeEach(() => {
            // The user must be set up once, so that the mouse stays pressed
            // between the pointer actions of a drag.
            user = userEvent.setup();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("fires tree.move", async () => {
            const $tree = createTree();

            const onMove = vi.fn();
            $tree.on("tree.move", onMove);

            // Drop node1 on the first half of node2; this moves it inside node2.
            await dragAndDropNode($tree, "node1", 25);

            expect(onMove).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    move_info: {
                        do_move: expect.any(Function) as unknown,
                        moved_node: $tree.tree(
                            "getNodeByNameMustExist",
                            "node1",
                        ),
                        original_event: expect.any(MouseEvent) as unknown,
                        position: "inside",
                        previous_parent: $tree.tree("getTree"),
                        target_node: $tree.tree(
                            "getNodeByNameMustExist",
                            "node2",
                        ),
                    },
                }),
            );
        });

        it("doesn't move the node when the event is cancelled", async () => {
            const $tree = createTree();

            $tree.on("tree.move", (e) => {
                e.preventDefault();
            });

            await dragAndDropNode($tree, "node1", 25);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("moves the node when do_move is called after the event", async () => {
            const $tree = createTree();

            const doMoveFunctions: (() => void)[] = [];

            $tree.on("tree.move", (e) => {
                e.preventDefault();
                doMoveFunctions.push(
                    (e as unknown as MoveEvent).move_info.do_move,
                );
            });

            await dragAndDropNode($tree, "node1", 25);

            expect(doMoveFunctions).toHaveLength(1);

            doMoveFunctions[0]?.();

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node3" }),
                    ],
                    name: "node2",
                }),
            ]);
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
                expect(onLoading).toHaveBeenNthCalledWith(1, true, undefined, $tree);
            });
            await waitFor(() => {
                expect(onLoading).toHaveBeenNthCalledWith(2, false, undefined, $tree);
            });
        });
    });
});
