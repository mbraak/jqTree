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
        autoOpen: boolean;
        initialSelectedNode: INode | null;
        pressedKey: number;
        $tree: JQuery<HTMLElement>;
    }

    const KEY_DOWN = 40;
    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;
    const KEY_UP = 38;
    const KEY_PAGE_UP = 33;

    const given = getGiven<Vars>();
    given("autoOpen", () => false);
    given("initialSelectedNode", () => null);
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            animationSpeed: 0,
            autoOpen: given.autoOpen,
            data: exampleData,
        });

        if (given.initialSelectedNode) {
            given.$tree.tree("selectNode", given.initialSelectedNode);
        }

        given.$tree.trigger($.Event("keydown", { which: given.pressedKey }));
    });

    context("with key down", () => {
        given("pressedKey", () => KEY_DOWN);

        context("when a node is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node1")
            );

            it("selects the next node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "node1", selected: false }),
                    expect.objectContaining({ name: "node2", selected: true }),
                ]);
            });
        });

        context("when no node is selected", () => {
            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });

        context("when the last node is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node2")
            );

            it("keeps the node selected", () => {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "node2",
                });
            });
        });
    });

    context("with key up", () => {
        given("pressedKey", () => KEY_UP);

        context("when a node is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node2")
            );

            it("selects the next node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "node1", selected: true }),
                    expect.objectContaining({ name: "node2", selected: false }),
                ]);
            });
        });

        context("when no node is selected", () => {
            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });

    context("with key right", () => {
        given("pressedKey", () => KEY_RIGHT);

        context("when a closed folder is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node1")
            );

            it("opens the folder", () => {
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

        context("when an open folder is selected", () => {
            given("autoOpen", () => true);
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node1")
            );

            it("selects the first child", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        open: true,
                        selected: false,
                        children: [
                            expect.objectContaining({
                                name: "child1",
                                selected: true,
                            }),
                            expect.objectContaining({
                                name: "child2",
                                selected: false,
                            }),
                        ],
                    }),
                    expect.objectContaining({
                        name: "node2",
                        selected: false,
                    }),
                ]);
            });
        });

        context("when no node is selected", () => {
            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });

        context("when a child is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "child1")
            );

            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "child1",
                });
            });
        });
    });
    context("with key left", () => {
        given("pressedKey", () => KEY_LEFT);

        context("when a closed folder is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node3")
            );

            it("selects the previous node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        selected: false,
                    }),
                    expect.objectContaining({
                        name: "node2",
                        selected: true,
                        children: [
                            expect.objectContaining({
                                name: "node3",
                                open: false,
                                selected: false,
                            }),
                        ],
                    }),
                ]);
            });
        });

        context("when an open folder is selected", () => {
            given("autoOpen", () => true);
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node2")
            );

            it("closes the folder", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        open: true,
                        selected: false,
                    }),
                    expect.objectContaining({
                        name: "node2",
                        open: false,
                        selected: true,
                    }),
                ]);
            });
        });

        context("when no node is selected", () => {
            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });

    context("with page up key", () => {
        given("pressedKey", () => KEY_PAGE_UP);

        given("initialSelectedNode", () =>
            given.$tree.tree("getNodeByNameMustExist", "child1")
        );

        it("does nothing", () => {
            expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                name: "child1",
            });
        });
    });
});
