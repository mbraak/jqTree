"use strict";

var _test = require("@playwright/test");
var _testUtils = require("./testUtils");
var _coverage = require("./coverage");
const initPage = async (page, baseURL) => {
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  await page.goto(`${baseURL}/test_index.html`);
  await page.waitForLoadState("domcontentloaded");
  page.on("console", msg => console.log(`console: ${msg.text()}`));
  await page.evaluate(`
        console.log(window.__coverage__ ? 'Coverage enabled' : 'Coverage not enabled');
    `);
};
const initTree = async (page, _ref) => {
  let {
    autoOpen,
    dragAndDrop
  } = _ref;
  await page.evaluate(`
        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: ${autoOpen || 0},
            data: ExampleData.exampleData,
            dragAndDrop: ${dragAndDrop || false},
            startDndDelay: 100,
        });
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
    await initPage(page, baseURL);
    await initTree(page, {
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
    await initPage(page, baseURL);
    await initTree(page, {
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
_test.test.describe("autoscroll when the window is scrollable", () => {
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom ", async _ref9 => {
    let {
      baseURL,
      page
    } = _ref9;
    await page.setViewportSize({
      width: 200,
      height: 100
    });
    await initPage(page, baseURL);
    await initTree(page, {
      autoOpen: 3,
      dragAndDrop: true
    });
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollTop)).toEqual(0);
    await (0, _testUtils.moveMouseToNode)(page, "Saurischia");
    await page.mouse.down();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(200);
    await page.mouse.move(20, 190);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(50);
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  });
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", async _ref10 => {
    let {
      baseURL,
      page
    } = _ref10;
    await page.setViewportSize({
      width: 60,
      height: 400
    });
    await initPage(page, baseURL);
    await initTree(page, {
      autoOpen: 3,
      dragAndDrop: true
    });
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollLeft)).toEqual(0);
    await (0, _testUtils.moveMouseToNode)(page, "Saurischia");
    await page.mouse.down();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(200);
    await page.mouse.move(55, 10);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(50);
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  });
  (0, _test.test)("scrollToNode scrolls to a node", async _ref11 => {
    let {
      baseURL,
      page
    } = _ref11;
    await page.setViewportSize({
      width: 200,
      height: 100
    });
    await initPage(page, baseURL);
    await initTree(page, {
      autoOpen: 3,
      dragAndDrop: true
    });
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollTop)).toEqual(0);
    await page.evaluate(`
            const $tree = jQuery("#tree1");
            const node = $tree.tree("getNodeByName", "Sauropodomorphs");
            $tree.tree("scrollToNode",node);
        `);
    (0, _test.expect)(await page.getByRole("document").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  });
});
_test.test.describe("autoscroll when the container is scrollable", () => {
  _test.test.beforeEach(async _ref12 => {
    let {
      page,
      baseURL
    } = _ref12;
    await initPage(page, baseURL);

    // Add a container and make it the parent of the tree element
    await page.evaluate(`
            document.body.style.marginLeft = "40px";
            document.body.style.marginTop = "40px";

            const treeElement = document.querySelector("#tree1");

            const container = document.createElement("div");
            container.id = "container";
            container.style.height = "200px";
            container.style.width = "60px";
            container.style.overflowY = "scroll";

            document.body.replaceChild(container, treeElement);
            container.appendChild(treeElement);
        `);
    await initTree(page, {
      autoOpen: 3,
      dragAndDrop: true
    });
  });
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom", async _ref13 => {
    let {
      page
    } = _ref13;
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollTop)).toEqual(0);
    await (0, _testUtils.moveMouseToNode)(page, "Saurischia");
    await page.mouse.down();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(200);
    await page.mouse.move(20, 245);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(50);
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  });
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", async _ref14 => {
    let {
      page
    } = _ref14;
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollLeft)).toEqual(0);
    await (0, _testUtils.moveMouseToNode)(page, "Saurischia");
    await page.mouse.down();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(200);
    await page.mouse.move(100, 50);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(50);
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  });
  (0, _test.test)("scrollToNode scrolls to a node", async _ref15 => {
    let {
      page
    } = _ref15;
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollTop)).toEqual(0);
    await page.evaluate(`
            const $tree = jQuery("#tree1");
            const node = $tree.tree("getNodeByName", "Sauropodomorphs");
            $tree.tree("scrollToNode",node);
        `);
    (0, _test.expect)(await page.locator("#container").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  });
});