import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import getGiven from "givens";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import "app/tree.jquery";

import { togglerLink } from "../support/testUtil";

const context = describe;

describe("load on demand", () => {
    const server = setupServer();

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        $("body").append('<div id="tree1"></div>');
    });

    afterEach(() => {
        server.resetHandlers();

        const $tree = $("#tree1");
        $tree.tree("destroy");
        $tree.remove();
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    interface Vars {
        $tree: JQuery;
        autoOpen: boolean;
        node: INode;
        savedState?: string;
    }
    const given = getGiven<Vars>();
    given("autoOpen", () => false);
    given("$tree", () => $("#tree1"));

    const initialData = [
        {
            id: 1,
            load_on_demand: true,
            name: "parent-node",
        },
    ];

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

    beforeEach(() => {
        if (given.savedState) {
            localStorage.setItem("tree", given.savedState);
        }

        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });
    });

    it("creates a parent node without children", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "parent-node",
                open: false,
            }),
        ]);
    });

    context("when the node is opened", () => {
        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "parent-node"),
        );

        it("loads the subtree", async () => {
            const toggler = togglerLink(given.node.element as HTMLElement);
            await userEvent.click(toggler);

            await screen.findByText("loaded-on-demand");

            await waitFor(() => {
                expect(given.$tree).toHaveTreeStructure([
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

        context("when the node is selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
            });

            it("keeps the node selected", async () => {
                expect(given.node.element).toBeSelectedTreeNode();
                expect(given.node.element).toBeFocusedTreeNode();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).toBeSelectedTreeNode();
            });
        });

        context("when the node is not selected", () => {
            it("doesn't select the node", async () => {
                expect(given.node.element).not.toBeSelectedTreeNode();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).not.toBeSelectedTreeNode();
            });
        });

        context("when the node is selected and doesn't have the focus", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
                (document.activeElement as HTMLElement).blur(); // eslint-disable-line testing-library/no-node-access
            });

            it("keeps the node selected and not focused", async () => {
                expect(given.node.element).toBeSelectedTreeNode();
                expect(given.node.element).not.toBeFocusedTreeNode();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).toBeSelectedTreeNode();
                expect(given.node.element).not.toBeFocusedTreeNode();
            });
        });
    });

    context("with autoOpen is true", () => {
        given("autoOpen", () => true);

        it("loads the node on demand", async () => {
            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
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

    context("with a saved state with an opened node", () => {
        given("savedState", () => '{"open_nodes":[1],"selected_node":[]}');

        it("opens the node and loads its children on demand", async () => {
            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
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
