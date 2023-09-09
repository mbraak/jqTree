import { test, expect, Page } from "@playwright/test";
import {
    dragAndDrop,
    findNodeElement,
    getTreeStructure,
    moveMouseToNode,
    selectNode,
} from "./testUtils";
import { initCoverage, saveCoverage } from "./coverage";

interface InitPageParameters {
    autoOpen?: number;
    baseURL?: string;
    dragAndDrop?: boolean;
    page: Page;
}

const initPage = async ({
    autoOpen,
    baseURL,
    dragAndDrop,
    page,
}: InitPageParameters) => {
    if (!baseURL) {
        throw new Error("Missing baseURL");
    }

    await page.goto(`${baseURL}/test_index.html`);
    await page.waitForLoadState("domcontentloaded");

    page.on("console", (msg) => console.log(`console: ${msg.text()}`));

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

    await page.evaluate(`
        console.log(window.__coverage__ ? 'Coverage enabled' : 'Coverage not enabled');
    `);
};

test.beforeEach(async ({ context }) => {
    await initCoverage(context);
});

test.afterEach(async ({ context }) => {
    await saveCoverage(context);
});

test.describe("without dragAndDrop", () => {
    test.beforeEach(async ({ baseURL, page }) => {
        await initPage({ baseURL, page, dragAndDrop: false });
    });

    test("displays a tree", async ({ page }) => {
        await expect(page.locator("body")).toHaveText(/.*Saurischia.*/);
        await expect(page.locator("body")).toHaveText(/.*Ornithischians.*/);
        await expect(page.locator("body")).toHaveText(/.*Coelophysoids.*/);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchSnapshot();
    });

    test("selects a node", async ({ page }) => {
        await expect(page.locator("body")).toHaveText(/.*Saurischia.*/);

        const saurischia = await findNodeElement(page, "Saurischia");
        await selectNode(saurischia);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchSnapshot();
    });
});

test.describe("with dragAndDrop", () => {
    test.beforeEach(async ({ baseURL, page }) => {
        await initPage({ baseURL, page, dragAndDrop: true });
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

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchSnapshot();
    });
});

test.describe("autoscroll", () => {
    test("it scrolls automatically when the users drags an element and the document is scrollable", async ({
        baseURL,
        page,
    }) => {
        await page.setViewportSize({ width: 200, height: 100 });
        await initPage({ baseURL, page, autoOpen: 3, dragAndDrop: true });

        expect(
            await page.evaluate("document.documentElement.scrollTop"),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(200);

        await page.mouse.move(20, 190);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(50);

        expect(
            await page.evaluate("document.documentElement.scrollTop"),
        ).toEqual(20);
    });
});
