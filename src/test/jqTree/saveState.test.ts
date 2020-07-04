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

let savedState = "";

const setState = (state: string): void => {
    savedState = state;
};

const getState = (): string => savedState;

interface Vars {
    initialState: string;
    node1: INode;
    $tree: JQuery<HTMLElement>;
}

const given = getGiven<Vars>();
given("initialState", () => "");
given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
given("$tree", () => $("#tree1"));

beforeEach(() => {
    given.$tree.tree({
        autoOpen: false,
        data: exampleData,
        onGetStateFromStorage: getState,
        onSetStateFromStorage: setState,
        saveState: true,
    });
});

context("with an open and a selected node", () => {
    beforeEach(() => {
        given.$tree.tree("selectNode", given.node1);
        given.$tree.tree("openNode", given.node1);
    });

    test("saves the state", () => {
        expect(JSON.parse(savedState)).toEqual({
            open_nodes: [123],
            selected_node: [123],
        });
    });
});

context("with a saved state", () => {
    given("initialState", () =>
        JSON.stringify({
            open_nodes: [123],
            selected_node: [123],
        })
    );

    it("restores the state", () => {
        expect(given.$tree).toHaveTreeStructure([
            {
                name: "node1",
                open: true,
                children: ["child1", "child2"],
            },
            { name: "node2", open: false, children: ["child3"] },
        ]);
        expect(given.$tree.tree("getSelectedNode")).toBe(given.node1);
    });
});
