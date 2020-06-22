import * as $ from "jquery";
import "../tree.jquery";
import exampleData from "./exampleData";

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

describe("create", () => {
    describe("with data", () => {
        test("creates a tree", () => {
            $("#tree1").tree({
                data: exampleData,
            });

            expect($("#tree1").children().length).toBe(1);
        });
    });
});
