import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import "app/tree.jquery";
import __version__ from "app/version";

import exampleData from "../support/exampleData";
import { getTreeListElement } from "../support/queries";

const server = setupServer();

describe("methods", () => {
    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    afterEach(() => {
        server.resetHandlers();

        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    describe("addNodeAfter", () => {
        it("adds the node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("addNodeAfter", "added-node", node);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "added-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("addNodeBefore", () => {
        it("adds the node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("addNodeBefore", "added-node", node);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "added-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("throws an error without an existingNode parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("addNodeBefore", "added-node");
            }).toThrow("Parameter is empty: existingNode");
        });
    });

    describe("addParentNode", () => {
        it("adds the parent node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("addParentNode", "new-parent-node", child1);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({ name: "child1" }),
                                expect.objectContaining({ name: "child2" }),
                            ],
                            name: "new-parent-node",
                        }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("throws an error without an existingNode parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("addParentNode", "new-parent-node");
            }).toThrow("Parameter is empty: existingNode");
        });
    });

    describe("addToSelection", () => {
        it("selects the nodes", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const child2 = $tree.tree("getNodeByNameMustExist", "child2");
            $tree.tree("addToSelection", child1);
            $tree.tree("addToSelection", child2);

            expect($tree.tree("getSelectedNodes")).toStrictEqual(
                expect.arrayContaining([child1, child2]),
            );
        });

        it("renders the nodes correctly", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const child2 = $tree.tree("getNodeByNameMustExist", "child2");
            $tree.tree("addToSelection", child1);
            $tree.tree("addToSelection", child2);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "child1",
                            selected: true,
                        }),
                        expect.objectContaining({
                            name: "child2",
                            selected: true,
                        }),
                    ],
                    name: "node1",
                    selected: false,
                }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            selected: false,
                        }),
                    ],
                    name: "node2",
                    selected: false,
                }),
            ]);
        });

        it("opens the parent node when it's closed", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(node1.is_open).toBeFalsy();

            $tree.tree("addToSelection", child1);

            expect(node1.is_open).toBeTrue();
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("addToSelection");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("appendNode", () => {
        it("appends the node to the tree with an empty parent parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            $tree.tree("appendNode", "appended-node", undefined);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-node" }),
            ]);
        });

        it("appends the node to a parent node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const parent = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("appendNode", "appended-node", parent);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                        expect.objectContaining({ name: "appended-node" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("appends the node to the tree using an object", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            $tree.tree("appendNode", {
                color: "green",
                id: 99,
                name: "appended-using-object",
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-using-object" }),
            ]);
        });

        it("sets the properties of the object", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const nodeData = {
                color: "green",
                id: 99,
                name: "appended-using-object",
            };
            $tree.tree("appendNode", nodeData);

            expect($tree.tree("getNodeById", 99)).toMatchObject(
                nodeData,
            );
        });
    });

    describe("closeNode", () => {
        it("closes the node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("closeNode", node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaExpanded();
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("closeNode");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("destroy", () => {
        it("clears the tree element", () => {
            const $tree = $("#tree1");

            $tree.tree({
                data: exampleData,
            });

            $tree.tree("destroy");

            expect($tree.get(0)).toBeEmptyDOMElement();
        });
    });

    describe("getNodeByCallback", () => {
        it("returns the node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const callback = (node: INode) => node.name.startsWith("chi");

            expect($tree.tree("getNodeByCallback", callback)).toMatchObject({
                name: "child1",
            });
        });
    });

    describe("getNodeByHtmlElement", () => {
        it("returns the node with an HTMLElement parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const htmlElement = screen.getByText("node1", {
                selector: ".jqtree-title",
            });

            expect(
                $tree.tree("getNodeByHtmlElement", htmlElement),
            ).toStrictEqual(expect.objectContaining({ name: "node1" }));
        });

        it("returns the node with a jQuery element parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const htmlElement = screen.getByText("node1", {
                selector: ".jqtree-title",
            });

            expect(
                $tree.tree("getNodeByHtmlElement", jQuery(htmlElement)),
            ).toStrictEqual(expect.objectContaining({ name: "node1" }));
        });

        it("returns null with an empty jQuery element element parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getNodeByHtmlElement", jQuery())).toBeNull();
        });
    });

    describe("getNodeById", () => {
        it("returns the node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getNodeById", 127)).toMatchObject({
                name: "node3",
            });
        });

        it("doesn't return the node with a string parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getNodeById", "127")).toBeNull();
        });

        it("returns null when the node doesn't exist", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getNodeById", 99999)).toBeNull();
        });

        it("returns the node with a string parameter when the data has string ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: [{ id: "123", name: "node1" }] });

            expect($tree.tree("getNodeById", "123")).toMatchObject({
                name: "node1",
            });
        });

        it("doesn't return the node with a number parameter when the data has string ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: [{ id: "123", name: "node1" }] });

            expect($tree.tree("getNodeById", 123)).toBeNull();
        });

        it("returns null when the node doesn't exist and the data has string ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: [{ id: "123", name: "node1" }] });

            expect($tree.tree("getNodeById", "abc")).toBeNull();
        });
    });

    describe("getNodesByProperty", () => {
        it("gets nodes by property", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                $tree.tree("getNodesByProperty", "intProperty", 1),
            ).toStrictEqual([node1]);
        });
    });

    describe("getSelectedNode", () => {
        it("returns false when no node is selected and nodes have ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("returns the selected node when nodes have ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node);

            expect($tree.tree("getSelectedNode")).toBe(node);
        });

        it("returns false when no node is selected and nodes don't have ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: ["without-id1", "without-id2"] });

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("returns the selected node when nodes don't have ids", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: ["without-id1", "without-id2"] });

            const node = $tree.tree("getNodeByNameMustExist", "without-id1");
            $tree.tree("selectNode", node);

            expect($tree.tree("getSelectedNode")).toBe(node);
        });
    });

    describe("getSelectedNodes", () => {
        it("returns an empty array when no node is selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getSelectedNodes")).toHaveLength(0);
        });

        it("returns the selected nodes when nodes are selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const child2 = $tree.tree("getNodeByNameMustExist", "child2");
            $tree.tree("addToSelection", child1);
            $tree.tree("addToSelection", child2);

            expect($tree.tree("getSelectedNodes")).toStrictEqual(
                expect.arrayContaining([child1, child2]),
            );
        });
    });

    describe("getState", () => {
        it("returns the state", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("openNode", node1, false);

            expect($tree.tree("getState")).toStrictEqual({
                open_nodes: [123],
                selected_node: [],
            });
        });
    });

    describe("getStateFromStorage", () => {
        it("returns the state", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                saveState: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("openNode", node1, false);

            expect($tree.tree("getStateFromStorage")).toStrictEqual({
                open_nodes: [123],
                selected_node: [],
            });
        });
    });

    describe("getTree", () => {
        it("returns the tree", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("getTree")).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    describe("getVersion", () => {
        it("returns the version", () => {
            const $tree = $("#tree1");
            $tree.tree();

            expect($tree.tree("getVersion")).toBe(__version__);
        });
    });

    describe("isDragging", () => {
        it("returns false when no node is being dragged", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: true,
            });

            expect($tree.tree("isDragging")).toBeFalse();
        });

        it("returns true while a node is being dragged", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: true,
                startDndDelay: 0,
            });

            const user = userEvent.setup();
            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            await user.pointer([
                { keys: "[MouseLeft>]", target: treeItem },
                { coords: { x: 5, y: 5 }, target: treeItem },
            ]);

            expect($tree.tree("isDragging")).toBeTrue();

            await user.pointer({ keys: "[/MouseLeft]", target: treeItem });
        });

        it("returns false after the drag has finished", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: true,
                startDndDelay: 0,
            });

            const user = userEvent.setup();
            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            await user.pointer([
                { keys: "[MouseLeft>]", target: treeItem },
                { coords: { x: 5, y: 5 }, target: treeItem },
                { keys: "[/MouseLeft]", target: treeItem },
            ]);

            expect($tree.tree("isDragging")).toBeFalse();
        });

        it("returns false when dragAndDrop is false", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: false,
                startDndDelay: 0,
            });

            const user = userEvent.setup();
            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            await user.pointer([
                { keys: "[MouseLeft>]", target: treeItem },
                { coords: { x: 5, y: 5 }, target: treeItem },
            ]);

            expect($tree.tree("isDragging")).toBeFalse();

            await user.pointer({ keys: "[/MouseLeft]", target: treeItem });
        });
    });

    describe("isNodeSelected", () => {
        it("returns true when the node is selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            expect($tree.tree("isNodeSelected", node1)).toBeTrue();
        });

        it("returns false when the node is not selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect($tree.tree("isNodeSelected", node1)).toBeFalse();
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("isNodeSelected");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("loadData", () => {
        it("replaces the whole tree when the node parameter is empty", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: ["initial1"] });

            $tree.tree("loadData", exampleData);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "node3" })],
                    name: "node2",
                }),
            ]);
        });

        it("loads the data under the node with a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: ["initial1"] });

            $tree.tree(
                "loadData",
                exampleData,
                $tree.tree("getNodeByNameMustExist", "initial1"),
            );

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({ name: "child1" }),
                                expect.objectContaining({ name: "child2" }),
                            ],
                            name: "node1",
                        }),
                        expect.objectContaining({ name: "node2" }),
                    ],
                    name: "initial1",
                }),
            ]);
        });

        it("deselects the node with a node parameter which has a selected child", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            $tree.tree(
                "selectNode",
                $tree.tree("getNodeByNameMustExist", "child1"),
            );

            $tree.tree(
                "loadData",
                ["new-child1"],
                $tree.tree("getNodeByNameMustExist", "node1"),
            );

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("deselects the node when the selected node doesn't have an id", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: [
                    { children: ["child1", "child2"], name: "node1" },
                    "node2",
                ],
            });

            $tree.tree(
                "selectNode",
                $tree.tree("getNodeByNameMustExist", "child1"),
            );

            $tree.tree(
                "loadData",
                ["new-child1"],
                $tree.tree("getNodeByNameMustExist", "node1"),
            );

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("keeps the drag and drop state when a node is being dragged", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                dragAndDrop: true,
                startDndDelay: 0,
            })

            const user = userEvent.setup();
            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            await user.pointer([
                { keys: "[MouseLeft>]", target: treeItem },
                { coords: { x: 5, y: 5 }, target: treeItem },
            ]);

            expect($tree.tree("isDragging")).toBeTrue();

            $tree.tree("loadData", ["new-child1"], $tree.tree("getNodeByNameMustExist", "node2"));

            expect($tree.tree("isDragging")).toBeTrue();
            expect(
                getTreeListElement(screen.getByRole("treeitem", { name: "node1" })),
            ).toHaveClass("jqtree-moving");

            await user.pointer({ keys: "[/MouseLeft]", target: treeItem });
        });

        it("doesn't deselect the node when the selected child is under another node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: [
                    { children: ["child1", "child2"], name: "node1" },
                    "node2",
                ],
            });

            $tree.tree(
                "selectNode",
                $tree.tree("getNodeByNameMustExist", "child1"),
            );

            $tree.tree(
                "loadData",
                ["new-child1"],
                $tree.tree("getNodeByNameMustExist", "node2"),
            );

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "child1",
            });
        });


    });

    describe("loadDataFromUrl", () => {
        it("loads the tree with a url parameter", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            const $tree = $("#tree1");
            $tree.tree({ data: [] });

            $tree.tree("loadDataFromUrl", "/tree/");
            await screen.findByText("node1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("loads a subtree with a parent node", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(["new1", "new2"])),
            );

            const $tree = $("#tree1");
            $tree.tree({ data: ["initial1", "initial2"] });

            const parentNode = $tree.tree(
                "getNodeByNameMustExist",
                "initial1",
            );
            $tree.tree("loadDataFromUrl", "/tree/", parentNode);
            await screen.findByText("new1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "new1" }),
                        expect.objectContaining({ name: "new2" }),
                    ],
                    name: "initial1",
                }),
                expect.objectContaining({ name: "initial2" }),
            ]);
        });

        it("loads the data from dataUrl without a url parameter", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            const $tree = $("#tree1");
            $tree.tree({ data: [] });

            $tree.tree("setOption", "dataUrl", "/tree/");
            $tree.tree("loadDataFromUrl");
            await screen.findByText("node1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("moveDown", () => {
        it("selects the next node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            $tree.tree("moveDown");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node2",
            });
        });
    });

    describe("moveNode", () => {
        it("moves node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("moveNode", child1, node2, "after");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child2" })],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "child1" }),
            ]);
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("moveNode");
            }).toThrow("Node parameter is empty");
        });

        it("throws an error without a targetNode parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("moveNode", child1);
            }).toThrow("Parameter is empty: targetNode");
        });

        it("throws an error without a position parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            const node2 = $tree.tree("getNodeByNameMustExist", "node2");

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("moveNode", child1, node2);
            }).toThrow("Parameter is empty: position");
        });
    });

    describe("moveUp", () => {
        it("selects the next node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("selectNode", node2);

            $tree.tree("moveUp");

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node1",
            });
        });
    });

    describe("openNode", () => {
        it("opens the node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("openNode", node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaExpanded();
        });

        it("calls the function with onFinished parameter", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            const onFinished = vi.fn();

            $tree.tree("openNode", node1, onFinished);

            await waitFor(() => {
                expect(onFinished).toHaveBeenCalledExactlyOnceWith(node1);
            });
        });

        it("handles an empty folder", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            child1.isEmptyFolder = true;

            expect(() => {
                $tree.tree("openNode", child1, false);
            }).not.toThrow();
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("openNode");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("prependNode", () => {
        it("prepends the node to the tree with an empty parent parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            $tree.tree("prependNode", "prepended-node", undefined);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "prepended-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("prepends the node to the parent with a parent node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const parent = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("prependNode", "prepended-node", parent);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "prepended-node" }),
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("refresh", () => {
        it("rerenders the tree", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const tree = $tree.tree("getTree");
            (tree.children[0] as INode).name = "node1a";

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);

            $tree.tree("refresh");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1a" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("reload", () => {
        it("reloads the data from the server", async () => {
            server.use(
                http.get("/tree2/", () => HttpResponse.json(exampleData)),
            );

            const $tree = $("#tree1");
            $tree.tree({ dataUrl: "/tree2/" });
            await screen.findByText("node1");

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("removeNode", node1);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node2" }),
            ]);

            $tree.tree("reload");
            await screen.findByText("node1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("calls onFinished with a onFinished parameter", async () => {
            server.use(
                http.get("/tree2/", () => HttpResponse.json(exampleData)),
            );

            const $tree = $("#tree1");
            $tree.tree({ dataUrl: "/tree2/" });
            await screen.findByText("node1");

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("removeNode", node1);

            const handleFinished = vi.fn();

            $tree.tree("reload", handleFinished);

            await waitFor(() => {
                expect(handleFinished).toHaveBeenCalledExactlyOnceWith();
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("removeFromSelection", () => {
        it("deselects a node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });

            const child1 = $tree.tree("getNodeByName", "child1") as INode;
            const child2 = $tree.tree("getNodeByName", "child2") as INode;
            $tree.tree("addToSelection", child1);
            $tree.tree("addToSelection", child2);

            expect($tree.tree("isNodeSelected", child1)).toBeTrue();
            expect($tree.tree("isNodeSelected", child2)).toBeTrue();

            $tree.tree("removeFromSelection", child2);

            expect($tree.tree("isNodeSelected", child1)).toBeTrue();
            expect($tree.tree("isNodeSelected", child2)).toBeFalse();
        });

        it("raises an error with an empty parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });

            expect(() => {
                $tree.tree(
                    "removeFromSelection",
                    undefined as unknown as INode,
                );
            }).toThrow("Node parameter is empty");
        });
    });

    describe("removeNode", () => {
        it("removes the node with a child node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("removeNode", node);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child2" })],
                    name: "node1",
                }),
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "node3" })],
                    name: "node2",
                }),
            ]);
        });

        it("removes and deselects the node when the child node is selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("selectNode", node);

            $tree.tree("removeNode", node);

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("removes the node with a parent node and its children", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("removeNode", node);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "node3" })],
                    name: "node2",
                }),
            ]);
        });

        it("removes the node and deselects the child when a child node is selected", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("selectNode", child1);

            $tree.tree("removeNode", node);

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("raises an exception with a root node", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            const node = $tree.tree("getTree");

            expect(() => $tree.tree("removeNode", node)).toThrow(
                "Node has no parent",
            );
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("removeNode");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("scrollToNode", () => {
        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });

            expect(() => {
                $tree.tree("scrollToNode", undefined as unknown as INode);
            }).toThrow("Node parameter is empty");
        });

        it("handles a node without an element", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
            });

            const result = $tree.tree("scrollToNode", {} as unknown as INode);

            expect(result).toStrictEqual($tree);
        });
    });

    describe("selectNode", () => {
        it("selects the node and deselects the previous node when another node is selected", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                selectable: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            const node2 = $tree.tree("getNodeByNameMustExist", "node2");
            $tree.tree("selectNode", node2);
            $tree.tree("selectNode", node1);

            const treeItem1 = screen.getByRole("treeitem", { name: "node1" });
            const treeItem2 = screen.getByRole("treeitem", { name: "node2" });

            expect(treeItem1).toBeAriaSelected();
            expect(treeItem2).not.toBeAriaSelected();
        });

        it("selects the node when the node is not selected", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                selectable: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaSelected();
        });

        it("deselects the node when the node is selected twice", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                selectable: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);
            $tree.tree("selectNode", node1);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaSelected();
        });

        it("deselects the current node with a null parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                selectable: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            $tree.tree("selectNode", null);

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });

        it("opens the parent node when it's closed", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                selectable: true,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(node1.is_open).toBeFalsy();

            const child1 = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("selectNode", child1);

            expect(node1.is_open).toBeTrue();
        });
    });

    describe("setOption", () => {
        it("sets an option", async () => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                data: exampleData,
                selectable: false,
            });

            $tree.tree("setOption", "selectable", true);
            await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

            expect($tree.tree("getSelectedNode")).toMatchObject({
                name: "node1",
            });
        });
    });

    describe("setState", () => {
        it("sets the state", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
                selectable: true,
            });

            $tree.tree("setState", {
                open_nodes: [123],
                selected_node: [123],
            });

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

        it("doesn't set the state when the state parameter is null", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
                selectable: true,
            });

            $tree.tree("setState", null as any); // eslint-disable-line @typescript-eslint/no-unsafe-argument

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });
    });

    describe("toggle", () => {
        it("opens the node when the node is closed", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("toggle", node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaExpanded();
        });

        it("closes the node when the node is open", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("toggle", node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaExpanded();
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("toggle");
            }).toThrow("Node parameter is empty");
        });
    });

    describe("toJson", () => {
        it("returns nodes as json", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData });

            expect($tree.tree("toJson")).toBe(
                '[{"id":123,"name":"node1","intProperty":1,"strProperty":"1","children":[{"id":125,"name":"child1","intProperty":2},{"id":126,"name":"child2"}]},{"id":124,"name":"node2","intProperty":3,"strProperty":"3","children":[{"id":127,"name":"node3","children":[{"id":128,"name":"child3"}]}]}]',
            );
        });
    });

    describe("updateNode", () => {
        it("updates the name with a string", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("updateNode", node, "updated-node");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("updates the name with an object containing a name", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("updateNode", node, { name: "updated-node" });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("updates the id with an object containing an id", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            const nodeData = { id: 999 };
            $tree.tree("updateNode", node, nodeData);

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect($tree.tree("getNodeById", 999)).toMatchObject(
                nodeData,
            );
        });

        it("updates the node with an object containing a property", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("updateNode", node, { color: "green" });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect($tree.tree("getNodeById", 123)).toMatchObject({
                color: "green",
                name: "node1",
            });
        });

        it("adds the child node when adding a child to a child node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "child1");
            $tree.tree("updateNode", node, { children: ["new-child"] });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({
                                    name: "new-child",
                                }),
                            ],
                            name: "child1",
                        }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("removes the children when removing the children", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("updateNode", node, { children: [] });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    nodeType: "child",
                }),
                expect.objectContaining({
                    name: "node2",
                    nodeType: "folder",
                }),
            ]);
        });

        it("keeps the node selected when the node was selected", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node);

            $tree.tree("updateNode", node, { name: 'node1_changed' });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1_changed" }),
                expect.objectContaining({ name: "node2" }),
            ]);

            expect($tree.tree('getSelectedNode')).toStrictEqual(node);
        });

        it("keeps the focus on the node when the node was selected", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node);
            $tree.tree("updateNode", node, { name: 'node1_changed' });

            const treeItem = screen.getByRole("treeitem", { name: "node1_changed" });

            expect(treeItem).toHaveFocus();
        });

        it("leaves the node unchanged with empty data", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("updateNode", node, "");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("throws an error without a node parameter", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const treeAny = $tree as unknown as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                treeAny.tree("updateNode");
            }).toThrow("Node parameter is empty");
        });
    });

    it("returns undefined when calling with a string that starts with an underscore", () => {
        const $tree = $("#tree1");

        const tree = $tree.tree as unknown as (name: string) => undefined;
        const result = tree("_test"); // eslint-disable-line @typescript-eslint/no-confusing-void-expression

        expect(result).toBeUndefined();
    });
});
