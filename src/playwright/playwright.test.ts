/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />

import getGiven from "givens";
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
import { matchScreenshot } from "./visualRegression";

interface Vars {
    dragAndDrop: boolean;
}

const given = getGiven<Vars>();
given("dragAndDrop", () => false);

beforeEach(async () => {
    await jestPlaywright.resetPage();

    await page.goto("http://localhost:8080/test_index.html");
    await page.waitForLoadState("domcontentloaded");

    // Fix error on iphone6 device when collecting coverage
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        (window as any)["reportCodeCoverage"] = () => null;
    });

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

describe("dragAndDrop", () => {
    given("dragAndDrop", () => true);

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
                        expect.objectContaining({
                            name: "Pachycephalosaurians",
                        }),
                        expect.objectContaining({ name: "Ceratopsians" }),
                    ],
                }),
            ]);
        });

        await matchScreenshot("moves_a_node");
    });
});
