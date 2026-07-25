import type { HtmlTreeOptions } from "app/htmlTree/options";

import HtmlTree from "app/htmlTree";

import exampleData from "../support/exampleData";

describe("create with data", () => {
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

  it("creates a tree", () => {
    createHtmlTree({ data: exampleData });

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({
        children: [
          expect.objectContaining({ name: "child1" }),
          expect.objectContaining({ name: "child2" }),
        ],
        name: "node1",
        open: false,
        selected: false,
      }),
      expect.objectContaining({
        children: [
          expect.objectContaining({
            children: [expect.objectContaining({ name: "child3" })],
            name: "node3",
            open: false,
          }),
        ],
        name: "node2",
        open: false,
        selected: false,
      }),
    ]);
  });

  it("creates an empty tree without data", () => {
    const tree = createHtmlTree();

    expect(htmlElement).toHaveTreeStructure([]);
    expect(tree.getTree().children).toBeEmpty();
  });
});
