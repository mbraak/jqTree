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

describe("closeNode", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });
        given.$tree.tree("closeNode", given.node1, false);
    });

    test("closes the node", () => {
        expect(given.node1.element).toBeClosed();
    });
});

describe("getNodeById", () => {
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

    test("returns the node", () => {
        expect(given.$tree.tree("getNodeById", 127)).toMatchObject({
            name: "child3",
        });
    });

    context("with a string parameter", () => {
        test("returns the node", () => {
            expect(given.$tree.tree("getNodeById", "127")).toMatchObject({
                name: "child3",
            });
        });
    });

    context("when the node doesn't exist", () => {
        test("returns undefined", () => {
            expect(given.$tree.tree("getNodeById", 99999)).toBeNull();
        });
    });
});

describe("getSelectedNode", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    context("when no node is selected", () => {
        test("returns false", () => {
            expect(given.$tree.tree("getSelectedNode")).toBe(false);
        });
    });

    context("when a node is selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        test("returns the selected node", () => {
            expect(given.$tree.tree("getSelectedNode")).toBe(given.node1);
        });
    });
});

describe("loadData", () => {
    interface Vars {
        initialNode: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("initialNode", () =>
        given.$tree.tree("getNodeByNameMustExist", "initial1")
    );
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: ["initial1"],
        });
    });

    context("when the node parameter is empty", () => {
        beforeEach(() => {
            given.$tree.tree("loadData", exampleData);
        });

        test("replaces the whole tree", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: ["child1", "child2"],
                }),
                expect.objectContaining({
                    name: "node2",
                    children: ["child3"],
                }),
            ]);
        });
    });

    context("with a node parameter", () => {
        beforeEach(() => {
            given.$tree.tree("loadData", exampleData, given.initialNode);
        });

        test("loads the data under the node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "initial1",
                    children: [
                        expect.objectContaining({
                            name: "node1",
                            children: ["child1", "child2"],
                        }),
                        expect.objectContaining({
                            name: "node2",
                            children: ["child3"],
                        }),
                    ],
                }),
            ]);
        });
    });
});

describe("openNode", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: false,
            data: exampleData,
        });
        given.$tree.tree("openNode", given.node1, false);
    });

    test("opens the node", () => {
        expect(given.node1.element).toBeOpen();
    });
});

describe("selectNode", () => {
    interface Vars {
        node1: INode;
        node2: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
            selectable: true,
        });
    });

    context("when another node is selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node2);
            given.$tree.tree("selectNode", given.node1);
        });

        test("selects the node and deselects the previous node", () => {
            expect(given.node1.element).toBeSelected();
            expect(given.node2.element).notToBeSelected();
        });
    });

    context("when the node is not selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        test("selects the node", () => {
            expect(given.node1.element).toBeSelected();
        });
    });

    context("when the node is selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("selectNode", given.node1);
        });

        test("deselects the node", () => {
            expect(given.node1.element).notToBeSelected();
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

describe("toJson", () => {
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

    test("returns nodes as json", () => {
        expect(JSON.parse(given.$tree.tree("toJson"))).toEqual(exampleData);
    });
});
