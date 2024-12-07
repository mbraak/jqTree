import { DragAndDropHandler } from "../../dragAndDropHandler";
import { Node } from "../../node";
import NodeElement from "../../nodeElement";
import { Position } from "../../position";
import { generateHtmlElementsForTree } from "../support/testUtil";

describe(".refresh", () => {
    it("generates hit areas if there is a current item", () => {
        const getNodeElementForNode = jest.fn();
        const getScrollLeft = jest.fn();
        const openNode = jest.fn();
        const refreshElements = jest.fn();
        const triggerEvent = jest.fn();

        const tree = new Node(null, true);

        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);

        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const elementForTree = generateHtmlElementsForTree(tree);

        const getNodeElement = jest.fn((element) => {
            let resultNode: Node | null = null;

            tree.iterate((node) => {
                if (node.element === element) {
                    resultNode = node;
                    return false;
                }

                return true;
            });

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (resultNode) {
                return new NodeElement({
                    getScrollLeft,
                    node: resultNode,
                    treeElement: elementForTree,
                });
            } else {
                return null;
            }
        });

        const getTree = jest.fn(() => tree);

        const dragAndDropHandler = new DragAndDropHandler({
            getNodeElement,
            getNodeElementForNode,
            getScrollLeft,
            getTree,
            openFolderDelay: false,
            openNode,
            refreshElements,
            slide: false,
            treeElement: elementForTree,
            triggerEvent,
        });

        // Set current item
        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        dragAndDropHandler.mouseCapture(positionInfo);
        expect(dragAndDropHandler.currentItem?.node).toBe(node1);

        // Call refresh
        dragAndDropHandler.refresh();

        expect(dragAndDropHandler.hitAreas).toMatchObject([
            expect.objectContaining({
                bottom: 38,
                node: node2,
                position: Position.Inside,
                top: 20,
            }),
            expect.objectContaining({
                bottom: 56,
                node: node2,
                position: Position.After,
                top: 38,
            }),
        ]);
    });
});
