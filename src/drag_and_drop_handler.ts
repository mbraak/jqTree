import * as jQuery from "jquery";
import { Position, Node, getPositionName } from "./node";
import { htmlEscape } from "./util";
import { ITreeWidget, IHitArea, INodeElement, IDropHint } from "./itree_widget";
import { IPositionInfo } from "./imouse_widget";

export class DragAndDropHandler {
    public hitAreas: IHitArea[];
    public isDragging: boolean;
    public currentItem: INodeElement | null;
    public hoveredArea: IHitArea | null;
    public positionInfo: IPositionInfo | null;

    private treeWidget: ITreeWidget;
    private dragElement: DragElement | null;
    private previousGhost: IDropHint | null;
    private openFolderTimer: number | null;

    constructor(treeWidget: ITreeWidget) {
        this.treeWidget = treeWidget;

        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
        this.positionInfo = null;
    }

    public mouseCapture(positionInfo: IPositionInfo): boolean | null {
        const $element = jQuery(positionInfo.target);

        if (!this.mustCaptureElement($element)) {
            return null;
        }

        if (this.treeWidget.options.onIsMoveHandle && !this.treeWidget.options.onIsMoveHandle($element)) {
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

    public generateHitAreas(): void {
        if (!this.currentItem) {
            this.hitAreas = [];
        } else {
            const hitAreasGenerator = new HitAreasGenerator(
                this.treeWidget.tree,
                this.currentItem.node,
                this.getTreeDimensions().bottom
            );
            this.hitAreas = hitAreasGenerator.generate();
        }
    }

    public mouseStart(positionInfo: IPositionInfo): boolean {
        if (!this.currentItem || positionInfo.pageX === undefined || positionInfo.pageY === undefined) {
            return false;
        } else {
            this.refresh();

            const offset = jQuery(positionInfo.target).offset();
            const left = offset ? offset.left : 0;
            const top = offset ? offset.top : 0;

            const node = this.currentItem.node;

            const nodeName: string = this.treeWidget.options.autoEscape ? htmlEscape(node.name) : node.name;

            this.dragElement = new DragElement(
                nodeName,
                positionInfo.pageX - left,
                positionInfo.pageY - top,
                this.treeWidget.element
            );

            this.isDragging = true;
            this.positionInfo = positionInfo;
            this.currentItem.$element.addClass("jqtree-moving");
            return true;
        }
    }

    public mouseDrag(positionInfo: IPositionInfo): boolean {
        if (
            !this.currentItem ||
            !this.dragElement ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined
        ) {
            return false;
        } else {
            this.dragElement.move(positionInfo.pageX, positionInfo.pageY);
            this.positionInfo = positionInfo;

            const area = this.findHoveredArea(positionInfo.pageX, positionInfo.pageY);
            const canMoveTo = this.canMoveToArea(area);

            if (canMoveTo && area) {
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
                this.removeHover();
                this.removeDropHint();
                this.stopOpenFolderTimer();
            }

            if (!area) {
                if (this.treeWidget.options.onDragMove) {
                    this.treeWidget.options.onDragMove(this.currentItem.node, positionInfo.originalEvent);
                }
            }

            return true;
        }
    }

    public mouseStop(positionInfo: IPositionInfo): boolean {
        this.moveItem(positionInfo);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();

        const currentItem = this.currentItem;

        if (this.currentItem) {
            this.currentItem.$element.removeClass("jqtree-moving");
            this.currentItem = null;
        }

        this.isDragging = false;
        this.positionInfo = null;

        if (!this.hoveredArea && currentItem) {
            if (this.treeWidget.options.onDragStop) {
                this.treeWidget.options.onDragStop(currentItem.node, positionInfo.originalEvent);
            }
        }

        return false;
    }

    public refresh(): void {
        this.removeHitAreas();

        if (this.currentItem) {
            this.generateHitAreas();

            this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);

            if (this.isDragging) {
                this.currentItem.$element.addClass("jqtree-moving");
            }
        }
    }

    private mustCaptureElement($element: JQuery<any>): boolean {
        return !$element.is("input,select,textarea");
    }

    private canMoveToArea(area: IHitArea | null): boolean {
        if (!area || !this.currentItem) {
            return false;
        } else if (this.treeWidget.options.onCanMoveTo) {
            const positionName = getPositionName(area.position);

            return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
        } else {
            return true;
        }
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

    private findHoveredArea(x: number, y: number): IHitArea | null {
        const dimensions = this.getTreeDimensions();

        if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
            return null;
        }

        let low = 0;
        let high = this.hitAreas.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            const area = this.hitAreas[mid];

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

    private mustOpenFolderTimer(area: IHitArea): boolean {
        const node = area.node;

        return node.isFolder() && !node.is_open && area.position === Position.Inside;
    }

    private updateDropHint(): void {
        if (!this.hoveredArea) {
            return;
        }

        // remove previous drop hint
        this.removeDropHint();

        // add new drop hint
        const nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }

    private startOpenFolderTimer(folder: Node): void {
        const openFolder = (): void => {
            this.treeWidget._openNode(folder, this.treeWidget.options.slide, () => {
                this.refresh();
                this.updateDropHint();
            });
        };

        this.stopOpenFolderTimer();

        this.openFolderTimer = window.setTimeout(openFolder, this.treeWidget.options.openFolderDelay);
    }

    private stopOpenFolderTimer(): void {
        if (this.openFolderTimer) {
            clearTimeout(this.openFolderTimer);
            this.openFolderTimer = null;
        }
    }

    private moveItem(positionInfo: IPositionInfo): void {
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
                this.hoveredArea.node.is_open = true; // eslint-disable-line @typescript-eslint/camelcase
            }

            const doMove = (): void => {
                this.treeWidget.tree.moveNode(movedNode, targetNode, position);
                this.treeWidget.element.empty();
                this.treeWidget._refreshElements(null);
            };

            /* eslint-disable @typescript-eslint/camelcase */
            const event = this.treeWidget._triggerEvent("tree.move", {
                move_info: {
                    moved_node: movedNode,
                    target_node: targetNode,
                    position: getPositionName(position),
                    previous_parent: previousParent,
                    do_move: doMove,
                    original_event: positionInfo.originalEvent
                }
            });
            /* eslint-enable @typescript-eslint/camelcase */

            if (!event.isDefaultPrevented()) {
                doMove();
            }
        }
    }

    private getTreeDimensions(): any {
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
                bottom: offset.top + height + 16
            };
        }
    }
}

abstract class VisibleNodeIterator {
    private tree: Node;

    constructor(tree: Node) {
        this.tree = tree;
    }

    protected iterate(): void {
        let isFirstNode = true;

        const _iterateNode = (node: Node, nextNode: Node | null): void => {
            let mustIterateInside = (node.is_open || !node.element) && node.hasChildren();

            let $element: JQuery<any> | null = null;

            if (node.element) {
                $element = jQuery(node.element);

                if (!$element.is(":visible")) {
                    return;
                }

                if (isFirstNode) {
                    this.handleFirstNode(node);
                    isFirstNode = false;
                }

                if (!node.hasChildren()) {
                    this.handleNode(node, nextNode, $element);
                } else if (node.is_open) {
                    if (!this.handleOpenFolder(node, $element)) {
                        mustIterateInside = false;
                    }
                } else {
                    this.handleClosedFolder(node, nextNode, $element);
                }
            }

            if (mustIterateInside) {
                const childrenLength = node.children.length;
                node.children.forEach((_, i) => {
                    if (i === childrenLength - 1) {
                        _iterateNode(node.children[i], null);
                    } else {
                        _iterateNode(node.children[i], node.children[i + 1]);
                    }
                });

                if (node.is_open && $element) {
                    this.handleAfterOpenFolder(node, nextNode);
                }
            }
        };

        _iterateNode(this.tree, null);
    }

    protected abstract handleNode(node: Node, nextNode: Node | null, $element: JQuery): void;

    /*
    override
    return
        - true: continue iterating
        - false: stop iterating
    */
    protected abstract handleOpenFolder(node: Node, $element: JQuery): boolean;

    protected abstract handleClosedFolder(node: Node, nextNode: Node | null, $element: JQuery): void;

    protected abstract handleAfterOpenFolder(node: Node, nextNode: Node | null): void;

    protected abstract handleFirstNode(node: Node): void;
}

export class HitAreasGenerator extends VisibleNodeIterator {
    private currentNode: Node;
    private treeBottom: number;
    private positions: IHitArea[];
    private lastTop: number;

    constructor(tree: Node, currentNode: Node, treeBottom: number) {
        super(tree);

        this.currentNode = currentNode;
        this.treeBottom = treeBottom;
    }

    public generate(): IHitArea[] {
        this.positions = [];
        this.lastTop = 0;

        this.iterate();

        return this.generateHitAreas(this.positions);
    }

    protected generateHitAreas(positions: IHitArea[]): IHitArea[] {
        let previousTop = -1;
        let group = [];
        const hitAreas: IHitArea[] = [];

        for (const position of positions) {
            if (position.top !== previousTop && group.length) {
                if (group.length) {
                    this.generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
                }

                previousTop = position.top;
                group = [];
            }

            group.push(position);
        }

        this.generateHitAreasForGroup(hitAreas, group, previousTop, this.treeBottom);

        return hitAreas;
    }

    protected handleOpenFolder(node: Node, $element: JQuery): boolean {
        if (node === this.currentNode) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== this.currentNode) {
            this.addPosition(node, Position.Inside, this.getTop($element));
        }

        // Continue iterating
        return true;
    }

    protected handleClosedFolder(node: Node, nextNode: Node, $element: JQuery): void {
        const top = this.getTop($element);

        if (node === this.currentNode) {
            // Cannot move after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);

            // Cannot move before current item
            if (nextNode !== this.currentNode) {
                this.addPosition(node, Position.After, top);
            }
        }
    }

    protected handleFirstNode(node: Node): void {
        if (node !== this.currentNode) {
            this.addPosition(node, Position.Before, this.getTop(jQuery(node.element)));
        }
    }

    protected handleAfterOpenFolder(node: Node, nextNode: Node): void {
        if (node === this.currentNode || nextNode === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, this.lastTop);
        } else {
            this.addPosition(node, Position.After, this.lastTop);
        }
    }

    protected handleNode(node: Node, nextNode: Node, $element: JQuery): void {
        const top = this.getTop($element);

        if (node === this.currentNode) {
            // Cannot move inside current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);
        }

        if (nextNode === this.currentNode || node === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.After, top);
        }
    }

    private getTop($element: JQuery<any>): number {
        const offset = $element.offset();

        return offset ? offset.top : 0;
    }

    private addPosition(node: Node, position: number, top: number): void {
        const area = {
            top,
            bottom: 0,
            node,
            position
        };

        this.positions.push(area);
        this.lastTop = top;
    }

    private generateHitAreasForGroup(
        hitAreas: IHitArea[],
        positionsInGroup: IHitArea[],
        top: number,
        bottom: number
    ): void {
        // limit positions in group
        const positionCount = Math.min(positionsInGroup.length, 4);

        const areaHeight = Math.round((bottom - top) / positionCount);
        let areaTop = top;

        let i = 0;
        while (i < positionCount) {
            const position = positionsInGroup[i];

            hitAreas.push({
                top: areaTop,
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position
            });

            areaTop += areaHeight;
            i += 1;
        }
    }
}

class DragElement {
    private offsetX: number;
    private offsetY: number;
    private $element: JQuery;

    constructor(nodeName: string, offsetX: number, offsetY: number, $tree: JQuery) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.$element = jQuery(`<span class=\"jqtree-title jqtree-dragging\">${nodeName}</span>`);
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }

    public move(pageX: number, pageY: number): void {
        this.$element.offset({
            left: pageX - this.offsetX,
            top: pageY - this.offsetY
        });
    }

    public remove(): void {
        this.$element.remove();
    }
}
