import "../../tree.jquery";
import { userEvent } from "@testing-library/user-event";
import exampleData from "../support/exampleData";
import { titleSpan, togglerLink } from "../support/testUtil";

beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});

afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
});

it("selects a node and sets the focus when it is clicked", async () => {
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const node = $tree.tree("getNodeByNameMustExist", "node1");

    expect(node.element).not.toBeSelected();
    expect(node.element).not.toBeFocused();

    await userEvent.click(
        titleSpan(node.element as HTMLElement).get(0) as HTMLElement,
    );

    expect(node.element).toBeSelected();
});

it("deselects when a selected node is clicked", async () => {
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const node = $tree.tree("getNodeByNameMustExist", "node1");
    $tree.tree("selectNode", node);

    expect(node.element).toBeSelected();

    await userEvent.click(
        titleSpan(node.element as HTMLElement).get(0) as HTMLElement,
    );

    expect(node.element).not.toBeSelected();
});

it("opens a node when the toggle button is clicked", async () => {
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const node = $tree.tree("getNodeByNameMustExist", "node1");

    expect(node.element).not.toBeOpen();

    await userEvent.click(
        togglerLink(node.element as HTMLElement).get(0) as HTMLElement,
    );

    expect(node.element).toBeOpen();
});

it("doesn't select a node when it is opened", async () => {
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const node = $tree.tree("getNodeByNameMustExist", "node1");

    expect(node.element).not.toBeSelected();
    expect(node.element).not.toBeOpen();

    await userEvent.click(
        togglerLink(node.element as HTMLElement).get(0) as HTMLElement,
    );

    expect(node.element).not.toBeSelected();
    expect(node.element).toBeOpen();
});

it("keeps it selected when a selected node is opened", async () => {
    const $tree = $("#tree1");
    $tree.tree({ data: exampleData });

    const node = $tree.tree("getNodeByNameMustExist", "node1");
    $tree.tree("selectNode", node);

    expect(node.element).toBeSelected();
    expect(node.element).not.toBeOpen();

    await userEvent.click(
        togglerLink(node.element as HTMLElement).get(0) as HTMLElement,
    );

    expect(node.element).toBeSelected();
    expect(node.element).toBeOpen();
});
