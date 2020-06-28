import * as $ from "jquery";
import "../tree.jquery";
import exampleData from "./exampleData";
import { treeStructure } from "./testUtil";

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

describe("create", () => {
    context("with data", () => {
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
});
