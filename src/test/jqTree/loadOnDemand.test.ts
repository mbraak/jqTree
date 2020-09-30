import * as $ from "jquery";
import getGiven from "givens";
import { screen } from "@testing-library/dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import "../../tree.jquery";
import { togglerLink } from "../support/testUtil";

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    localStorage.clear();
});

context("when a node has load_on_demand in the data", () => {
    interface Vars {
        autoOpen: boolean;
        node: INode;
        $tree: JQuery<HTMLElement>;
        savedState?: string;
    }
    const given = getGiven<Vars>();
    given("autoOpen", () => false);
    given("$tree", () => $("#tree1"));

    const initialData = [
        {
            id: 1,
            name: "parent-node",
            load_on_demand: true,
        },
    ];

    let server: ReturnType<typeof setupServer> | null = null;

    beforeAll(() => {
        server = setupServer(
            rest.get("/tree/", (request, response, ctx) => {
                const parentId = request.url.searchParams.get("node");

                if (parentId === "1") {
                    return response(
                        ctx.status(200),
                        ctx.json([{ id: 2, name: "loaded-on-demand" }])
                    );
                } else {
                    return response(ctx.status(400));
                }
            })
        );

        server.listen();
    });

    afterAll(() => {
        server?.close();
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
            given.$tree.tree("getNodeByNameMustExist", "parent-node")
        );

        it("loads the subtree", async () => {
            togglerLink(given.node.element).trigger("click");

            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                }),
            ]);
        });
    });

    context("with autoOpen is true", () => {
        given("autoOpen", () => true);

        it("loads the node on demand", async () => {
            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
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
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                }),
            ]);
        });
    });
});
