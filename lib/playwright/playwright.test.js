"use strict";

var _test = require("@playwright/test");
var _testUtils = require("./testUtils");
var _coverage = require("./coverage");
const initPage = async _ref => {
  let {
    baseURL,
    dragAndDrop,
    page
  } = _ref;
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  await page.goto(`${baseURL}/test_index.html`);
  await page.waitForLoadState("domcontentloaded");
  page.on("console", msg => console.log(`console: ${msg.text()}`));
  await page.evaluate(`
        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: 0,
            data: ExampleData.exampleData,
            dragAndDrop: ${dragAndDrop},
            startDndDelay: 100,
        });
    `);
  await page.evaluate(`
        console.log(window.__coverage__ ? 'Coverage enabled' : 'Coverage not enabled');
    `);
};
_test.test.beforeEach(async _ref2 => {
  let {
    context
  } = _ref2;
  await (0, _coverage.initCoverage)(context);
});
_test.test.afterEach(async _ref3 => {
  let {
    context
  } = _ref3;
  await (0, _coverage.saveCoverage)(context);
});
_test.test.describe("without dragAndDrop", () => {
  _test.test.beforeEach(async _ref4 => {
    let {
      baseURL,
      page
    } = _ref4;
    await initPage({
      baseURL,
      page,
      dragAndDrop: false
    });
  });
  (0, _test.test)("displays a tree", async _ref5 => {
    let {
      page
    } = _ref5;
    await (0, _test.expect)(page.locator("body")).toHaveText(/.*Saurischia.*/);
    await (0, _test.expect)(page.locator("body")).toHaveText(/.*Ornithischians.*/);
    await (0, _test.expect)(page.locator("body")).toHaveText(/.*Coelophysoids.*/);
    const screenshot = await page.screenshot();
    (0, _test.expect)(screenshot).toMatchSnapshot();
  });
  (0, _test.test)("selects a node", async _ref6 => {
    let {
      page
    } = _ref6;
    await (0, _test.expect)(page.locator("body")).toHaveText(/.*Saurischia.*/);
    const saurischia = await (0, _testUtils.findNodeElement)(page, "Saurischia");
    await (0, _testUtils.selectNode)(saurischia);
    const screenshot = await page.screenshot();
    (0, _test.expect)(screenshot).toMatchSnapshot();
  });
});
_test.test.describe("with dragAndDrop", () => {
  _test.test.beforeEach(async _ref7 => {
    let {
      baseURL,
      page
    } = _ref7;
    await initPage({
      baseURL,
      page,
      dragAndDrop: true
    });
  });
  (0, _test.test)("moves a node", async _ref8 => {
    let {
      page
    } = _ref8;
    await (0, _testUtils.dragAndDrop)(page, "Herrerasaurians", "Ornithischians");
    const structure = await (0, _testUtils.getTreeStructure)(page);
    (0, _test.expect)(structure).toEqual([_test.expect.objectContaining({
      name: "Saurischia",
      children: [_test.expect.objectContaining({
        name: "Theropods"
      }), _test.expect.objectContaining({
        name: "Sauropodomorphs"
      })]
    }), _test.expect.objectContaining({
      name: "Ornithischians",
      children: [_test.expect.objectContaining({
        name: "Herrerasaurians"
      }), _test.expect.objectContaining({
        name: "Heterodontosaurids"
      }), _test.expect.objectContaining({
        name: "Thyreophorans"
      }), _test.expect.objectContaining({
        name: "Ornithopods"
      }), _test.expect.objectContaining({
        name: "Pachycephalosaurians"
      }), _test.expect.objectContaining({
        name: "Ceratopsians"
      })]
    })]);
    const screenshot = await page.screenshot();
    (0, _test.expect)(screenshot).toMatchSnapshot();
  });
});