import { screen, waitFor } from "@testing-library/dom";
import getGiven from "givens";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan, togglerLink } from "../support/testUtil";

const context = describe;

const server = setupServer();

beforeAll(() => {
    server.listen();
});

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    server.resetHandlers();

    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    localStorage.clear();
});

afterAll(() => {
    server.close();
});

describe("autoEscape", () => {
    interface Vars {
        $tree: JQuery;
        autoEscape: boolean;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoEscape: given.autoEscape,
            data: ["<span>test</span>"],
        });
    });

    context("with autoEscape true", () => {
        given("autoEscape", () => true);

        it("escapes the node name", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "&lt;span&gt;test&lt;/span&gt;",
                }),
            ]);
        });
    });

    context("with autoEscape false", () => {
        given("autoEscape", () => false);

        it("doesn't escape the node name", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "<span>test</span>",
                }),
            ]);
        });
    });
});

describe("autoOpen", () => {
    interface Vars {
        $tree: JQuery;
        autoOpen: boolean | number | string;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: exampleData,
        });
    });

    context("with autoOpen false", () => {
        given("autoOpen", () => false);

        it("doesn't open any nodes", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: false }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
        });
    });

    context("with autoOpen true", () => {
        given("autoOpen", () => true);

        it("opens all nodes", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    context("with autoOpen 0", () => {
        given("autoOpen", () => 0);

        it("opens level 0", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node3", open: false }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    context("with autoOpen 1", () => {
        given("autoOpen", () => 1);

        it("opens levels 1", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    context("with autoOpen '1'", () => {
        given("autoOpen", () => "1");

        it("opens levels 1", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
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
        server.use(http.get("/tree/", () => HttpResponse.json(exampleData)));

        const dataFilter = jest.fn((data) => [data[1]]); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return

        const $tree = $("#tree1");
        $tree.tree({
            dataFilter,
            dataUrl: "/tree/",
        });

        await screen.findByText("node2");
        expect(screen.queryByText("node1")).not.toBeInTheDocument();
        expect(dataFilter).toHaveBeenCalledWith(exampleData);
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
            expectedStructure: [expect.objectContaining({ name: "test-node" })],
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

    interface Vars {
        $tree: JQuery;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    testCases.forEach(({ dataUrl, expectedNode, expectedStructure, name }) => {
        context(`with ${name}`, () => {
            it("loads the data from the url", async () => {
                given.$tree.tree({ dataUrl });
                await screen.findByText(expectedNode);

                expect(given.$tree).toHaveTreeStructure(expectedStructure);
            });
        });
    });

    it("loads the data and selects the node when the state contains a selected node", async () => {
        localStorage.setItem("tree", '{"selected_node":[124]}');

        given.$tree.tree({
            dataUrl: { url: "/tree/" },
            saveState: true,
        });

        await screen.findByText("node1");

        expect((given.$tree.tree("getSelectedNode") as INode).name).toBe(
            "node2",
        );
    });

    it("loads the data and doesn't selects a node when the state doesn't contain a selected node", async () => {
        localStorage.setItem("tree", "{}");

        given.$tree.tree({
            dataUrl: { url: "/tree/" },
            saveState: true,
        });

        await screen.findByText("node1");

        expect(given.$tree.tree("getSelectedNode")).toBeFalse();
    });
});

describe("onCanSelectNode", () => {
    interface Vars {
        $tree: JQuery;
        node1: INode;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
            onCanSelectNode: (node: INode) => node.name !== "node1",
        });
    });

    it("doesn't select the node", () => {
        given.$tree.tree("selectNode", given.node1);

        expect(given.$tree.tree("getSelectedNode")).toBe(false);
    });
});

describe("onCreateLi", () => {
    interface Vars {
        $tree: JQuery;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
            onCreateLi: (node: INode, el: JQuery) => {
                titleSpan(el).text(`_${node.name}_`);
            },
        });
    });

    it("is called when creating a node", () => {
        expect(given.$tree).toHaveTreeStructure([
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

    interface Vars {
        $tree: JQuery;
        initialState: string;
        node1: INode;
    }

    const given = getGiven<Vars>();
    given("initialState", () => "");
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        savedState = given.initialState;

        given.$tree.tree({
            autoOpen: false,
            data: exampleData,
            onGetStateFromStorage: getState,
            onSetStateFromStorage: setState,
            saveState: true,
        });
    });

    context("with an open and a selected node", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("openNode", given.node1);
        });

        it("saves the state", () => {
            expect(JSON.parse(savedState)).toEqual({
                open_nodes: [123],
                selected_node: [123],
            });
        });
    });

    context("with a saved state", () => {
        given("initialState", () =>
            JSON.stringify({
                open_nodes: [123],
                selected_node: [123],
            }),
        );

        it("restores the state", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
            expect(given.node1.element).toBeSelected();
        });
    });
});

describe("onLoadFailed", () => {
    interface Vars {
        $tree: JQuery;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("when the loading fails", () => {
        beforeEach(() => {
            server.use(
                http.get(
                    "/tree/",
                    () =>
                        new HttpResponse("Internal server error", {
                            status: 500,
                        }),
                ),
            );
        });

        it("calls onLoadFailed", async () => {
            const onLoadFailed = jest.fn();

            given.$tree.tree({
                dataUrl: "/tree/",
                onLoadFailed,
            });

            await waitFor(() => {
                expect(onLoadFailed).toHaveBeenCalledWith(
                    expect.objectContaining({ status: 500 }),
                );
            });
        });
    });
});

describe("rtl", () => {
    interface Vars {
        $tree: JQuery;
        node1: INode;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    context("with the rtl option is true", () => {
        beforeEach(() => {
            given.$tree.tree({ data: exampleData, rtl: true });
        });

        it("has a different closed icon", () => {
            expect(togglerLink(given.node1.element as HTMLElement).text()).toBe(
                "◀",
            );
        });
    });

    context("with the rtl data option", () => {
        beforeEach(() => {
            given.$tree.attr("data-rtl", "true");
            given.$tree.tree({ data: exampleData });
        });

        it("has a different closed icon", () => {
            expect(togglerLink(given.node1.element as HTMLElement).text()).toBe(
                "◀",
            );
        });
    });
});

describe("saveState", () => {
    interface Vars {
        $tree: JQuery;
        node1: INode;
        saveState: boolean | string;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    context("when a node is open and selected", () => {
        beforeEach(() => {
            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: given.saveState,
            });

            given.$tree.tree("selectNode", given.node1);
            given.$tree.tree("openNode", given.node1);
        });

        context("when saveState is true", () => {
            given("saveState", () => true);

            it("saves the state to local storage", () => {
                expect(localStorage.getItem("tree")).toBe(
                    '{"open_nodes":[123],"selected_node":[123]}',
                );
            });
        });

        context("when saveState is a string", () => {
            given("saveState", () => "my-state");

            it("uses the string as a key", () => {
                expect(localStorage.getItem("my-state")).toBe(
                    '{"open_nodes":[123],"selected_node":[123]}',
                );
            });
        });

        context("when saveState is false", () => {
            given("saveState", () => false);

            it("doesn't save to local storage", () => {
                expect(localStorage.getItem("tree")).toBeNull();
            });
        });
    });

    context("when there is a state in the local storage", () => {
        given("saveState", () => true);

        beforeEach(() => {
            localStorage.setItem(
                "tree",
                '{"open_nodes":[123],"selected_node":[123]}',
            );

            given.$tree.tree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: given.saveState,
            });
        });

        it("restores the state", () => {
            expect(given.$tree).toHaveTreeStructure([
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
});

describe("showEmptyFolder", () => {
    context("when children attribute is an empty array", () => {
        interface Vars {
            $tree: JQuery;
            showEmptyFolder: boolean;
        }

        const given = getGiven<Vars>();
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({
                data: [{ children: [], name: "parent1" }],
                showEmptyFolder: given.showEmptyFolder,
            });
        });

        context("with showEmptyFolder false", () => {
            given("showEmptyFolder", () => false);

            it("creates a child node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "parent1" }),
                ]);
            });
        });

        context("with showEmptyFolder true", () => {
            given("showEmptyFolder", () => true);

            it("creates a folder", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ children: [], name: "parent1" }),
                ]);
            });
        });
    });
});
