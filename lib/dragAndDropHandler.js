import * as jQuery from "jquery";
import { getPositionName, Position } from "./node";
export class DragAndDropHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
        this.positionInfo = null;
    }
    mouseCapture(positionInfo) {
        const $element = jQuery(positionInfo.target);
        if (!this.mustCaptureElement($element)) {
            return null;
        }
        if (this.treeWidget.options.onIsMoveHandle &&
            !this.treeWidget.options.onIsMoveHandle($element)) {
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
    generateHitAreas() {
        if (!this.currentItem) {
            this.hitAreas = [];
        }
        else {
            const hitAreasGenerator = new HitAreasGenerator(this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
            this.hitAreas = hitAreasGenerator.generate();
        }
    }
    mouseStart(positionInfo) {
        var _a;
        if (!this.currentItem ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        else {
            this.refresh();
            const offset = jQuery(positionInfo.target).offset();
            const left = offset ? offset.left : 0;
            const top = offset ? offset.top : 0;
            const node = this.currentItem.node;
            this.dragElement = new DragElement(node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, (_a = this.treeWidget.options.autoEscape) !== null && _a !== void 0 ? _a : true);
            this.isDragging = true;
            this.positionInfo = positionInfo;
            this.currentItem.$element.addClass("jqtree-moving");
            return true;
        }
    }
    mouseDrag(positionInfo) {
        if (!this.currentItem ||
            !this.dragElement ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        else {
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
                    }
                    else {
                        this.stopOpenFolderTimer();
                    }
                    this.updateDropHint();
                }
            }
            else {
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
    mouseStop(positionInfo) {
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
    refresh() {
        this.removeHitAreas();
        if (this.currentItem) {
            this.generateHitAreas();
            this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);
            if (this.isDragging) {
                this.currentItem.$element.addClass("jqtree-moving");
            }
        }
    }
    mustCaptureElement($element) {
        return !$element.is("input,select,textarea");
    }
    canMoveToArea(area) {
        if (!area || !this.currentItem) {
            return false;
        }
        else if (this.treeWidget.options.onCanMoveTo) {
            const positionName = getPositionName(area.position);
            return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
        }
        else {
            return true;
        }
    }
    removeHitAreas() {
        this.hitAreas = [];
    }
    clear() {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
    }
    removeDropHint() {
        if (this.previousGhost) {
            this.previousGhost.remove();
        }
    }
    removeHover() {
        this.hoveredArea = null;
    }
    findHoveredArea(x, y) {
        const dimensions = this.getTreeDimensions();
        if (x < dimensions.left ||
            y < dimensions.top ||
            x > dimensions.right ||
            y > dimensions.bottom) {
            return null;
        }
        let low = 0;
        let high = this.hitAreas.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            const area = this.hitAreas[mid];
            if (y < area.top) {
                high = mid;
            }
            else if (y > area.bottom) {
                low = mid + 1;
            }
            else {
                return area;
            }
        }
        return null;
    }
    mustOpenFolderTimer(area) {
        const node = area.node;
        return (node.isFolder() &&
            !node.is_open &&
            area.position === Position.Inside);
    }
    updateDropHint() {
        if (!this.hoveredArea) {
            return;
        }
        // remove previous drop hint
        this.removeDropHint();
        // add new drop hint
        const nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }
    startOpenFolderTimer(folder) {
        const openFolder = () => {
            this.treeWidget._openNode(folder, this.treeWidget.options.slide, () => {
                this.refresh();
                this.updateDropHint();
            });
        };
        this.stopOpenFolderTimer();
        this.openFolderTimer = window.setTimeout(openFolder, this.treeWidget.options.openFolderDelay);
    }
    stopOpenFolderTimer() {
        if (this.openFolderTimer) {
            clearTimeout(this.openFolderTimer);
            this.openFolderTimer = null;
        }
    }
    moveItem(positionInfo) {
        if (this.currentItem &&
            this.hoveredArea &&
            this.hoveredArea.position !== Position.None &&
            this.canMoveToArea(this.hoveredArea)) {
            const movedNode = this.currentItem.node;
            const targetNode = this.hoveredArea.node;
            const position = this.hoveredArea.position;
            const previousParent = movedNode.parent;
            if (position === Position.Inside) {
                this.hoveredArea.node.is_open = true;
            }
            const doMove = () => {
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
    getTreeDimensions() {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const offset = this.treeWidget.element.offset();
        if (!offset) {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
        else {
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
class VisibleNodeIterator {
    constructor(tree) {
        this.tree = tree;
    }
    iterate() {
        let isFirstNode = true;
        const _iterateNode = (node, nextNode) => {
            let mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
            let $element = null;
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
                }
                else if (node.is_open) {
                    if (!this.handleOpenFolder(node, $element)) {
                        mustIterateInside = false;
                    }
                }
                else {
                    this.handleClosedFolder(node, nextNode, $element);
                }
            }
            if (mustIterateInside) {
                const childrenLength = node.children.length;
                node.children.forEach((_, i) => {
                    if (i === childrenLength - 1) {
                        _iterateNode(node.children[i], null);
                    }
                    else {
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
}
export class HitAreasGenerator extends VisibleNodeIterator {
    constructor(tree, currentNode, treeBottom) {
        super(tree);
        this.currentNode = currentNode;
        this.treeBottom = treeBottom;
    }
    generate() {
        this.positions = [];
        this.lastTop = 0;
        this.iterate();
        return this.generateHitAreas(this.positions);
    }
    generateHitAreas(positions) {
        let previousTop = -1;
        let group = [];
        const hitAreas = [];
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
    handleOpenFolder(node, $element) {
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
    handleClosedFolder(node, nextNode, $element) {
        const top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move after current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.Inside, top);
            // Cannot move before current item
            if (nextNode !== this.currentNode) {
                this.addPosition(node, Position.After, top);
            }
        }
    }
    handleFirstNode(node) {
        if (node !== this.currentNode) {
            this.addPosition(node, Position.Before, this.getTop(jQuery(node.element)));
        }
    }
    handleAfterOpenFolder(node, nextNode) {
        if (node === this.currentNode || nextNode === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, this.lastTop);
        }
        else {
            this.addPosition(node, Position.After, this.lastTop);
        }
    }
    handleNode(node, nextNode, $element) {
        const top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move inside current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.Inside, top);
        }
        if (nextNode === this.currentNode || node === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.After, top);
        }
    }
    getTop($element) {
        const offset = $element.offset();
        return offset ? offset.top : 0;
    }
    addPosition(node, position, top) {
        const area = {
            top,
            bottom: 0,
            node,
            position,
        };
        this.positions.push(area);
        this.lastTop = top;
    }
    generateHitAreasForGroup(hitAreas, positionsInGroup, top, bottom) {
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
                position: position.position,
            });
            areaTop += areaHeight;
            i += 1;
        }
    }
}
class DragElement {
    constructor(nodeName, offsetX, offsetY, $tree, autoEscape) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.$element = jQuery("<span>").addClass("jqtree-title jqtree-dragging");
        if (autoEscape) {
            this.$element.text(nodeName);
        }
        else {
            this.$element.html(nodeName);
        }
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }
    move(pageX, pageY) {
        this.$element.offset({
            left: pageX - this.offsetX,
            top: pageY - this.offsetY,
        });
    }
    remove() {
        this.$element.remove();
    }
}
