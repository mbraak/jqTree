import { DragAndDropHandler } from "../../dragAndDropHandler";
import { Node } from "../../node";
import NodeElement from "../../nodeElement";
import { Position } from "../../position";
import { mockLayout } from "../support/testUtil";

describe(".refresh", () => {
    it("generates hit areas if there is a current item", () => {
        const getNodeElementForNode = jest.fn();
        const getScrollLeft = jest.fn();
        const openNode = jest.fn();
        const refreshElements = jest.fn();
        const triggerEvent = jest.fn();

        const elementForTree = document.createElement("div");
        document.body.append(elementForTree);

        mockLayout(elementForTree, { height: 40, width: 50, x: 0, y: 0 });

        const elementForNode1 = document.createElement("div");
        elementForTree.append(elementForNode1);
        const elementForNode2 = document.createElement("div");
        elementForTree.append(elementForNode2);

        mockLayout(elementForNode1, { height: 20, width: 50, x: 0, y: 0 });
        mockLayout(elementForNode2, { height: 20, width: 50, x: 0, y: 20 });

        const tree = new Node({ isRoot: true });

        const node1 = new Node({ name: "node1" });
        node1.element = elementForNode1;
        tree.addChild(node1);

        const node2 = new Node({ name: "node2" });
        node2.element = elementForNode2;
        tree.addChild(node2);

        const nodeElement1 = new NodeElement({
            getScrollLeft,
            node: node1,
            treeElement: elementForTree,
        });

        const nodeElement2 = new NodeElement({
            getScrollLeft,
            node: node2,
            treeElement: elementForTree,
        });

        const getNodeElement = jest.fn((element) => {
            if (element == elementForNode1) {
                return nodeElement1;
            } else if (element == elementForNode2) {
                return nodeElement2;
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
            target: elementForNode1,
        };

        dragAndDropHandler.mouseCapture(positionInfo);
        expect(dragAndDropHandler.currentItem).toBe(nodeElement1);

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
