import type {
    DragMethod,
    OnCanMove,
    OnCanMoveTo,
    OnIsMoveHandle,
} from "../htmlTree/options";
import type {
    GetScrollLeft,
    GetTree,
    OpenNode,
    RefreshElements,
    TriggerEvent,
} from "../jqtreeMethodTypes";
import type { PositionInfo } from "../mouseUtils";
import type { Node } from "../node";
import type NodeElement from "../nodeElement";
import type { DropHint, HitArea } from "./types";

import { getElementPosition } from "../positionUtils";
import binarySearch from "./binarySearch";
import DragElement from "./dragElement";
import generateHitAreas from "./generateHitAreas";

interface Dimensions {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

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
type GetNodeElement = (element: HTMLElement) => NodeElement | null;

type GetNodeElementForNode = (node: Node) => NodeElement;

export class DragAndDropHandler {
    public currentItem: NodeElement | null;
    public hitAreas: HitArea[];
    public hoveredArea: HitArea | null;
    public isDragging: boolean;

    private _autoEscape?: boolean;
    private _dragElement: DragElement | null;
    private _getNodeElement: GetNodeElement;
    private _getNodeElementForNode: GetNodeElementForNode;
    private _getScrollLeft: GetScrollLeft;
    private _getTree: GetTree;
    private _onCanMove?: OnCanMove;
    private _onCanMoveTo?: OnCanMoveTo;
    private _onDragMove?: DragMethod;
    private _onDragStop?: DragMethod;
    private _onIsMoveHandle?: OnIsMoveHandle;
    private _openFolderDelay: false | number;
    private _openFolderTimer: null | number;
    private _openNode: OpenNode;
    private _previousGhost: DropHint | null;
    private _refreshElements: RefreshElements;
    private _slide: boolean;
    private _treeElement: HTMLElement;
    private _triggerEvent: TriggerEvent;

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
        openFolderDelay,
        openNode,
        refreshElements,
        slide,
        treeElement,
        triggerEvent,
    }: DragAndDropHandlerParams) {
        this._autoEscape = autoEscape;
        this._getNodeElement = getNodeElement;
        this._getNodeElementForNode = getNodeElementForNode;
        this._getScrollLeft = getScrollLeft;
        this._getTree = getTree;
        this._onCanMove = onCanMove;
        this._onCanMoveTo = onCanMoveTo;
        this._onDragMove = onDragMove;
        this._onDragStop = onDragStop;
        this._onIsMoveHandle = onIsMoveHandle;
        this._openFolderDelay = openFolderDelay;
        this._openNode = openNode;
        this._refreshElements = refreshElements;
        this._slide = slide;
        this._treeElement = treeElement;
        this._triggerEvent = triggerEvent;

        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
    }

    public mouseCapture(positionInfo: PositionInfo): boolean | null {
        const element = positionInfo.target;

        if (!this._mustCaptureElement(element)) {
            return null;
        }

        if (this._onIsMoveHandle && !this._onIsMoveHandle(jQuery(element))) {
            return null;
        }

        let nodeElement = this._getNodeElement(element);

        if (nodeElement && this._onCanMove) {
            if (!this._onCanMove(nodeElement.node)) {
                nodeElement = null;
            }
        }

        this.currentItem = nodeElement;
        return this.currentItem != null;
    }

    public mouseDrag(positionInfo: PositionInfo): boolean {
        if (!this.currentItem || !this._dragElement) {
            return false;
        }

        this._dragElement.move(positionInfo.pageX, positionInfo.pageY);

        const area = this._findHoveredArea(
            positionInfo.pageX,
            positionInfo.pageY,
        );

        if (area && this._canMoveToArea(area, this.currentItem)) {
            if (!area.node.isFolder()) {
                this._stopOpenFolderTimer();
            }

            if (this.hoveredArea !== area) {
                this.hoveredArea = area;

                // If this is a closed folder, start timer to open it
                if (this._mustOpenFolderTimer(area)) {
                    this._startOpenFolderTimer(area.node);
                } else {
                    this._stopOpenFolderTimer();
                }

                this._updateDropHint();
            }
        } else {
            this._removeDropHint();
            this._stopOpenFolderTimer();
            this.hoveredArea = area;
        }

        if (!area) {
            if (this._onDragMove) {
                this._onDragMove(
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

        this._dragElement = new DragElement({
            autoEscape: this._autoEscape ?? true,
            nodeName: node.name,
            offsetX: positionInfo.pageX - left,
            offsetY: positionInfo.pageY - top,
            treeElement: this._treeElement,
        });

        this.isDragging = true;
        this.currentItem.element.classList.add("jqtree-moving");

        return true;
    }

    public mouseStop(positionInfo: PositionInfo): boolean {
        this._moveItem(positionInfo);
        this._clear();
        this._removeHover();
        this._removeDropHint();
        this._removeHitAreas();

        const currentItem = this.currentItem;

        if (this.currentItem) {
            this.currentItem.element.classList.remove("jqtree-moving");
            this.currentItem = null;
        }

        this.isDragging = false;

        if (!this.hoveredArea && currentItem) {
            if (this._onDragStop) {
                this._onDragStop(currentItem.node, positionInfo.originalEvent);
            }
        }

        return false;
    }

    public refresh(): void {
        this._removeHitAreas();

        if (this.currentItem) {
            const currentNode = this.currentItem.node;
            this._generateHitAreas(currentNode);
            this.currentItem = this._getNodeElementForNode(currentNode);

            if (this.isDragging) {
                this.currentItem.element.classList.add("jqtree-moving");
            }
        }
    }

    private _canMoveToArea(area: HitArea, currentItem: NodeElement): boolean {
        if (!this._onCanMoveTo) {
            return true;
        }

        return this._onCanMoveTo(currentItem.node, area.node, area.position);
    }

    private _clear(): void {
        if (this._dragElement) {
            this._dragElement.remove();
            this._dragElement = null;
        }
    }

    private _findHoveredArea(x: number, y: number): HitArea | null {
        const dimensions = this._getTreeDimensions();

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

    private _generateHitAreas(currentNode: Node): void {
        const tree = this._getTree();

        if (!tree) {
            this.hitAreas = [];
        } else {
            this.hitAreas = generateHitAreas(
                tree,
                currentNode,
                this._getTreeDimensions().bottom,
            );
        }
    }

    private _getTreeDimensions(): Dimensions {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const treePosition = getElementPosition(this._treeElement);
        const left = treePosition.left + this._getScrollLeft();
        const top = treePosition.top;

        return {
            bottom: top + this._treeElement.clientHeight + 16,
            left,
            right: left + this._treeElement.clientWidth,
            top,
        };
    }

    /* Move the dragged node to the selected position in the tree. */
    private _moveItem(positionInfo: PositionInfo): void {
        if (
            this.currentItem &&
            this.hoveredArea?.position &&
            this._canMoveToArea(this.hoveredArea, this.currentItem)
        ) {
            const movedNode = this.currentItem.node;
            const targetNode = this.hoveredArea.node;
            const position = this.hoveredArea.position;
            const previousParent = movedNode.parent;

            if (position === "inside") {
                this.hoveredArea.node.is_open = true;
            }

            const doMove = (): void => {
                const tree = this._getTree();

                if (tree) {
                    tree.moveNode(movedNode, targetNode, position);

                    this._treeElement.textContent = "";
                    this._refreshElements(null);
                }
            };

            if (this._triggerEvent("tree.move", {
                move_info: {
                    do_move: doMove,
                    moved_node: movedNode,
                    original_event: positionInfo.originalEvent,
                    position,
                    previous_parent: previousParent,
                    target_node: targetNode,
                },
            })) {
                doMove();
            }
        }
    }

    private _mustCaptureElement(element: HTMLElement): boolean {
        const nodeName = element.nodeName;

        return (
            nodeName !== "INPUT" &&
            nodeName !== "SELECT" &&
            nodeName !== "TEXTAREA"
        );
    }

    private _mustOpenFolderTimer(area: HitArea): boolean {
        const node = area.node;

        return node.isFolder() && !node.is_open && area.position === "inside";
    }

    private _removeDropHint(): void {
        if (this._previousGhost) {
            this._previousGhost.remove();
        }
    }

    private _removeHitAreas(): void {
        this.hitAreas = [];
    }

    private _removeHover(): void {
        this.hoveredArea = null;
    }

    private _startOpenFolderTimer(folder: Node): void {
        const openFolder = (): void => {
            this._openNode(folder, this._slide, () => {
                this.refresh();
                this._updateDropHint();
            });
        };

        this._stopOpenFolderTimer();

        const openFolderDelay = this._openFolderDelay;

        if (openFolderDelay !== false) {
            this._openFolderTimer = window.setTimeout(
                openFolder,
                openFolderDelay,
            );
        }
    }

    private _stopOpenFolderTimer(): void {
        if (this._openFolderTimer) {
            clearTimeout(this._openFolderTimer);
            this._openFolderTimer = null;
        }
    }

    private _updateDropHint(): void {
        if (!this.hoveredArea) {
            return;
        }

        // remove previous drop hint
        this._removeDropHint();

        // add new drop hint
        const nodeElement = this._getNodeElementForNode(this.hoveredArea.node);
        this._previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }
}
