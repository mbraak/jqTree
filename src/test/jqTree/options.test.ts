import * as $ from "jquery";
import getGiven from "givens";
import * as mockjaxFactory from "jquery-mockjax";
import { screen } from "@testing-library/dom";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan, togglerLink } from "../support/testUtil";

const mockjax = mockjaxFactory(jQuery, window);
const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    mockjax.clear();
    localStorage.clear();
});

describe("autoOpen", () => {
    interface Vars {
        autoOpen: boolean | number | string;
        $tree: JQuery<HTMLElement>;
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
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
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
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: false }),
                    ],
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
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
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
                    name: "node2",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "node3", open: true }),
                    ],
                }),
            ]);
        });
    });
});

describe("dataUrl", () => {
    const testCases = [
        {
            name: "string",
            dataUrl: "/tree/",
        },
        {
            name: "object with url and headers",
            dataUrl: {
                url: "/tree/",
                headers: { key1: "value1" },
            },
            checkRequest: (settings: MockJaxSettings) => {
                expect(settings).toMatchObject({
                    headers: { key1: "value1" },
                    method: "GET",
                    url: "/tree/",
                });
            },
        },
        {
            name: "function",
            dataUrl: () => ({ url: "/tree/" }),
        },
    ];

    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    testCases.forEach(({ checkRequest, dataUrl, name }) => {
        function handleResponse(
            this: MockJaxSettings,
            settings: MockJaxSettings
        ) {
            if (checkRequest) {
                checkRequest(settings);
            }

            this.responseText = exampleData;
        }

        context(`with ${name}`, () => {
            it("loads the data from the url", async () => {
                mockjax({
                    url: "/tree/",
                    response: handleResponse,
                    logging: false,
                });

                given.$tree.tree({ dataUrl });
                await screen.findByText("node1");

                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "node1" }),
                    expect.objectContaining({ name: "node2" }),
                ]);
            });
        });
    });
});

describe("onCanSelectNode", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
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
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
            onCreateLi: (node: INode, el: JQuery<HTMLElement>) => {
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
        initialState: string;
        node1: INode;
        $tree: JQuery<HTMLElement>;
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
            })
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
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("when the loading fails", () => {
        beforeEach(() => {
            mockjax({
                url: "/tree/",
                responseText: "",
                status: 500,
                statusText: "Internal server error",
                logging: false,
            });
        });

        it("calls onLoadFailed", () =>
            new Promise((done) => {
                given.$tree.tree({
                    dataUrl: "/tree/",
                    onLoadFailed: (jqXHR) => {
                        expect(jqXHR.status).toBe(500);
                        done();
                    },
                });
            }));
    });
});

describe("rtl", () => {
    interface Vars {
        node1: INode;
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("$tree", () => $("#tree1"));

    context("with the rtl option is true", () => {
        beforeEach(() => {
            given.$tree.tree({ data: exampleData, rtl: true });
        });

        it("has a different closed icon", () => {
            expect(togglerLink(given.node1.element).text()).toEqual("◀");
        });
    });

    context("with the rtl data option", () => {
        beforeEach(() => {
            given.$tree.attr("data-rtl", "true");
            given.$tree.tree({ data: exampleData });
        });

        it("has a different closed icon", () => {
            expect(togglerLink(given.node1.element).text()).toEqual("◀");
        });
    });
});

describe("saveState", () => {
    interface Vars {
        node1: INode;
        saveState: boolean | string;
        $tree: JQuery<HTMLElement>;
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
                expect(localStorage.getItem("tree")).toEqual(
                    '{"open_nodes":[123],"selected_node":[123]}'
                );
            });
        });

        context("when saveState is a string", () => {
            given("saveState", () => "my-state");

            it("uses the string as a key", () => {
                expect(localStorage.getItem("my-state")).toEqual(
                    '{"open_nodes":[123],"selected_node":[123]}'
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
                '{"open_nodes":[123],"selected_node":[123]}'
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
            showEmptyFolder: boolean;
            $tree: JQuery<HTMLElement>;
        }

        const given = getGiven<Vars>();
        given("$tree", () => $("#tree1"));

        beforeEach(() => {
            given.$tree.tree({
                data: [{ name: "parent1", children: [] }],
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
                    expect.objectContaining({ name: "parent1", children: [] }),
                ]);
            });
        });
    });
});
