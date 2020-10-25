import * as $ from "jquery";
import getGiven from "givens";
import { screen } from "@testing-library/dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";
import __version__ from "../../version";

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

describe("addNodeAfter", () => {
    interface Vars {
        node: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        given.$tree.tree("addNodeAfter", "added-node", given.node);
    });

    it("adds the node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "added-node" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});

describe("addNodeBefore", () => {
    interface Vars {
        node: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        given.$tree.tree("addNodeBefore", "added-node", given.node);
    });

    it("adds the node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "added-node" }),
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});

describe("addParentNode", () => {
    interface Vars {
        child1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        given.$tree.tree("addParentNode", "new-parent-node", given.child1);
    });

    it("adds the parent node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                children: [
                    expect.objectContaining({
                        name: "new-parent-node",
                        children: [
                            expect.objectContaining({ name: "child1" }),
                            expect.objectContaining({ name: "child2" }),
                        ],
                    }),
                ],
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });
});

describe("addToSelection", () => {
    interface Vars {
        child1: INode;
        child2: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
    given("child2", () => given.$tree.tree("getNodeByNameMustExist", "child2"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        given.$tree.tree("addToSelection", given.child1);
        given.$tree.tree("addToSelection", given.child2);
    });

    it("selects the nodes", () => {
        expect(given.$tree.tree("getSelectedNodes")).toEqual(
            expect.arrayContaining([given.child1, given.child2])
        );
    });

    it("renders the nodes correctly", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                selected: false,
                children: [
                    expect.objectContaining({ name: "child1", selected: true }),
                    expect.objectContaining({ name: "child2", selected: true }),
                ],
            }),
            expect.objectContaining({
                name: "node2",
                selected: false,
                children: [
                    expect.objectContaining({
                        name: "node3",
                        selected: false,
                    }),
                ],
            }),
        ]);
    });
});

describe("appendNode", () => {
    interface Vars {
        nodeData: NodeData;
        parent: INode | undefined;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("parent", () => undefined);
    given("nodeData", () => "appended-node");

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        given.$tree.tree("appendNode", given.nodeData, given.parent);
    });

    context("with an empty parent parameter", () => {
        it("appends the node to the tree", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-node" }),
            ]);
        });
    });

    context("when appending to a parent node", () => {
        given("parent", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );

        it("appends the node to parent node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                        expect.objectContaining({ name: "appended-node" }),
                    ],
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    context("when appending a node using an object", () => {
        given("nodeData", () => ({
            color: "green",
            id: 99,
            name: "appended-using-object",
        }));

        it("appends the node to the tree", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-using-object" }),
            ]);
        });

        it("sets the properties of the object", () => {
            expect(given.$tree.tree("getNodeById", 99)).toMatchObject(
                given.nodeData
            );
        });
    });
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

    it("closes the node", () => {
        expect(given.node1.element).toBeClosed();
    });
});

describe("getNodeByCallback", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("returns the node", () => {
        const callback = (node: INode) => node.name.startsWith("chi");

        expect(given.$tree.tree("getNodeByCallback", callback)).toMatchObject({
            name: "child1",
        });
    });
});

describe("getNodeByHtmlElement", () => {
    interface Vars {
        htmlElement: HTMLElement;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("htmlElement", () =>
        screen.getByText("node1", { selector: ".jqtree-title" })
    );
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("returns the node", () => {
        expect(
            given.$tree.tree("getNodeByHtmlElement", given.htmlElement)
        ).toEqual(expect.objectContaining({ name: "node1" }));
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

    it("returns the node", () => {
        expect(given.$tree.tree("getNodeById", 127)).toMatchObject({
            name: "node3",
        });
    });

    context("with a string parameter", () => {
        it("returns the node", () => {
            expect(given.$tree.tree("getNodeById", "127")).toMatchObject({
                name: "node3",
            });
        });
    });

    context("when the node doesn't exist", () => {
        it("returns undefined", () => {
            expect(given.$tree.tree("getNodeById", 99999)).toBeNull();
        });
    });
});

describe("getNodesByProperty", () => {
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

    it("gets nodes by property", () => {
        expect(
            given.$tree.tree("getNodesByProperty", "intProperty", 1)
        ).toEqual([given.node1]);
    });
});

describe("getSelectedNode", () => {
    interface Vars {
        node: INode;
        $tree: JQuery<HTMLElement>;
        treeData: NodeData[];
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: given.treeData,
        });
    });

    context("when nodes have ids", () => {
        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );
        given("treeData", () => exampleData);

        context("when no node is selected", () => {
            it("returns false", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });

        context("when a node is selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
            });

            it("returns the selected node", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
            });
        });
    });

    context("when nodes don't have ids", () => {
        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "without-id1")
        );
        given("treeData", () => ["without-id1", "without-id2"]);

        context("when no node is selected", () => {
            it("returns false", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });

        context("when a node is selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
            });

            it("returns the selected node", () => {
                expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
            });
        });
    });
});

describe("getSelectedNodes", () => {
    interface Vars {
        child1: INode;
        child2: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
    given("child2", () => given.$tree.tree("getNodeByNameMustExist", "child2"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    context("when no node is selected", () => {
        it("returns an empty array", () => {
            expect(given.$tree.tree("getSelectedNodes")).toHaveLength(0);
        });
    });

    context("when nodes are selected", () => {
        beforeEach(() => {
            given.$tree.tree("addToSelection", given.child1);
            given.$tree.tree("addToSelection", given.child2);
        });

        it("returns the selected nodes", () => {
            expect(given.$tree.tree("getSelectedNodes")).toEqual(
                expect.arrayContaining([given.child1, given.child2])
            );
        });
    });
});

describe("getState", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
        given.$tree.tree("openNode", given.node1, false);
    });

    it("returns the state", () => {
        expect(given.$tree.tree("getState")).toEqual({
            open_nodes: [123],
            selected_node: [],
        });
    });
});

describe("getStateFromStorage", () => {
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
            saveState: true,
        });
        given.$tree.tree("openNode", given.node1, false);
    });

    it("returns the state", () => {
        expect(given.$tree.tree("getStateFromStorage")).toEqual({
            open_nodes: [123],
            selected_node: [],
        });
    });
});

describe("getTree", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("returns the tree", () => {
        expect(given.$tree.tree("getTree")).toMatchObject({
            children: [
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ],
        });
    });
});

describe("getVersion", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree();
    });

    it("returns the version", () => {
        expect(given.$tree.tree("getVersion")).toBe(__version__);
    });
});

describe("isNodeSelected", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    context("when the node is selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("returns true", () => {
            expect(given.$tree.tree("isNodeSelected", given.node1)).toBeTrue();
        });
    });

    context("when the node is not selected", () => {
        it("returns false", () => {
            expect(given.$tree.tree("isNodeSelected", given.node1)).toBeFalse();
        });
    });
});

describe("loadData", () => {
    interface Vars {
        initialData: NodeData[];
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("initialData", () => ["initial1"]);
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: given.initialData });
    });

    context("when the node parameter is empty", () => {
        beforeEach(() => {
            given.$tree.tree("loadData", exampleData);
        });

        it("replaces the whole tree", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                }),
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })],
                }),
            ]);
        });
    });

    context("with a node parameter", () => {
        beforeEach(() => {
            given.$tree.tree(
                "loadData",
                exampleData,
                given.$tree.tree("getNodeByNameMustExist", "initial1")
            );
        });

        it("loads the data under the node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "initial1",
                    children: [
                        expect.objectContaining({
                            name: "node1",
                            children: [
                                expect.objectContaining({ name: "child1" }),
                                expect.objectContaining({ name: "child2" }),
                            ],
                        }),
                        expect.objectContaining({ name: "node2" }),
                    ],
                }),
            ]);
        });
    });

    context("with a node parameter which has a selected child", () => {
        given("initialData", () => exampleData);

        beforeEach(() => {
            given.$tree.tree(
                "selectNode",
                given.$tree.tree("getNodeByNameMustExist", "child1")
            );
        });

        it("deselects the node", () => {
            given.$tree.tree(
                "loadData",
                ["new-child1"],
                given.$tree.tree("getNodeByNameMustExist", "node1")
            );

            expect(given.$tree.tree("getSelectedNode")).toBeFalse();
        });

        context("when the selected node doesn't have an id", () => {
            given("initialData", () => [
                { name: "node1", children: ["child1", "child2"] },
                "node2",
            ]);

            it("deselects the node", () => {
                given.$tree.tree(
                    "loadData",
                    ["new-child1"],
                    given.$tree.tree("getNodeByNameMustExist", "node1")
                );

                expect(given.$tree.tree("getSelectedNode")).toBeFalse();
            });

            context("when the selected child is under another node", () => {
                it("doesn't deselect the node", () => {
                    given.$tree.tree(
                        "loadData",
                        ["new-child1"],
                        given.$tree.tree("getNodeByNameMustExist", "node2")
                    );

                    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
                        name: "child1",
                    });
                });
            });
        });
    });
});

describe("loadDataFromUrl", () => {
    interface Vars {
        initialData: NodeData[];
        serverData: NodeData[];
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("initialData", () => []);
    given("serverData", () => exampleData);
    given("$tree", () => $("#tree1"));

    let server: ReturnType<typeof setupServer> | null = null;

    beforeAll(() => {
        server = setupServer(
            rest.get("/tree/", (_request, response, ctx) => {
                return response(ctx.status(200), ctx.json(given.serverData));
            })
        );
        server.listen();
    });

    afterAll(() => {
        server?.close();
    });

    beforeEach(() => {
        given.$tree.tree({ data: given.initialData });
    });

    context("with url parameter", () => {
        it("loads the tree", async () => {
            given.$tree.tree("loadDataFromUrl", "/tree/");
            await screen.findByText("node1");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        context("with parent node", () => {
            given("initialData", () => ["initial1", "initial2"]);
            given("serverData", () => ["new1", "new2"]);

            it("loads a subtree", async () => {
                const parentNode = given.$tree.tree(
                    "getNodeByNameMustExist",
                    "initial1"
                );
                given.$tree.tree("loadDataFromUrl", "/tree/", parentNode);
                await screen.findByText("new1");

                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "initial1",
                        children: [
                            expect.objectContaining({ name: "new1" }),
                            expect.objectContaining({ name: "new2" }),
                        ],
                    }),
                    expect.objectContaining({ name: "initial2" }),
                ]);
            });
        });
    });

    context("without url parameter", () => {
        it("loads the data from dataUrl", async () => {
            given.$tree.tree("setOption", "dataUrl", "/tree/");
            given.$tree.tree("loadDataFromUrl");
            await screen.findByText("node1");

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
});

describe("moveDown", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
        given.$tree.tree("selectNode", given.node1);
    });

    it("selects the next node", () => {
        given.$tree.tree("moveDown");
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node2",
        });
    });
});

describe("moveNode", () => {
    interface Vars {
        child1: INode;
        node2: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
    given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });
        given.$tree.tree("moveNode", given.child1, given.node2, "after");
    });

    it("moves node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                name: "node1",
                children: [expect.objectContaining({ name: "child2" })],
            }),
            expect.objectContaining({ name: "node2" }),
            expect.objectContaining({ name: "child1" }),
        ]);
    });
});

describe("moveUp", () => {
    interface Vars {
        node2: INode;
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
        given.$tree.tree("selectNode", given.node2);
    });

    it("selects the next node", () => {
        given.$tree.tree("moveUp");
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node1",
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
    });

    it("opens the node", () => {
        given.$tree.tree("openNode", given.node1, false);

        expect(given.node1.element).toBeOpen();
    });

    context("with onFinished parameter", () => {
        it("calls the function", () =>
            new Promise((resolve) =>
                given.$tree.tree("openNode", given.node1, (node) =>
                    resolve(expect(node).toBe(given.node1))
                )
            ));
    });
});

describe("prependNode", () => {
    interface Vars {
        parent: INode | undefined;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));
    given("parent", () => undefined);

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
        given.$tree.tree("prependNode", "prepended-node", given.parent);
    });

    context("with an empty parent parameter", () => {
        it("prepends the node to the tree", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "prepended-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    context("with a parent node", () => {
        given("parent", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );

        it("prepends the node to the parent", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [
                        expect.objectContaining({ name: "prepended-node" }),
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
});

describe("reload", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    let server: ReturnType<typeof setupServer> | null = null;

    beforeAll(() => {
        server = setupServer(
            rest.get("/tree/", (_request, response, ctx) =>
                response(ctx.status(200), ctx.json(exampleData))
            )
        );
        server.listen();
    });

    afterAll(() => {
        server?.close();
    });

    beforeEach(async () => {
        given.$tree.tree({ dataUrl: "/tree/" });
        await screen.findByText("node1");

        given.$tree.tree("removeNode", given.node1);
    });

    it("reloads the data from the server", async () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "node2" }),
        ]);

        given.$tree.tree("reload");
        await screen.findByText("node1");

        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    context("with a onFinished parameter", () => {
        it("calls onFinished", () =>
            new Promise((resolve) => {
                const handleFinished = () => {
                    expect(given.$tree).toHaveTreeStructure([
                        expect.objectContaining({ name: "node1" }),
                        expect.objectContaining({ name: "node2" }),
                    ]);

                    resolve();
                };

                given.$tree.tree("reload", handleFinished);
            }));
    });
});

describe("removeNode", () => {
    interface Vars {
        node: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    context("with a child node", () => {
        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "child1")
        );

        it("removes the node", () => {
            given.$tree.tree("removeNode", given.node);

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    children: [expect.objectContaining({ name: "child2" })],
                }),
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })],
                }),
            ]);
        });

        context("when the node is selected", () => {
            beforeEach(() => {
                given.$tree.tree("selectNode", given.node);
            });

            it("removes and deselects the node", () => {
                given.$tree.tree("removeNode", given.node);

                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });

    context("with a parent node and its children", () => {
        given("node", () =>
            given.$tree.tree("getNodeByNameMustExist", "node1")
        );

        it("removes the node", () => {
            given.$tree.tree("removeNode", given.node);

            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node2",
                    children: [expect.objectContaining({ name: "node3" })],
                }),
            ]);
        });

        context("when a child node is selected", () => {
            beforeEach(() => {
                const child1 = given.$tree.tree(
                    "getNodeByNameMustExist",
                    "child1"
                );
                given.$tree.tree("selectNode", child1);
            });

            it("removes the node and deselects the child", () => {
                given.$tree.tree("removeNode", given.node);

                expect(given.$tree.tree("getSelectedNode")).toBe(false);
            });
        });
    });

    context("with a root node", () => {
        given("node", () => given.$tree.tree("getTree"));

        it("raises an exception", () => {
            expect(() => given.$tree.tree("removeNode", given.node)).toThrow(
                "Node has no parent"
            );
        });
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

        it("selects the node and deselects the previous node", () => {
            expect(given.node1.element).toBeSelected();
            expect(given.node2.element).notToBeSelected();
        });
    });

    context("when the node is not selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("selects the node", () => {
            expect(given.node1.element).toBeSelected();
        });
    });

    context("when the node is selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("deselects the node", () => {
            given.$tree.tree("selectNode", given.node1);
            expect(given.node1.element).notToBeSelected();
        });
    });

    context("with a null parameter", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("deselects the current node", () => {
            given.$tree.tree("selectNode", null);
            expect(given.$tree.tree("getSelectedNode")).toBeFalse();
        });
    });
});

describe("setOption", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    beforeEach(() => {
        given.$tree.tree({
            animationSpeed: 0,
            data: exampleData,
            selectable: false,
        });
    });
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    it("sets an option", () => {
        given.$tree.tree("setOption", "selectable", true);
        titleSpan(given.node1.element).click();
        expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "node1",
        });
    });
});

describe("setState", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    beforeEach(() => {
        given.$tree.tree({
            autoOpen: false,
            data: exampleData,
            selectable: true,
        });
    });
    given("$tree", () => $("#tree1"));

    it("sets the state", () => {
        given.$tree.tree("setState", {
            open_nodes: [123],
            selected_node: [123],
        });

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
        it("opens the node", () => {
            expect(given.node1.element).toBeOpen();
        });
    });

    context("when the node is open", () => {
        given("autoOpen", () => true);

        it("closes the node", () => {
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

    it("returns nodes as json", () => {
        expect(JSON.parse(given.$tree.tree("toJson"))).toEqual(exampleData);
    });
});

describe("updateNode", () => {
    interface Vars {
        isSelected: boolean;
        node: INode;
        nodeData: NodeData;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("isSelected", () => false);
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        if (given.isSelected) {
            given.$tree.tree("selectNode", given.node);
        }

        given.$tree.tree("updateNode", given.node, given.nodeData);
    });

    context("with a string", () => {
        given("nodeData", () => "updated-node");

        it("updates the name", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    context("with an object containing a name", () => {
        given("nodeData", () => ({ name: "updated-node" }));

        it("updates the name", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    context("with an object containing an id", () => {
        given("nodeData", () => ({ id: 999 }));

        it("updates the id", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(given.$tree.tree("getNodeById", 999)).toMatchObject(
                given.nodeData
            );
        });
    });

    context("with an object containing a property", () => {
        given("nodeData", () => ({ color: "green" }));

        it("updates the node", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(given.$tree.tree("getNodeById", 123)).toMatchObject({
                color: "green",
                name: "node1",
            });
        });
    });

    context("with an object containing children", () => {
        context("when adding a child to a child node", () => {
            given("nodeData", () => ({ children: ["new-child"] }));
            given("node", () =>
                given.$tree.tree("getNodeByNameMustExist", "child1")
            );

            it("adds the child node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        name: "node1",
                        children: [
                            expect.objectContaining({
                                name: "child1",
                                children: [
                                    expect.objectContaining({
                                        name: "new-child",
                                    }),
                                ],
                            }),
                            expect.objectContaining({ name: "child2" }),
                        ],
                    }),
                    expect.objectContaining({ name: "node2" }),
                ]);
            });
        });

        context("when removing the children", () => {
            given("nodeData", () => ({ children: [] }));

            it("removes the children", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({
                        nodeType: "child",
                        name: "node1",
                    }),
                    expect.objectContaining({
                        nodeType: "folder",
                        name: "node2",
                    }),
                ]);
            });
        });
    });

    context("when the node was selected", () => {
        given("isSelected", () => true);

        it("keeps the node selected", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("keeps the focus on the node", () => {
            expect(document.activeElement).not.toBeNil();
            expect(
                given.$tree.tree(
                    "getNodeByHtmlElement",
                    document.activeElement as HTMLElement
                )
            ).not.toBeNil();
        });
    });
});
