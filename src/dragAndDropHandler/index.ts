import {
    GetScrollLeft,
    GetTree,
    OpenNode,
    RefreshElements,
    TriggerEvent,
} from "../jqtreeMethodTypes";
import {
    DragMethod,
    OnCanMove,
    OnCanMoveTo,
    OnIsMoveHandle,
} from "../jqtreeOptions";
import { PositionInfo } from "../mouseUtils";
import { Node } from "../node";
import NodeElement from "../nodeElement";
import { getPositionName, Position } from "../position";
import { getElementPosition } from "../util";
import binarySearch from "./binarySearch";
import DragElement from "./dragElement";
import generateHitAreas from "./generateHitAreas";
import { DropHint, HitArea } from "./types";

interface Dimensions {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

type GetNodeElement = (element: HTMLElement) => NodeElement | null;
type GetNodeElementForNode = (node: Node) => NodeElement;

interface DragAndDropHandlerParams {
    autoEscape?: boolean;
    getNodeElement: GetNodeElement;
    getNodeElementForNode: GetNodeElementForNode;
    getScrollLeft: GetScrollLeft;
    getTree: GetTree;
    onCanMove?: OnCanMove;
    onCanMoveTo?: OnCanMoveTo;
    onDragMove?: DragMethod;
    onDragStop?: DragMethod;
    onIsMoveHandle?: OnIsMoveHandle;
    openFolderDelay: false | number;
    openNode: OpenNode;
    refreshElements: RefreshElements;
    slide: boolean;
    treeElement: HTMLElement;
    triggerEvent: TriggerEvent;
}

export class DragAndDropHandler {
    private autoEscape?: boolean;
    private dragElement: DragElement | null;
    private getNodeElement: GetNodeElement;
    private getNodeElementForNode: GetNodeElementForNode;

    private getScrollLeft: GetScrollLeft;
    private getTree: GetTree;
    private onCanMove?: OnCanMove;
    private onCanMoveTo?: OnCanMoveTo;
    private onDragMove?: DragMethod;
    private onDragStop?: DragMethod;
    private onIsMoveHandle?: OnIsMoveHandle;
    private openFolderDelay: false | number;
    private openFolderTimer: null | number;
    private openNode: OpenNode;
    private previousGhost: DropHint | null;
    private refreshElements: RefreshElements;
    private slide: boolean;
    private treeElement: HTMLElement;
    private triggerEvent: TriggerEvent;
    public currentItem: NodeElement | null;
    public hitAreas: HitArea[];
    public hoveredArea: HitArea | null;
    public isDragging: boolean;

    constructor({
        autoEscape,
        getNodeElement,
        getNodeElementForNode,
        getScrollLeft,
        getTree,
        onCanMove,
        onCanMoveTo,
        onDragMove,
        onDragStop,
        onIsMoveHandle,
        openNode,
        refreshElements,
        slide,
        treeElement,
        triggerEvent,
    }: DragAndDropHandlerParams) {
        this.autoEscape = autoEscape;
        this.getNodeElement = getNodeElement;
        this.getNodeElementForNode = getNodeElementForNode;
        this.getScrollLeft = getScrollLeft;
        this.getTree = getTree;
        this.onCanMove = onCanMove;
        this.onCanMoveTo = onCanMoveTo;
        this.onDragMove = onDragMove;
        this.onDragStop = onDragStop;
        this.onIsMoveHandle = onIsMoveHandle;
        this.openNode = openNode;
        this.refreshElements = refreshElements;
        this.slide = slide;
        this.treeElement = treeElement;
        this.triggerEvent = triggerEvent;

        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
    }

    private canMoveToArea(area: HitArea, currentItem: NodeElement): boolean {
        if (!this.onCanMoveTo) {
            return true;
        }

        const positionName = getPositionName(area.position);

        return this.onCanMoveTo(currentItem.node, area.node, positionName);
    }

    private clear(): void {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
    }

    private findHoveredArea(x: number, y: number): HitArea | null {
        const dimensions = this.getTreeDimensions();

        if (
            x < dimensions.left ||
            y < dimensions.top ||
            x > dimensions.right ||
            y > dimensions.bottom
        ) {
            return null;
        }

        return binarySearch<HitArea>(this.hitAreas, (area) => {
            if (y < area.top) {
                return 1;
            } else if (y > area.bottom) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    private generateHitAreas(currentNode: Node): void {
        const tree = this.getTree();

        if (!tree) {
            this.hitAreas = [];
        } else {
            this.hitAreas = generateHitAreas(
                tree,
                currentNode,
                this.getTreeDimensions().bottom,
            );
        }
    }

    private getTreeDimensions(): Dimensions {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const treePosition = getElementPosition(this.treeElement);
        const left = treePosition.left + this.getScrollLeft();
        const top = treePosition.top;

        return {
            bottom: top + this.treeElement.clientHeight + 16,
            left,
            right: left + this.treeElement.clientWidth,
            top,
        };
    }

    private moveItem(positionInfo: PositionInfo): void {
        if (
            this.currentItem &&
            this.hoveredArea &&
            this.hoveredArea.position !== Position.None &&
            this.canMoveToArea(this.hoveredArea, this.currentItem)
        ) {
            const movedNode = this.currentItem.node;
            const targetNode = this.hoveredArea.node;
            const position = this.hoveredArea.position;
            const previousParent = movedNode.parent;

            if (position === Position.Inside) {
                this.hoveredArea.node.is_open = true;
            }

            const doMove = (): void => {
                const tree = this.getTree();

                if (tree) {
                    tree.moveNode(movedNode, targetNode, position);

                    this.treeElement.textContent = "";
                    this.refreshElements(null);
                }
            };

            const event = this.triggerEvent("tree.move", {
                move_info: {
                    do_move: doMove,
                    moved_node: movedNode,
                    original_event: positionInfo.originalEvent,
                    position: getPositionName(position),
                    previous_parent: previousParent,
                    target_node: targetNode,
                },
            });

            if (!event.isDefaultPrevented()) {
                doMove();
            }
        }
    }

    private mustCaptureElement(element: HTMLElement): boolean {
        const nodeName = element.nodeName;

        return (
            nodeName !== "INPUT" &&
            nodeName !== "SELECT" &&
            nodeName !== "TEXTAREA"
        );
    }

    private mustOpenFolderTimer(area: HitArea): boolean {
        const node = area.node;

        return (
            node.isFolder() &&
            !node.is_open &&
            area.position === Position.Inside
        );
    }

    private removeDropHint(): void {
        if (this.previousGhost) {
            this.previousGhost.remove();
        }
    }

    private removeHitAreas(): void {
        this.hitAreas = [];
    }

    private removeHover(): void {
        this.hoveredArea = null;
    }

    private startOpenFolderTimer(folder: Node): void {
        const openFolder = (): void => {
            this.openNode(folder, this.slide, () => {
                this.refresh();
                this.updateDropHint();
            });
        };

        this.stopOpenFolderTimer();

        const openFolderDelay = this.openFolderDelay;

        if (openFolderDelay !== false) {
            this.openFolderTimer = window.setTimeout(
                openFolder,
                openFolderDelay,
            );
        }
    }

    private stopOpenFolderTimer(): void {
        if (this.openFolderTimer) {
            clearTimeout(this.openFolderTimer);
            this.openFolderTimer = null;
        }
    }

    private updateDropHint(): void {
        if (!this.hoveredArea) {
            return;
        }

        // remove previous drop hint
        this.removeDropHint();

        // add new drop hint
        const nodeElement = this.getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }

    public mouseCapture(positionInfo: PositionInfo): boolean | null {
        const element = positionInfo.target;

        if (!this.mustCaptureElement(element)) {
            return null;
        }

        if (this.onIsMoveHandle && !this.onIsMoveHandle(jQuery(element))) {
            return null;
        }

        let nodeElement = this.getNodeElement(element);

        if (nodeElement && this.onCanMove) {
            if (!this.onCanMove(nodeElement.node)) {
                nodeElement = null;
            }
        }

        this.currentItem = nodeElement;
        return this.currentItem != null;
    }

    public mouseDrag(positionInfo: PositionInfo): boolean {
        if (!this.currentItem || !this.dragElement) {
            return false;
        }

        this.dragElement.move(positionInfo.pageX, positionInfo.pageY);

        const area = this.findHoveredArea(
            positionInfo.pageX,
            positionInfo.pageY,
        );

        if (area && this.canMoveToArea(area, this.currentItem)) {
            if (!area.node.isFolder()) {
                this.stopOpenFolderTimer();
            }

            if (this.hoveredArea !== area) {
                this.hoveredArea = area;

                // If this is a closed folder, start timer to open it
                if (this.mustOpenFolderTimer(area)) {
                    this.startOpenFolderTimer(area.node);
                } else {
                    this.stopOpenFolderTimer();
                }

                this.updateDropHint();
            }
        } else {
            this.removeDropHint();
            this.stopOpenFolderTimer();
            this.hoveredArea = area;
        }

        if (!area) {
            if (this.onDragMove) {
                this.onDragMove(
                    this.currentItem.node,
                    positionInfo.originalEvent,
                );
            }
        }

        return true;
    }

    public mouseStart(positionInfo: PositionInfo): boolean {
        if (!this.currentItem) {
            return false;
        }

        this.refresh();

        const { left, top } = getElementPosition(positionInfo.target);

        const node = this.currentItem.node;

        this.dragElement = new DragElement({
            autoEscape: this.autoEscape ?? true,
            nodeName: node.name,
            offsetX: positionInfo.pageX - left,
            offsetY: positionInfo.pageY - top,
            treeElement: this.treeElement,
        });

        this.isDragging = true;
        this.currentItem.element.classList.add("jqtree-moving");

        return true;
    }

    public mouseStop(positionInfo: PositionInfo): boolean {
        this.moveItem(positionInfo);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();

        const currentItem = this.currentItem;

        if (this.currentItem) {
            this.currentItem.element.classList.remove("jqtree-moving");
            this.currentItem = null;
        }

        this.isDragging = false;

        if (!this.hoveredArea && currentItem) {
            if (this.onDragStop) {
                this.onDragStop(currentItem.node, positionInfo.originalEvent);
            }
        }

        return false;
    }

    public refresh(): void {
        this.removeHitAreas();

        if (this.currentItem) {
            const currentNode = this.currentItem.node;
            this.generateHitAreas(currentNode);
            this.currentItem = this.getNodeElementForNode(currentNode);

            if (this.isDragging) {
                this.currentItem.element.classList.add("jqtree-moving");
            }
        }
    }
}
