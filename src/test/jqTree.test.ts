import * as $ from "jquery";
import getGiven from "givens";
import "../tree.jquery";
import exampleData from "./exampleData";
import { treeStructure } from "./testUtil";

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
    beforeEach(() => {
        $("#tree1").tree({
            data: exampleData,
        });
    });

    test("creates a tree", () => {
        expect(treeStructure($("#tree1"))).toEqual([
            {
                name: "node1",
                open: true,
                children: ["child1", "child2"],
            },
            { name: "node2", open: true, children: ["child3"] },
        ]);
    });
});

describe("showEmptyFolder option", () => {
    context("when children attribute is an empty array", () => {
        interface Vars {
            showEmptyFolder: boolean;
        }

        const given = getGiven<Vars>();

        beforeEach(() => {
            $("#tree1").tree({
                data: [{ name: "parent1", children: [] }],
                showEmptyFolder: given.showEmptyFolder,
            });
        });

        context("with showEmptyFolder false", () => {
            given("showEmptyFolder", () => false);

            test("creates a child node", () => {
                expect(treeStructure($("#tree1"))).toEqual(["parent1"]);
            });
        });

        context("with showEmptyFolder true", () => {
            given("showEmptyFolder", () => true);

            test("creates a folder", () => {
                expect(treeStructure($("#tree1"))).toEqual([
                    { name: "parent1", children: [], open: true },
                ]);
            });
        });
    });
});
