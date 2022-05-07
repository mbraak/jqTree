import { test, expect, Page } from "@playwright/test";
import {
    dragAndDrop,
    findNodeElement,
    getTreeStructure,
    selectNode,
} from "./testUtils";

const initPage = async (page: Page, dragAndDrop: boolean) => {
    await page.goto("http://localhost:8080/test_index.html");
    await page.waitForLoadState("domcontentloaded");

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
};

test.describe("without dragAndDrop", () => {
    test.beforeEach(async ({ page }) => {
        await initPage(page, false);
    });

    test("displays a tree", async ({ page }) => {
        await expect(page.locator("body")).toHaveText(/.*Saurischia.*/);
        await expect(page.locator("body")).toHaveText(/.*Ornithischians.*/);
        await expect(page.locator("body")).toHaveText(/.*Coelophysoids.*/);

        await expect(page.screenshot()).resolves.toMatchSnapshot();
    });

    test("selects a node", async ({ page }) => {
        await expect(page.locator("body")).toHaveText(/.*Saurischia.*/);

        const saurischia = await findNodeElement(page, "Saurischia");
        await selectNode(saurischia);

        await expect(page.screenshot()).resolves.toMatchSnapshot();
    });
});

test.describe("with dragAndDrop", () => {
    test.beforeEach(async ({ page }) => {
        await initPage(page, true);
    });

    test("moves a node", async ({ page }) => {
        await dragAndDrop(page, "Herrerasaurians", "Ornithischians");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                name: "Saurischia",
                children: [
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
            }),
            expect.objectContaining({
                name: "Ornithischians",
                children: [
                    expect.objectContaining({ name: "Herrerasaurians" }),
                    expect.objectContaining({ name: "Heterodontosaurids" }),
                    expect.objectContaining({ name: "Thyreophorans" }),
                    expect.objectContaining({ name: "Ornithopods" }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
            }),
        ]);

        await expect(page.screenshot()).resolves.toMatchSnapshot();
    });
});
