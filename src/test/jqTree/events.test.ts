import getGiven from "givens";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

const context = describe;

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

describe("tree.click", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.click", async () => {
        const onClick = jest.fn();
        given.$tree.on("tree.click", onClick);

        await userEvent.click(given.titleSpan.get(0) as HTMLElement);
        expect(onClick).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 }),
        );
    });
});

describe("tree.contextmenu", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.contextmenu", async () => {
        const onContextMenu = jest.fn();
        given.$tree.on("tree.contextmenu", onContextMenu);

        await userEvent.pointer({
            target: given.titleSpan.get(0) as HTMLElement,
            keys: "[MouseRight]",
        });
        expect(onContextMenu).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 }),
        );
    });
});

describe("tree.dblclick", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({ data: exampleData });
    });

    it("fires tree.dblclick", async () => {
        const onDoubleClick = jest.fn();
        given.$tree.on("tree.dblclick", onDoubleClick);

        await userEvent.dblClick(given.titleSpan.get(0) as HTMLElement);
        expect(onDoubleClick).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 }),
        );
    });
});

describe("tree.init", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("with json data", () => {
        it("is called", () => {
            const onInit = jest.fn();
            given.$tree.on("tree.init", onInit);

            given.$tree.tree({
                data: exampleData,
            });

            // eslint-disable-next-line jest/prefer-called-with
            expect(onInit).toHaveBeenCalled();
        });
    });

    context("with data loaded from an url", () => {
        const server = setupServer(
            http.get("/tree/", () => HttpResponse.json(exampleData)),
        );
        beforeEach(() => {
            server.listen();
        });

        afterAll(() => {
            server.close();
        });

        it("is called", async () => {
            const onInit = jest.fn();
            given.$tree.on("tree.init", onInit);

            given.$tree.tree({ dataUrl: "/tree/" });

            await waitFor(() => {
                // eslint-disable-next-line jest/prefer-called-with
                expect(onInit).toHaveBeenCalled();
            });
        });
    });
});

describe("tree.load_data", () => {
    interface Vars {
        $tree: JQuery<HTMLElement>;
    }
    const given = getGiven<Vars>();
    given("$tree", () => $("#tree1"));

    context("when the tree is initialized with data", () => {
        it("fires tree.load_data", () => {
            const onLoadData = jest.fn();
            given.$tree.on("tree.load_data", onLoadData);

            given.$tree.tree({ data: exampleData });
            expect(onLoadData).toHaveBeenCalledWith(
                expect.objectContaining({ tree_data: exampleData }),
            );
        });
    });
});

describe("tree.loading_data", () => {
    const server = setupServer(
        http.get("/tree/", () => HttpResponse.json(exampleData)),
    );
    beforeEach(() => {
        server.listen();
    });

    afterAll(() => {
        server.close();
    });

    it("fires tree.loading_data when the data is loading from an url", async () => {
        const $tree = $("#tree1");

        const onLoading = jest.fn();
        $tree.on("tree.loading_data", onLoading);

        $tree.tree({ dataUrl: "/tree/" });

        await waitFor(() => {
            expect(onLoading).toHaveBeenCalledWith(
                expect.objectContaining({
                    element: $tree.get(0),
                    isLoading: true,
                    node: null,
                }),
            );
        });

        await waitFor(() => {
            expect(onLoading).toHaveBeenCalledWith(
                expect.objectContaining({
                    element: $tree.get(0),
                    isLoading: false,
                    node: null,
                }),
            );
        });
    });
});

describe("tree.select", () => {
    interface Vars {
        node1: INode;
        titleSpan: JQuery<HTMLElement>;
        $tree: JQuery<HTMLElement>;
    }

    const given = getGiven<Vars>();
    given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("titleSpan", () => titleSpan(given.node1.element));
    given("$tree", () => $("#tree1"));

    beforeEach(() => {
        given.$tree.tree({
            data: exampleData,
        });
    });

    it("fires tree.select", async () => {
        const onSelect = jest.fn();
        given.$tree.on("tree.select", onSelect);

        await userEvent.click(given.titleSpan.get(0) as HTMLElement);
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                node: given.node1,
                deselected_node: null,
            }),
        );
    });

    context("when the node was selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("fires tree.select with node is null", async () => {
            const onSelect = jest.fn();
            given.$tree.on("tree.select", onSelect);

            await userEvent.click(given.titleSpan.get(0) as HTMLElement);
            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    node: null,
                    previous_node: given.node1,
                }),
            );
        });
    });
});
