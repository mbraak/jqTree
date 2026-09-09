import { screen } from "@testing-library/dom";

import "app/tree.jquery";

import exampleData from "../support/exampleData";

/* jqTree keeps the class names of jqtree 1.x: the classes are derived from the
 * "jqtree" prefix, the root element gets "jqtree-tree" and every element gets
 * "jqtree_common".
 */
describe("class names", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tree1"></div>';
    });

    afterEach(() => {
        const $tree = $("#tree1");
        $tree.tree("destroy");
        document.body.innerHTML = "";
    });

    const getElementDiv = (name: string) => {
        const title = screen.getByRole("treeitem", { name });

        // eslint-disable-next-line testing-library/no-node-access
        return title.parentElement as HTMLElement;
    };

    const getLi = (name: string) => {
        // eslint-disable-next-line testing-library/no-node-access
        return getElementDiv(name).parentElement as HTMLElement;
    };

    const getToggler = (name: string) => {
        // eslint-disable-next-line testing-library/no-node-access
        return getElementDiv(name).querySelector("a") as HTMLElement;
    };

    it("sets the class names of the tree element", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        expect(screen.getByRole("tree")).toHaveClass(
            "jqtree_common",
            "jqtree-tree",
        );
    });

    it("sets the class name of a child list", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        for (const group of screen.getAllByRole("group")) {
            expect(group).toHaveClass("jqtree_common");
        }
    });

    it("sets the class names of a folder", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        expect(getLi("node1")).toHaveClass(
            "jqtree_common",
            "jqtree-folder",
            "jqtree-closed",
        );
    });

    it("sets the class names of an open folder", () => {
        const $tree = $("#tree1");
        $tree.tree({ autoOpen: 0, data: exampleData });

        const li = getLi("node1");

        expect(li).toHaveClass("jqtree_common", "jqtree-folder");
        expect(li).not.toHaveClass("jqtree-closed");
    });

    it("sets the class name of a child node", () => {
        const $tree = $("#tree1");
        $tree.tree({ autoOpen: 0, data: exampleData });

        const li = getLi("child1");

        expect(li).toHaveClass("jqtree_common");
        expect(li).not.toHaveClass("jqtree-folder");
    });

    it("sets the class names of the element of a node", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        expect(getElementDiv("node1")).toHaveClass(
            "jqtree_common",
            "jqtree-element",
        );
    });

    it("sets the class names of the title of a folder", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        expect(screen.getByRole("treeitem", { name: "node1" })).toHaveClass(
            "jqtree_common",
            "jqtree-title",
            "jqtree-title-folder",
            "jqtree-title-button-left",
        );
    });

    it("sets the class names of the title of a child node", () => {
        const $tree = $("#tree1");
        $tree.tree({ autoOpen: 0, data: exampleData });

        const title = screen.getByRole("treeitem", { name: "child1" });

        expect(title).toHaveClass(
            "jqtree_common",
            "jqtree-title",
            "jqtree-title-button-left",
        );
        expect(title).not.toHaveClass("jqtree-title-folder");
    });

    it("sets the class names of the title when buttonLeft is false", () => {
        const $tree = $("#tree1");
        $tree.tree({ buttonLeft: false, data: exampleData });

        expect(screen.getByRole("treeitem", { name: "node1" })).toHaveClass(
            "jqtree-title-button-right",
        );
    });

    it("sets the class names of the toggler", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        expect(getToggler("node1")).toHaveClass(
            "jqtree_common",
            "jqtree-toggler",
            "jqtree-toggler-left",
            "jqtree-closed",
        );
    });

    it("sets the class names of the toggler when buttonLeft is false", () => {
        const $tree = $("#tree1");
        $tree.tree({ buttonLeft: false, data: exampleData });

        expect(getToggler("node1")).toHaveClass(
            "jqtree_common",
            "jqtree-toggler",
            "jqtree-toggler-right",
        );
    });

    it("sets the class name of a selected node", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData });

        const node1 = $tree.tree("getNodeByNameMustExist", "node1");
        $tree.tree("selectNode", node1);

        expect(getLi("node1")).toHaveClass("jqtree-selected");
    });

    it("sets the rtl class name when the rtl option is true", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData, rtl: true });

        expect(screen.getByRole("tree")).toHaveClass("jqtree-rtl");
    });

    it("sets the dnd class name when the dragAndDrop option is true", () => {
        const $tree = $("#tree1");
        $tree.tree({ data: exampleData, dragAndDrop: true });

        expect(screen.getByRole("tree")).toHaveClass("jqtree-dnd");
    });

    it("ignores the classPrefix, commonClassName and treeClassName options", () => {
        const $tree = $("#tree1");

        // These options are not part of the jqTree api; a plain javascript
        // caller can still pass them, and jqTree must ignore them.
        $tree.tree({
            classPrefix: "other-prefix",
            commonClassName: "other-common",
            data: exampleData,
            treeClassName: "other-tree",
        } as JQTreeOptions);

        expect(screen.getByRole("tree")).toHaveClass(
            "jqtree_common",
            "jqtree-tree",
        );
        expect(getLi("node1")).toHaveClass("jqtree_common", "jqtree-folder");
    });
});
