import * as $ from "jquery";
import getGiven from "givens";
import { screen } from "@testing-library/dom";
import * as mockjaxFactory from "jquery-mockjax";
import "../../tree.jquery";
import { togglerLink } from "../support/testUtil";

const mockjax = mockjaxFactory(jQuery, window);

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    mockjax.clear();
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

    function handleResponse(this: MockJaxSettings, settings: MockJaxSettings) {
        expect(settings).toMatchObject({
            data: { node: 1 },
            method: "GET",
            url: "/tree/",
        });
        this.responseText = [{ id: 2, name: "loaded-on-demand" }];
    }

    beforeEach(() => {
        if (given.savedState) {
            localStorage.setItem("tree", given.savedState);
        }

        mockjax({
            url: "*",
            response: handleResponse,
            logging: false,
        });

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
            togglerLink(given.node.element).click();

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
