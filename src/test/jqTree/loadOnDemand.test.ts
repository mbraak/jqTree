import * as $ from "jquery";
import getGiven from "givens";
import "../../tree.jquery";

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

context("when a node has load_on_demand in the data", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: [
                {
                    id: 1,
                    name: "loaded-on-demand",
                    load_on_demand: true,
                },
            ],
        });
    });

    test("displays as a parent node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "loaded-on-demand",
                open: false,
            }),
        ]);
    });
});
