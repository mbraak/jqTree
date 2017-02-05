import { Position, Node } from './node';
import { html_escape } from './util'

const $ = window["jQuery"];


export class DragAndDropHandler {
    tree_widget;
    hovered_area;
    $ghost;
    hit_areas;
    is_dragging: boolean;
    current_item;
    drag_element;
    previous_ghost;
    open_folder_timer;

    constructor(tree_widget) {
        this.tree_widget = tree_widget;

        this.hovered_area = null;
        this.$ghost = null
        this.hit_areas = []
        this.is_dragging = false
        this.current_item = null
    }

    mouseCapture(position_info): boolean|null {
        const $element = $(position_info.target)

        if (! this.mustCaptureElement($element)) {
            return null;
        }

        if (this.tree_widget.options.onIsMoveHandle && ! this.tree_widget.options.onIsMoveHandle($element)) {
            return null;
        }

        let node_element = this.tree_widget._getNodeElement($element);

        if (node_element && this.tree_widget.options.onCanMove) {
            if (! this.tree_widget.options.onCanMove(node_element.node)) {
                node_element = null;
            }
        }

        this.current_item = node_element;
        return (this.current_item != null);
    }

    mouseStart(position_info) {
        this.refresh();

        const offset = $(position_info.target).offset();

        const node = this.current_item.node;

        let node_name;

        if (this.tree_widget.options.autoEscape) {
            node_name = html_escape(node.name);
        }
        else {
            node_name = node.name;
        }

        this.drag_element = new DragElement(
            node_name,
            position_info.page_x - offset.left,
            position_info.page_y - offset.top,
            this.tree_widget.element
        );

        this.is_dragging = true;
        this.current_item.$element.addClass('jqtree-moving');
        return true;
    }

    mouseDrag(position_info): boolean {
        this.drag_element.move(position_info.page_x, position_info.page_y);

        const area = this.findHoveredArea(position_info.page_x, position_info.page_y);
        const can_move_to = this.canMoveToArea(area);

        if (can_move_to && area) {
            if (!area.node.isFolder()) {
                this.stopOpenFolderTimer();
            }

            if (this.hovered_area != area) {
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

        if (! area) {
            if (this.tree_widget.options.onDragMove) {
                this.tree_widget.options.onDragMove(this.current_item.node, position_info.original_event);
            }
        }

        return true;
    }

    mustCaptureElement($element) {
        return ! $element.is('input,select,textarea');
    }

    canMoveToArea(area): boolean {
        if (! area) {
            return false;
        }
        else if (this.tree_widget.options.onCanMoveTo) {
            const position_name = Position.getName(area.position);

            return this.tree_widget.options.onCanMoveTo(this.current_item.node, area.node, position_name);
        }
        else {
            return true;
        }
    }

    mouseStop(position_info) {
        this.moveItem(position_info);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();

        let current_item = this.current_item;

        if (this.current_item) {
            this.current_item.$element.removeClass('jqtree-moving');
            this.current_item = null;
        }

        this.is_dragging = false;

        if (! this.hovered_area && current_item) {
            if (this.tree_widget.options.onDragStop) {
                this.tree_widget.options.onDragStop(current_item.node, position_info.original_event);
            }
        }

        return false;
    }

    refresh() {
        this.removeHitAreas();

        if (this.current_item) {
            this.generateHitAreas();

            this.current_item = this.tree_widget._getNodeElementForNode(this.current_item.node);

            if (this.is_dragging) {
                this.current_item.$element.addClass('jqtree-moving');
            }
        }
    }

    removeHitAreas() {
        this.hit_areas = [];
    }

    clear() {
        this.drag_element.remove();
        this.drag_element = null;
    }

    removeDropHint() {
        if (this.previous_ghost) {
            this.previous_ghost.remove();
        }
    }

    removeHover() {
        this.hovered_area = null;
    }

    generateHitAreas() {
        const hit_areas_generator = new HitAreasGenerator(
            this.tree_widget.tree,
            this.current_item.node,
            this.getTreeDimensions().bottom
        );
        this.hit_areas = hit_areas_generator.generate();
    }

    findHoveredArea(x:  number, y: number) {
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
        let high = this.hit_areas.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            const area = this.hit_areas[mid];

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

        return (
            node.isFolder() &&
            ! node.is_open &&
            area.position == Position.INSIDE
        );
    }

    updateDropHint() {
        if (! this.hovered_area) {
            return
        }

        // remove previous drop hint
        this.removeDropHint();

        // add new drop hint
        const node_element = this.tree_widget._getNodeElementForNode(this.hovered_area.node);
        this.previous_ghost = node_element.addDropHint(this.hovered_area.position);
    }

    startOpenFolderTimer(folder) {
        const openFolder = () => {
            this.tree_widget._openNode(
                folder,
                this.tree_widget.options.slide,
                () => {
                    this.refresh();
                    this.updateDropHint();
                }
            )
        }

        this.stopOpenFolderTimer();

        this.open_folder_timer = setTimeout(openFolder, this.tree_widget.options.openFolderDelay);
    }

    stopOpenFolderTimer() {
        if (this.open_folder_timer) {
            clearTimeout(this.open_folder_timer);
            this.open_folder_timer = null;
        }
    }

    moveItem(position_info) {
        if (
            this.hovered_area &&
            this.hovered_area.position != Position.NONE &&
            this.canMoveToArea(this.hovered_area)
        ) {
            const moved_node = this.current_item.node;
            const target_node = this.hovered_area.node;
            const position = this.hovered_area.position;
            const previous_parent = moved_node.parent;

            if (position == Position.INSIDE) {
                this.hovered_area.node.is_open = true;
            }

            const doMove = () => {
                this.tree_widget.tree.moveNode(moved_node, target_node, position);
                this.tree_widget.element.empty();
                this.tree_widget._refreshElements();
            }

            const event = this.tree_widget._triggerEvent(
                'tree.move',
                {
                    move_info: {
                        moved_node: moved_node,
                        target_node: target_node,
                        position: Position.getName(position),
                        previous_parent: previous_parent,
                        do_move: doMove,
                        original_event: position_info.original_event
                    }
                }
            )

            if (! event.isDefaultPrevented()) {
                doMove();
            }
        }
    }


    getTreeDimensions() {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // for some to drag-and-drop the last element.
        const offset = this.tree_widget.element.offset();

        return {
            left: offset.left,
            top: offset.top,
            right: offset.left + this.tree_widget.element.width(),
            bottom: offset.top + this.tree_widget.element.height() + 16
        };
    }
}


class VisibleNodeIterator {
    tree;

    constructor(tree) {
        this.tree = tree;
    }

    iterate() {
        let is_first_node = true

        const _iterateNode = (node: Node, next_node: Node) => {
            let must_iterate_inside = (
                (node.is_open || ! node.element) && node.hasChildren()
            );

            let $element = null;

            if (node.element) {
                $element = $(node.element);

                if (! $element.is(':visible')) {
                    return
                }

                if (is_first_node) {
                    this.handleFirstNode(node, $element);
                    is_first_node = false;
                }

                if (! node.hasChildren()) {
                    this.handleNode(node, next_node, $element);
                }
                else if (node.is_open) {
                    if (! this.handleOpenFolder(node, $element)) {
                        must_iterate_inside = false
                    }
                }
                else {
                    this.handleClosedFolder(node, next_node, $element);
                }
            }

            if (must_iterate_inside) {
                const children_length = node.children.length;
                node.children.forEach((child, i) => {
                    if (i == (children_length - 1)) {
                        _iterateNode(node.children[i], null);
                    }
                    else {
                        _iterateNode(node.children[i], node.children[i+1]);
                    }
                });

                if (node.is_open) {
                    this.handleAfterOpenFolder(node, next_node, $element);
                }
            }
        }

        _iterateNode(this.tree, null);
    }

    handleNode(node: Node, next_node: Node, $element) {
        // override
    }

    handleOpenFolder(node: Node, $element) {
        /*
        override
        return
          - true: continue iterating
          - false: stop iterating
         */
    }

    handleClosedFolder(node: Node, next_node: Node, $element) {
        // override
    }

    handleAfterOpenFolder(node: Node, next_node: Node, $element) {
        // override
    }

    handleFirstNode(node: Node, $element) {
        // override
    }
}


export class HitAreasGenerator extends VisibleNodeIterator {
    current_node: Node;
    tree_bottom: number;
    positions;
    last_top: number;

    constructor(tree, current_node: Node, tree_bottom: number) {
        super(tree);

        this.current_node = current_node;
        this.tree_bottom = tree_bottom;
    }

    generate() {
        this.positions = [];
        this.last_top = 0;

        this.iterate();

        return this.generateHitAreas(this.positions);
    }

    getTop($element): number {
        return $element.offset().top;
    }

    addPosition(node: Node, position, top: number) {
        const area = {
            top: top,
            node: node,
            position: position
        };

        this.positions.push(area);
        this.last_top = top;
    }

    handleNode(node: Node, next_node: Node, $element) {
        const top = this.getTop($element);

        if (node == this.current_node) {
            // Cannot move inside current item
            this.addPosition(node, Position.NONE, top);
        }
        else {
            this.addPosition(node, Position.INSIDE, top);
        }

        if (
            next_node == this.current_node ||
            node == this.current_node
        ) {
            // Cannot move before or after current item
            this.addPosition(node, Position.NONE, top);
        }
        else {
            this.addPosition(node, Position.AFTER, top);
        }
    }

    handleOpenFolder(node: Node, $element) {
        if (node == this.current_node) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] != this.current_node) {
            this.addPosition(node, Position.INSIDE, this.getTop($element));
        }

        // Continue iterating
        return true;
    }

    handleClosedFolder(node: Node, next_node: Node, $element) {
        const top = this.getTop($element);

        if (node == this.current_node) {
            // Cannot move after current item
            this.addPosition(node, Position.NONE, top);
        }
        else {
            this.addPosition(node, Position.INSIDE, top);

            // Cannot move before current item
            if (next_node != this.current_node) {
                this.addPosition(node, Position.AFTER, top);
            }
        }
    }

    handleFirstNode(node: Node, $element) {
        if (node != this.current_node) {
            this.addPosition(node, Position.BEFORE, this.getTop($(node.element)));
        }
    }

    handleAfterOpenFolder(node: Node, next_node: Node, $element) {
        if (
            node == this.current_node ||
            next_node == this.current_node
        ) {
            // Cannot move before or after current item
            this.addPosition(node, Position.NONE, this.last_top);
        }
        else {
            this.addPosition(node, Position.AFTER, this.last_top);
        }
    }

    generateHitAreas(positions) {
        let previous_top = -1;
        let group = [];
        const hit_areas = [];

        for (let position of positions) {
            if (position.top != previous_top && group.length) {
                if (group.length) {
                    this.generateHitAreasForGroup(
                        hit_areas,
                        group,
                        previous_top,
                        position.top
                    );
                }

                previous_top = position.top;
                group = [];
            }

            group.push(position)
        }

        this.generateHitAreasForGroup(
            hit_areas,
            group,
            previous_top,
            this.tree_bottom
        );

        return hit_areas;
    }

    generateHitAreasForGroup(hit_areas, positions_in_group, top: number, bottom: number) {
        // limit positions in group
        const position_count = Math.min(positions_in_group.length, 4);

        const area_height = Math.round((bottom - top) / position_count);
        let area_top = top;

        let i = 0;
        while (i < position_count) {
            const position = positions_in_group[i];

            hit_areas.push({
                top: area_top,
                bottom: area_top + area_height,
                node: position.node,
                position: position.position
            })

            area_top += area_height;
            i += 1;
        }
    }
}


export class DragElement {
    offset_x: number;
    offset_y: number;
    $element;

    constructor(node_name: string, offset_x: number, offset_y: number, $tree) {
        this.offset_x = offset_x;
        this.offset_y = offset_y;

        this.$element = $("<span class=\"jqtree-title jqtree-dragging\">#{ node_name }</span>");
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }

    move(page_x: number, page_y: number) {
        this.$element.offset({
            left: page_x - this.offset_x,
            top: page_y - this.offset_y
        });
    }

    remove() {
        this.$element.remove();
    }
}
