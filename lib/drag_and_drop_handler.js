"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var node_1 = require("./node");
var util_1 = require("./util");
var DragAndDropHandler = (function () {
    function DragAndDropHandler(tree_widget) {
        this.tree_widget = tree_widget;
        this.hovered_area = null;
        this.$ghost = null;
        this.hit_areas = [];
        this.is_dragging = false;
        this.current_item = null;
    }
    DragAndDropHandler.prototype.mouseCapture = function (position_info) {
        var $element = $(position_info.target);
        if (!this.mustCaptureElement($element)) {
            return null;
        }
        if (this.tree_widget.options.onIsMoveHandle &&
            !this.tree_widget.options.onIsMoveHandle($element)) {
            return null;
        }
        var node_element = this.tree_widget._getNodeElement($element);
        if (node_element && this.tree_widget.options.onCanMove) {
            if (!this.tree_widget.options.onCanMove(node_element.node)) {
                node_element = null;
            }
        }
        this.current_item = node_element;
        return this.current_item != null;
    };
    DragAndDropHandler.prototype.generateHitAreas = function () {
        if (!this.current_item) {
            this.hit_areas = [];
        }
        else {
            var hit_areas_generator = new HitAreasGenerator(this.tree_widget.tree, this.current_item.node, this.getTreeDimensions().bottom);
            this.hit_areas = hit_areas_generator.generate();
        }
    };
    DragAndDropHandler.prototype.mouseStart = function (position_info) {
        if (!this.current_item) {
            return false;
        }
        else {
            this.refresh();
            var offset = $(position_info.target).offset();
            var node = this.current_item.node;
            var node_name = this.tree_widget.options.autoEscape
                ? util_1.html_escape(node.name)
                : node.name;
            this.drag_element = new DragElement(node_name, position_info.page_x - offset.left, position_info.page_y - offset.top, this.tree_widget.element);
            this.is_dragging = true;
            this.current_item.$element.addClass("jqtree-moving");
            return true;
        }
    };
    DragAndDropHandler.prototype.mouseDrag = function (position_info) {
        if (!this.current_item || !this.drag_element) {
            return false;
        }
        else {
            this.drag_element.move(position_info.page_x, position_info.page_y);
            var area = this.findHoveredArea(position_info.page_x, position_info.page_y);
            var can_move_to = this.canMoveToArea(area);
            if (can_move_to && area) {
                if (!area.node.isFolder()) {
                    this.stopOpenFolderTimer();
                }
                if (this.hovered_area !== area) {
                    this.hovered_area = area;
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
                if (this.tree_widget.options.onDragMove) {
                    this.tree_widget.options.onDragMove(this.current_item.node, position_info.original_event);
                }
            }
            return true;
        }
    };
    DragAndDropHandler.prototype.mouseStop = function (position_info) {
        this.moveItem(position_info);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();
        var current_item = this.current_item;
        if (this.current_item) {
            this.current_item.$element.removeClass("jqtree-moving");
            this.current_item = null;
        }
        this.is_dragging = false;
        if (!this.hovered_area && current_item) {
            if (this.tree_widget.options.onDragStop) {
                this.tree_widget.options.onDragStop(current_item.node, position_info.original_event);
            }
        }
        return false;
    };
    DragAndDropHandler.prototype.refresh = function () {
        this.removeHitAreas();
        if (this.current_item) {
            this.generateHitAreas();
            this.current_item = this.tree_widget._getNodeElementForNode(this.current_item.node);
            if (this.is_dragging) {
                this.current_item.$element.addClass("jqtree-moving");
            }
        }
    };
    DragAndDropHandler.prototype.mustCaptureElement = function ($element) {
        return !$element.is("input,select,textarea");
    };
    DragAndDropHandler.prototype.canMoveToArea = function (area) {
        if (!area || !this.current_item) {
            return false;
        }
        else if (this.tree_widget.options.onCanMoveTo) {
            var position_name = node_1.getPositionName(area.position);
            return this.tree_widget.options.onCanMoveTo(this.current_item.node, area.node, position_name);
        }
        else {
            return true;
        }
    };
    DragAndDropHandler.prototype.removeHitAreas = function () {
        this.hit_areas = [];
    };
    DragAndDropHandler.prototype.clear = function () {
        if (this.drag_element) {
            this.drag_element.remove();
            this.drag_element = null;
        }
    };
    DragAndDropHandler.prototype.removeDropHint = function () {
        if (this.previous_ghost) {
            this.previous_ghost.remove();
        }
    };
    DragAndDropHandler.prototype.removeHover = function () {
        this.hovered_area = null;
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
        var high = this.hit_areas.length;
        while (low < high) {
            // tslint:disable-next-line: no-bitwise
            var mid = (low + high) >> 1;
            var area = this.hit_areas[mid];
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
        if (!this.hovered_area) {
            return;
        }
        // remove previous drop hint
        this.removeDropHint();
        // add new drop hint
        var node_element = this.tree_widget._getNodeElementForNode(this.hovered_area.node);
        this.previous_ghost = node_element.addDropHint(this.hovered_area.position);
    };
    DragAndDropHandler.prototype.startOpenFolderTimer = function (folder) {
        var _this = this;
        var openFolder = function () {
            _this.tree_widget._openNode(folder, _this.tree_widget.options.slide, function () {
                _this.refresh();
                _this.updateDropHint();
            });
        };
        this.stopOpenFolderTimer();
        this.open_folder_timer = setTimeout(openFolder, this.tree_widget.options.openFolderDelay);
    };
    DragAndDropHandler.prototype.stopOpenFolderTimer = function () {
        if (this.open_folder_timer) {
            clearTimeout(this.open_folder_timer);
            this.open_folder_timer = null;
        }
    };
    DragAndDropHandler.prototype.moveItem = function (position_info) {
        var _this = this;
        if (this.current_item &&
            this.hovered_area &&
            this.hovered_area.position !== node_1.Position.None &&
            this.canMoveToArea(this.hovered_area)) {
            var moved_node_1 = this.current_item.node;
            var target_node_1 = this.hovered_area.node;
            var position_1 = this.hovered_area.position;
            var previous_parent = moved_node_1.parent;
            if (position_1 === node_1.Position.Inside) {
                this.hovered_area.node.is_open = true;
            }
            var doMove = function () {
                _this.tree_widget.tree.moveNode(moved_node_1, target_node_1, position_1);
                _this.tree_widget.element.empty();
                _this.tree_widget._refreshElements(null);
            };
            var event_1 = this.tree_widget._triggerEvent("tree.move", {
                move_info: {
                    moved_node: moved_node_1,
                    target_node: target_node_1,
                    position: node_1.getPositionName(position_1),
                    previous_parent: previous_parent,
                    do_move: doMove,
                    original_event: position_info.original_event
                }
            });
            if (!event_1.isDefaultPrevented()) {
                doMove();
            }
        }
    };
    DragAndDropHandler.prototype.getTreeDimensions = function () {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // for some to drag-and-drop the last element.
        var offset = this.tree_widget.element.offset();
        return {
            left: offset.left,
            top: offset.top,
            right: offset.left + this.tree_widget.element.width(),
            bottom: offset.top + this.tree_widget.element.height() + 16
        };
    };
    return DragAndDropHandler;
}());
exports.DragAndDropHandler = DragAndDropHandler;
var VisibleNodeIterator = (function () {
    function VisibleNodeIterator(tree) {
        this.tree = tree;
    }
    VisibleNodeIterator.prototype.iterate = function () {
        var _this = this;
        var is_first_node = true;
        var _iterateNode = function (node, next_node) {
            var must_iterate_inside = (node.is_open || !node.element) && node.hasChildren();
            var $element = null;
            if (node.element) {
                $element = $(node.element);
                if (!$element.is(":visible")) {
                    return;
                }
                if (is_first_node) {
                    _this.handleFirstNode(node);
                    is_first_node = false;
                }
                if (!node.hasChildren()) {
                    _this.handleNode(node, next_node, $element);
                }
                else if (node.is_open) {
                    if (!_this.handleOpenFolder(node, $element)) {
                        must_iterate_inside = false;
                    }
                }
                else {
                    _this.handleClosedFolder(node, next_node, $element);
                }
            }
            if (must_iterate_inside) {
                var children_length_1 = node.children.length;
                node.children.forEach(function (_, i) {
                    if (i === children_length_1 - 1) {
                        _iterateNode(node.children[i], null);
                    }
                    else {
                        _iterateNode(node.children[i], node.children[i + 1]);
                    }
                });
                if (node.is_open && $element) {
                    _this.handleAfterOpenFolder(node, next_node);
                }
            }
        };
        _iterateNode(this.tree, null);
    };
    return VisibleNodeIterator;
}());
var HitAreasGenerator = (function (_super) {
    __extends(HitAreasGenerator, _super);
    function HitAreasGenerator(tree, current_node, tree_bottom) {
        var _this = _super.call(this, tree) || this;
        _this.current_node = current_node;
        _this.tree_bottom = tree_bottom;
        return _this;
    }
    HitAreasGenerator.prototype.generate = function () {
        this.positions = [];
        this.last_top = 0;
        this.iterate();
        return this.generateHitAreas(this.positions);
    };
    HitAreasGenerator.prototype.generateHitAreas = function (positions) {
        var previous_top = -1;
        var group = [];
        var hit_areas = [];
        for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
            var position = positions_1[_i];
            if (position.top !== previous_top && group.length) {
                if (group.length) {
                    this.generateHitAreasForGroup(hit_areas, group, previous_top, position.top);
                }
                previous_top = position.top;
                group = [];
            }
            group.push(position);
        }
        this.generateHitAreasForGroup(hit_areas, group, previous_top, this.tree_bottom);
        return hit_areas;
    };
    HitAreasGenerator.prototype.handleOpenFolder = function (node, $element) {
        if (node === this.current_node) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }
        // Cannot move before current item
        if (node.children[0] !== this.current_node) {
            this.addPosition(node, node_1.Position.Inside, this.getTop($element));
        }
        // Continue iterating
        return true;
    };
    HitAreasGenerator.prototype.handleClosedFolder = function (node, next_node, $element) {
        var top = this.getTop($element);
        if (node === this.current_node) {
            // Cannot move after current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.Inside, top);
            // Cannot move before current item
            if (next_node !== this.current_node) {
                this.addPosition(node, node_1.Position.After, top);
            }
        }
    };
    HitAreasGenerator.prototype.handleFirstNode = function (node) {
        if (node !== this.current_node) {
            this.addPosition(node, node_1.Position.Before, this.getTop($(node.element)));
        }
    };
    HitAreasGenerator.prototype.handleAfterOpenFolder = function (node, next_node) {
        if (node === this.current_node || next_node === this.current_node) {
            // Cannot move before or after current item
            this.addPosition(node, node_1.Position.None, this.last_top);
        }
        else {
            this.addPosition(node, node_1.Position.After, this.last_top);
        }
    };
    HitAreasGenerator.prototype.handleNode = function (node, next_node, $element) {
        var top = this.getTop($element);
        if (node === this.current_node) {
            // Cannot move inside current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.Inside, top);
        }
        if (next_node === this.current_node || node === this.current_node) {
            // Cannot move before or after current item
            this.addPosition(node, node_1.Position.None, top);
        }
        else {
            this.addPosition(node, node_1.Position.After, top);
        }
    };
    HitAreasGenerator.prototype.getTop = function ($element) {
        return $element.offset().top;
    };
    HitAreasGenerator.prototype.addPosition = function (node, position, top) {
        var area = {
            top: top,
            bottom: 0,
            node: node,
            position: position
        };
        this.positions.push(area);
        this.last_top = top;
    };
    HitAreasGenerator.prototype.generateHitAreasForGroup = function (hit_areas, positions_in_group, top, bottom) {
        // limit positions in group
        var position_count = Math.min(positions_in_group.length, 4);
        var area_height = Math.round((bottom - top) / position_count);
        var area_top = top;
        var i = 0;
        while (i < position_count) {
            var position = positions_in_group[i];
            hit_areas.push({
                top: area_top,
                bottom: area_top + area_height,
                node: position.node,
                position: position.position
            });
            area_top += area_height;
            i += 1;
        }
    };
    return HitAreasGenerator;
}(VisibleNodeIterator));
exports.HitAreasGenerator = HitAreasGenerator;
var DragElement = (function () {
    function DragElement(node_name, offset_x, offset_y, $tree) {
        this.offset_x = offset_x;
        this.offset_y = offset_y;
        this.$element = $("<span class=\"jqtree-title jqtree-dragging\">" + node_name + "</span>");
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }
    DragElement.prototype.move = function (page_x, page_y) {
        this.$element.offset({
            left: page_x - this.offset_x,
            top: page_y - this.offset_y
        });
    };
    DragElement.prototype.remove = function () {
        this.$element.remove();
    };
    return DragElement;
}());
exports.DragElement = DragElement;
