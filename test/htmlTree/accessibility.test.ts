import axe from "axe-core";

import type { HtmlTreeOptions } from "htmlTree/options";

import HtmlTree from "htmlTree";

import exampleData from "../support/exampleData";

describe("accessibility", () => {
  let htmlElement: HTMLElement;
  let htmlTree: HtmlTree | undefined;

  const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
    htmlTree = new HtmlTree({ htmlElement, options });

    return htmlTree;
  };

  const runAxe = () => {
    const rules = axe.getRules(["cat.color"]).map(({ ruleId: id }) => ({
      enabled: false,
      id,
    }));

    axe.configure({ rules });

    return axe.run();
  };

  beforeEach(() => {
    document.title = "Test title";
    document.body.innerHTML = "";
    document.documentElement.setAttribute("lang", "en");

    const mainElement = document.createElement("main");
    htmlElement = document.createElement("div");
    mainElement.append(htmlElement);
    document.body.append(mainElement);
  });

  afterEach(() => {
    htmlTree?.deinit();
    htmlTree = undefined;

    document.body.innerHTML = "";
  });

  it("has an accessible ui", async () => {
    createHtmlTree({ data: exampleData });

    const results = await runAxe();

    expect(results.violations).toBeEmpty();
  });

  it("has an accessible ui with an open and selected node", async () => {
    const tree = createHtmlTree({ autoOpen: true, data: exampleData });

    tree.selectNode(tree.getNodeByNameMustExist("child1"));

    const results = await runAxe();

    expect(results.violations).toBeEmpty();
  });
});
