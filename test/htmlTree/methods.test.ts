import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import type { HtmlTreeOptions } from "app/htmlTree/options";
import type { Node } from "app/node";

import HtmlTree from "app/htmlTree";
import __version__ from "app/version";

import exampleData from "../support/exampleData";

const server = setupServer();

describe("methods", () => {
    let htmlElement: HTMLElement;
    let htmlTree: HtmlTree | undefined;

    const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
        htmlTree = new HtmlTree({ htmlElement, options });

        return htmlTree;
    };

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        document.body.innerHTML = "";

        htmlElement = document.createElement("div");
        document.body.append(htmlElement);
    });

    afterEach(() => {
        server.resetHandlers();

        htmlTree?.deinit();
        htmlTree = undefined;

        document.body.innerHTML = "";
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    describe("addNodeAfter", () => {
        it("adds the node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.addNodeAfter("added-node", node);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "added-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("returns null when the existing node has no parent", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            expect(tree.addNodeAfter("added-node", tree.tree)).toBeNull();
        });
    });

    describe("addNodeBefore", () => {
        it("adds the node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.addNodeBefore("added-node", node);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "added-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("returns null when the existing node has no parent", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            expect(tree.addNodeBefore("added-node", tree.tree)).toBeNull();
        });
    });

    describe("addParentNode", () => {
        it("adds the parent node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            tree.addParentNode("new-parent-node", child1);

            expect(htmlElement).toHaveTreeStructure([
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

        it("returns null when the existing node has no parent", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            expect(tree.addParentNode("new-parent-node", tree.tree)).toBeNull();
        });
    });

    describe("addToSelection", () => {
        it("selects the nodes", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            const child2 = tree.getNodeByNameMustExist("child2");
            tree.addToSelection(child1);
            tree.addToSelection(child2);

            expect(tree.getSelectedNodes()).toStrictEqual(
                expect.arrayContaining([child1, child2]),
            );
        });

        it("renders the nodes correctly", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            const child2 = tree.getNodeByNameMustExist("child2");
            tree.addToSelection(child1);
            tree.addToSelection(child2);

            expect(htmlElement).toHaveTreeStructure([
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
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            const node1 = tree.getNodeByNameMustExist("node1");

            expect(node1.is_open).toBeFalsy();

            tree.addToSelection(child1);

            expect(node1.is_open).toBeTrue();
        });
    });

    describe("appendNode", () => {
        it("appends the node to the root node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            tree.appendNode("appended-node", tree.tree);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-node" }),
            ]);
        });

        it("appends the node to a parent node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const parent = tree.getNodeByNameMustExist("node1");
            tree.appendNode("appended-node", parent);

            expect(htmlElement).toHaveTreeStructure([
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
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            tree.appendNode(
                {
                    color: "green",
                    id: 99,
                    name: "appended-using-object",
                },
                tree.tree,
            );

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "appended-using-object" }),
            ]);
        });

        it("sets the properties of the object", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const nodeData = {
                color: "green",
                id: 99,
                name: "appended-using-object",
            };
            tree.appendNode(nodeData, tree.tree);

            expect(tree.getNodeById(99)).toMatchObject(nodeData);
        });
    });

    describe("closeNode", () => {
        it("closes the node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.closeNode(node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaExpanded();
        });

        it("doesn't close a node without children", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            tree.closeNode(child1, false);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1" }),
                        expect.objectContaining({ name: "child2" }),
                    ],
                    name: "node1",
                    open: true,
                }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({ name: "child3" }),
                            ],
                            name: "node3",
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    describe("deinit", () => {
        it("clears the tree element", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.deinit();

            expect(htmlElement).toBeEmptyDOMElement();
        });
    });

    describe("getNode", () => {
        it("returns the node for an element of the node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const titleElement = screen.getByText("node1", {
                selector: ".jqtree-title",
            });

            expect(tree.getNode(titleElement)).toStrictEqual(
                expect.objectContaining({ name: "node1" }),
            );
        });

        it("returns null when the element is not part of the tree", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNode(document.createElement("span"))).toBeNull();
        });
    });

    describe("getNodeByCallback", () => {
        it("returns the node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const callback = (node: Node) => node.name.startsWith("chi");

            expect(tree.getNodeByCallback(callback)).toMatchObject({
                name: "child1",
            });
        });
    });

    describe("getNodeById", () => {
        it("returns the node", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeById(127)).toMatchObject({ name: "node3" });
        });

        it("doesn't return the node with a string parameter", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeById("127")).toBeNull();
        });

        it("returns null when the node doesn't exist", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeById(99999)).toBeNull();
        });

        it("returns the node with a string parameter when the data has string ids", () => {
            const tree = createHtmlTree({
                data: [{ id: "123", name: "node1" }],
            });

            expect(tree.getNodeById("123")).toMatchObject({ name: "node1" });
        });

        it("doesn't return the node with a number parameter when the data has string ids", () => {
            const tree = createHtmlTree({
                data: [{ id: "123", name: "node1" }],
            });

            expect(tree.getNodeById(123)).toBeNull();
        });

        it("returns null when the node doesn't exist and the data has string ids", () => {
            const tree = createHtmlTree({
                data: [{ id: "123", name: "node1" }],
            });

            expect(tree.getNodeById("abc")).toBeNull();
        });
    });

    describe("getNodeByName", () => {
        it("returns the node", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeByName("child1")).toMatchObject({ id: 125 });
        });

        it("returns null when the node doesn't exist", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeByName("non-existing")).toBeNull();
        });
    });

    describe("getNodeByNameMustExist", () => {
        it("returns the node", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getNodeByNameMustExist("child1")).toMatchObject({
                id: 125,
            });
        });

        it("throws an error when the node doesn't exist", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(() => tree.getNodeByNameMustExist("non-existing")).toThrow(
                "Node with name non-existing not found",
            );
        });
    });

    describe("getNodesByProperty", () => {
        it("gets nodes by property", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node1 = tree.getNodeByNameMustExist("node1");

            expect(tree.getNodesByProperty("intProperty", 1)).toStrictEqual([
                node1,
            ]);
        });
    });

    describe("getSelectedNode", () => {
        it("returns false when no node is selected and nodes have ids", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("returns the selected node when nodes have ids", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node);

            expect(tree.getSelectedNode()).toBe(node);
        });

        it("returns false when no node is selected and nodes don't have ids", () => {
            const tree = createHtmlTree({
                data: ["without-id1", "without-id2"],
            });

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("returns the selected node when nodes don't have ids", () => {
            const tree = createHtmlTree({
                data: ["without-id1", "without-id2"],
            });

            const node = tree.getNodeByNameMustExist("without-id1");
            tree.selectNode(node);

            expect(tree.getSelectedNode()).toBe(node);
        });
    });

    describe("getSelectedNodes", () => {
        it("returns an empty array when no node is selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getSelectedNodes()).toHaveLength(0);
        });

        it("returns the selected nodes when nodes are selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            const child1 = tree.getNodeByNameMustExist("child1");
            const child2 = tree.getNodeByNameMustExist("child2");
            tree.addToSelection(child1);
            tree.addToSelection(child2);

            expect(tree.getSelectedNodes()).toStrictEqual(
                expect.arrayContaining([child1, child2]),
            );
        });
    });

    describe("getState", () => {
        it("returns the state", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.openNode(node1, false);

            expect(tree.getState()).toStrictEqual({
                open_nodes: [123],
                selected_node: [],
            });
        });
    });

    describe("getStateFromStorage", () => {
        it("returns the state", () => {
            const tree = createHtmlTree({
                data: exampleData,
                saveState: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.openNode(node1, false);

            expect(tree.getStateFromStorage()).toStrictEqual({
                open_nodes: [123],
                selected_node: [],
            });
        });
    });

    describe("getTree", () => {
        it("returns the tree", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.getTree()).toMatchObject({
                children: [
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ],
            });
        });
    });

    describe("getVersion", () => {
        it("returns the version", () => {
            const tree = createHtmlTree();

            expect(tree.getVersion()).toBe(__version__);
        });
    });

    describe("isNodeSelected", () => {
        it("returns true when the node is selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);

            expect(tree.isNodeSelected(node1)).toBeTrue();
        });

        it("returns false when the node is not selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node1 = tree.getNodeByNameMustExist("node1");

            expect(tree.isNodeSelected(node1)).toBeFalse();
        });
    });

    describe("loadData", () => {
        it("replaces the whole tree when the node parameter is empty", () => {
            const tree = createHtmlTree({ data: ["initial1"] });

            tree.loadData(exampleData);

            expect(htmlElement).toHaveTreeStructure([
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
            const tree = createHtmlTree({ data: ["initial1"] });

            tree.loadData(
                exampleData,
                tree.getNodeByNameMustExist("initial1"),
            );

            expect(htmlElement).toHaveTreeStructure([
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

        it("does nothing when the data parameter is null", () => {
            const tree = createHtmlTree({ data: ["initial1"] });

            tree.loadData(null);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "initial1" }),
            ]);
        });

        it("deselects the node with a node parameter which has a selected child", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.selectNode(tree.getNodeByNameMustExist("child1"));

            tree.loadData(
                ["new-child1"],
                tree.getNodeByNameMustExist("node1"),
            );

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("deselects the node when the selected node doesn't have an id", () => {
            const tree = createHtmlTree({
                data: [
                    { children: ["child1", "child2"], name: "node1" },
                    "node2",
                ],
            });

            tree.selectNode(tree.getNodeByNameMustExist("child1"));

            tree.loadData(
                ["new-child1"],
                tree.getNodeByNameMustExist("node1"),
            );

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("doesn't deselect the node when the selected child is under another node", () => {
            const tree = createHtmlTree({
                data: [
                    { children: ["child1", "child2"], name: "node1" },
                    "node2",
                ],
            });

            tree.selectNode(tree.getNodeByNameMustExist("child1"));

            tree.loadData(
                ["new-child1"],
                tree.getNodeByNameMustExist("node2"),
            );

            expect(tree.getSelectedNode()).toMatchObject({ name: "child1" });
        });
    });

    describe("loadDataFromUrl", () => {
        it("loads the tree with a url parameter", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            const tree = createHtmlTree({ data: [] });

            tree.loadDataFromUrl("/tree/");
            await screen.findByText("node1");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("loads a subtree with a parent node", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(["new1", "new2"])),
            );

            const tree = createHtmlTree({ data: ["initial1", "initial2"] });

            const parentNode = tree.getNodeByNameMustExist("initial1");
            tree.loadDataFromUrl("/tree/", parentNode);
            await screen.findByText("new1");

            expect(htmlElement).toHaveTreeStructure([
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

            const tree = createHtmlTree({ data: [] });

            tree.setOption("dataUrl", "/tree/");
            tree.loadDataFromUrl();
            await screen.findByText("node1");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("reloads the data from the server", async () => {
            server.use(
                http.get("/tree2/", () => HttpResponse.json(exampleData)),
            );

            const tree = createHtmlTree({ dataUrl: "/tree2/" });
            await screen.findByText("node1");

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.removeNode(node1);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node2" }),
            ]);

            tree.loadDataFromUrl();
            await screen.findByText("node1");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("calls onFinished with an onFinished parameter", async () => {
            server.use(
                http.get("/tree2/", () => HttpResponse.json(exampleData)),
            );

            const tree = createHtmlTree({ dataUrl: "/tree2/" });
            await screen.findByText("node1");

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.removeNode(node1);

            const handleFinished = vi.fn();

            tree.loadDataFromUrl(undefined, undefined, handleFinished);

            await waitFor(() => {
                expect(handleFinished).toHaveBeenCalledExactlyOnceWith();
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("doesn't load the data when there is no url", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(() => {
                tree.loadDataFromUrl();
            }).not.toThrow();

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("moveDown", () => {
        it("selects the next node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);

            tree.moveDown();

            expect(tree.getSelectedNode()).toMatchObject({ name: "node2" });
        });

        it("does nothing when no node is selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.moveDown();

            expect(tree.getSelectedNode()).toBeFalse();
        });
    });

    describe("moveNode", () => {
        it("moves node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            const node2 = tree.getNodeByNameMustExist("node2");
            tree.moveNode(child1, node2, "after");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "child2" })],
                    name: "node1",
                }),
                expect.objectContaining({ name: "node2" }),
                expect.objectContaining({ name: "child1" }),
            ]);
        });
    });

    describe("moveUp", () => {
        it("selects the previous node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node2 = tree.getNodeByNameMustExist("node2");
            tree.selectNode(node2);

            tree.moveUp();

            expect(tree.getSelectedNode()).toMatchObject({ name: "node1" });
        });

        it("does nothing when no node is selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.moveUp();

            expect(tree.getSelectedNode()).toBeFalse();
        });
    });

    describe("openNode", () => {
        it("opens the node", () => {
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.openNode(node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaExpanded();
        });

        it("calls the function with onFinished parameter", async () => {
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            const onFinished = vi.fn();

            tree.openNode(node1, onFinished);

            await waitFor(() => {
                expect(onFinished).toHaveBeenCalledExactlyOnceWith(node1);
            });
        });

        it("handles an empty folder", () => {
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            const child1 = tree.getNodeByNameMustExist("child1");
            child1.isEmptyFolder = true;

            expect(() => {
                tree.openNode(child1, false);
            }).not.toThrow();
        });
    });

    describe("prependNode", () => {
        it("prepends the node to the root node", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.prependNode("prepended-node", tree.tree);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "prepended-node" }),
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("prepends the node to the parent with a parent node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const parent = tree.getNodeByNameMustExist("node1");
            tree.prependNode("prepended-node", parent);

            expect(htmlElement).toHaveTreeStructure([
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

    describe("refreshElements", () => {
        it("rerenders the tree", () => {
            const tree = createHtmlTree({ data: exampleData });

            tree.getNodeByNameMustExist("node1").name = "node1a";

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);

            tree.refreshElements(null);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1a" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("rerenders a subtree with a node parameter", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.getNodeByNameMustExist("child1").name = "child1a";

            tree.refreshElements(node1);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "child1a" }),
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
    });

    describe("removeFromSelection", () => {
        it("deselects a node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const child1 = tree.getNodeByNameMustExist("child1");
            const child2 = tree.getNodeByNameMustExist("child2");
            tree.addToSelection(child1);
            tree.addToSelection(child2);

            expect(tree.isNodeSelected(child1)).toBeTrue();
            expect(tree.isNodeSelected(child2)).toBeTrue();

            tree.removeFromSelection(child2);

            expect(tree.isNodeSelected(child1)).toBeTrue();
            expect(tree.isNodeSelected(child2)).toBeFalse();
        });
    });

    describe("removeNode", () => {
        it("removes the node with a child node", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("child1");
            tree.removeNode(node);

            expect(htmlElement).toHaveTreeStructure([
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
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("child1");
            tree.selectNode(node);

            tree.removeNode(node);

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("removes the node with a parent node and its children", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("node1");
            tree.removeNode(node);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [expect.objectContaining({ name: "node3" })],
                    name: "node2",
                }),
            ]);
        });

        it("removes the node and deselects the child when a child node is selected", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("node1");
            const child1 = tree.getNodeByNameMustExist("child1");
            tree.selectNode(child1);

            tree.removeNode(node);

            expect(tree.getSelectedNode()).toBeFalse();
        });
    });

    describe("scrollToNode", () => {
        it("handles a node without an element", () => {
            const tree = createHtmlTree({ data: exampleData });

            const node = tree.getNodeByNameMustExist("child1");
            node.element = undefined;

            expect(() => {
                tree.scrollToNode(node);
            }).not.toThrow();
        });
    });

    describe("selectNode", () => {
        it("selects the node and deselects the previous node when another node is selected", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            const node2 = tree.getNodeByNameMustExist("node2");
            tree.selectNode(node2);
            tree.selectNode(node1);

            const treeItem1 = screen.getByRole("treeitem", { name: "node1" });
            const treeItem2 = screen.getByRole("treeitem", { name: "node2" });

            expect(treeItem1).toBeAriaSelected();
            expect(treeItem2).not.toBeAriaSelected();
        });

        it("selects the node when the node is not selected", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaSelected();
        });

        it("deselects the node when the node is selected twice", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);
            tree.selectNode(node1);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaSelected();
        });

        it("keeps the node selected when the node is selected twice and mustToggle is false", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);
            tree.selectNode(node1, { mustToggle: false });

            expect(tree.getSelectedNode()).toBe(node1);
        });

        it("deselects the current node with a null parameter", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);

            tree.selectNode(null);

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("doesn't select the node when the selectable option is false", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: false,
            });

            tree.selectNode(tree.getNodeByNameMustExist("node1"));

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("doesn't select the node when onCanSelectNode returns false", () => {
            const tree = createHtmlTree({
                data: exampleData,
                onCanSelectNode: () => false,
                selectable: true,
            });

            tree.selectNode(tree.getNodeByNameMustExist("node1"));

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("opens the parent node when it's closed", () => {
            const tree = createHtmlTree({
                data: exampleData,
                selectable: true,
            });

            const node1 = tree.getNodeByNameMustExist("node1");

            expect(node1.is_open).toBeFalsy();

            const child1 = tree.getNodeByNameMustExist("child1");
            tree.selectNode(child1);

            expect(node1.is_open).toBeTrue();
        });
    });

    describe("setOption", () => {
        it("sets an option", async () => {
            const tree = createHtmlTree({
                animationSpeed: 0,
                data: exampleData,
                selectable: false,
            });

            tree.setOption("selectable", true);
            await userEvent.click(
                screen.getByRole("treeitem", { name: "node1" }),
            );

            expect(tree.getSelectedNode()).toMatchObject({ name: "node1" });
        });
    });

    describe("setState", () => {
        it("sets the state", () => {
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
                selectable: true,
            });

            tree.setState({
                open_nodes: [123],
                selected_node: [123],
            });

            expect(htmlElement).toHaveTreeStructure([
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
    });

    describe("toggle", () => {
        it("opens the node when the node is closed", () => {
            const tree = createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.toggle(node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaExpanded();
        });

        it("closes the node when the node is open", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.toggle(node1, false);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).not.toBeAriaExpanded();
        });
    });

    describe("toJson", () => {
        it("returns nodes as json", () => {
            const tree = createHtmlTree({ data: exampleData });

            expect(tree.toJson()).toBe(
                '[{"id":123,"name":"node1","intProperty":1,"strProperty":"1","children":[{"id":125,"name":"child1","intProperty":2},{"id":126,"name":"child2"}]},{"id":124,"name":"node2","intProperty":3,"strProperty":"3","children":[{"id":127,"name":"node3","children":[{"id":128,"name":"child3"}]}]}]',
            );
        });

        it("returns an empty array for an empty tree", () => {
            const tree = createHtmlTree({ data: [] });

            expect(tree.toJson()).toBe("[]");
        });
    });

    describe("updateNode", () => {
        it("updates the name with a string", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.updateNode(node, "updated-node");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("updates the name with an object containing a name", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.updateNode(node, { name: "updated-node" });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "updated-node" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });

        it("updates the id with an object containing an id", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            const nodeData = { id: 999 };
            tree.updateNode(node, nodeData);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(tree.getNodeById(999)).toMatchObject(nodeData);
            expect(tree.getNodeById(123)).toBeNull();
        });

        it("updates the node with an object containing a property", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.updateNode(node, { color: "green" });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
            expect(tree.getNodeById(123)).toMatchObject({
                color: "green",
                name: "node1",
            });
        });

        it("adds the child node when adding a child to a child node", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("child1");
            tree.updateNode(node, { children: ["new-child"] });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            children: [
                                expect.objectContaining({ name: "new-child" }),
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
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.updateNode(node, { children: [] });

            expect(htmlElement).toHaveTreeStructure([
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
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node);

            tree.updateNode(node, { name: "node1_changed" });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1_changed" }),
                expect.objectContaining({ name: "node2" }),
            ]);

            expect(tree.getSelectedNode()).toStrictEqual(node);
        });

        it("keeps the focus on the node when the node was selected", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node);
            tree.updateNode(node, { name: "node1_changed" });

            const treeItem = screen.getByRole("treeitem", {
                name: "node1_changed",
            });

            expect(treeItem).toHaveFocus();
        });

        it("leaves the node unchanged with empty data", () => {
            const tree = createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            const node = tree.getNodeByNameMustExist("node1");
            tree.updateNode(node, "");

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });
});
