/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />

import getGiven from "givens";
import {
    expectToBeClosed,
    expectToBeOpen,
    expectToBeSelected,
    findNodeElement,
    openNode,
    selectNode,
} from "./testUtil";
import { matchScreenshot } from "./visualRegression";

interface Vars {
    dragAndDrop: boolean;
}

const given = getGiven<Vars>();
given("dragAndDrop", () => false);

beforeEach(async () => {
    await page.goto("http://localhost:8080/test_index.html");
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(`
        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: 0,
            data: ExampleData.exampleData,
            dragAndDrop: ${given.dragAndDrop},
        });
        $tree.tree("setMouseDelay", 100);
    `);
});

afterEach(async () => {
    await jestPlaywright.saveCoverage(page);
});

it("displays a tree", async () => {
    await expect(page).toHaveText("Saurischia");
    await expect(page).toHaveText("Ornithischians");
    await expect(page).toHaveText("Coelophysoids");

    await matchScreenshot("displays_a_tree");
});

it("selects a node", async () => {
    await expect(page).toHaveText("Saurischia");
    const saurischia = await findNodeElement("Saurischia");
    await selectNode(saurischia);
    await expectToBeSelected(saurischia);

    await matchScreenshot("selects_a_node");
});

it("opens a node", async () => {
    await expect(page).toHaveText("Saurischia");

    const theropods = await findNodeElement("Theropods");
    await expectToBeClosed(theropods);
    await openNode(theropods);
    await expectToBeOpen(theropods);

    await matchScreenshot("opens_a_node");
});
