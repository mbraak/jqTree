import { DragAndDropHandler } from "../../dragAndDropHandler";
import { GetTree } from "../../jqtreeMethodTypes";
import { Node } from "../../node";
import NodeElement from "../../nodeElement";
import { Position } from "../../position";
import { generateHtmlElementsForTree } from "../support/testUtil";

interface CreateDragAndDropHandlerParams {
    getTree?: GetTree;
    tree: Node;
}

const createDragAndDropHandler = ({
    getTree,
    tree,
}: CreateDragAndDropHandlerParams) => {
    const getNodeElementForNode = jest.fn();
    const getScrollLeft = jest.fn();
    const openNode = jest.fn();
    const refreshElements = jest.fn();
    const triggerEvent = jest.fn();

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

    const getTreeImplementation = getTree ?? jest.fn(() => tree);

    return new DragAndDropHandler({
        getNodeElement,
        getNodeElementForNode,
        getScrollLeft,
        getTree: getTreeImplementation,
        openFolderDelay: false,
        openNode,
        refreshElements,
        slide: false,
        treeElement: elementForTree,
        triggerEvent,
    });
};

describe(".refresh", () => {
    it("generates hit areas", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

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

    it("doesn't generates hit areas when the tree is set to null", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const getTree = jest.fn(() => null);

        const dragAndDropHandler = createDragAndDropHandler({ getTree, tree });

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

        expect(dragAndDropHandler.hitAreas).toBeEmpty();
    });
});
