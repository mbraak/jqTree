import { screen, waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import "app/tree.jquery";

import exampleData from "../support/exampleData";
import { titleSpan, togglerLink } from "../support/testUtil";

const server = setupServer();

describe("options", () => {
    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        const element = document.createElement("div");
        element.id = "tree1";
        document.body.appendChild(element);
    });

    afterEach(() => {
        server.resetHandlers();

        const $tree = $("#tree1");
        $tree.tree("destroy");
        (document.getElementById("tree1") as HTMLElement).remove(); // eslint-disable-line testing-library/no-node-access
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    describe("autoEscape", () => {
        it("escapes the node name when autoEscape is true", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoEscape: true,
                data: ["<span>test</span>"],
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "&lt;span&gt;test&lt;/span&gt;",
                }),
            ]);
        });

        it("doesn't escape the node name when autoEscape is false", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoEscape: false,
                data: ["<span>test</span>"],
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "<span>test</span>",
                }),
            ]);
        });
    });

    describe("autoOpen", () => {
        it("doesn't open any nodes with autoOpen false", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: false }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
        });

        it("opens all nodes with autoOpen true", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: true,
                data: exampleData,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens level 0 with autoOpen 0", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: 0,
                data: exampleData,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: false,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens levels 1 with autoOpen 1", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: 1,
                data: exampleData,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens levels 1 with autoOpen '1'", () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: "1",
                data: exampleData,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    describe("buttonLeft", () => {
        it("renders the button on the right when buttonLeft is false", () => {
            const $tree = $("#tree1");
            $tree.tree({
                buttonLeft: false,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByName", "node1");
            const liElement = node?.element as HTMLElement;
            const spanElement = titleSpan(liElement);

            // eslint-disable-next-line testing-library/no-node-access
            const nextSibling = spanElement.nextSibling as HTMLElement;

            expect(nextSibling).toHaveClass("jqtree-toggler");
        });

        it("renders the button on the left when buttonLeft is true", () => {
            const $tree = $("#tree1");
            $tree.tree({
                buttonLeft: true,
                data: exampleData,
            });

            const node = $tree.tree("getNodeByName", "node1");
            const liElement = node?.element as HTMLElement;
            const spanElement = titleSpan(liElement);

            // eslint-disable-next-line testing-library/no-node-access
            const nextSibling = spanElement.previousSibling as HTMLElement;

            expect(nextSibling).toHaveClass("jqtree-toggler");
        });
    });

    describe("closedIcon", () => {
        it("renders a string", () => {
            const $tree = $("#tree1");
            $tree.tree({
                closedIcon: "closed",
                data: exampleData,
            });

            const $button = $tree.find("a.jqtree-toggler:first");

            expect($button.text()).toBe("closed");
        });

        it("escapes html", () => {
            const $tree = $("#tree1");
            $tree.tree({
                closedIcon: "<span>test</span>",
                data: exampleData,
            });

            const $button = $tree.find("a.jqtree-toggler:first");

            expect($button.text()).toBe("<span>test</span>");
        });

        it("renders a jquery element", () => {
            const $tree = $("#tree1");
            $tree.tree({
                closedIcon: $("<span class='abc'>test</span>"),
                data: exampleData,
            });

            const $span = $tree.find("a.jqtree-toggler:first span.abc");

            expect($span.text()).toBe("test");
        });

        it("renders a html element", () => {
            const icon = document.createElement("span");
            icon.className = "abc";
            icon.textContent = "test";

            const $tree = $("#tree1");
            $tree.tree({
                closedIcon: icon,
                data: exampleData,
            });

            const $span = $tree.find("a.jqtree-toggler:first span.abc");

            expect($span.text()).toBe("test");
        });

        it("renders a default when the option is empty", () => {
            const $tree = $("#tree1");
            $tree.tree({
                closedIcon: undefined,
                data: exampleData,
            });

            const $span = $tree.find("a.jqtree-toggler:first");

            expect($span.text()).toBe("►");
        });
    });

    describe("dataFilter", () => {
        it("changes the loaded data", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            const dataFilter = vi.fn((data) => [
                (data as number[])[1] as unknown as NodeData,
            ]);

            const $tree = $("#tree1");
            $tree.tree({
                dataFilter,
                dataUrl: "/tree/",
            });

            await screen.findByText("node2");

            expect(screen.queryByText("node1")).not.toBeInTheDocument();
            expect(dataFilter).toHaveBeenCalledExactlyOnceWith(exampleData);
        });
    });

    describe("dataUrl", () => {
        const exampleStructure = [
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ];

        const testCases = [
            {
                dataUrl: "/tree/",
                expectedNode: "node1",
                expectedStructure: exampleStructure,
                name: "string",
            },
            {
                dataUrl: {
                    headers: { node: "test-node" },
                    url: "/tree/",
                },
                expectedNode: "test-node",
                expectedStructure: [
                    expect.objectContaining({ name: "test-node" }),
                ],
                name: "object with url and headers",
            },
            {
                dataUrl: () => ({ url: "/tree/" }),
                expectedNode: "node1",
                expectedStructure: exampleStructure,
                name: "function",
            },
        ];

        beforeEach(() => {
            server.use(
                http.get("/tree/", ({ request }) => {
                    const nodeName = request.headers.get("node");
                    const data = nodeName ? [nodeName] : exampleData;

                    return HttpResponse.json(data);
                }),
            );
        });

        testCases.forEach(
            ({ dataUrl, expectedNode, expectedStructure, name }) => {
                it(`loads the data from the url with ${name}`, async () => {
                    const $tree = $("#tree1");
                    $tree.tree({ dataUrl });
                    await screen.findByText(expectedNode);

                    expect($tree).toHaveTreeStructure(expectedStructure);
                });
            },
        );

        it("loads the data and selects the node when the state contains a selected node", async () => {
            localStorage.setItem("tree", '{"selected_node":[124]}');

            const $tree = $("#tree1");
            $tree.tree({
                dataUrl: "/tree/",
                saveState: true,
            });

            await screen.findByText("node1");

            expect(($tree.tree("getSelectedNode") as INode).name).toBe(
                "node2",
            );
        });

        it("loads the data and doesn't selects a node when the state doesn't contain a selected node", async () => {
            localStorage.setItem("tree", "{}");

            const $tree = $("#tree1");
            $tree.tree({
                dataUrl: "/tree/",
                saveState: true,
            });

            await screen.findByText("node1");

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });
    });

    describe("data-url in html", () => {
        it("loads the data from the url", async () => {
            server.use(
                http.get(
                    "/tree",
                    () => HttpResponse.json(exampleData)
                ),
            );

            const $tree = $("#tree1");
            const treeElement = $tree.get(0) as HTMLElement;
            treeElement.dataset.url = "/tree";

            $tree.tree();

            await screen.findByText("node1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("onCanSelectNode", () => {
        it("doesn't select the node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                onCanSelectNode: (node: INode) => node.name !== "node1",
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);

            expect($tree.tree("getSelectedNode")).toBeFalse();
        });
    });

    describe("onCreateLi", () => {
        it("is called when creating a node", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: exampleData,
                onCreateLi: (node: INode, el: JQuery) => {
                    titleSpan(el.get(0) as HTMLElement).innerHTML =
                        `_${node.name}_`;
                },
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "_node1_" }),
                expect.objectContaining({ name: "_node2_" }),
            ]);
        });
    });

    describe("onGetStateFromStorage and onSetStateFromStorage", () => {
        let savedState = "";

        const setState = (state: string): void => {
            savedState = state;
        };

        const getState = (): string => savedState;

        const createTree = () => {
            const $tree = $("#tree1");
            $tree.tree({
                autoOpen: false,
                data: exampleData,
                onGetStateFromStorage: getState,
                onSetStateFromStorage: setState,
                saveState: true,
            });

            return $tree;
        };

        beforeEach(() => {
            savedState = "";
        });

        it("saves the state with an open and a selected node", () => {
            const $tree = createTree();
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            $tree.tree("selectNode", node1);
            $tree.tree("openNode", node1);

            expect(JSON.parse(savedState)).toStrictEqual({
                open_nodes: [123],
                selected_node: [123],
            });
        });

        it("restores the state with a saved state", () => {
            savedState = JSON.stringify({
                open_nodes: [123],
                selected_node: [123],
            });

            const $tree = createTree();
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
            expect(node1.element).toBeSelectedTreeNode();
        });
    });

    describe("onLoadFailed", () => {
        it("calls onLoadFailed when the loading fails", async () => {
            server.use(
                http.get(
                    "/tree/",
                    () =>
                        new HttpResponse("Internal server error", {
                            status: 500,
                        }),
                ),
            );

            const onLoadFailed = vi.fn();

            const $tree = $("#tree1");
            $tree.tree({
                dataUrl: "/tree/",
                onLoadFailed,
            });

            await waitFor(() => {
                expect(onLoadFailed).toHaveBeenCalledExactlyOnceWith(
                    expect.objectContaining({ status: 500 }),
                );
            });
        });
    });

    describe("rtl", () => {
        it("has a different closed icon when the rtl option is true", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData, rtl: true });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                togglerLink(node1.element as HTMLElement).innerHTML,
            ).toBe("◀");
        });

        it("has the default closed icon when the rtl option is false", () => {
            const $tree = $("#tree1");
            $tree.tree({ data: exampleData, rtl: false });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                togglerLink(node1.element as HTMLElement).innerHTML,
            ).toBe("►");
        });

        it("has a different closed icon when the rtl data option is true", () => {
            const $tree = $("#tree1");
            $tree.attr("data-rtl", "true");
            $tree.tree({ data: exampleData });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                togglerLink(node1.element as HTMLElement).innerHTML,
            ).toBe("◀");
        });

        it("has the default closed icon when the rtl data option is false", () => {
            const $tree = $("#tree1");
            $tree.attr("data-rtl", "false");
            $tree.tree({ data: exampleData });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                togglerLink(node1.element as HTMLElement).innerHTML,
            ).toBe("►");
        });

        it("has a different closed icon when the rtl data option has no value", () => {
            const $tree = $("#tree1");
            $tree.attr("data-rtl", "");
            $tree.tree({ data: exampleData });
            const node1 = $tree.tree("getNodeByNameMustExist", "node1");

            expect(
                togglerLink(node1.element as HTMLElement).innerHTML,
            ).toBe("◀");
        });
    });

    describe("saveState", () => {
        const createTreeWithOpenSelectedNode = (
            saveState: boolean | string,
        ) => {
            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState,
            });

            const node1 = $tree.tree("getNodeByNameMustExist", "node1");
            $tree.tree("selectNode", node1);
            $tree.tree("openNode", node1);

            return $tree;
        };

        it("saves the state to local storage when saveState is true", () => {
            createTreeWithOpenSelectedNode(true);

            expect(localStorage.getItem("tree")).toBe(
                '{"open_nodes":[123],"selected_node":[123]}',
            );
        });

        it("uses the string as a key when saveState is a string", () => {
            createTreeWithOpenSelectedNode("my-state");

            expect(localStorage.getItem("my-state")).toBe(
                '{"open_nodes":[123],"selected_node":[123]}',
            );
        });

        it("doesn't save to local storage when saveState is false", () => {
            createTreeWithOpenSelectedNode(false);

            expect(localStorage.getItem("tree")).toBeNull();
        });

        it("restores the state when there is a state in the local storage", () => {
            localStorage.setItem(
                "tree",
                '{"open_nodes":[123],"selected_node":[123]}',
            );

            const $tree = $("#tree1");
            $tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: true,
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
    });

    describe("showEmptyFolder", () => {
        it("creates a child node with showEmptyFolder false", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: [{ children: [], name: "parent1" }],
                showEmptyFolder: false,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({ name: "parent1" }),
            ]);
        });

        it("creates a folder with showEmptyFolder true", () => {
            const $tree = $("#tree1");
            $tree.tree({
                data: [{ children: [], name: "parent1" }],
                showEmptyFolder: true,
            });

            expect($tree).toHaveTreeStructure([
                expect.objectContaining({
                    children: [],
                    name: "parent1",
                }),
            ]);
        });
    });
});
