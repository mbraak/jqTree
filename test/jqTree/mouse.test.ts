import { waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import "app/tree.jquery";

import exampleData from "../support/exampleData";
import { titleSpan, togglerLink } from "../support/testUtil";

describe("mouse", () => {
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

        expect(node.element).not.toBeSelectedTreeNode();
        expect(node.element).not.toBeFocusedTreeNode();

        await userEvent.click(titleSpan(node.element as HTMLElement));

        expect(node.element).toBeSelectedTreeNode();
    });

    it("deselects when a selected node is clicked", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        $tree.tree("selectNode", node);

        expect(node.element).toBeSelectedTreeNode();

        await userEvent.click(titleSpan(node.element as HTMLElement));

        expect(node.element).not.toBeSelectedTreeNode();
    });

    it("opens a node when the toggle button is clicked", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");

        expect(node.element).not.toBeOpenTreeNode();

        await userEvent.click(togglerLink(node.element as HTMLElement));

        await waitFor(() => {
            expect(node.element).toBeOpenTreeNode();
        });
    });

    it("doesn't select a node when it is opened", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");

        expect(node.element).not.toBeSelectedTreeNode();
        expect(node.element).not.toBeOpenTreeNode();

        await userEvent.click(togglerLink(node.element as HTMLElement));

        await waitFor(() => {
            expect(node.element).toBeOpenTreeNode();
        });

        expect(node.element).not.toBeSelectedTreeNode();
    });

    it("keeps it selected when a selected node is opened", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        $tree.tree("selectNode", node);

        expect(node.element).toBeSelectedTreeNode();
        expect(node.element).not.toBeOpenTreeNode();

        await userEvent.click(togglerLink(node.element as HTMLElement));

        await waitFor(() => {
            expect(node.element).toBeOpenTreeNode();
        });

        expect(node.element).toBeSelectedTreeNode();
    });
});
