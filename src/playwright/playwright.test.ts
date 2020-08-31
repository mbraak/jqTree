/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />

import {
    dragAndDrop,
    expectToBeClosed,
    expectToBeOpen,
    expectToBeSelected,
    findNodeElement,
    getTreeStructure,
    openNode,
    selectNode,
} from "./testUtil";

beforeEach(async () => {
    await page.goto("http://localhost:8080/test_index.html");
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(`
        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: 0,
            data: ExampleData.exampleData,
            dragAndDrop: true,
        });
        $tree.tree("setMouseDelay", 100);
    `);
});

it("displays a tree", async () => {
    await expect(page).toHaveText("Saurischia");
    await expect(page).toHaveText("Ornithischians");
    await expect(page).toHaveText("Coelophysoids");
});

it("selects a node", async () => {
    await expect(page).toHaveText("Saurischia");
    const saurischia = await findNodeElement("Saurischia");
    await selectNode(saurischia);
    await expectToBeSelected(saurischia);
});

it("opens a node", async () => {
    await expect(page).toHaveText("Saurischia");

    const theropods = await findNodeElement("Theropods");
    await expectToBeClosed(theropods);
    await openNode(theropods);
    await expectToBeOpen(theropods);
});

it("moves a node", async () => {
    await dragAndDrop("Herrerasaurians", "Ornithischians");

    await getTreeStructure().then((structure) => {
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
                    expect.objectContaining({ name: "Pachycephalosaurians" }),
                    expect.objectContaining({ name: "Ceratopsians" }),
                ],
            }),
        ]);
    });
});
