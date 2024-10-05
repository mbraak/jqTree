import { expect, Page, test } from "@playwright/test";

import { initCoverage, saveCoverage } from "./coverage";
import {
    boundingBox,
    dragAndDrop,
    findNodeElement,
    getNodeRect,
    getSelectedNodeName,
    getTreeStructure,
    moveMouseToNode,
    selectNode,
    sleep,
} from "./testUtils";

const initPage = async (page: Page, baseURL: string | undefined) => {
    if (!baseURL) {
        throw new Error("Missing baseURL");
    }

    await page.goto(`${baseURL}/test_index.html`);
    await page.waitForLoadState("domcontentloaded");

    page.on("console", (msg) => {
        console.log(`console: ${msg.text()}`);
    });
};

interface InitTreeOptions {
    autoOpen?: number;
    dragAndDrop?: boolean;
    onCanMove?: boolean;
    onCanMoveTo?: boolean;
}

const initTree = async (
    page: Page,
    { autoOpen, dragAndDrop, onCanMove, onCanMoveTo }: InitTreeOptions,
) => {
    await page.evaluate(`
        const onCanMove = (node) => node.name !== "Herrerasaurians";

        const onCanMoveTo = (node, targetNode) => targetNode.name !== "Ornithischians";

        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: ${autoOpen ?? 0},
            data: ExampleData.exampleData,
            dragAndDrop: ${dragAndDrop ?? false},
            onCanMove: ${onCanMove ? "onCanMove" : "null"},
            onCanMoveTo: ${onCanMoveTo ? "onCanMoveTo" : "null"},
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

        expect(await getSelectedNodeName(page)).toBe("Saurischia");

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchSnapshot();
    });
});

test.describe("with dragAndDrop", () => {
    test("moves a node", async ({ baseURL, page }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true });

        await dragAndDrop(page, "Herrerasaurians", "Ornithischians");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Theropods", open: false }),
                    expect.objectContaining({
                        name: "Sauropodomorphs",
                        open: false,
                    }),
                ],
                name: "Saurischia",
                open: true,
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Herrerasaurians" }),
                    expect.objectContaining({ name: "Heterodontosaurids" }),
                    expect.objectContaining({
                        name: "Thyreophorans",
                        open: false,
                    }),
                    expect.objectContaining({
                        name: "Ornithopods",
                        open: false,
                    }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
                open: true,
            }),
        ]);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchSnapshot();
    });

    test("moves a node with touch events", async ({ baseURL, page }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true });

        const client = await page.context().newCDPSession(page);

        const box1 = await getNodeRect(page, "Herrerasaurians");

        await client.send("Input.dispatchTouchEvent", {
            touchPoints: [{ x: box1.x + 10, y: box1.y + box1.height / 2 }],
            type: "touchStart",
        });

        await sleep(page, 200);

        const box2 = await getNodeRect(page, "Ornithischians");
        await client.send("Input.dispatchTouchEvent", {
            touchPoints: [{ x: box2.x + 10, y: box2.y + box2.height / 2 }],
            type: "touchEnd",
        });

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
                name: "Saurischia",
            }),
            expect.objectContaining({
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
                name: "Ornithischians",
            }),
        ]);
    });

    test("opens a node when a dragged node is hovered over it with a touch event", async ({
        baseURL,
        page,
    }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true });

        const client = await page.context().newCDPSession(page);

        const box1 = await getNodeRect(page, "Herrerasaurians");

        await client.send("Input.dispatchTouchEvent", {
            touchPoints: [{ x: box1.x + 10, y: box1.y + box1.height / 2 }],
            type: "touchStart",
        });

        await sleep(page, 200);

        const box2 = await getNodeRect(page, "Thyreophorans");
        await client.send("Input.dispatchTouchEvent", {
            touchPoints: [{ x: box2.x + 10, y: box2.y + box2.height / 2 }],
            type: "touchMove",
        });

        await sleep(page, 200);

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({
                        name: "Herrerasaurians",
                    }),
                    expect.objectContaining({ name: "Theropods", open: false }),
                    expect.objectContaining({
                        name: "Sauropodomorphs",
                        open: false,
                    }),
                ],
                name: "Saurischia",
                open: true,
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Heterodontosaurids" }),
                    expect.objectContaining({
                        name: "Thyreophorans",
                        open: true,
                    }),
                    expect.objectContaining({
                        name: "Ornithopods",
                        open: false,
                    }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
                open: true,
            }),
        ]);
    });

    test("onCanMove prevents move from a node", async ({ baseURL, page }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true, onCanMove: true });

        await dragAndDrop(page, "Herrerasaurians", "Ornithischians");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Herrerasaurians" }),
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
                name: "Saurischia",
                open: true,
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({
                        name: "Heterodontosaurids",
                    }),
                    expect.objectContaining({
                        name: "Thyreophorans",
                        open: false,
                    }),
                    expect.objectContaining({
                        name: "Ornithopods",
                        open: false,
                    }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
                open: true,
            }),
        ]);
    });

    test("onCanMove doesn't prevent move from another node", async ({
        baseURL,
        page,
    }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true, onCanMove: true });

        await dragAndDrop(page, "Theropods", "Ornithischians");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Herrerasaurians" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
                name: "Saurischia",
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Heterodontosaurids" }),
                    expect.objectContaining({ name: "Thyreophorans" }),
                    expect.objectContaining({ name: "Ornithopods" }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
            }),
        ]);
    });

    test("onCanMoveTo prevents move to a node", async ({ baseURL, page }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true, onCanMoveTo: true });

        await dragAndDrop(page, "Herrerasaurians", "Ornithischians");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Herrerasaurians" }),
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
                name: "Saurischia",
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Heterodontosaurids" }),
                    expect.objectContaining({ name: "Thyreophorans" }),
                    expect.objectContaining({ name: "Ornithopods" }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
            }),
        ]);
    });

    test("onCanMoveTo doesn't prevent move to another node", async ({
        baseURL,
        page,
    }) => {
        await initPage(page, baseURL);
        await initTree(page, { dragAndDrop: true, onCanMoveTo: true });

        await dragAndDrop(page, "Herrerasaurians", "Heterodontosaurids");

        const structure = await getTreeStructure(page);

        expect(structure).toEqual([
            expect.objectContaining({
                children: [
                    expect.objectContaining({ name: "Theropods" }),
                    expect.objectContaining({ name: "Sauropodomorphs" }),
                ],
                name: "Saurischia",
            }),
            expect.objectContaining({
                children: [
                    expect.objectContaining({
                        children: [
                            expect.objectContaining({
                                name: "Herrerasaurians",
                            }),
                        ],
                        name: "Heterodontosaurids",
                    }),
                    expect.objectContaining({ name: "Thyreophorans" }),
                    expect.objectContaining({ name: "Ornithopods" }),
                    expect.objectContaining({
                        name: "Pachycephalosaurians",
                    }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
                name: "Ornithischians",
            }),
        ]);
    });
});

test.describe("autoscroll when the window is scrollable", () => {
    test("it scrolls vertically when the users drags an element to the bottom", async ({
        baseURL,
        page,
    }) => {
        await page.setViewportSize({ height: 100, width: 200 });
        await initPage(page, baseURL);
        await initTree(page, { autoOpen: 3, dragAndDrop: true });

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();

        await sleep(page, 200);

        await page.mouse.move(20, 190);
        await sleep(page, 50);

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
        await page.setViewportSize({ height: 400, width: 60 });
        await initPage(page, baseURL);
        await initTree(page, { autoOpen: 3, dragAndDrop: true });

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollLeft),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();
        await sleep(page, 200);

        await page.mouse.move(55, 10);
        await sleep(page, 50);

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(0);
    });

    test("scrollToNode scrolls to a node", async ({ baseURL, page }) => {
        await page.setViewportSize({ height: 100, width: 200 });
        await initPage(page, baseURL);
        await initTree(page, { autoOpen: 3, dragAndDrop: true });

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await page.evaluate(`
            const $tree = jQuery("#tree1");
            const node = $tree.tree("getNodeByName", "Sauropodomorphs");
            $tree.tree("scrollToNode",node);
        `);

        expect(
            await page
                .getByRole("document")
                .evaluate((element) => element.scrollTop),
        ).toBeGreaterThan(0);
    });
});

test.describe("autoscroll when the container is scrollable vertically", () => {
    test.beforeEach(async ({ baseURL, page }) => {
        await initPage(page, baseURL);

        // Add a container and make it the parent of the tree element
        await page.evaluate(`
            document.body.style.marginLeft = "40px";
            document.body.style.marginTop = "40px";

            const treeElement = document.querySelector("#tree1");

            const container = document.createElement("div");
            container.id = "container";
            container.style.height = "200px";
            container.style.overflowY = "scroll";

            document.body.replaceChild(container, treeElement);
            container.appendChild(treeElement);
        `);

        await initTree(page, { autoOpen: 3, dragAndDrop: true });
    });

    test("it scrolls vertically when the users drags an element to the bottom", async ({
        page,
    }) => {
        const container = page.locator("#container");

        expect(
            await container.evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();
        await sleep(page, 200);

        await page.mouse.move(20, 245);
        await sleep(page, 50);

        expect(
            await container.evaluate((element) => element.scrollTop),
        ).toBeGreaterThan(0);
    });

    test("scrollToNode scrolls to a node", async ({ page }) => {
        const container = page.locator("#container");

        expect(
            await container.evaluate((element) => element.scrollTop),
        ).toEqual(0);

        await page.evaluate(`
            const $tree = jQuery("#tree1");
            const node = $tree.tree("getNodeByName", "Sauropodomorphs");
            $tree.tree("scrollToNode",node);
        `);

        expect(
            await container.evaluate((element) => element.scrollTop),
        ).toBeGreaterThan(0);
    });
});

test.describe("autoscroll when the container is scrollable horizontally", () => {
    test.beforeEach(async ({ baseURL, page }) => {
        await initPage(page, baseURL);

        // Add a container and make it the parent of the tree element
        await page.evaluate(`
            document.body.style.marginLeft = "40px";
            document.body.style.marginTop = "40px";

            const treeElement = document.querySelector("#tree1");

            const container = document.createElement("div");
            container.id = "container";
            container.style.width = "400px";
            container.style.overflowX = "scroll";
            container.classList.add('wide-tree');

            document.body.replaceChild(container, treeElement);
            container.appendChild(treeElement);
        `);

        await initTree(page, { autoOpen: 3, dragAndDrop: true });
    });

    test("it scrolls horizontally when the users drags an element to the right", async ({
        page,
    }) => {
        const container = page.locator("#container");

        expect(
            await container.evaluate((element) => element.scrollLeft),
        ).toEqual(0);

        await moveMouseToNode(page, "Saurischia");
        await page.mouse.down();
        await sleep(page, 200);

        const containerBox = await boundingBox(container);

        await page.mouse.move(
            containerBox.x + containerBox.width,
            containerBox.y + 10,
        );
        await sleep(page, 100);

        expect(
            await container.evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(0);
    });

    test("it moves a node after scrolling horizontally", async ({ page }) => {
        await moveMouseToNode(page, "Coelophysoids");
        await page.mouse.down();
        await sleep(page, 200);

        const container = page.locator("#container");
        const containerBox = await boundingBox(container);

        await page.mouse.move(
            containerBox.x + containerBox.width,
            containerBox.y + 10,
        );

        await page.waitForFunction(() => {
            const container = document.querySelector("#container");

            if (!container) {
                return false;
            }

            return (
                container.scrollLeft >=
                container.scrollWidth - container.clientWidth
            );
        });

        await moveMouseToNode(page, "Tyrannosauroids");
        await page.mouse.down();
        await sleep(page, 200);

        const childrenJson = await page.evaluate<string>(`
            const $tree = jQuery("#tree1");
            const node = $tree.tree("getNodeByName", "Tyrannosauroids");
            const children = node.children.map(child => child.name)
            JSON.stringify(children);
        `);
        expect(JSON.parse(childrenJson)).toEqual(["Coelophysoids"]);
    });
});
