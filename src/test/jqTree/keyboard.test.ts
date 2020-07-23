import * as $ from "jquery";
import getGiven from "givens";
import "../../tree.jquery";
import exampleData from "../support/exampleData";

//const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

describe("keyboard support", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const KEY_DOWN = 40;

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
        given.$tree.tree("selectNode", given.node1);
    });

    test("changes selection", () => {
        given.$tree.trigger($.Event("keydown", { which: KEY_DOWN }));

        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "node1", selected: false }),
            expect.objectContaining({ name: "node2", selected: true }),
        ]);
    });
});
