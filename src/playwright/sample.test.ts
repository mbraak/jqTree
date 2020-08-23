/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />

import {
    expectToBeClosed,
    expectToBeOpen,
    expectToBeSelected,
    findTitleElement,
    openNode,
} from "./testUtil";

beforeEach(async () => {
    await page.goto("http://localhost:8080/");
});

test("displays a tree", async () => {
    await expect(page).toHaveText("Saurischia");
    await expect(page).toHaveText("Ornithischians");
    await expect(page).toHaveText("Coelophysoids");
});

test("selects a node", async () => {
    await expect(page).toHaveText("Saurischia");
    await findTitleElement("Saurischia").then((el) => el.click());
    await expectToBeSelected("Saurischia");
});

test("opens a node", async () => {
    await expect(page).toHaveText("Saurischia");
    await expectToBeOpen("Saurischia");
    await expectToBeClosed("Theropods");
    await openNode("Theropods");
    await expectToBeOpen("Theropods");
});
