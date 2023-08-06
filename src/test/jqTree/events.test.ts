import getGiven from "givens";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/dom";
import "../../tree.jquery";
import exampleData from "../support/exampleData";
import { titleSpan } from "../support/testUtil";

const context = describe;

const server = setupServer();

beforeAll(() => server.listen());

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    server.resetHandlers();

    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

afterAll(() => server.close());

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

    it("fires tree.click", () => {
        const onClick = jest.fn();
        given.$tree.on("tree.click", onClick);

        given.titleSpan.trigger("click");
        expect(onClick).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 })
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

    it("fires tree.contextmenu", () => {
        const onContextMenu = jest.fn();
        given.$tree.on("tree.contextmenu", onContextMenu);

        given.titleSpan.trigger("contextmenu");
        expect(onContextMenu).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 })
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

    it("fires tree.dblclick", () => {
        const onDoubleClick = jest.fn();
        given.$tree.on("tree.dblclick", onDoubleClick);

        given.titleSpan.trigger("dblclick");
        expect(onDoubleClick).toHaveBeenCalledWith(
            expect.objectContaining({ node: given.node1 })
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
        beforeEach(() => {
            server.use(
                rest.get("/tree/", (_request, response, ctx) =>
                    response(ctx.status(200), ctx.json(exampleData))
                )
            );
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
                expect.objectContaining({ tree_data: exampleData })
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

    it("fires tree.select", () => {
        const onSelect = jest.fn();
        given.$tree.on("tree.select", onSelect);

        given.titleSpan.trigger("click");
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                node: given.node1,
                deselected_node: null,
            })
        );
    });

    context("when the node was selected", () => {
        beforeEach(() => {
            given.$tree.tree("selectNode", given.node1);
        });

        it("fires tree.select with node is null", () => {
            const onSelect = jest.fn();
            given.$tree.on("tree.select", onSelect);

            given.titleSpan.trigger("click");
            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    node: null,
                    previous_node: given.node1,
                })
            );
        });
    });
});
