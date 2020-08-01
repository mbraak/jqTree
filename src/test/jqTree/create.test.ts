import * as $ from "jquery";
import getGiven from "givens";
import "../../tree.jquery";
import exampleData from "../support/exampleData";

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

describe("create with data", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    it("creates a tree", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                open: false,
                selected: false,
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ],
            }),
            expect.objectContaining({
                name: "node2",
                open: false,
                selected: false,
                children: [
                    expect.objectContaining({
                        name: "node3",
                        open: false,
                        children: [expect.objectContaining({ name: "child3" })],
                    }),
                ],
            }),
        ]);
    });
});
