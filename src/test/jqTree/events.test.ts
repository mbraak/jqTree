import * as $ from "jquery";
import getGiven from "givens";
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
        given.$tree.tree({
            data: exampleData,
        });
    });

    test("fires tree.click", (done) => {
        given.$tree.on("tree.click", (e: unknown) => {
            const treeClickEvent = e as ClickNodeEvent;

            expect(treeClickEvent.node).toBe(given.node1);
            done();
        });

        given.titleSpan.click();
    });
});

describe("tree.init", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    test("is called", (done) => {
        given.$tree.on("tree.init", () => {
            expect(given.$tree.tree("getNodeByName", "node2")).toMatchObject({
                id: 124,
                name: "node2",
            });
            done();
        });

        given.$tree.tree({
            data: exampleData,
        });
    });

    // todo: when data is loaded by ajax call
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

    test("fires tree.click", (done) => {
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

        test("fires tree.select with node is null", (done) => {
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
