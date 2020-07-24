import * as $ from "jquery";
import getGiven from "givens";
import "../../tree.jquery";
import exampleData from "../support/exampleData";

const context = describe;

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
        pressedKey: number;
        initialSelectedNode: INode;
        $tree: JQuery<HTMLElement>;
    }

    const KEY_DOWN = 40;
    const KEY_RIGHT = 39;
    const KEY_UP = 38;

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
        given.$tree.tree("selectNode", given.initialSelectedNode);
        given.$tree.trigger($.Event("keydown", { which: given.pressedKey }));
    });

    context("with key down", () => {
        given("initialSelectedNode", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );
        given("pressedKey", () => KEY_DOWN);

        test("selects the next node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", selected: false }),
                expect.objectContaining({ name: "node2", selected: true }),
            ]);
        });
    });

    context("with key up", () => {
        given("initialSelectedNode", () =>
            given.$tree.tree("getNodeByNameMustExist", "node2")
        );
        given("pressedKey", () => KEY_UP);

        test("selects the next node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", selected: true }),
                expect.objectContaining({ name: "node2", selected: false }),
            ]);
        });
    });

    context("with key right", () => {
        given("initialSelectedNode", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );
        given("pressedKey", () => KEY_RIGHT);

        test("opens the node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                    selected: true,
                }),
                expect.objectContaining({
                    name: "node2",
                    open: false,
                    selected: false,
                }),
            ]);
        });
    });
});
