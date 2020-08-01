import * as $ from "jquery";
import getGiven from "givens";
import * as mockjaxFactory from "jquery-mockjax";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

const mockjax = mockjaxFactory(jQuery, window);

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    mockjax.clear();
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
        given.$tree.tree({
            data: exampleData,
        });
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
        beforeEach(() => {
            mockjax({
                url: "/tree/",
                responseText: exampleData,
                logging: false,
            });
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
