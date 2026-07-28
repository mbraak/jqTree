import { screen } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import "app/tree.jquery";

import exampleData from "../support/exampleData";

describe("keyboard support", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
    });

    describe("with key down", () => {
        it("selects the next node when a node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            await userEvent.keyboard("{ArrowDown}");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", selected: false }),
                expect.objectContaining({ name: "node2", selected: true }),
            ]);
        });

        it("does nothing when no node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            await userEvent.keyboard("{ArrowDown}");

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("keeps the node selected when the last node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("selectNode", node2);

            await userEvent.keyboard("{ArrowDown}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node2",
            });
        });
    });

    describe("with key up", () => {
        it("selects the previous node when a node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("selectNode", node2);

            await userEvent.keyboard("{ArrowUp}");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", selected: true }),
                expect.objectContaining({ name: "node2", selected: false }),
            ]);
        });

        it("does nothing when no node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            await userEvent.keyboard("{ArrowUp}");

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });
    });

    describe("with key right", () => {
        it("opens the folder when a closed folder is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            await userEvent.keyboard("{ArrowRight}");

            expect($tree).toHaveTreeStructure([
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

        it("selects the first child when an open folder is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: true,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            await userEvent.keyboard("{ArrowRight}");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "child1",
                            selected: true,
                        }),
                        expect.objectContaining({
                            name: "child2",
                            selected: false,
                        }),
                    ],
                    name: "node1",
                    open: true,
                    selected: false,
                }),
                expect.objectContaining({
                    name: "node2",
                    selected: false,
                }),
            ]);
        });

        it("does nothing when no node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            await userEvent.keyboard("{ArrowRight}");

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("does nothing when a child is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("selectNode", child1);

            await userEvent.keyboard("{ArrowRight}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "child1",
            });
        });
    });

    describe("with key left", () => {
        it("selects the previous node when a closed folder is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const node3 = $tree.tree("getNodeByNameMustExist", "node3");
            $tree.tree("selectNode", node3);

            await userEvent.keyboard("{ArrowLeft}");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    selected: false,
                }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: false,
                            selected: false,
                        }),
                    ],
                    name: "node2",
                    selected: true,
                }),
            ]);
        });

        it("closes the folder when an open folder is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: true,
                data: exampleData,
            });

            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("selectNode", node2);

            await userEvent.keyboard("{ArrowLeft}");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                    selected: false,
                }),
                expect.objectContaining({
                    name: "node2",
                    open: false,
                    selected: true,
                }),
            ]);
        });

        it("does nothing when no node is selected", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            await userEvent.keyboard("{ArrowLeft}");

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });
    });

    describe("with page up key", () => {
        it("does nothing", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("selectNode", child1);

            await userEvent.keyboard("{PageUp}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "child1",
            });
        });
    });

    describe("when the focus is not on the title of a node", () => {
        // Add a link and an input to every node
        const createTree = () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                onCreateLi: (node: INode, $li: JQuery) => {
                    // eslint-disable-next-line testing-library/no-node-access
                    const element = $li.get(0)?.querySelector(":scope > .jqtree-element");
                    element?.insertAdjacentHTML(
                        "beforeend",
                        `<a href="#">link-${node.name}</a><input aria-label="input-${node.name}">`,
                    );
                },
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            return $tree;
        };

        it("handles the key when the focus is on a link in a node", async () => {
            const $tree = createTree();

            screen.getByRole("link", { name: "link-node1" }).focus();

            await userEvent.keyboard("{ArrowDown}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node2",
            });
        });

        it("does nothing when the focus is on an input in a node", async () => {
            const $tree = createTree();

            screen.getByRole("textbox", { name: "input-node1" }).focus();

            await userEvent.keyboard("{ArrowDown}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node1",
            });
        });

        it("does nothing when the focus is outside the tree", async () => {
            const $tree = createTree();

            document.body.insertAdjacentHTML(
                "beforeend",
                '<span tabindex="0">outside the tree</span>',
            );
            screen.getByText("outside the tree").focus();

            await userEvent.keyboard("{ArrowDown}");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node1",
            });
        });
    });
});
