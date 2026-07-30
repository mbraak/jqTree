import { screen } from "@testing-library/dom";

import type { GetTree, IsNodeSelected } from "app/jqtreeMethodTypes";
import type { IconElement, OnCreateLi } from "app/jqtreeOptions";

import ElementsRenderer from "app/elementsRenderer";
import { Node } from "app/node";

import exampleData from "./support/exampleData";
import { getTreeButton, getTreeListElement } from "./support/queries";

interface CreateRendererParams {
    autoEscape?: boolean;
    buttonLeft?: boolean;
    closedIcon?: IconElement;
    data?: NodeData[];
    dragAndDrop?: boolean;
    getTree?: GetTree;
    isNodeSelected?: IsNodeSelected;
    onCreateLi?: OnCreateLi;
    openedIcon?: IconElement;
    rtl?: boolean;
    showEmptyFolder?: boolean;
    tabIndex?: number;
}

const createRenderer = ({
    autoEscape = true,
    buttonLeft = false,
    closedIcon,
    data = exampleData,
    dragAndDrop = false,
    getTree,
    isNodeSelected = () => false,
    onCreateLi,
    openedIcon,
    rtl,
    showEmptyFolder = false,
    tabIndex,
}: CreateRendererParams = {}) => {
    const tree = new Node().loadFromData(data);

    const element = document.createElement("div");
    document.body.append(element);

    const setNodeElement = vi.fn();

    const renderer = new ElementsRenderer({
        autoEscape,
        buttonLeft,
        closedIcon,
        dragAndDrop,
        getTree: getTree ?? (() => tree),
        htmlElement: element,
        isNodeSelected,
        onCreateLi,
        openedIcon,
        rtl,
        setNodeElement,
        showEmptyFolder,
        tabIndex,
    });

    return { element, renderer, setNodeElement, tree };
};

const getTreeItem = (name: string) => screen.getByRole("treeitem", { name });

describe("render", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("renders from the root when the node is null", () => {
        const { element, renderer } = createRenderer();

        renderer.render(null);

        expect(element).toHaveTreeStructure([
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("renders from the root when the node has no parent", () => {
        const { element, renderer, tree } = createRenderer();

        renderer.render(tree);

        expect(element).toHaveTreeStructure([
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("renders only the node when the node has a parent", () => {
        const { renderer, tree } = createRenderer();
        renderer.renderFromRoot();

        const node1 = tree.getNodeByNameMustExist("node1");
        const node2 = tree.getNodeByNameMustExist("node2");
        const node2Element = node2.element;

        node1.name = "new-name";
        renderer.render(node1);

        expect(getTreeItem("new-name")).toBeInTheDocument();
        expect(node2.element).toBe(node2Element);
    });
});

describe("renderFromNode", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("does nothing when the node has no element", () => {
        const { element, renderer } = createRenderer();

        renderer.renderFromNode(new Node({ name: "node1" }));

        // eslint-disable-next-line testing-library/no-node-access
        expect(element.children).toBeEmpty();
    });

    it("replaces the element of the node", () => {
        const { element, renderer, tree } = createRenderer();
        renderer.renderFromRoot();

        const node = tree.getNodeByNameMustExist("node1");
        const oldElement = node.element as HTMLElement;

        node.name = "new-name";
        renderer.renderFromNode(node);

        expect(node.element).not.toBe(oldElement);
        expect(oldElement).not.toBeInTheDocument();
        expect(element).toHaveTreeStructure([
            expect.objectContaining({ name: "new-name" }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("renders the children of the node", () => {
        const { element, renderer, tree } = createRenderer();
        renderer.renderFromRoot();

        const node = tree.getNodeByNameMustExist("node1");
        node.append({ id: 200, name: "child3" });

        renderer.renderFromNode(node);

        expect(element).toHaveTreeStructure([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "child1" }),
                    expect.objectContaining({ name: "child2" }),
                    expect.objectContaining({ name: "child3" }),
                ],
                name: "node1",
            }),
            expect.objectContaining({ name: "node2" }),
        ]);
    });

    it("keeps the level of the node", () => {
        const { renderer, tree } = createRenderer();
        renderer.renderFromRoot();

        renderer.renderFromNode(tree.getNodeByNameMustExist("node3"));

        expect(getTreeItem("node3")).toHaveAttribute("aria-level", "2");
        expect(getTreeItem("child3")).toHaveAttribute("aria-level", "3");
    });
});

describe("renderFromRoot", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("renders the tree", () => {
        const { element, renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(element).toHaveTreeStructure([
            {
                children: [
                    { name: "child1", nodeType: "child", selected: false },
                    { name: "child2", nodeType: "child", selected: false },
                ],
                name: "node1",
                nodeType: "folder",
                open: false,
                selected: false,
            },
            {
                children: [
                    {
                        children: [
                            {
                                name: "child3",
                                nodeType: "child",
                                selected: false,
                            },
                        ],
                        name: "node3",
                        nodeType: "folder",
                        open: false,
                        selected: false,
                    },
                ],
                name: "node2",
                nodeType: "folder",
                open: false,
                selected: false,
            },
        ]);
    });

    it("removes the elements of a previous render", () => {
        const { element, renderer } = createRenderer();

        renderer.renderFromRoot();
        renderer.renderFromRoot();

        // eslint-disable-next-line testing-library/no-node-access
        expect(element.children).toHaveLength(1);
        expect(screen.getAllByRole("treeitem", { name: "node1" })).toHaveLength(
            1,
        );
    });

    it("renders nothing when there is no tree", () => {
        const { element, renderer } = createRenderer({ getTree: () => null });

        renderer.renderFromRoot();

        // eslint-disable-next-line testing-library/no-node-access
        expect(element.children).toBeEmpty();
    });

    it("calls onCreateLi for every node", () => {
        const onCreateLi = vi.fn();
        const { renderer, tree } = createRenderer({ onCreateLi });

        renderer.renderFromRoot();

        const node = tree.getNodeByNameMustExist("node1");

        expect(onCreateLi).toHaveBeenCalledTimes(6);
        expect(onCreateLi).toHaveBeenCalledWith(node, jQuery(node.element as HTMLElement), false);
    });

    it("renders the root list as a tree", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(screen.getByRole("tree")).toHaveClass(
            "jqtree_common",
            "jqtree-tree",
        );
        expect(screen.getAllByRole("group")).toHaveLength(3);
    });

    it("adds the rtl class to the root list when rtl is true", () => {
        const { renderer } = createRenderer({ rtl: true });

        renderer.renderFromRoot();

        expect(screen.getByRole("tree")).toHaveClass("jqtree-rtl");
        expect(screen.getAllByRole("group")[0]).not.toHaveClass("jqtree-rtl");
    });

    it("doesn't add the rtl class to the root list when rtl is undefined", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(screen.getByRole("tree")).not.toHaveClass("jqtree-rtl");
    });

    it("adds the dnd class to the lists when dragAndDrop is true", () => {
        const { renderer } = createRenderer({ dragAndDrop: true });

        renderer.renderFromRoot();

        expect(screen.getByRole("tree")).toHaveClass("jqtree-dnd");
        expect(screen.getAllByRole("group")[0]).toHaveClass("jqtree-dnd");
    });

    it("doesn't add the dnd class to the lists when dragAndDrop is false", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(screen.getByRole("tree")).not.toHaveClass("jqtree-dnd");
        expect(screen.getAllByRole("group")[0]).not.toHaveClass("jqtree-dnd");
    });

    it("sets the level of the nodes", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(getTreeItem("node1")).toHaveAttribute("aria-level", "1");
        expect(getTreeItem("child1")).toHaveAttribute("aria-level", "2");
        expect(getTreeItem("child3")).toHaveAttribute("aria-level", "3");
    });

    it("renders a closed folder", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        const treeItem = getTreeItem("node1");

        expect(getTreeListElement(treeItem)).toHaveClass(
            "jqtree-folder",
            "jqtree-closed",
        );
        expect(getTreeButton(treeItem)).toHaveClass("jqtree-closed");
        expect(treeItem).not.toBeAriaExpanded();
    });

    it("renders an open folder", () => {
        const { renderer, tree } = createRenderer();
        tree.getNodeByNameMustExist("node1").is_open = true;

        renderer.renderFromRoot();

        const treeItem = getTreeItem("node1");

        expect(getTreeListElement(treeItem)).not.toHaveClass("jqtree-closed");
        expect(getTreeButton(treeItem)).not.toHaveClass("jqtree-closed");
        expect(treeItem).toBeAriaExpanded();
    });

    it("renders a loading folder", () => {
        const { renderer, tree } = createRenderer();
        tree.getNodeByNameMustExist("node1").is_loading = true;

        renderer.renderFromRoot();

        expect(getTreeListElement(getTreeItem("node1"))).toHaveClass(
            "jqtree-loading",
        );
        expect(getTreeListElement(getTreeItem("node2"))).not.toHaveClass(
            "jqtree-loading",
        );
    });

    it("renders a selected folder", () => {
        const { renderer } = createRenderer({
            isNodeSelected: (node) => node.name === "node1",
        });

        renderer.renderFromRoot();

        const treeItem = getTreeItem("node1");

        expect(getTreeListElement(treeItem)).toHaveClass("jqtree-selected");
        expect(treeItem).toBeAriaSelected();
    });

    it("renders a selected child", () => {
        const { renderer } = createRenderer({
            isNodeSelected: (node) => node.name === "child1",
        });

        renderer.renderFromRoot();

        const treeItem = getTreeItem("child1");

        expect(getTreeListElement(treeItem)).toHaveClass("jqtree-selected");
        expect(treeItem).toBeAriaSelected();
        expect(getTreeItem("child2")).not.toBeAriaSelected();
    });

    it("sets the tab index of a selected node", () => {
        const { renderer } = createRenderer({
            isNodeSelected: (node) => node.name === "child1",
            tabIndex: 11,
        });

        renderer.renderFromRoot();

        expect(getTreeItem("child1")).toHaveAttribute("tabindex", "11");
        expect(getTreeItem("child2")).not.toHaveAttribute("tabindex");
    });

    it("doesn't set a tab index when the tabIndex option is undefined", () => {
        const { renderer } = createRenderer({
            isNodeSelected: (node) => node.name === "child1",
        });

        renderer.renderFromRoot();

        expect(getTreeItem("child1")).not.toHaveAttribute("tabindex");
    });

    it("escapes the node name when autoEscape is true", () => {
        const { renderer } = createRenderer({
            autoEscape: true,
            data: ["<span>test</span>"],
        });

        renderer.renderFromRoot();

        expect(getTreeItem("<span>test</span>")).toHaveTextContent(
            "<span>test</span>",
        );
    });

    it("doesn't escape the node name when autoEscape is false", () => {
        const { renderer } = createRenderer({
            autoEscape: false,
            data: ["<span>test</span>"],
        });

        renderer.renderFromRoot();

        const treeItem = getTreeItem("<span>test</span>");

        // eslint-disable-next-line testing-library/no-node-access
        expect(treeItem.querySelector("span")).toHaveTextContent("test");
    });

    it("renders the button on the right when buttonLeft is false", () => {
        const { renderer } = createRenderer({ buttonLeft: false });

        renderer.renderFromRoot();

        const treeItem = getTreeItem("node1");

        expect(treeItem).toHaveClass("jqtree-title-button-right");
        expect(getTreeButton(treeItem)).toHaveClass("jqtree-toggler-right");
        // eslint-disable-next-line testing-library/no-node-access
        expect(treeItem.nextSibling).toHaveClass("jqtree-toggler");
    });

    it("renders the button on the left when buttonLeft is true", () => {
        const { renderer } = createRenderer({ buttonLeft: true });

        renderer.renderFromRoot();

        const treeItem = getTreeItem("node1");

        expect(treeItem).toHaveClass("jqtree-title-button-left");
        expect(getTreeButton(treeItem)).toHaveClass("jqtree-toggler-left");
        // eslint-disable-next-line testing-library/no-node-access
        expect(treeItem.previousSibling).toHaveClass("jqtree-toggler");
    });

    it("renders the closed icon of a closed folder", () => {
        const { renderer } = createRenderer({
            closedIcon: "closed",
            openedIcon: "opened",
        });

        renderer.renderFromRoot();

        expect(getTreeButton(getTreeItem("node1"))).toHaveTextContent("closed");
    });

    it("renders the opened icon of an open folder", () => {
        const { renderer, tree } = createRenderer({
            closedIcon: "closed",
            openedIcon: "opened",
        });
        tree.getNodeByNameMustExist("node1").is_open = true;

        renderer.renderFromRoot();

        expect(getTreeButton(getTreeItem("node1"))).toHaveTextContent("opened");
    });

    it("renders the default icons", () => {
        const { renderer } = createRenderer();

        renderer.renderFromRoot();

        expect(getTreeButton(getTreeItem("node1"))).toHaveTextContent("-");
    });

    it("clones an icon element for every folder", () => {
        const icon = document.createElement("span");
        icon.textContent = "icon";

        const { renderer } = createRenderer({ closedIcon: icon });

        renderer.renderFromRoot();

        const button = getTreeButton(getTreeItem("node1"));

        expect(button).toHaveTextContent("icon");
        expect(button.children[0]).not.toBe(icon);
    });

    it("renders an empty folder as a folder when showEmptyFolder is true", () => {
        const { renderer } = createRenderer({
            data: [{ children: [], name: "node1" }],
            showEmptyFolder: true,
        });

        renderer.renderFromRoot();

        expect(getTreeListElement(getTreeItem("node1"))).toHaveClass(
            "jqtree-folder",
        );
    });

    it("renders an empty folder as a child when showEmptyFolder is false", () => {
        const { renderer } = createRenderer({
            data: [{ children: [], name: "node1" }],
            showEmptyFolder: false,
        });

        renderer.renderFromRoot();

        expect(getTreeListElement(getTreeItem("node1"))).not.toHaveClass(
            "jqtree-folder",
        );
    });
});
