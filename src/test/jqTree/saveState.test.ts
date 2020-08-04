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
    localStorage.clear();
});

describe("local storage", () => {
    interface Vars {
        node1: INode;
        saveState: boolean | string;
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    context("when a node is open and selected", () => {
        beforeEach(() => {
            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: given.saveState,
            });

            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("openNode", given.node1);
        });

        context("when saveState is true", () => {
            given("saveState", () => true);

            it("saves the state to local storage", () => {
                expect(localStorage.getItem("tree")).toEqual(
                    '{"open_nodes":[123],"selected_node":[123]}'
                );
            });
        });

        context("when saveState is a string", () => {
            given("saveState", () => "my-state");

            it("uses the string as a key", () => {
                expect(localStorage.getItem("my-state")).toEqual(
                    '{"open_nodes":[123],"selected_node":[123]}'
                );
            });
        });

        context("when saveState is false", () => {
            given("saveState", () => false);

            it("doesn't save to local storage", () => {
                expect(localStorage.getItem("tree")).toBeNull();
            });
        });
    });

    context("when there is a state in the local storage", () => {
        given("saveState", () => true);

        beforeEach(() => {
            localStorage.setItem(
                "tree",
                '{"open_nodes":[123],"selected_node":[123]}'
            );

            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: given.saveState,
            });
        });

        it("restores the state", () => {
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
