import "app/tree.jquery";

import exampleData from "../support/exampleData";

describe("create with data", () => {
    beforeEach(() => {
        const element = document.createElement("div");
        element.id = "tree1";
        document.body.appendChild(element);
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        (document.getElementById("tree1") as HTMLElement).remove();
    });

    it("creates a tree", () => {
        const $tree = $("#tree1");
        $tree.tree({
            data: exampleData,
        });

        expect($tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ],
                name: "node1",
                open: false,
                selected: false,
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({
                        children: [expect.objectContaining({ name: "child3" })],
                        name: "node3",
                        open: false,
                    }),
                ],
                name: "node2",
                open: false,
                selected: false,
            }),
        ]);
    });
});
