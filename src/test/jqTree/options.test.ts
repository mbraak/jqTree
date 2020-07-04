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

describe("showEmptyFolder", () => {
    context("when children attribute is an empty array", () => {
        interface Vars {
            showEmptyFolder: boolean;
            $tree: JQuery<HTMLElement>;
        }

        const given = getGiven<Vars>();
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({
                data: [{ name: "parent1", children: [] }],
                showEmptyFolder: given.showEmptyFolder,
            });
        });

        context("with showEmptyFolder false", () => {
            given("showEmptyFolder", () => false);

            test("creates a child node", () => {
                expect(given.$tree).toHaveTreeStructure(["parent1"]);
            });
        });

        context("with showEmptyFolder true", () => {
            given("showEmptyFolder", () => true);

            test("creates a folder", () => {
                expect(given.$tree).toHaveTreeStructure([
                    { name: "parent1", children: [], open: false },
                ]);
            });
        });
    });
});
