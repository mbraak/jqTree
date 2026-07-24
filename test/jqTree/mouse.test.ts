import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import "app/tree.jquery";

import exampleData from "../support/exampleData";
import { getTogglerElement } from "../support/queries";

describe("mouse", () => {
    beforeEach(() => {
        const element = document.createElement("div");
        element.id = "tree1";
        document.body.appendChild(element);
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        (document.getElementById("tree1") as HTMLElement).remove(); // eslint-disable-line testing-library/no-node-access
    });

    it("selects a node and sets the focus when it is clicked", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toBeAriaSelected();
        expect(treeItem).not.toHaveFocus();

        await userEvent.click(treeItem);

        expect(treeItem).toBeAriaSelected();
        expect(treeItem).toHaveFocus();
    });

    it("deselects when a selected node is clicked", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        $tree.tree("selectNode", node);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toBeAriaSelected();

        await userEvent.click(treeItem);

        expect(treeItem).not.toBeAriaSelected();
    });

    it("opens a node when the toggle button is clicked", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toBeAriaExpanded();

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        await userEvent.click(getTogglerElement(node.element as HTMLElement));

        await waitFor(() => {
            expect(treeItem).toBeAriaExpanded();
        });
    });

    it("doesn't select a node when it is opened", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).not.toBeAriaSelected();
        expect(treeItem).not.toBeAriaExpanded();

        await userEvent.click(getTogglerElement(node.element as HTMLElement));

        await waitFor(() => {
            expect(treeItem).toBeAriaExpanded();
        });

        expect(treeItem).not.toBeAriaSelected();
    });

    it("keeps it selected when a selected node is opened", async () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node = $tree.tree("getNodeByNameMustExist", "node1");
        $tree.tree("selectNode", node);

        const treeItem = screen.getByRole("treeitem", { name: "node1" });

        expect(treeItem).toBeAriaSelected();
        expect(treeItem).not.toBeAriaExpanded();

        await userEvent.click(getTogglerElement(node.element as HTMLElement));

        await waitFor(() => {
            expect(treeItem).toBeAriaExpanded();
        });

        expect(treeItem).toBeAriaSelected();
    });
});
