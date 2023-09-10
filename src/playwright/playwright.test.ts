import { test, expect, Page } from "@playwright/test";
import {
    dragAndDrop,
    findNodeElement,
    getTreeStructure,
    moveMouseToNode,
    selectNode,
} from "./testUtils";
import { initCoverage, saveCoverage } from "./coverage";

const initPage = async (page: Page, baseURL: string | undefined) => {
    if (!baseURL) {
        throw new Error("Missing baseURL");
    }

    await page.goto(`${baseURL}/test_index.html`);
    await page.waitForLoadState("domcontentloaded");

    page.on("console", (msg) => console.log(`console: ${msg.text()}`));

    await page.evaluate(`
        console.log(window.__coverage__ ? 'Coverage enabled' : 'Coverage not enabled');
    `);
};

interface InitTreeOptions {
    autoOpen?: number;
    dragAndDrop?: boolean;
}

const initTree = async (
    page: Page,
    { autoOpen, dragAndDrop }: InitTreeOptions,
) => {
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

test.beforeEach(async ({ context }) => {
    await initCoverage(context);
});

test.afterEach(async ({ context }) => {
    await saveCoverage(context);
});

test.describe("without dragAndDrop", () => {
    test.beforeEach(async ({ baseURL, page }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: false });
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
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true });
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

test.describe("autoscroll when the window is scrollable", () => {
    test("it scrolls vertically when the users drags an element to the bottom ", async ({
        baseURL,
        page,
    }) => {
        await page.setViewportSize({ width: 200, height: 100 });
        await initPage(page, baseURL);
        await initTree(page, { autoOpen: 3, dragAndDrop: true });

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(200);

        await page.mouse.move(20, 190);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(50);

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollTop),
        ).toBeGreaterThan(0);
    });

    test("it scrolls horizontally when the users drags an element to the right", async ({
        baseURL,
        page,
    }) => {
        await page.setViewportSize({ width: 60, height: 400 });
        await initPage(page, baseURL);
        await initTree(page, { autoOpen: 3, dragAndDrop: true });

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollLeft),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(200);

        await page.mouse.move(55, 10);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(50);

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(0);
    });
});

test.describe("autoscroll when the container is scrollable", () => {
    test.beforeEach(async ({ page, baseURL }) => {
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

        await initTree(page, { autoOpen: 3, dragAndDrop: true });
    });

    test("it scrolls vertically when the users drags an element to the bottom", async ({
        page,
    }) => {
        expect(
            await page
                .locator("#container")
                .evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(200);

        await page.mouse.move(20, 245);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(50);

        expect(
            await page
                .locator("#container")
                .evaluate((element) => element.scrollTop),
        ).toBeGreaterThan(0);
    });

    test("it scrolls horizontally when the users drags an element to the right", async ({
        page,
    }) => {
        expect(
            await page
                .locator("#container")
                .evaluate((element) => element.scrollLeft),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(200);

        await page.mouse.move(100, 50);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await page.waitForTimeout(50);

        expect(
            await page
                .locator("#container")
                .evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(0);
    });
});
