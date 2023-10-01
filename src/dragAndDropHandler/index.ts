import { getPositionName, Node, Position } from "../node";
import { DropHint, HitArea, PositionInfo } from "../types";
import NodeElement from "../nodeElement";
import { JqTreeWidget } from "../tree.jquery";
import DragElement from "./dragElement";
import HitAreasGenerator from "./hitAreasGenerator";

interface Dimensions {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export class DragAndDropHandler {
    public hitAreas: HitArea[];
    public isDragging: boolean;
    public currentItem: NodeElement | null;
    public hoveredArea: HitArea | null;

    private treeWidget: JqTreeWidget;
    private dragElement: DragElement | null;
    private previousGhost: DropHint | null;
    private openFolderTimer: number | null;

    constructor(treeWidget: JqTreeWidget) {
        this.treeWidget = treeWidget;

        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
    }

    public mouseCapture(positionInfo: PositionInfo): boolean | null {
        const $element = jQuery(positionInfo.target);

        if (!this.mustCaptureElement(positionInfo.target)) {
            return null;
        }

        if (
            this.treeWidget.options.onIsMoveHandle &&
            !this.treeWidget.options.onIsMoveHandle($element)
        ) {
            return null;
        }

        let nodeElement = this.treeWidget._getNodeElement($element);

        if (nodeElement && this.treeWidget.options.onCanMove) {
            if (!this.treeWidget.options.onCanMove(nodeElement.node)) {
                nodeElement = null;
            }
        }

        this.currentItem = nodeElement;
        return this.currentItem != null;
    }

    public mouseStart(positionInfo: PositionInfo): boolean {
        if (
            !this.currentItem ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined
        ) {
            return false;
        }

        this.refresh();

        const offset = jQuery(positionInfo.target).offset();
        const left = offset ? offset.left : 0;
        const top = offset ? offset.top : 0;

        const node = this.currentItem.node;

        this.dragElement = new DragElement(
            node.name,
            positionInfo.pageX - left,
            positionInfo.pageY - top,
            this.treeWidget.element,
            this.treeWidget.options.autoEscape ?? true,
        );

        this.isDragging = true;
        this.currentItem.element.classList.add("jqtree-moving");

        return true;
    }

    public mouseDrag(positionInfo: PositionInfo): boolean {
        if (
            !this.currentItem ||
            !this.dragElement ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined
        ) {
            return false;
        }

        this.dragElement.move(positionInfo.pageX, positionInfo.pageY);

        const area = this.findHoveredArea(
            positionInfo.pageX,
            positionInfo.pageY,
        );

        if (area && this.canMoveToArea(area)) {
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
            if (this.treeWidget.options.onDragMove) {
                this.treeWidget.options.onDragMove(
                    this.currentItem.node,
                    positionInfo.originalEvent,
                );
            }
        }

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
            if (this.treeWidget.options.onDragStop) {
                this.treeWidget.options.onDragStop(
                    currentItem.node,
                    positionInfo.originalEvent,
                );
            }
        }

        return false;
    }

    public refresh(): void {
        this.removeHitAreas();

        if (this.currentItem) {
            this.generateHitAreas();

            this.currentItem = this.treeWidget._getNodeElementForNode(
                this.currentItem.node,
            );

            if (this.isDragging) {
                this.currentItem.element.classList.add("jqtree-moving");
            }
        }
    }

    private generateHitAreas(): void {
        if (!this.currentItem) {
            this.hitAreas = [];
        } else {
            const hitAreasGenerator = new HitAreasGenerator(
                this.treeWidget.tree,
                this.currentItem.node,
                this.getTreeDimensions().bottom,
            );
            this.hitAreas = hitAreasGenerator.generate();
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

    private canMoveToArea(area: HitArea): boolean {
        if (!this.treeWidget.options.onCanMoveTo) {
            return true;
        }

        if (!this.currentItem) {
            return false;
        }

        const positionName = getPositionName(area.position);

        return this.treeWidget.options.onCanMoveTo(
            this.currentItem.node,
            area.node,
            positionName,
        );
    }

    private removeHitAreas(): void {
        this.hitAreas = [];
    }

    private clear(): void {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
    }

    private removeDropHint(): void {
        if (this.previousGhost) {
            this.previousGhost.remove();
        }
    }

    private removeHover(): void {
        this.hoveredArea = null;
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

        let low = 0;
        let high = this.hitAreas.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            const area = this.hitAreas[mid];

            if (!area) {
                return null;
            }

            if (y < area.top) {
                high = mid;
            } else if (y > area.bottom) {
                low = mid + 1;
            } else {
                return area;
            }
        }

        return null;
    }

    private mustOpenFolderTimer(area: HitArea): boolean {
        const node = area.node;

        return (
            node.isFolder() &&
            !node.is_open &&
            area.position === Position.Inside
        );
    }

    private updateDropHint(): void {
        if (!this.hoveredArea) {
            return;
        }

        // remove previous drop hint
        this.removeDropHint();

        // add new drop hint
        const nodeElement = this.treeWidget._getNodeElementForNode(
            this.hoveredArea.node,
        );
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }

    private startOpenFolderTimer(folder: Node): void {
        const openFolder = (): void => {
            this.treeWidget._openNode(
                folder,
                this.treeWidget.options.slide,
                () => {
                    this.refresh();
                    this.updateDropHint();
                },
            );
        };

        this.stopOpenFolderTimer();

        const openFolderDelay = this.treeWidget.options.openFolderDelay;

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

    private moveItem(positionInfo: PositionInfo): void {
        if (
            this.currentItem &&
            this.hoveredArea &&
            this.hoveredArea.position !== Position.None &&
            this.canMoveToArea(this.hoveredArea)
        ) {
            const movedNode = this.currentItem.node;
            const targetNode = this.hoveredArea.node;
            const position = this.hoveredArea.position;
            const previousParent = movedNode.parent;

            if (position === Position.Inside) {
                this.hoveredArea.node.is_open = true;
            }

            const doMove = (): void => {
                this.treeWidget.tree.moveNode(movedNode, targetNode, position);
                this.treeWidget.element.empty();
                this.treeWidget._refreshElements(null);
            };

            const event = this.treeWidget._triggerEvent("tree.move", {
                move_info: {
                    moved_node: movedNode,
                    target_node: targetNode,
                    position: getPositionName(position),
                    previous_parent: previousParent,
                    do_move: doMove,
                    original_event: positionInfo.originalEvent,
                },
            });

            if (!event.isDefaultPrevented()) {
                doMove();
            }
        }
    }

    private getTreeDimensions(): Dimensions {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const offset = this.treeWidget.element.offset();

        if (!offset) {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        } else {
            const el = this.treeWidget.element;
            const width = el.width() || 0;
            const height = el.height() || 0;
            const left = offset.left + this.treeWidget._getScrollLeft();

            return {
                left,
                top: offset.top,
                right: left + width,
                bottom: offset.top + height + 16,
            };
        }
    }
}
