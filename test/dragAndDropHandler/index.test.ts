import { vi } from "vitest";

import { DragAndDropHandler } from "app/dragAndDropHandler";
import { GetScrollLeft, GetTree, OpenNode } from "app/jqtreeMethodTypes";
import {
    DragMethod,
    OnCanMove,
    OnCanMoveTo,
    OnIsMoveHandle,
} from "app/jqtreeOptions";
import { Node } from "app/node";
import NodeElement from "app/nodeElement";

import { generateHtmlElementsForTree } from "../support/testUtil";

interface CreateDragAndDropHandlerParams {
    getTree?: GetTree;
    onCanMove?: OnCanMove;
    onCanMoveTo?: OnCanMoveTo;
    onDragMove?: DragMethod;
    onDragStop?: DragMethod;
    onIsMoveHandle?: OnIsMoveHandle;
    openFolderDelay?: false | number;
    openNode?: OpenNode;
    tree: Node;
}

const createDragAndDropHandler = ({
    getTree,
    onCanMove,
    onCanMoveTo,
    onDragMove,
    onDragStop,
    onIsMoveHandle,
    openFolderDelay,
    openNode,
    tree,
}: CreateDragAndDropHandlerParams) => {
    const getScrollLeft = vi.fn<GetScrollLeft>();
    const refreshElements = vi.fn();

    const treeElement = generateHtmlElementsForTree(tree);

    const triggerEvent = vi.fn(
        (eventName: string, values?: Record<string, unknown>) => {
            const event = jQuery.Event(eventName, values);
            jQuery(treeElement).trigger(event);
            return event;
        },
    );

    const getNodeElementForNode = vi.fn(
        (node: Node) =>
            new NodeElement({
                getScrollLeft,
                node,
                treeElement: treeElement,
            }),
    );

    const getNodeElement = vi.fn((element: HTMLElement) => {
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
                treeElement,
            });
        } else {
            return null;
        }
    });

    const dragAndDropHandler = new DragAndDropHandler({
        getNodeElement,
        getNodeElementForNode,
        getScrollLeft,
        getTree: getTree ?? vi.fn(() => tree),
        onCanMove,
        onCanMoveTo,
        onDragMove,
        onDragStop,
        onIsMoveHandle,
        openFolderDelay: openFolderDelay ?? false,
        openNode: openNode ?? vi.fn(),
        refreshElements,
        slide: false,
        treeElement: treeElement,
        triggerEvent,
    });

    return { dragAndDropHandler, triggerEvent };
};

describe("DragAndDropHandler", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe(".mouseCapture", () => {
        it("sets the current item and returns true when a node can be moved", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

        it("doesn't set the current item and returns false when no node can be moved", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const element = document.createElement("div");

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const onIsMoveHandle = vi.fn(
                (jQueryElement: JQuery) =>
                    jQueryElement.get(0) === node1.element,
            );
            const { dragAndDropHandler } = createDragAndDropHandler({
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

            expect(onIsMoveHandle).toHaveBeenCalledExactlyOnceWith(expect.anything());
        });

        it("doesn't capture the node when onIsMoveHandle returns false", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const onIsMoveHandle = vi.fn(() => false);
            const { dragAndDropHandler } = createDragAndDropHandler({
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

            expect(onIsMoveHandle).toHaveBeenCalledExactlyOnceWith(expect.anything());
        });

        it("doesn't capture when onCanMove returns false", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const onCanMove = vi.fn(() => false);

            const { dragAndDropHandler } = createDragAndDropHandler({
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

            expect(onCanMove).toHaveBeenCalledExactlyOnceWith(node2);
        });

        it("captures when onCanMove returns true", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const onCanMove = vi.fn(() => true);

            const { dragAndDropHandler } = createDragAndDropHandler({
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
            expect(dragAndDropHandler.currentItem?.node).toStrictEqual(node2);

            expect(onCanMove).toHaveBeenCalledExactlyOnceWith(node2);
        });
    });

    describe(".mouseStart", () => {
        it("sets dragging to true and returns true", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });
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

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            expect(
                document.querySelector(".jqtree-dragging"),
            ).toBeInTheDocument();
        });

        it("sets dragging to false and returns false when there is no current item", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

    describe(".mouseStop", () => {
        it("triggers a tree.move event", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler, triggerEvent } =
                createDragAndDropHandler({
                    tree,
                });

            // Capture
            const positionInfo = {
                originalEvent: new Event("click"),
                pageX: 10,
                pageY: 10,
                target: node1.element as HTMLElement,
            };

            dragAndDropHandler.mouseCapture(positionInfo);

            expect(dragAndDropHandler.currentItem?.node).toBe(node1);

            // Start
            expect(dragAndDropHandler.mouseStart(positionInfo)).toBeTrue();
            expect(dragAndDropHandler.isDragging).toBeTrue();

            // Drag
            const dragPositionInfo = {
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            };

            dragAndDropHandler.mouseDrag(dragPositionInfo);

            expect(dragAndDropHandler.hoveredArea?.node).toStrictEqual(node2);

            // Stop
            dragAndDropHandler.mouseStop(dragPositionInfo);

            expect(triggerEvent).toHaveBeenCalledExactlyOnceWith(
                "tree.move",
                expect.objectContaining({
                    move_info: {
                        do_move: expect.any(Function) as unknown,
                        moved_node: node1,
                        original_event: dragPositionInfo.originalEvent,
                        position: "inside",
                        previous_parent: tree,
                        target_node: node2,
                    },
                }),
            );
        });

        it("calls tree.moveNode", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const mockMoveNode = vi.spyOn(tree, "moveNode");

            const { dragAndDropHandler } = createDragAndDropHandler({
                tree,
            });

            // Capture
            const positionInfo = {
                originalEvent: new Event("click"),
                pageX: 10,
                pageY: 10,
                target: node1.element as HTMLElement,
            };

            dragAndDropHandler.mouseCapture(positionInfo);

            expect(dragAndDropHandler.currentItem?.node).toBe(node1);

            // Start
            expect(dragAndDropHandler.mouseStart(positionInfo)).toBeTrue();
            expect(dragAndDropHandler.isDragging).toBeTrue();

            // Drag
            const dragPositionInfo = {
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            };

            dragAndDropHandler.mouseDrag(dragPositionInfo);

            expect(dragAndDropHandler.hoveredArea?.node).toStrictEqual(node2);

            // Stop
            dragAndDropHandler.mouseStop(dragPositionInfo);

            expect(mockMoveNode).toHaveBeenCalledExactlyOnceWith(node1, node2, "inside");
        });

        it("calls onDragStop when there is no hovered area", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const onDragStop = vi.fn();

            const { dragAndDropHandler } = createDragAndDropHandler({
                onDragStop,
                tree,
            });

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
            dragAndDropHandler.mouseDrag({
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            });

            // Stop
            const originalEvent = new Event("mousemove");

            dragAndDropHandler.mouseStop({
                originalEvent,
                pageX: 300,
                pageY: 300,
                target: document.body,
            });

            expect(onDragStop).toHaveBeenCalledExactlyOnceWith(node1, originalEvent);
        });
    });

    describe(".mouseDrag", () => {
        it("moves the drag element and returns true", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            expect(dragAndDropHandler.hoveredArea).toStrictEqual(
                expect.objectContaining({
                    bottom: 38,
                    node: node2,
                    position: "inside",
                    top: 20,
                }),
            );
        });

        it("creates a border drop hint", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            expect(
                node2.element?.querySelector(".jqtree-border"),
            ).toBeInTheDocument();
        });

        it("returns false when dragging hasn't started", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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

            const { dragAndDropHandler } = createDragAndDropHandler({
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

            const onDragMove = vi.fn();

            const { dragAndDropHandler } = createDragAndDropHandler({
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

            expect(onDragMove).toHaveBeenCalledExactlyOnceWith(
                node1,
                positionInfoForDragging.originalEvent,
            );
        });

        it("doesn't create a drop hint when onCanMoveTo returns false", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const onCanMoveTo = vi.fn(() => false);

            const { dragAndDropHandler } = createDragAndDropHandler({
                onCanMoveTo,
                tree,
            });

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
            dragAndDropHandler.mouseDrag({
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            });

            expect(onCanMoveTo).toHaveBeenCalledExactlyOnceWith(node1, node2, "inside");

            // Still sets hoveredArea to the new node
            expect(dragAndDropHandler.hoveredArea?.node).toStrictEqual(node2);

            expect(node2.element?.querySelector(".jqtree-border")).toBeNull();
        });

        it("opens a closed folder when it is hovered for a certain time", () => {
            vi.useFakeTimers();

            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);
            node2.addChild(new Node({ name: "child" }));

            const openNode = vi.fn();

            const { dragAndDropHandler } = createDragAndDropHandler({
                openFolderDelay: 100,
                openNode,
                tree,
            });

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

            // Move mouse to node2
            dragAndDropHandler.mouseDrag({
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            });

            vi.advanceTimersByTime(10);

            expect(openNode).not.toHaveBeenCalled();

            vi.advanceTimersByTime(100);

            expect(openNode).toHaveBeenCalledExactlyOnceWith(
                node2,
                false,
                expect.any(Function),
            );
        });

        it("doesn't open a closed folder when it is hovered over but not long enough", () => {
            vi.useFakeTimers();

            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);
            node2.addChild(new Node({ name: "child" }));

            const openNode = vi.fn();

            const { dragAndDropHandler } = createDragAndDropHandler({
                openFolderDelay: 100,
                openNode,
                tree,
            });

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

            // Move mouse to node2
            dragAndDropHandler.mouseDrag({
                originalEvent: new Event("mousemove"),
                pageX: 15,
                pageY: 30,
                target: node2.element as HTMLElement,
            });

            vi.advanceTimersByTime(10);

            // Move mouse outside of the tree
            dragAndDropHandler.mouseDrag({
                originalEvent: new Event("mousemove"),
                pageX: 150,
                pageY: 500,
                target: document.body,
            });

            vi.advanceTimersByTime(100);

            expect(openNode).not.toHaveBeenCalled();
        });
    });

    describe(".refresh", () => {
        it("generates hit areas", () => {
            const tree = new Node(null, true);
            const node1 = new Node({ name: "node1" });
            tree.addChild(node1);
            const node2 = new Node({ name: "node2" });
            tree.addChild(node2);

            const { dragAndDropHandler } = createDragAndDropHandler({ tree });

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
                    position: "inside",
                    top: 20,
                }),
                expect.objectContaining({
                    bottom: 56,
                    node: node2,
                    position: "after",
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

            const getTree = vi.fn(() => null);

            const { dragAndDropHandler } = createDragAndDropHandler({
                getTree,
                tree,
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

            expect(dragAndDropHandler.hitAreas).toBeEmpty();
        });
    });
});
