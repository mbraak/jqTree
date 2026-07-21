import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import "app/tree.jquery";

import { getTogglerElement } from "../support/queries";

describe("load on demand", () => {
    const server = setupServer();

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        const element = document.createElement("div");
        element.id = "tree1";
        document.body.appendChild(element);
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
        (document.getElementById("tree1") as HTMLElement).remove(); // eslint-disable-line testing-library/no-node-access
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
            const node = $tree.tree("getNodeByNameMustExist", "parent-node");

            const toggler = getTogglerElement(node.element as HTMLElement);
            await userEvent.click(toggler);

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

            await screen.findByText("loaded-on-demand");
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

            expect(node.element).toBeSelectedTreeNode();
            expect(node.element).toBeFocusedTreeNode();

            const toggler = getTogglerElement(node.element as HTMLElement);
            await userEvent.click(toggler);

            await screen.findByText("loaded-on-demand");

            expect(node.element).toBeSelectedTreeNode();
        });

        it("doesn't select the node when the node is not selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: initialData,
                dataUrl: "/tree/",
                saveState: true,
            });
            const node = $tree.tree("getNodeByNameMustExist", "parent-node");

            expect(node.element).not.toBeSelectedTreeNode();

            const toggler = getTogglerElement(node.element as HTMLElement);
            await userEvent.click(toggler);

            await screen.findByText("loaded-on-demand");

            expect(node.element).not.toBeSelectedTreeNode();
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

            expect(node.element).toBeSelectedTreeNode();
            expect(node.element).not.toBeFocusedTreeNode();

            const toggler = getTogglerElement(node.element as HTMLElement);
            await userEvent.click(toggler);

            await screen.findByText("loaded-on-demand");

            expect(node.element).toBeSelectedTreeNode();
            expect(node.element).not.toBeFocusedTreeNode();
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

        await screen.findByText("loaded-on-demand");

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

    it("opens the node and loads its children on demand with a saved state with an opened node", async () => {
        localStorage.setItem("tree", '{"open_nodes":[1],"selected_node":[]}');

        const $tree = $("#tree1");
        $tree.tree({
            autoOpen: false,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });

        await screen.findByText("loaded-on-demand");

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
