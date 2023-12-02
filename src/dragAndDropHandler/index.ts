import { Node } from "../node";
import { getPositionName, Position } from "../position";
import { DropHint, HitArea } from "./types";
import { PositionInfo } from "../mouseWidgetTypes";
import NodeElement from "../nodeElement";
import DragElement from "./dragElement";
import HitAreasGenerator from "./hitAreasGenerator";
import {
    OnCanMove,
    OnCanMoveTo,
    OnIsMoveHandle,
    DragMethod,
} from "../jqtreeOptions";
import {
    GetScrollLeft,
    GetTree,
    OpenNode,
    RefreshElements,
    TriggerEvent,
} from "../jqtreeMethodTypes";

interface Dimensions {
    left: number;
    top: number;
    right: number;
    bottom: number;
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
    openFolderDelay: number | false;
    openNode: OpenNode;
    refreshElements: RefreshElements;
    slide: boolean;
    $treeElement: JQuery<HTMLElement>;
    triggerEvent: TriggerEvent;
}

export class DragAndDropHandler {
    public hitAreas: HitArea[];
    public isDragging: boolean;
    public currentItem: NodeElement | null;
    public hoveredArea: HitArea | null;

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
    private openFolderDelay: number | false;
    private openFolderTimer: number | null;
    private openNode: OpenNode;
    private previousGhost: DropHint | null;
    private refreshElements: RefreshElements;
    private slide: boolean;
    private $treeElement: JQuery<HTMLElement>;
    private triggerEvent: TriggerEvent;

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
        $treeElement,
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
        this.$treeElement = $treeElement;
        this.triggerEvent = triggerEvent;

        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
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
            this.$treeElement,
            this.autoEscape ?? true,
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
            if (this.onDragMove) {
                this.onDragMove(
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
            if (this.onDragStop) {
                this.onDragStop(currentItem.node, positionInfo.originalEvent);
            }
        }

        return false;
    }

    public refresh(): void {
        this.removeHitAreas();

        if (this.currentItem) {
            this.generateHitAreas();

            this.currentItem = this.getNodeElementForNode(
                this.currentItem.node,
            );

            if (this.isDragging) {
                this.currentItem.element.classList.add("jqtree-moving");
            }
        }
    }

    private generateHitAreas(): void {
        const tree = this.getTree();

        if (!this.currentItem || !tree) {
            this.hitAreas = [];
        } else {
            const hitAreasGenerator = new HitAreasGenerator(
                tree,
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
        if (!this.onCanMoveTo) {
            return true;
        }

        if (!this.currentItem) {
            return false;
        }

        const positionName = getPositionName(area.position);

        return this.onCanMoveTo(this.currentItem.node, area.node, positionName);
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
        const nodeElement = this.getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
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
                const tree = this.getTree();

                if (tree) {
                    tree.moveNode(movedNode, targetNode, position);
                    this.$treeElement.empty();
                    this.refreshElements(null);
                }
            };

            const event = this.triggerEvent("tree.move", {
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
        const offset = this.$treeElement.offset();

        if (!offset) {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        } else {
            const el = this.$treeElement;
            const width = el.width() || 0;
            const height = el.height() || 0;
            const left = offset.left + this.getScrollLeft();

            return {
                left,
                top: offset.top,
                right: left + width,
                bottom: offset.top + height + 16,
            };
        }
    }
}
