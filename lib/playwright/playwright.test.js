/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getGiven from "givens";
import { dragAndDrop, expectToBeClosed, expectToBeOpen, expectToBeSelected, findNodeElement, getTreeStructure, openNode, selectNode, } from "./testUtil";
import { matchScreenshot } from "./visualRegression";
const given = getGiven();
given("dragAndDrop", () => false);
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield page.goto("http://localhost:8080/test_index.html");
    yield page.waitForLoadState("domcontentloaded");
    yield page.evaluate(`
        const $tree = jQuery("#tree1");

        $tree.tree({
            animationSpeed: 0,
            autoOpen: 0,
            data: ExampleData.exampleData,
            dragAndDrop: ${given.dragAndDrop},
        });
        $tree.tree("setMouseDelay", 100);
    `);
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield jestPlaywright.saveCoverage(page);
}));
it("displays a tree", () => __awaiter(void 0, void 0, void 0, function* () {
    yield expect(page).toHaveText("Saurischia");
    yield expect(page).toHaveText("Ornithischians");
    yield expect(page).toHaveText("Coelophysoids");
    yield matchScreenshot("displays_a_tree");
}));
it("selects a node", () => __awaiter(void 0, void 0, void 0, function* () {
    yield expect(page).toHaveText("Saurischia");
    const saurischia = yield findNodeElement("Saurischia");
    yield selectNode(saurischia);
    yield expectToBeSelected(saurischia);
    yield matchScreenshot("selects_a_node");
}));
it("opens a node", () => __awaiter(void 0, void 0, void 0, function* () {
    yield expect(page).toHaveText("Saurischia");
    const theropods = yield findNodeElement("Theropods");
    yield expectToBeClosed(theropods);
    yield openNode(theropods);
    yield expectToBeOpen(theropods);
    yield matchScreenshot("opens_a_node");
}));
describe("dragAndDrop", () => {
    given("dragAndDrop", () => true);
    it("moves a node", () => __awaiter(void 0, void 0, void 0, function* () {
        yield dragAndDrop("Herrerasaurians", "Ornithischians");
        yield getTreeStructure().then((structure) => {
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
        yield matchScreenshot("moves_a_node");
    }));
});
