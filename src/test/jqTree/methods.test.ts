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

describe("toggle", () => {
    interface Vars {
        autoOpen: boolean;
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("autoOpen", () => false);
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: exampleData,
        });
        given.$tree.tree("toggle", given.node1, false);
    });

    context("when the node is closed", () => {
        test("opens the node", () => {
            expect(given.node1.element).toBeOpen();
        });
    });

    context("when the node is open", () => {
        given("autoOpen", () => true);

        test("closes the node", () => {
            expect(given.node1.element).toBeClosed();
        });
    });
});
