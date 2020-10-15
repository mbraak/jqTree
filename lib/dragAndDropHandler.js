"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.HitAreasGenerator = exports.DragAndDropHandler = void 0;
var jQueryProxy = require("jquery");
var node_1 = require("./node");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
var jQuery = jQueryProxy["default"] || jQueryProxy;
var DragAndDropHandler = /** @class */ (function () {
    function DragAndDropHandler(treeWidget) {
        this.treeWidget = treeWidget;
        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
        this.positionInfo = null;
    }
    DragAndDropHandler.prototype.mouseCapture = function (positionInfo) {
        var $element = jQuery(positionInfo.target);
        if (!this.mustCaptureElement($element)) {
            return null;
        }
        if (this.treeWidget.options.onIsMoveHandle &&
            !this.treeWidget.options.onIsMoveHandle($element)) {
            return null;
        }
        var nodeElement = this.treeWidget._getNodeElement($element);
        if (nodeElement && this.treeWidget.options.onCanMove) {
            if (!this.treeWidget.options.onCanMove(nodeElement.node)) {
                nodeElement = null;
            }
        }
        this.currentItem = nodeElement;
        return this.currentItem != null;
    };
    DragAndDropHandler.prototype.mouseStart = function (positionInfo) {
        var _a;
        if (!this.currentItem ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        this.refresh();
        var offset = jQuery(positionInfo.target).offset();
        var left = offset ? offset.left : 0;
        var top = offset ? offset.top : 0;
        var node = this.currentItem.node;
        this.dragElement = new DragElement(node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, (_a = this.treeWidget.options.autoEscape) !== null && _a !== void 0 ? _a : true);
        this.isDragging = true;
        this.positionInfo = positionInfo;
        this.currentItem.$element.addClass("jqtree-moving");
        return true;
    };
    DragAndDropHandler.prototype.mouseDrag = function (positionInfo) {
        if (!this.currentItem ||
            !this.dragElement ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        this.dragElement.move(positionInfo.pageX, positionInfo.pageY);
        this.positionInfo = positionInfo;
        var area = this.findHoveredArea(positionInfo.pageX, positionInfo.pageY);
        if (area && this.canMoveToArea(area)) {
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
            this.removeDropHint();
            this.stopOpenFolderTimer();
            this.hoveredArea = area;
        }
        if (!area) {
            if (this.treeWidget.options.onDragMove) {
                this.treeWidget.options.onDragMove(this.currentItem.node, positionInfo.originalEvent);
            }
        }
        return true;
    };
    DragAndDropHandler.prototype.mouseStop = function (positionInfo) {
        this.moveItem(positionInfo);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();
        var currentItem = this.currentItem;
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
    };
    DragAndDropHandler.prototype.refresh = function () {
        this.removeHitAreas();
        if (this.currentItem) {
            this.generateHitAreas();
            this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);
            if (this.isDragging) {
                this.currentItem.$element.addClass("jqtree-moving");
            }
        }
    };
    DragAndDropHandler.prototype.generateHitAreas = function () {
        if (!this.currentItem) {
            this.hitAreas = [];
        }
        else {
            var hitAreasGenerator = new HitAreasGenerator(this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
            this.hitAreas = hitAreasGenerator.generate();
        }
    };
    DragAndDropHandler.prototype.mustCaptureElement = function ($element) {
        return !$element.is("input,select,textarea");
    };
    DragAndDropHandler.prototype.canMoveToArea = function (area) {
        if (!this.treeWidget.options.onCanMoveTo) {
            return true;
        }
        if (!this.currentItem) {
            return false;
        }
        var positionName = node_1.getPositionName(area.position);
        return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
    };
    DragAndDropHandler.prototype.removeHitAreas = function () {
        this.hitAreas = [];
    };
    DragAndDropHandler.prototype.clear = function () {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
    };
    DragAndDropHandler.prototype.removeDropHint = function () {
        if (this.previousGhost) {
            this.previousGhost.remove();
        }
    };
    DragAndDropHandler.prototype.removeHover = function () {
        this.hoveredArea = null;
    };
    DragAndDropHandler.prototype.findHoveredArea = function (x, y) {
        var dimensions = this.getTreeDimensions();
        if (x < dimensions.left ||
            y < dimensions.top ||
            x > dimensions.right ||
            y > dimensions.bottom) {
            return null;
        }
        var low = 0;
        var high = this.hitAreas.length;
        while (low < high) {
            var mid = (low + high) >> 1;
            var area = this.hitAreas[mid];
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
    };
    DragAndDropHandler.prototype.mustOpenFolderTimer = function (area) {
        var node = area.node;
        return (node.isFolder() &&
            !node.is_open &&
            area.position === node_1.Position.Inside);
    };
    DragAndDropHandler.prototype.updateDropHint = function () {
        if (!this.hoveredArea) {
            return;
        }
        // remove previous drop hint
        this.removeDropHint();
        // add new drop hint
        var nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    };
    DragAndDropHandler.prototype.startOpenFolderTimer = function (folder) {
        var _this = this;
        var openFolder = function () {
            _this.treeWidget._openNode(folder, _this.treeWidget.options.slide, function () {
                _this.refresh();
                _this.updateDropHint();
            });
        };
        this.stopOpenFolderTimer();
        this.openFolderTimer = window.setTimeout(openFolder, this.treeWidget.options.openFolderDelay);
    };
    DragAndDropHandler.prototype.stopOpenFolderTimer = function () {
        if (this.openFolderTimer) {
            clearTimeout(this.openFolderTimer);
            this.openFolderTimer = null;
        }
    };
    DragAndDropHandler.prototype.moveItem = function (positionInfo) {
        var _this = this;
        if (this.currentItem &&
            this.hoveredArea &&
            this.hoveredArea.position !== node_1.Position.None &&
            this.canMoveToArea(this.hoveredArea)) {
            var movedNode_1 = this.currentItem.node;
            var targetNode_1 = this.hoveredArea.node;
            var position_1 = this.hoveredArea.position;
            var previousParent = movedNode_1.parent;
            if (position_1 === node_1.Position.Inside) {
                this.hoveredArea.node.is_open = true;
            }
            var doMove = function () {
                _this.treeWidget.tree.moveNode(movedNode_1, targetNode_1, position_1);
                _this.treeWidget.element.empty();
                _this.treeWidget._refreshElements(null);
            };
            var event_1 = this.treeWidget._triggerEvent("tree.move", {
                move_info: {
                    moved_node: movedNode_1,
                    target_node: targetNode_1,
                    position: node_1.getPositionName(position_1),
                    previous_parent: previousParent,
                    do_move: doMove,
                    original_event: positionInfo.originalEvent
                }
            });
            if (!event_1.isDefaultPrevented()) {
                doMove();
            }
        }
    };
    DragAndDropHandler.prototype.getTreeDimensions = function () {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        var offset = this.treeWidget.element.offset();
        if (!offset) {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
        else {
            var el = this.treeWidget.element;
            var width = el.width() || 0;
            var height = el.height() || 0;
            var left = offset.left + this.treeWidget._getScrollLeft();
            return {
                left: left,
                top: offset.top,
                right: left + width,
                bottom: offset.top + height + 16
            };
        }
    };
    return DragAndDropHandler;
}());
exports.DragAndDropHandler = DragAndDropHandler;
var VisibleNodeIterator = /** @class */ (function () {
    function VisibleNodeIterator(tree) {
        this.tree = tree;
    }
    VisibleNodeIterator.prototype.iterate = function () {
        var _this = this;
        var isFirstNode = true;
        var _iterateNode = function (node, nextNode) {
            var mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
            var $element = null;
            if (node.element) {
                $element = jQuery(node.element);
                if (!$element.is(":visible")) {
                    return;
                }
                if (isFirstNode) {
                    _this.handleFirstNode(node);
                    isFirstNode = false;
                }
                if (!node.hasChildren()) {
                    _this.handleNode(node, nextNode, $element);
                }
                else if (node.is_open) {
                    if (!_this.handleOpenFolder(node, $element)) {
                        mustIterateInside = false;
                    }
                }
                else {
                    _this.handleClosedFolder(node, nextNode, $element);
                }
            }
            if (mustIterateInside) {
                var childrenLength_1 = node.children.length;
                node.children.forEach(function (_, i) {
                    if (i === childrenLength_1 - 1) {
                        _iterateNode(node.children[i], null);
                    }
                    else {
                        _iterateNode(node.children[i], node.children[i + 1]);
                    }
                });
                if (node.is_open && $element) {
                    _this.handleAfterOpenFolder(node, nextNode);
                }
            }
        };
        _iterateNode(this.tree, null);
    };
    return VisibleNodeIterator;
}());
var HitAreasGenerator = /** @class */ (function (_super) {
    __extends(HitAreasGenerator, _super);
    function HitAreasGenerator(tree, currentNode, treeBottom) {
        var _this = _super.call(this, tree) || this;
        _this.currentNode = currentNode;
        _this.treeBottom = treeBottom;
        return _this;
    }
    HitAreasGenerator.prototype.generate = function () {
        this.positions = [];
        this.lastTop = 0;
        this.iterate();
        return this.generateHitAreas(this.positions);
    };
    HitAreasGenerator.prototype.generateHitAreas = function (positions) {
        var previousTop = -1;
        var group = [];
        var hitAreas = [];
        for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
            var position = positions_1[_i];
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
    };
    HitAreasGenerator.prototype.handleOpenFolder = function (node, $element) {
        if (node === this.currentNode) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }
        // Cannot move before current item
        if (node.children[0] !== this.currentNode) {
            this.addPosition(node, node_1.Position.Inside, this.getTop($element));
        }
        // Continue iterating
        return true;
    };
    HitAreasGenerator.prototype.handleClosedFolder = function (node, nextNode, $element) {
        var top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move after current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.Inside, top);
            // Cannot move before current item
            if (nextNode !== this.currentNode) {
                this.addPosition(node, node_1.Position.After, top);
            }
        }
    };
    HitAreasGenerator.prototype.handleFirstNode = function (node) {
        if (node !== this.currentNode) {
            this.addPosition(node, node_1.Position.Before, this.getTop(jQuery(node.element)));
        }
    };
    HitAreasGenerator.prototype.handleAfterOpenFolder = function (node, nextNode) {
        if (node === this.currentNode || nextNode === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, node_1.Position.None, this.lastTop);
        }
        else {
            this.addPosition(node, node_1.Position.After, this.lastTop);
        }
    };
    HitAreasGenerator.prototype.handleNode = function (node, nextNode, $element) {
        var top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move inside current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.Inside, top);
        }
        if (nextNode === this.currentNode || node === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.After, top);
        }
    };
    HitAreasGenerator.prototype.getTop = function ($element) {
        var offset = $element.offset();
        return offset ? offset.top : 0;
    };
    HitAreasGenerator.prototype.addPosition = function (node, position, top) {
        var area = {
            top: top,
            bottom: 0,
            node: node,
            position: position
        };
        this.positions.push(area);
        this.lastTop = top;
    };
    HitAreasGenerator.prototype.generateHitAreasForGroup = function (hitAreas, positionsInGroup, top, bottom) {
        // limit positions in group
        var positionCount = Math.min(positionsInGroup.length, 4);
        var areaHeight = Math.round((bottom - top) / positionCount);
        var areaTop = top;
        var i = 0;
        while (i < positionCount) {
            var position = positionsInGroup[i];
            hitAreas.push({
                top: areaTop,
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position
            });
            areaTop += areaHeight;
            i += 1;
        }
    };
    return HitAreasGenerator;
}(VisibleNodeIterator));
exports.HitAreasGenerator = HitAreasGenerator;
var DragElement = /** @class */ (function () {
    function DragElement(nodeName, offsetX, offsetY, $tree, autoEscape) {
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
    DragElement.prototype.move = function (pageX, pageY) {
        this.$element.offset({
            left: pageX - this.offsetX,
            top: pageY - this.offsetY
        });
    };
    DragElement.prototype.remove = function () {
        this.$element.remove();
    };
    return DragElement;
}());
