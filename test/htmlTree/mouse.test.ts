import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";

import type { HtmlTreeOptions } from "htmlTree/options";

import HtmlTree from "htmlTree";

import exampleData from "../support/exampleData";
import { getTreeButton } from "../support/queries";

describe("mouse", () => {
  let htmlElement: HTMLElement;
  let htmlTree: HtmlTree | undefined;

  const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
    htmlTree = new HtmlTree({ htmlElement, options });

    return htmlTree;
  };

  beforeEach(() => {
    document.body.innerHTML = "";

    htmlElement = document.createElement("div");
    document.body.append(htmlElement);
  });

  afterEach(() => {
    htmlTree?.deinit();
    htmlTree = undefined;

    document.body.innerHTML = "";
  });

  it("selects a node and sets the focus when it is clicked", async () => {
    createHtmlTree({ data: exampleData });

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).not.toBeAriaSelected();
    expect(treeItem).not.toHaveFocus();

    await userEvent.click(treeItem);

    expect(treeItem).toBeAriaSelected();
    expect(treeItem).toHaveFocus();
  });

  it("deselects when a selected node is clicked", async () => {
    const tree = createHtmlTree({ data: exampleData });

    const node = tree.getNodeByNameMustExist("node1");
    tree.selectNode(node);

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).toBeAriaSelected();

    await userEvent.click(treeItem);

    expect(treeItem).not.toBeAriaSelected();
  });

  it("opens a node when the toggle button is clicked", async () => {
    createHtmlTree({ data: exampleData });

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).not.toBeAriaExpanded();

    await userEvent.click(getTreeButton(treeItem));

    await waitFor(() => {
      expect(treeItem).toBeAriaExpanded();
    });
  });

  it("closes a node when the toggle button of an open node is clicked", async () => {
    createHtmlTree({ autoOpen: true, data: exampleData });

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).toBeAriaExpanded();

    await userEvent.click(getTreeButton(treeItem));

    await waitFor(() => {
      expect(treeItem).not.toBeAriaExpanded();
    });
  });

  it("doesn't select a node when it is opened", async () => {
    createHtmlTree({ data: exampleData });

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).not.toBeAriaSelected();
    expect(treeItem).not.toBeAriaExpanded();

    await userEvent.click(getTreeButton(treeItem));

    await waitFor(() => {
      expect(treeItem).toBeAriaExpanded();
    });

    expect(treeItem).not.toBeAriaSelected();
  });

  it("keeps it selected when a selected node is opened", async () => {
    const tree = createHtmlTree({ data: exampleData });

    const node = tree.getNodeByNameMustExist("node1");
    tree.selectNode(node);

    const treeItem = screen.getByRole("treeitem", { name: "node1" });

    expect(treeItem).toBeAriaSelected();
    expect(treeItem).not.toBeAriaExpanded();

    await userEvent.click(getTreeButton(treeItem));

    await waitFor(() => {
      expect(treeItem).toBeAriaExpanded();
    });

    expect(treeItem).toBeAriaSelected();
  });

  it("doesn't select a node when the selectable option is false", async () => {
    const tree = createHtmlTree({ data: exampleData, selectable: false });

    await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

    expect(tree.getSelectedNode()).toBeFalse();
  });
});
