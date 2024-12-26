import { DragAndDropHandler } from "../../dragAndDropHandler";
import { GetTree } from "../../jqtreeMethodTypes";
import { DragMethod, OnCanMove, OnIsMoveHandle } from "../../jqtreeOptions";
import { Node } from "../../node";
import NodeElement from "../../nodeElement";
import { Position } from "../../position";
import { generateHtmlElementsForTree } from "../support/testUtil";

interface CreateDragAndDropHandlerParams {
    getTree?: GetTree;
    onCanMove?: OnCanMove;
    onDragMove?: DragMethod;
    onIsMoveHandle?: OnIsMoveHandle;
    tree: Node;
}

const createDragAndDropHandler = ({
    getTree,
    onCanMove,
    onDragMove,
    onIsMoveHandle,
    tree,
}: CreateDragAndDropHandlerParams) => {
    const getScrollLeft = jest.fn();
    const openNode = jest.fn();
    const refreshElements = jest.fn();
    const triggerEvent = jest.fn();

    const elementForTree = generateHtmlElementsForTree(tree);

    const getNodeElementForNode = jest.fn(
        (node: Node) =>
            new NodeElement({
                getScrollLeft,
                node,
                treeElement: elementForTree,
            }),
    );

    const getNodeElement = jest.fn((element: HTMLElement) => {
        let resultNode: Node | null = null;

        tree.iterate((node) => {
            if (
                node.element === element ||
                node.element === element.parentElement
            ) {
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

    return new DragAndDropHandler({
        getNodeElement,
        getNodeElementForNode,
        getScrollLeft,
        getTree: getTree ?? jest.fn(() => tree),
        onCanMove,
        onDragMove,
        onIsMoveHandle,
        openFolderDelay: false,
        openNode,
        refreshElements,
        slide: false,
        treeElement: elementForTree,
        triggerEvent,
    });
};

beforeEach(() => {
    document.body.innerHTML = "";
});

describe(".mouseCapture", () => {
    it("sets the current item and returns true when a node can be moved", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });
        expect(dragAndDropHandler.currentItem).toBeNull();

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeTrue();
        expect(dragAndDropHandler.currentItem?.node).toBe(node1);
    });

    it("doesn'set the current item and returns false when no node can be moved", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const element = document.createElement("div");

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 200,
            pageY: 10,
            target: element,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeFalse();
        expect(dragAndDropHandler.currentItem).toBeNull();
    });

    it("captures the node when an element inside a node element is clicked", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        const element = document.createElement("div");
        (node2.element as HTMLElement).appendChild(element);

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: element,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeTrue();
        expect(dragAndDropHandler.currentItem?.node).toBe(node2);
    });

    it("doesn't capture the node and returns null when an input element is clicked", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        const element = document.createElement("input");
        (node2.element as HTMLElement).appendChild(element);

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: element,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeNull();
        expect(dragAndDropHandler.currentItem).toBeNull();
    });

    it("captures the node when onIsMoveHandle returns true", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const onIsMoveHandle = jest.fn(
            (jQueryElement: JQuery) => jQueryElement.get(0) === node1.element,
        );
        const dragAndDropHandler = createDragAndDropHandler({
            onIsMoveHandle,
            tree,
        });

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeTrue();
        expect(dragAndDropHandler.currentItem?.node).toBe(node1);

        expect(onIsMoveHandle).toHaveBeenCalled();
    });

    it("doesn't capture the node when onIsMoveHandle returns false", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const onIsMoveHandle = jest.fn(() => false);
        const dragAndDropHandler = createDragAndDropHandler({
            onIsMoveHandle,
            tree,
        });

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeNull();
        expect(dragAndDropHandler.currentItem).toBeNull();

        expect(onIsMoveHandle).toHaveBeenCalled();
    });

    it("doesn't capture when onCanMove returns false", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const onCanMove = jest.fn(() => false);

        const dragAndDropHandler = createDragAndDropHandler({
            onCanMove,
            tree,
        });

        const element = document.createElement("div");
        (node2.element as HTMLElement).appendChild(element);

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: element,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeFalse();
        expect(dragAndDropHandler.currentItem).toBeNull();

        expect(onCanMove).toHaveBeenCalledWith(node2);
    });

    it("captures when onCanMove returns true", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const onCanMove = jest.fn(() => true);

        const dragAndDropHandler = createDragAndDropHandler({
            onCanMove,
            tree,
        });

        const element = document.createElement("div");
        (node2.element as HTMLElement).appendChild(element);

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: element,
        };

        expect(dragAndDropHandler.mouseCapture(positionInfo)).toBeTrue();
        expect(dragAndDropHandler.currentItem?.node).toEqual(node2);

        expect(onCanMove).toHaveBeenCalledWith(node2);
    });
});

describe(".mouseStart", () => {
    it("sets dragging to true and returns true", () => {
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
        expect(dragAndDropHandler.isDragging).toBeFalse();

        // mouseStart
        expect(dragAndDropHandler.mouseStart(positionInfo)).toBeTrue();
        expect(dragAndDropHandler.isDragging).toBeTrue();
    });

    it("adds the jqtree-moving css class", () => {
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

        // mouseStart
        dragAndDropHandler.mouseStart(positionInfo);

        expect(node1.element?.classList).toContain("jqtree-moving");
    });

    it("creates a drag element", () => {
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

        // mouseStart
        dragAndDropHandler.mouseStart(positionInfo);

        expect(document.querySelector(".jqtree-dragging")).toBeInTheDocument();
    });

    it("sets dragging to false and returns false when there is no current item", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        expect(dragAndDropHandler.mouseStart(positionInfo)).toBeFalse();
        expect(dragAndDropHandler.isDragging).toBeFalse();
    });
});

describe(".mouseDrag", () => {
    it("moves the drag element and returns true", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        // Start dragging
        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        dragAndDropHandler.mouseCapture(positionInfo);

        dragAndDropHandler.mouseStart(positionInfo);
        expect(dragAndDropHandler.isDragging).toBeTrue();

        // Move mouse
        const dragResult = dragAndDropHandler.mouseDrag({
            originalEvent: new Event("mousemove"),
            pageX: 15,
            pageY: 30,
            target: node2.element as HTMLElement,
        });
        expect(dragResult).toBeTrue();

        const dragElement = document.querySelector(".jqtree-dragging");
        expect(dragElement).toHaveStyle({
            left: "5px",
            position: "absolute",
            top: "20px",
        });
    });

    it("changes the hovered area", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        // Start dragging
        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 10,
            target: node1.element as HTMLElement,
        };

        dragAndDropHandler.mouseCapture(positionInfo);

        dragAndDropHandler.mouseStart(positionInfo);
        expect(dragAndDropHandler.isDragging).toBeTrue();
        expect(dragAndDropHandler.hoveredArea).toBeNull();

        // Move mouse
        dragAndDropHandler.mouseDrag({
            originalEvent: new Event("mousemove"),
            pageX: 15,
            pageY: 30,
            target: node2.element as HTMLElement,
        });

        expect(dragAndDropHandler.hoveredArea).toEqual(
            expect.objectContaining({
                bottom: 38,
                node: node2,
                position: Position.Inside,
                top: 20,
            }),
        );
    });

    it("returns false when dragging hasn't started", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({ tree });

        const dragResult = dragAndDropHandler.mouseDrag({
            originalEvent: new Event("mousemove"),
            pageX: 15,
            pageY: 30,
            target: node2.element as HTMLElement,
        });
        expect(dragResult).toBeFalse();
    });

    it("sets area to null when no area is found", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const dragAndDropHandler = createDragAndDropHandler({
            tree,
        });

        // Start dragging
        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: node1.element as HTMLElement,
        };

        dragAndDropHandler.mouseCapture(positionInfo);

        dragAndDropHandler.mouseStart(positionInfo);

        dragAndDropHandler.mouseDrag({
            originalEvent: new Event("mousemove"),
            pageX: 15,
            pageY: 200,
            target: document.body,
        });

        expect(dragAndDropHandler.hoveredArea).toBeNull();
    });

    it("calls onDragMove when no area is found and onDragMove is defined", () => {
        const tree = new Node(null, true);
        const node1 = new Node({ name: "node1" });
        tree.addChild(node1);
        const node2 = new Node({ name: "node2" });
        tree.addChild(node2);

        const onDragMove = jest.fn();

        const dragAndDropHandler = createDragAndDropHandler({
            onDragMove,
            tree,
        });

        // Start dragging
        const positionInfo = {
            originalEvent: new Event("click"),
            pageX: 10,
            pageY: 30,
            target: node1.element as HTMLElement,
        };

        dragAndDropHandler.mouseCapture(positionInfo);

        dragAndDropHandler.mouseStart(positionInfo);
        expect(dragAndDropHandler.isDragging).toBeTrue();
        expect(dragAndDropHandler.hoveredArea).toBeNull();

        const positionInfoForDragging = {
            originalEvent: new Event("mousemove"),
            pageX: 15,
            pageY: 200,
            target: document.body,
        };

        // Move mouse
        dragAndDropHandler.mouseDrag(positionInfoForDragging);

        expect(onDragMove).toHaveBeenCalledWith(
            node1,
            positionInfoForDragging.originalEvent,
        );
    });
});

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
