import { screen } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import getGiven from "givens";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import "../../tree.jquery";
import { togglerLink } from "../support/testUtil";

const context = describe;

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

context("when a node has load_on_demand in the data", () => {
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
            await userEvent.click(toggler.get(0) as HTMLElement);

            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                    name: "parent-node",
                    open: true,
                }),
            ]);
        });

        context("when the node is selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
            });

            it("keeps the node selected", async () => {
                expect(given.node.element).toBeSelected();
                expect(given.node.element).toBeFocused();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler.get(0) as HTMLElement);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).toBeSelected();
            });
        });

        context("when the node is not selected", () => {
            it("doesn't select the node", async () => {
                expect(given.node.element).not.toBeSelected();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler.get(0) as HTMLElement);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).not.toBeSelected();
            });
        });

        context("when the node is selected and doesn't have the focus", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
                (document.activeElement as HTMLElement).blur(); // eslint-disable-line testing-library/no-node-access
            });

            it("keeps the node selected and not focused", async () => {
                expect(given.node.element).toBeSelected();
                expect(given.node.element).not.toBeFocused();

                const toggler = togglerLink(given.node.element as HTMLElement);
                await userEvent.click(toggler.get(0) as HTMLElement);

                await screen.findByText("loaded-on-demand");

                expect(given.node.element).toBeSelected();
                expect(given.node.element).not.toBeFocused();
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
                        expect.objectContaining({ name: "loaded-on-demand" }),
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
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                    name: "parent-node",
                    open: true,
                }),
            ]);
        });
    });
});
