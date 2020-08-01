import * as $ from "jquery";
import getGiven from "givens";
import * as mockjaxFactory from "jquery-mockjax";
import { screen } from "@testing-library/dom";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

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
});

describe("autoOpen", () => {
    interface Vars {
        autoOpen: boolean | number;
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

        test("doesn't open any nodes", () => {
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: false }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
        });
    });

    context("with autoOpen true", () => {
        given("autoOpen", () => true);

        test("opens all nodes", () => {
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

        test("opens level 0", () => {
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

        test("opens levels 1", () => {
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
            test("it loads the data from the url", async () => {
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

    test("is called when creating a node", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({ name: "_node1_" }),
            expect.objectContaining({ name: "_node2_" }),
        ]);
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

        test("calls onLoadFailed", () =>
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

            test("creates a child node", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "parent1" }),
                ]);
            });
        });

        context("with showEmptyFolder true", () => {
            given("showEmptyFolder", () => true);

            test("creates a folder", () => {
                expect(given.$tree).toHaveTreeStructure([
                    expect.objectContaining({ name: "parent1", children: [] }),
                ]);
            });
        });
    });
});
