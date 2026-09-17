import "app/tree.jquery";

import exampleData from "../support/exampleData";

describe("create with data", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
    });

    it("creates a tree", () => {
        const $tree = $("#tree1");
        $tree.tree({
            autoOpen: true,
            data: exampleData,
        });

        expect($tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                ],
                name: "node1",
                open: true,
                selected: false,
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({
                        children: [expect.objectContaining({ name: "child3" })],
                        name: "node3",
                        open: true,
                    }),
                ],
                name: "node2",
                open: true,
                selected: false,
            }),
        ]);
    });
});
