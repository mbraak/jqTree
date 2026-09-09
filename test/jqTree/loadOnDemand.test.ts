import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import "app/tree.jquery";

import { getTreeButton } from "../support/queries";

describe("load on demand", () => {
    const server = setupServer();

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    beforeEach(() => {
        server.use(
            http.get("/tree/", ({ request }) => {
                const url = new URL(request.url);
                const parentId = url.searchParams.get("node");

                if (parentId === "1") {
                    return HttpResponse.json([
                        { id: 2, name: "loaded-on-demand" },
                    ]);
                } else {
                    return new HttpResponse(null, { status: 400 });
                }
            }),
        );
    });

    afterEach(() => {
        server.resetHandlers();

        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    const initialData = [
        {
            id: 1,
            load_on_demand: true,
            name: "parent-node",
        },
    ];

    it("creates a parent node without children", () => {
        const $tree = $("#tree1");
        $tree.tree({
            autoOpen: false,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });

        expect($tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "parent-node",
                open: false,
            }),
        ]);
    });

    describe("when the node is opened", () => {
        it("loads the subtree", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: initialData,
                dataUrl: "/tree/",
                saveState: true,
            });
            const treeItem = screen.getByRole("treeitem", { name: "parent-node" });
            const button = getTreeButton(treeItem);
            await userEvent.click(button);

            await waitFor(() => {
                expect($tree).toHaveTreeStructure([
                    expect.objectContaining({
                        children: [
                            expect.objectContaining({
                                name: "loaded-on-demand",
                            }),
                        ],
                        name: "parent-node",
                        open: true,
                    }),
                ]);
            });

            await screen.findByRole("treeitem", { name: "loaded-on-demand" })
        });

        it("keeps the node selected when the node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: initialData,
                dataUrl: "/tree/",
                saveState: true,
            });
            const node = $tree.tree("getNodeByNameMustExist", "parent-node");
            $tree.tree("selectNode", node);

            const treeItem = screen.getByRole("treeitem", { name: "parent-node" });

            expect(treeItem).toBeAriaSelected();
            expect(treeItem).toHaveFocus();

            const button = getTreeButton(treeItem);
            await userEvent.click(button);

            await screen.findByRole("treeitem", { name: "loaded-on-demand" })

            expect(treeItem).toBeAriaSelected();
        });

        it("doesn't select the node when the node is not selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: initialData,
                dataUrl: "/tree/",
                saveState: true,
            });
            const treeItem = screen.getByRole("treeitem", { name: "parent-node" });

            expect(treeItem).not.toBeAriaSelected();

            const button = getTreeButton(treeItem);
            await userEvent.click(button);

            await screen.findByRole("treeitem", { name: "loaded-on-demand" })

            expect(treeItem).not.toBeAriaSelected();
        });

        it("keeps the node selected and not focused when the node is selected and doesn't have the focus", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: initialData,
                dataUrl: "/tree/",
                saveState: true,
            });
            const node = $tree.tree("getNodeByNameMustExist", "parent-node");
            $tree.tree("selectNode", node);
            (document.activeElement as HTMLElement).blur(); // eslint-disable-line testing-library/no-node-access

            const treeItem = screen.getByRole("treeitem", { name: "parent-node" });

            expect(treeItem).toBeAriaSelected();
            expect(treeItem).not.toHaveFocus();

            const button = getTreeButton(treeItem);
            await userEvent.click(button);

            await screen.findByRole("treeitem", { name: "loaded-on-demand" })

            expect(treeItem).toBeAriaSelected();
            expect(treeItem).not.toHaveFocus();
        });
    });

    it("loads the node on demand with autoOpen true", async () => {
        const $tree = $("#tree1");
        $tree.tree({
            autoOpen: true,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });

        await screen.findByRole("treeitem", { name: "loaded-on-demand" })

        await waitFor(() => {
            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "loaded-on-demand",
                        }),
                    ],
                    name: "parent-node",
                    open: true,
                }),
            ]);
        });
    });

    it("opens the node and loads its children on demand with a saved state with an opened node", async () => {
        localStorage.setItem("tree", '{"open_nodes":[1],"selected_node":[]}');

        const $tree = $("#tree1");
        $tree.tree({
            autoOpen: false,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });

        await screen.findByRole("treeitem", { name: "loaded-on-demand" })

        await waitFor(() => {
            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "loaded-on-demand",
                        }),
                    ],
                    name: "parent-node",
                    open: true,
                }),
            ]);
        });
    });
});
