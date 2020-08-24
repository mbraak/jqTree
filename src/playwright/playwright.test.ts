/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />
/// <reference types="expect-playwright" />

import {
    expectToBeClosed,
    expectToBeOpen,
    expectToBeSelected,
    findNodeElement,
    findTitleElement,
    getTreeStructure,
    openNode,
    selectNode,
} from "./testUtil";

beforeEach(async () => {
    await page.goto("http://localhost:8080/");
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
    const fromRect = await findTitleElement("Herrerasaurians").then((handle) =>
        handle.boundingBox()
    );

    const toRect = await findTitleElement("Ornithischians").then((handle) =>
        handle.boundingBox()
    );
    await page.mouse.move(fromRect?.x || 0, fromRect?.y || 0);
    await page.mouse.down();
    await page.mouse.move(toRect?.x || 0, toRect?.y || 0);
    await page.mouse.up();

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
