import { userEvent } from "@testing-library/user-event";
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
        $tree: JQuery;
        autoOpen: boolean;
        initialSelectedNode: INode | null;
        pressedKey: string;
    }

    const given = getGiven<Vars>();
    given("autoOpen", () => false);
    given("initialSelectedNode", () => null);
    given("$tree", () => $("#tree1"));

    beforeEach(async () => {
        given.$tree.tree({
            animationSpeed: 0,
            autoOpen: given.autoOpen,
            data: exampleData,
        });

        if (given.initialSelectedNode) {
            given.$tree.tree("selectNode", given.initialSelectedNode);
        }

        await userEvent.keyboard(`{${given.pressedKey}}`);
    });

    context("with key down", () => {
        given("pressedKey", () => "ArrowDown");

        context("when a node is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node1"),
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
                given.$tree.tree("getNodeByNameMustExist", "node2"),
            );

            it("keeps the node selected", () => {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "node2",
                });
            });
        });
    });

    context("with key up", () => {
        given("pressedKey", () => "ArrowUp");

        context("when a node is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node2"),
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
        given("pressedKey", () => "ArrowRight");

        context("when a closed folder is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node1"),
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
                given.$tree.tree("getNodeByNameMustExist", "node1"),
            );

            it("selects the first child", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
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
                        name: "node1",
                        open: true,
                        selected: false,
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
                given.$tree.tree("getNodeByNameMustExist", "child1"),
            );

            it("does nothing", () => {
                expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                    name: "child1",
                });
            });
        });
    });
    context("with key left", () => {
        given("pressedKey", () => "ArrowLeft");

        context("when a closed folder is selected", () => {
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node3"),
            );

            it("selects the previous node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        selected: false,
                    }),
                    expect.objectContaining({
                        children: [
                            expect.objectContaining({
                                name: "node3",
                                open: false,
                                selected: false,
                            }),
                        ],
                        name: "node2",
                        selected: true,
                    }),
                ]);
            });
        });

        context("when an open folder is selected", () => {
            given("autoOpen", () => true);
            given("initialSelectedNode", () =>
                given.$tree.tree("getNodeByNameMustExist", "node2"),
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
        given("pressedKey", () => "PageUp");

        given("initialSelectedNode", () =>
            given.$tree.tree("getNodeByNameMustExist", "child1"),
        );

        it("does nothing", () => {
            expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                name: "child1",
            });
        });
    });
});
