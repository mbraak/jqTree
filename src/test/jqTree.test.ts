import * as $ from "jquery";
import getGiven from "givens";
import "../tree.jquery";
import exampleData from "./support/exampleData";
import { titleSpan } from "./support/testUtil";

const context = describe;

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

    test("creates a tree", () => {
        expect(given.$tree).toHaveTreeStructure([
            {
                name: "node1",
                open: false,
                children: ["child1", "child2"],
            },
            { name: "node2", open: false, children: ["child3"] },
        ]);
    });
});

describe("options", () => {
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

describe("events", () => {
    context("when a node is clicked", () => {
        interface Vars {
            node1: INode;
            titleSpan: JQuery<HTMLElement>;
            $tree: JQuery<HTMLElement>;
        }

        const given = getGiven<Vars>();
        given("node1", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );
        given("titleSpan", () => titleSpan(given.node1.element));
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({
                data: exampleData,
            });
        });

        test("it fires tree.click", (done) => {
            given.$tree.on("tree.click", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });

            given.titleSpan.click();
        });

        test("it fires tree.select", (done) => {
            given.$tree.on("tree.select", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                expect(treeClickEvent.deselected_node).toBeNull();
                done();
            });

            given.titleSpan.click();
        });

        context("when the node was selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node1);
            });

            test("it fires tree.select with node is null", (done) => {
                given.$tree.on("tree.select", (e: unknown) => {
                    const treeClickEvent = e as ClickNodeEvent;

                    expect(treeClickEvent.node).toBeNull();
                    expect(treeClickEvent.previous_node).toBe(given.node1);
                    done();
                });

                given.titleSpan.click();
            });
        });
    });
});

describe("save state", () => {
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
            expect(JSON.parse(savedState)).toMatchObject({
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
});
