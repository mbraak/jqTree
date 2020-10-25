import * as $ from "jquery";
import getGiven from "givens";
import { rest } from "msw";
import { setupServer } from "msw/node";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

describe("tree.click", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.click", () =>
        new Promise((done) => {
            given.$tree.on("tree.click", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });

            given.titleSpan.click();
        }));
});

describe("tree.contextmenu", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.contextmenu", () =>
        new Promise((done) => {
            given.$tree.on("tree.contextmenu", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });

            given.titleSpan.contextmenu();
        }));
});

describe("tree.dblclick", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.dblclick", () =>
        new Promise((done) => {
            given.$tree.on("tree.dblclick", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                done();
            });

            given.titleSpan.dblclick();
        }));
});

describe("tree.init", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("with json data", () => {
        it("is called", () =>
            new Promise((done) => {
                given.$tree.on("tree.init", () => {
                    expect(
                        given.$tree.tree("getNodeByName", "node2")
                    ).toMatchObject({
                        id: 124,
                        name: "node2",
                    });
                    done();
                });

                given.$tree.tree({
                    data: exampleData,
                });
            }));
    });

    context("with data loaded from an url", () => {
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

        it("is called", () =>
            new Promise((done) => {
                given.$tree.on("tree.init", () => {
                    expect(
                        given.$tree.tree("getNodeByName", "node2")
                    ).toMatchObject({
                        id: 124,
                        name: "node2",
                    });
                    done();
                });

                given.$tree.tree({ dataUrl: "/tree/" });
            }));
    });
});

describe("tree.load_data", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("when the tree is initialized with data", () => {
        it("fires tree.load_data", () =>
            new Promise((resolve) => {
                given.$tree.on("tree.load_data", (e: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    expect(e.tree_data).toEqual(exampleData);
                    resolve();
                });

                given.$tree.tree({ data: exampleData });
            }));
    });
});

describe("tree.select", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    it("fires tree.click", () =>
        new Promise((done) => {
            given.$tree.on("tree.select", (e: unknown) => {
                const treeClickEvent = e as ClickNodeEvent;

                expect(treeClickEvent.node).toBe(given.node1);
                expect(treeClickEvent.deselected_node).toBeNull();
                done();
            });

            given.titleSpan.click();
        }));

    context("when the node was selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("fires tree.select with node is null", () =>
            new Promise((done) => {
                given.$tree.on("tree.select", (e: unknown) => {
                    const treeClickEvent = e as ClickNodeEvent;

                    expect(treeClickEvent.node).toBeNull();
                    expect(treeClickEvent.previous_node).toBe(given.node1);
                    done();
                });

                given.titleSpan.click();
            }));
    });
});
