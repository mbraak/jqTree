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
});

context("when a node has load_on_demand in the data", () => {
    interface Vars {
        node: INode;
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    const initialData = [
        {
            id: 1,
            name: "parent-node",
            load_on_demand: true,
        },
    ];

    beforeEach(() => {
        given.$tree.tree({
            data: initialData,
            dataUrl: "/tree/",
        });
    });

    test("creates a parent node without children", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "parent-node",
                open: false,
            }),
        ]);
    });

    context("when the node is opened", () => {
        function handleResponse(
            this: MockJaxSettings,
            settings: MockJaxSettings
        ) {
            expect(settings).toMatchObject({
                data: { node: 1 },
                method: "GET",
                url: "/tree/",
            });
            this.responseText = [{ id: 2, name: "loaded-on-demand" }];
        }

        beforeEach(() => {
            mockjax({
                url: "*",
                response: handleResponse,
                logging: false,
            });
        });

        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "parent-node")
        );

        test("loads the subtree", async () => {
            togglerLink(given.node.element).click();

            await screen.findByText("loaded-on-demand");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: ["loaded-on-demand"],
                    name: "parent-node",
                    open: true,
                }),
            ]);
        });
    });
});
